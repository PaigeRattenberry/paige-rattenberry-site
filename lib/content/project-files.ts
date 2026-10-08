/**
 * The one place that reads `content/projects/*.mdx` from disk. Node-only (fs). Frontmatter
 * parsing is gray-matter's; validation happens in `./projects.ts`.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/** Resolved from the working directory: the bundler rewrites `__dirname` at build time. */
export const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export type ProjectFile = {
  /** File name without extension; must equal the frontmatter slug. */
  file: string;
  /** Unvalidated frontmatter. */
  data: Record<string, unknown>;
  /** MDX body; empty for frontmatter-only cards. */
  body: string;
};

/** Every project file, sorted by file name for a stable order everywhere. */
export function readProjectFiles(dir = PROJECTS_DIR): ProjectFile[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .sort()
    .map((name) => {
      const { data, content } = matter(readFileSync(path.join(dir, name), "utf8"));
      return { file: name.replace(/\.mdx$/, ""), data, body: content.trim() };
    });
}
