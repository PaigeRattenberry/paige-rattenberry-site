"use client";

import { useSearchParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { pushQueryValue, readQueryValue } from "@/lib/query-filter";

import { ExplorerView, type ExplorerViewMode } from "./ExplorerView";
import { type ExplorerData, SKILL_PARAM } from "./types";

/** The `?skill=` value when it names a used skill; anything else means "everything". */
export function readSkill(query: string, known: ReadonlySet<string>) {
  return readQueryValue(query, SKILL_PARAM, known);
}

/** The live-region sentence for a filter. */
export function statusText(data: ExplorerData, active: string | null) {
  const total = data.entries.length;
  if (!active) return `All ${total} entries`;
  const label = data.nodes.find((n) => n.id === active)?.label ?? active;
  const shown = data.entries.filter((e) => e.tags.some((t) => t.id === active)).length;
  return `${shown} of ${total} entries use ${label}`;
}

/**
 * The career timeline + skills explorer island (DESIGN §7.2). The chosen skill lives in the
 * URL (`/experience?skill=rag`) so a filtered view is shareable and back/forward walk through
 * choices; chips and constellation nodes apply the same filter through `history.pushState`,
 * which Next.js syncs into `useSearchParams`, so nothing is fetched. The graph/list choice is
 * local state. Rendered inside a Suspense boundary whose fallback is the same markup,
 * unfiltered, prerendered on the server.
 */
export function Explorer({ data }: { data: ExplorerData }) {
  const known = useMemo(() => new Set(data.nodes.map((n) => n.id)), [data]);
  const params = useSearchParams();
  const active = readSkill(params.toString(), known);
  const [view, setView] = useState<ExplorerViewMode>("graph");
  // The live region speaks only after the visitor changes the filter, not on arrival.
  const [interacted, setInteracted] = useState(false);

  function choose(id: string | null) {
    pushQueryValue(SKILL_PARAM, id);
    // Next applies the URL change in a transition; joining it keeps the live region from
    // committing the previous filter's sentence first.
    startTransition(() => setInteracted(true));
  }

  return (
    <ExplorerView
      data={data}
      active={active}
      view={view}
      status={interacted ? statusText(data, active) : ""}
      onChoose={choose}
      onView={setView}
    />
  );
}
