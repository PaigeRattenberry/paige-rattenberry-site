/**
 * Career timeline + skills explorer data (DESIGN §7.2, IMPLEMENTATION_PLAN §4 Session 5).
 * Derived from the validated content in `./load.ts`: one entry per piece of work drawn from
 * the experience roles, the projects and the research items, the skills each entry used, and
 * the skill-to-skill co-occurrence graph the constellation draws. Server-only; pages turn
 * the result into plain view data for the client island (`lib/explorer/view.ts`).
 *
 * One piece of work, one entry (2026-09-15 amendment). Some work is recorded in two content
 * files, and each link between them is followed here so nothing appears twice and no skill
 * co-occurrence counts double:
 * - a project whose `researchId` names a research item (Clinical CoPilot, the capnography/EEG
 *   research, the GenAI literature review);
 * - a research item whose `projectSlug` names a deep page (the thesis, the capstone);
 * - a research item whose `roleId` names an experience role (the Stryker XAI item happened
 *   inside the Stryker co-op; Paige's decision, 2026-09-15: one entry, taken from the role).
 * The merged entry takes its title, dates and line from the primary record (role, then
 * project, then research item) and the union of both records' skills.
 *
 * The degree is one entry too (Paige's decision, 2026-09-16): DESIGN §7.2 runs the timeline from
 * 2017, which is when it starts, and education carries no skill tags, so the graph is unchanged.
 * Conference reviewing lives in content/leadership.ts and is not an entry.
 */
import { KIND_LABELS, RESEARCH_KIND_LABELS } from "./labels";
import { education, newestFirst, projects, research, roles, skills } from "./load";
import { findMetric } from "./metrics";
import type { LoadedProject } from "./projects";
import type { Metric, ResearchItem, Role } from "./schema";

export type EntryKind = "role" | "project" | "research" | "education";

/** Where an entry's facts come from: every content record it merges, by kind and id. */
export type EntrySource = { kind: EntryKind; id: string };

export type ExplorerEntry = {
  /** The primary record's id: a role id, a project slug, a research item id, or "education". */
  id: string;
  kind: EntryKind;
  /** Card title for a project (`displayTitle` when set), resume title for a role. */
  title: string;
  /** "Role", "Project", "Coursework", "Honours thesis", ...: the record's kind, labelled. */
  kindLabel: string;
  /** Organisation, for a role or a research item (projects have none of their own). */
  org?: string;
  /** Team or group, for a role whose resume heading names one. */
  team?: string;
  /** Date range as content prints it. */
  dates: string;
  periods: Role["periods"];
  /** Four-digit year of the first period's start; the timeline groups by it. */
  year: number;
  /** One line of substance: a project's tagline, a research item's summary, a role's location. */
  line: string;
  /** Declared metrics whose value occurs in `line`, so it can render through MetricStat. */
  lineMetrics: Metric[];
  /** Shown wherever the work appears (StimMap3D's non-clinical wording, DESIGN §3.3). */
  disclaimer?: string;
  /** Skill ids in vocabulary order, the union over every merged record. */
  skills: string[];
  /** Every content record merged into this entry, primary first. */
  sources: EntrySource[];
  /** The page that holds the full record. */
  href: string;
};

export type SkillNode = {
  id: string;
  label: string;
  category: string;
  /** Number of entries that carry the skill (node size). */
  count: number;
};

/** An unordered pair of skills, `source` before `target` in vocabulary order. */
export type SkillEdge = {
  source: string;
  target: string;
  /** Number of entries that carry both skills. */
  weight: number;
};

export type ExplorerGraph = {
  entries: ExplorerEntry[];
  nodes: SkillNode[];
  edges: SkillEdge[];
};

const vocabularyOrder = new Map(skills.map((s, i) => [s.id, i]));

/** Skill ids sorted into vocabulary order, duplicates dropped. */
function unionSkills(...lists: readonly (readonly string[])[]): string[] {
  const ids = new Set(lists.flat());
  return [...ids].sort((a, b) => vocabularyOrder.get(a)! - vocabularyOrder.get(b)!);
}

function metricsIn(text: string, metrics: readonly Metric[]): Metric[] {
  return metrics.filter((m) => findMetric(text, m.value) >= 0);
}

function projectHref(project: LoadedProject) {
  return project.deepPage ? `/projects/${project.slug}` : `/projects#${project.slug}`;
}

/** The research items that fold into another record, keyed by what they point at. */
function partnerIndex(items: readonly ResearchItem[]) {
  const byProjectSlug = new Map<string, ResearchItem>();
  const byRoleId = new Map<string, ResearchItem>();
  for (const item of items) {
    if (item.projectSlug) byProjectSlug.set(item.projectSlug, item);
    if (item.roleId) byRoleId.set(item.roleId, item);
  }
  return { byProjectSlug, byRoleId };
}

/**
 * Every piece of work as one entry, newest first (by `periods[0].start`, as `newestFirst()`
 * orders every dated list; `dates` is display text in several shapes).
 */
export function deriveEntries(): ExplorerEntry[] {
  const { byProjectSlug, byRoleId } = partnerIndex(research);
  const merged = new Set<string>();
  const entries: ExplorerEntry[] = [];

  for (const role of roles) {
    const partner = byRoleId.get(role.id);
    if (partner) merged.add(partner.id);
    entries.push({
      id: role.id,
      kind: "role",
      title: role.title,
      kindLabel: "Role",
      org: role.org,
      ...(role.team ? { team: role.team } : {}),
      dates: role.dates,
      periods: role.periods,
      year: Number(role.periods[0].start.slice(0, 4)),
      line: role.location,
      lineMetrics: metricsIn(role.location, role.metrics),
      skills: unionSkills(role.skills, partner?.skills ?? []),
      sources: [
        { kind: "role", id: role.id },
        ...(partner ? [{ kind: "research" as const, id: partner.id }] : []),
      ],
      href: `/experience#${role.id}`,
    });
  }

  for (const project of projects) {
    // A research-backed card (researchId) already carries the item's skills; the item that
    // points at a deep page (projectSlug) may add its own.
    const partner = project.researchId
      ? research.find((r) => r.id === project.researchId)
      : byProjectSlug.get(project.slug);
    if (partner) merged.add(partner.id);
    entries.push({
      id: project.slug,
      kind: "project",
      title: project.displayTitle ?? project.title,
      kindLabel: partner ? RESEARCH_KIND_LABELS[partner.kind] : KIND_LABELS[project.kind],
      ...(partner ? { org: partner.org } : {}),
      dates: project.dates,
      periods: project.periods,
      year: Number(project.periods[0].start.slice(0, 4)),
      line: project.tagline,
      lineMetrics: metricsIn(project.tagline, project.metrics),
      ...(project.disclaimer ? { disclaimer: project.disclaimer } : {}),
      skills: unionSkills(project.skills, partner?.skills ?? []),
      sources: [
        { kind: "project", id: project.slug },
        ...(partner ? [{ kind: "research" as const, id: partner.id }] : []),
      ],
      href: projectHref(project),
    });
  }

  entries.push({
    id: "education",
    kind: "education",
    title: education.degree,
    kindLabel: "Education",
    org: education.institution,
    dates: education.dates,
    periods: education.periods,
    year: Number(education.periods[0].start.slice(0, 4)),
    line: education.location,
    lineMetrics: metricsIn(education.location, education.metrics),
    skills: [],
    sources: [{ kind: "education", id: "education" }],
    href: "/experience#education",
  });

  for (const item of research) {
    if (merged.has(item.id)) continue;
    entries.push({
      id: item.id,
      kind: "research",
      title: item.title,
      kindLabel: RESEARCH_KIND_LABELS[item.kind],
      org: item.org,
      dates: item.dates,
      periods: item.periods,
      year: Number(item.periods[0].start.slice(0, 4)),
      line: item.summary,
      lineMetrics: metricsIn(item.summary, item.metrics),
      skills: unionSkills(item.skills),
      sources: [{ kind: "research", id: item.id }],
      href: `/research#${item.id}`,
    });
  }

  return newestFirst(entries);
}

/** Joins two skill ids into one map key; written as an escape so the source stays plain text. */
const PAIR_SEPARATOR = "\u0000";

/** Skill nodes (used skills only) and symmetric co-occurrence edges for the entries given. */
export function deriveGraph(entries: readonly ExplorerEntry[]): ExplorerGraph {
  const counts = new Map<string, number>();
  const weights = new Map<string, number>();
  for (const entry of entries) {
    for (const id of entry.skills) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (let i = 0; i < entry.skills.length; i++) {
      for (let j = i + 1; j < entry.skills.length; j++) {
        const key = `${entry.skills[i]}${PAIR_SEPARATOR}${entry.skills[j]}`;
        weights.set(key, (weights.get(key) ?? 0) + 1);
      }
    }
  }
  const nodes: SkillNode[] = skills
    .filter((s) => counts.has(s.id))
    .map((s) => ({ id: s.id, label: s.label, category: s.category, count: counts.get(s.id)! }));
  const edges: SkillEdge[] = [...weights]
    .map(([key, weight]) => {
      const [source, target] = key.split(PAIR_SEPARATOR);
      return { source, target, weight };
    })
    .sort(
      (a, b) =>
        vocabularyOrder.get(a.source)! - vocabularyOrder.get(b.source)! ||
        vocabularyOrder.get(a.target)! - vocabularyOrder.get(b.target)!,
    );
  return { entries: [...entries], nodes, edges };
}

/** The whole explorer graph, derived once per process. */
export const explorer: ExplorerGraph = deriveGraph(deriveEntries());
