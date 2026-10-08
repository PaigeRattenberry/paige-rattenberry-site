/**
 * Writes content/generated/explorer-layout.json: the d3-force layout of the skills
 * constellation, computed once and committed (IMPLEMENTATION_PLAN §4 Session 5).
 *
 *   npm run layout:explorer   writes the file (run after any change to skills in content/)
 *   npm run build             runs this with --check first: a stale file fails the build
 *
 * The committed file is the layout the screenshots were reviewed against, so a build never
 * rewrites it; `--check` recomputes and compares instead, and the unit test does the same.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { explorer } from "../lib/content/explorer";
import { computeLayout } from "../lib/explorer/layout";

const root = path.resolve(__dirname, "..");
const out = path.join(root, "content", "generated", "explorer-layout.json");
const check = process.argv.includes("--check");

const installed = JSON.parse(
  readFileSync(path.join(root, "node_modules", "d3-force", "package.json"), "utf8"),
) as { version: string };

const layout = computeLayout(explorer, installed.version);
const text = `${JSON.stringify(layout, null, 2)}\n`;
const summary =
  `${layout.nodes.length} nodes, ${explorer.edges.length} edges, ${layout.ticks} ticks ` +
  `(d3-force ${layout.d3Force})`;

if (check) {
  const committed = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (committed !== text) {
    console.error(
      `explorer layout: ${path.relative(root, out)} is out of date for the current content ` +
        `(${summary}). Run "npm run layout:explorer", review the picture and commit the file.`,
    );
    process.exit(1);
  }
  console.log(`explorer layout: ${path.relative(root, out)} is up to date (${summary})`);
} else {
  writeFileSync(out, text);
  console.log(`explorer layout: ${summary} -> ${path.relative(root, out)}`);
}
