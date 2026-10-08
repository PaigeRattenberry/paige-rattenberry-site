/**
 * Server-side derivation of the plain card data and filter groups the /projects page hands
 * to its client island (AGENTS.md: loaders stay server-only, islands get serialisable data).
 * Source ids are resolved to public labels here, so no `_source/` path is serialised.
 */
import type { ProjectCardData } from "@/components/projects/ProjectCard";
import type { FilterGroup } from "@/components/projects/ProjectGridParts";
import { KIND_LABELS } from "@/lib/content/labels";
import { categories, skill, skills } from "@/lib/content/load";
import type { LoadedProject } from "@/lib/content/load";
import { metricViews } from "@/lib/content/sources";

export function toCard(project: LoadedProject): ProjectCardData {
  return {
    slug: project.slug,
    title: project.displayTitle ?? project.title,
    dates: project.dates,
    kindLabel: KIND_LABELS[project.kind],
    tagline: project.tagline,
    proof: project.proof,
    metrics: metricViews(project.metrics),
    disclaimer: project.disclaimer,
    tags: project.skills.map((id) => ({ id, label: skill(id).label })),
    deepPage: project.deepPage,
    links: project.links ?? [],
  };
}

/** Skill chips for the cards given, in vocabulary order, grouped by category (empty groups dropped). */
export function filterGroups(cards: readonly ProjectCardData[]): FilterGroup[] {
  return skillGroups(new Set(cards.flatMap((c) => c.tags.map((t) => t.id))));
}

/** The skills in `used`, in vocabulary order, grouped by category (empty groups dropped). */
export function skillGroups(used: ReadonlySet<string>): FilterGroup[] {
  return categories
    .map((category) => ({
      id: category.id,
      label: category.label,
      tags: skills
        .filter((s) => s.category === category.id && used.has(s.id))
        .map((s) => ({ id: s.id, label: s.label })),
    }))
    .filter((g) => g.tags.length > 0);
}
