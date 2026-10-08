/**
 * Project loader (DESIGN §3.1, IMPLEMENTATION_PLAN §4 Session 3a). Reads every
 * `content/projects/*.mdx`, validates the frontmatter, fills research-backed cards from
 * `content/research.ts` so no fact is typed twice, resolves `cover` against assets.json, and
 * keeps the MDX body beside the record for the deep page to compile. Server-only (fs);
 * pages import the result through `./load.ts`.
 */
import { z } from "zod";

import { assertDocumentLinks } from "./links";
import { readProjectFiles, type ProjectFile } from "./project-files";
import {
  type Asset,
  type ImageAssetSchema,
  type Link,
  type Project,
  ProjectFrontmatterSchema,
  ProjectSchema,
  RESEARCH_DERIVED_FIELDS,
  type ResearchItem,
} from "./schema";

export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export type LoadedProject = Project & {
  /** MDX body (may be empty until the project's session writes it). */
  body: string;
  /** The `cover` image's assets.json record, when the project declares one. */
  coverAsset?: ImageAsset;
};

type Deps = {
  research: readonly ResearchItem[];
  assets: readonly Asset[];
};

/** Merge a research item into the card that points at it (fields listed in the schema). */
export function mergeResearch(
  fm: z.infer<typeof ProjectFrontmatterSchema>,
  research: readonly ResearchItem[],
): Project {
  if (!fm.researchId) return ProjectSchema.parse(fm);
  const item = research.find((r) => r.id === fm.researchId);
  if (!item) {
    throw new Error(`projects:${fm.slug}: researchId "${fm.researchId}" is not in research.ts`);
  }
  const derived = {
    title: item.title,
    dates: item.dates,
    periods: item.periods,
    proof: item.summary,
    bullets: [item.summary],
    metrics: item.metrics,
    skills: item.skills,
    source: item.source,
  } satisfies Pick<Project, (typeof RESEARCH_DERIVED_FIELDS)[number]>;
  return ProjectSchema.parse({
    ...fm,
    ...derived,
    year: Number(item.periods[0].start.slice(0, 4)),
  });
}

/**
 * Repositories _source/INVENTORY.md clears for public linking, one by one. Today: the public
 * StimMap3D repository (S0-D, 2026-09-20). No other repository is linked from a project.
 */
export const CLEARED_REPOSITORIES: readonly string[] = [
  "https://github.com/PaigeRattenberry/stimmap3d",
];

/** The cleared repository this URL belongs to — the repository itself, or a file inside it. */
function clearedRepositoryOf(url: string): string | undefined {
  return CLEARED_REPOSITORIES.find((repo) => url === repo || url.startsWith(`${repo}/`));
}

/**
 * Every link a project publishes, wherever it is declared. `links` is the facts column and
 * `aside.links` the aside's own links (StimMap3D's workflow document): both reach a reader, so
 * both pass the same gates. A URL under github.com must sit inside a repository INVENTORY.md has
 * cleared, whatever its `kind` says, and a `/docs/*.pdf` path must name a document in
 * assets.json. Bodies are checked by the claims gate, which reads the MDX text.
 */
function assertPublishableLinks(project: Project, assets: readonly Asset[]): void {
  const where = `projects:${project.slug}`;
  const links: readonly Link[] = [...(project.links ?? []), ...(project.aside?.links ?? [])];
  for (const link of project.links ?? []) {
    // A `repo` link is the repository itself, so it must be a cleared URL exactly, not a path
    // inside one: "…/stimmap3d-other" must not pass because "…/stimmap3d" is cleared. Checked
    // before the host rule below so the narrower failure gets the clearer message.
    if (link.kind === "repo" && !CLEARED_REPOSITORIES.includes(link.url)) {
      throw new Error(
        `${where}: repo link "${link.url}" is not cleared (see _source/INVENTORY.md)`,
      );
    }
  }
  for (const link of links) {
    if (link.url.startsWith("https://github.com/") && !clearedRepositoryOf(link.url)) {
      throw new Error(
        `${where}: repository link "${link.url}" is not cleared (see _source/INVENTORY.md)`,
      );
    }
  }
  assertDocumentLinks(where, links, assets);
}

/** `cover` must name an image listed in assets.json; returns it, or undefined when unset. */
export function resolveCover(
  project: Pick<Project, "slug" | "cover">,
  assets: readonly Asset[],
): ImageAsset | undefined {
  if (!project.cover) return undefined;
  const asset = assets.find((a) => a.path === project.cover);
  if (!asset || asset.kind !== "image") {
    throw new Error(
      `projects:${project.slug}: cover "${project.cover}" is not an image in content/assets.json`,
    );
  }
  return asset;
}

/**
 * The research item a card pairs with, if any: the one its `researchId` names, or the one whose
 * `projectSlug` names the card (the thesis, the capstone). The resume prints that item's `org`.
 */
export function pairedResearch(
  project: Pick<Project, "slug" | "researchId">,
  research: readonly ResearchItem[],
): ResearchItem | undefined {
  return research.find((r) => r.id === project.researchId || r.projectSlug === project.slug);
}

/**
 * The resume's selection must change what prints: `firstBullets` has to leave a card bullet
 * out, and `resume.org` cannot sit on a card whose paired research item supplies the line.
 */
function assertResumeSelection(project: Project, research: readonly ResearchItem[]): void {
  const where = `projects:${project.slug}`;
  const { firstBullets, org } = project.resume;
  if (firstBullets !== undefined && firstBullets >= project.bullets.length) {
    throw new Error(
      `${where}: resume.firstBullets ${firstBullets} keeps all ${project.bullets.length} bullets; drop it`,
    );
  }
  const item = pairedResearch(project, research);
  if (org !== undefined && item) {
    throw new Error(
      `${where}: resume.org is never printed, since research item "${item.id}" supplies the line`,
    );
  }
}

/** Validate one file into a project record (exported for tests with fixture files). */
export function loadProject(file: ProjectFile, deps: Deps): LoadedProject {
  const parsed = ProjectFrontmatterSchema.safeParse(file.data);
  if (!parsed.success) {
    throw new Error(
      `content/projects/${file.file}.mdx frontmatter: ${z.prettifyError(parsed.error)}`,
    );
  }
  if (parsed.data.slug !== file.file) {
    throw new Error(
      `content/projects/${file.file}.mdx: frontmatter slug "${parsed.data.slug}" must equal the file name`,
    );
  }
  const project = mergeResearch(parsed.data, deps.research);
  assertPublishableLinks(project, deps.assets);
  assertResumeSelection(project, deps.research);
  if (project.embed) {
    // The poster is the cover and the "open" link is the live app, so an embed needs both.
    if (!project.cover || !project.links?.some((l) => l.kind === "live")) {
      throw new Error(`projects:${project.slug}: an embed needs a cover and a live link`);
    }
  }
  if (project.deepPage && file.body.trim() === "") {
    // Since Session 4 a deep page renders its body only; there is no frontmatter fallback.
    throw new Error(`projects:${project.slug}: a deep page needs an MDX body`);
  }
  const coverAsset = resolveCover(project, deps.assets);
  return { ...project, body: file.body, ...(coverAsset ? { coverAsset } : {}) };
}

/**
 * Every project: featured ones first in their `order` (DESIGN §0), then the rest by year and
 * start month descending, then by title. File names are unique, and each slug must equal its
 * file name, so slugs are unique too.
 */
export function loadProjects(deps: Deps): LoadedProject[] {
  return readProjectFiles()
    .map((file) => loadProject(file, deps))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.featured && b.featured ? (a.order ?? 0) - (b.order ?? 0) : 0) ||
        b.year - a.year ||
        b.periods[0].start.localeCompare(a.periods[0].start) ||
        a.title.localeCompare(b.title),
    );
}
