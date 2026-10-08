"use client";

import { useSearchParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { pushQueryValue, readQueryValue } from "@/lib/query-filter";

import type { ProjectCardData } from "./ProjectCard";
import { CardList, FILTER_PARAM, FilterChips, type FilterGroup } from "./ProjectGridParts";

type ProjectGridProps = {
  projects: readonly ProjectCardData[];
  /** Skill tags that occur on at least one card, grouped by vocabulary category. */
  groups: readonly FilterGroup[];
};

/** The `?tag=` value when it names a known skill; anything else means "show everything". */
export function readFilter(query: string, known: ReadonlySet<string>) {
  return readQueryValue(query, FILTER_PARAM, known);
}

/**
 * The filterable half of /projects (DESIGN §2): one row of skill chips, single-select, and
 * the cards that carry the chosen skill. The chosen tag lives in the URL (`?tag=rag`) so a
 * filtered view is shareable and back/forward walk through choices; an unknown value shows
 * everything. Chip clicks use `history.pushState`, which Next.js syncs into
 * `useSearchParams`, so nothing is fetched. Rendered inside a Suspense boundary whose
 * fallback is the same grid, unfiltered, prerendered on the server.
 */
export function ProjectGrid({ projects, groups }: ProjectGridProps) {
  const labels = useMemo(
    () => new Map(groups.flatMap((g) => g.tags.map((t) => [t.id, t.label] as const))),
    [groups],
  );
  const params = useSearchParams();
  const active = readFilter(params.toString(), new Set(labels.keys()));
  // The live region speaks only after the visitor changes the filter, not on arrival.
  const [interacted, setInteracted] = useState(false);

  const shown = active ? projects.filter((p) => p.tags.some((t) => t.id === active)) : projects;
  const status = active
    ? `${shown.length} of ${projects.length} projects tagged ${labels.get(active)}`
    : `All ${projects.length} projects`;

  function choose(tag: string | null) {
    pushQueryValue(FILTER_PARAM, tag);
    // Next applies the URL change in a transition; joining it keeps the live region from
    // committing the previous filter's sentence first.
    startTransition(() => setInteracted(true));
  }

  return (
    <div>
      <FilterChips groups={groups} active={active} onChoose={choose} />
      <p className="sr-only" aria-live="polite" data-testid="filter-status">
        {interacted ? status : ""}
      </p>
      <CardList projects={shown} />
    </div>
  );
}
