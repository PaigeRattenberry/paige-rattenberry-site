/**
 * Typed loaders for `content/` (DESIGN §3.1). Each module is validated once at import time;
 * pages and components import from here, never from `content/` directly (an ESLint rule
 * enforces it), so every fact on the site has passed the schema and the claims gate it
 * encodes.
 */
import { z } from "zod";

import { about as aboutRaw } from "@/content/about";
import assetsRaw from "@/content/assets.json";
import { buildStory as buildStoryRaw } from "@/content/build-story";
import { certifications as certificationsRaw } from "@/content/certifications";
import { education as educationRaw } from "@/content/education";
import buildStatsRaw from "@/content/generated/build-stats.json";
import { roles as rolesRaw } from "@/content/experience";
import { diagrams as diagramsRaw, iouTables as iouTablesRaw } from "@/content/figures";
import { leadership as leadershipRaw } from "@/content/leadership";
import { profile as profileRaw } from "@/content/profile";
import { research as researchRaw } from "@/content/research";
import { skillCategories, skills as skillsRaw } from "@/content/skills";
import { SOURCE_LABELS } from "@/content/sources";

import { readBuildLogs } from "./build-log";
import { assertDocumentLinks } from "./links";
import { loadProjects, pairedResearch } from "./projects";
import {
  AboutSchema,
  AssetsSchema,
  BuildStatsSchema,
  BuildStorySchema,
  CertificationSchema,
  EducationSchema,
  FiguresSchema,
  LeadershipItemSchema,
  type Metric,
  ProfileSchema,
  RESEARCH_THEME_IDS,
  type ResearchItem,
  ResearchItemSchema,
  RoleSchema,
  type Skill,
  SkillsSchema,
} from "./schema";

export const profile = ProfileSchema.parse(profileRaw);
export const about = AboutSchema.parse(aboutRaw);
export const roles = z.array(RoleSchema).min(1).parse(rolesRaw);
export const education = EducationSchema.parse(educationRaw);
export const certifications = z.array(CertificationSchema).parse(certificationsRaw);
export const research = z.array(ResearchItemSchema).parse(researchRaw);
export const leadership = z.array(LeadershipItemSchema).parse(leadershipRaw);
export const assets = AssetsSchema.parse(assetsRaw);
for (const r of research) assertDocumentLinks(`research:${r.id}`, r.links, assets);
for (const l of leadership) assertDocumentLinks(`leadership:${l.id}`, l.links, assets);
/** Every project from content/projects/*.mdx (frontmatter validated, research merged). */
export const projects = loadProjects({ research, assets });
/** Figure data for the deep pages: replotted thesis tables and original diagrams. */
export const figures = FiguresSchema.parse({ iouTables: iouTablesRaw, diagrams: diagramsRaw });

/** One figure's data by id; throws so a typo in MDX fails the build, not the reader. */
export function iouTable(id: string) {
  const table = figures.iouTables.find((t) => t.id === id);
  if (!table) throw new Error(`No IoU table "${id}" in content/figures.ts`);
  return table;
}
export function diagram(id: string) {
  const d = figures.diagrams.find((x) => x.id === id);
  if (!d) throw new Error(`No diagram "${id}" in content/figures.ts`);
  return d;
}

/** Newest first by start month; ties keep content order. One comparator for every dated list. */
export function newestFirst<T extends { periods: readonly { start: string }[] }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => b.periods[0].start.localeCompare(a.periods[0].start));
}
export const researchNewestFirst = newestFirst(research);
/** /research's groups in DESIGN §2's order, newest first inside each; every item is in one. */
export const researchByTheme = RESEARCH_THEME_IDS.map((theme) => ({
  theme,
  items: researchNewestFirst.filter((r) => r.theme === theme),
}));
export const leadershipNewestFirst = newestFirst(leadership);
/** The leadership items that DESIGN §2 lists on /research too (conference reviewing). */
export const researchReviewing = leadership.filter((l) => l.alsoResearch);
/** Re-exported so tests can check label coverage without importing content/ directly. */
export { SOURCE_LABELS };
export type { LoadedProject } from "./projects";

/** One project by slug, or undefined (the page turns that into a 404). */
export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/**
 * The deep page a research item expands into, if any: the one its `projectSlug` names (the
 * thesis, the capstone), or the research-backed card that points back at it with `researchId`
 * (the literature review). Either pointer pairs the two records, so neither is typed twice.
 */
export function deepPageForResearch(item: Pick<ResearchItem, "id" | "projectSlug">) {
  return deepPageProjects.find((p) => p.slug === item.projectSlug || p.researchId === item.id);
}

/** The research item a project card pairs with (its `researchId`, or an item's `projectSlug`). */
export function researchForProject(project: { slug: string; researchId?: string }) {
  return pairedResearch(project, research);
}

const vocabulary = SkillsSchema.parse({ categories: skillCategories, skills: skillsRaw });
export const categories = vocabulary.categories;
export const skills = vocabulary.skills;

const skillIndex = new Map(skills.map((s) => [s.id, s]));

/** The vocabulary entry for a tag; throws on an unknown id so a typo never renders. */
export function skill(id: string): Skill {
  const s = skillIndex.get(id);
  if (!s) throw new Error(`Unknown skill id "${id}" (not in content/skills.ts)`);
  return s;
}

/** The three featured deep pages (DESIGN §0, "Featured order"), for home and the top of /projects. */
export const featuredProjects = projects.filter((p) => p.featured && p.deepPage);
/** Everything else: the filterable grid on /projects. */
export const otherProjects = projects.filter((p) => !(p.featured && p.deepPage));
/** Every project with a page under /projects/: the one list for routes and static params. */
export const deepPageProjects = projects.filter((p) => p.deepPage);

/** The one role with no end date; the home page's "Currently" line names it. */
export const currentRole = (() => {
  const open = roles.filter((r) => r.periods.some((p) => p.end === null));
  if (open.length !== 1) {
    throw new Error(
      `Expected exactly one ongoing role in content/experience.ts, found ${open.length}`,
    );
  }
  return open[0];
})();

/** The headshot asset the profile points at; must be listed in content/assets.json. */
export const headshot = (() => {
  const asset = assets.find((a) => a.path === profile.headshot);
  if (!asset || asset.kind !== "image")
    throw new Error(
      `profile.headshot "${profile.headshot}" is not an image in content/assets.json`,
    );
  return asset;
})();

/** Every metric object anywhere in content/, for the claims-gate test. */
export function allMetrics(): Metric[] {
  return [
    ...roles.flatMap((r) => r.metrics),
    ...education.metrics,
    ...certifications.flatMap((c) => c.metrics),
    ...research.flatMap((r) => r.metrics),
    ...leadership.flatMap((l) => l.metrics),
    ...projects.flatMap((p) => p.metrics),
    ...profile.currently.metrics,
    ...profile.summary.metrics,
  ];
}

/** Every source id used anywhere in content/, for the label-coverage test. */
export function allSourceIds(): string[] {
  const ids = new Set<string>();
  for (const m of allMetrics()) ids.add(m.source);
  for (const r of roles) [r.source, ...(r.bulletSources ?? [])].forEach((id) => ids.add(id));
  ids.add(education.source);
  for (const h of education.honours) ids.add(h.source);
  for (const c of certifications) ids.add(c.source);
  for (const r of research) ids.add(r.source);
  for (const l of leadership) ids.add(l.source);
  for (const p of projects) ids.add(p.source);
  for (const t of figures.iouTables) ids.add(t.source);
  for (const d of figures.diagrams) ids.add(d.source);
  ids.add(profile.currently.source);
  ids.add(profile.summary.source);
  return [...ids];
}

/** Every skill id referenced outside the vocabulary, for the vocabulary test. */
export function allSkillRefs(): { where: string; id: string }[] {
  return [
    ...roles.flatMap((r) => r.skills.map((id) => ({ where: `experience:${r.id}`, id }))),
    ...research.flatMap((r) => r.skills.map((id) => ({ where: `research:${r.id}`, id }))),
    ...projects.flatMap((p) => p.skills.map((id) => ({ where: `projects:${p.slug}`, id }))),
    ...profile.skillsStrip.map((id) => ({ where: "profile:skillsStrip", id })),
  ];
}

/** Session 8: the build-story page's own words (content/build-story.ts). */
export const buildStory = BuildStorySchema.parse(buildStoryRaw);
/** The pre-launch history snapshot (DESIGN §5.6, D6), written by scripts/fetch-build-stats.ts. */
export const buildStats = BuildStatsSchema.parse(buildStatsRaw);
/** Every build log in docs/build-log/, oldest first; each has a page under /how-this-was-built/. */
export const buildLogs = readBuildLogs();

/** One build log by file name, or undefined (the page turns that into a 404). */
export function buildLogBySlug(slug: string) {
  return buildLogs.find((entry) => entry.slug === slug);
}

/** The build-story gallery with each image's assets.json record (alt text and dimensions). */
export const buildStoryGallery = buildStory.gallery.map((figure) => {
  const asset = assets.find((a) => a.path === figure.asset);
  if (!asset || asset.kind !== "image") {
    throw new Error(`build-story gallery: "${figure.asset}" is not an image in assets.json`);
  }
  if (!buildLogBySlug(figure.log)) {
    throw new Error(`build-story gallery: no build log "${figure.log}"`);
  }
  return { ...figure, image: asset };
});
