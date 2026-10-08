import { chipClass, FilterChips } from "@/components/ui/FilterChips";

import { SkillList } from "./SkillList";
import { SkillsConstellation } from "./SkillsConstellation";
import { Timeline } from "./Timeline";
import type { ExplorerData } from "./types";

export type ExplorerViewMode = "graph" | "list";

type ExplorerViewProps = {
  data: ExplorerData;
  active: string | null;
  view: ExplorerViewMode;
  /**
   * The live-region text; empty until the visitor changes the filter. Omitted by the
   * server-rendered fallback, which renders no live region at all (the island owns it, and
   * tests use its presence to know the island has hydrated).
   */
  status?: string;
  onChoose?: (id: string | null) => void;
  onView?: (view: ExplorerViewMode) => void;
};

/**
 * The explorer's markup, shared by the client island and its server-rendered Suspense
 * fallback (which passes no handlers): the graph-or-list view with its toggle first, so the
 * figure is in view on arrival, then the chips and the live status directly above the
 * timeline they filter. Handlers are optional so a server component can render it.
 */
export function ExplorerView({ data, active, view, status, onChoose, onView }: ExplorerViewProps) {
  return (
    <div className="explorer">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="mono-label">
          <span className="text-ink">Skills</span> · {data.nodes.length} used across{" "}
          {data.entries.length} entries
        </p>
        <div role="group" aria-label="Skills view" className="flex gap-1.5">
          <button
            type="button"
            className={chipClass(view === "graph")}
            aria-pressed={view === "graph"}
            onClick={onView ? () => onView("graph") : undefined}
          >
            Constellation
          </button>
          <button
            type="button"
            className={chipClass(view === "list")}
            aria-pressed={view === "list"}
            onClick={onView ? () => onView("list") : undefined}
          >
            View as list
          </button>
        </div>
      </div>

      <div className="mt-3">
        {view === "graph" ? (
          <SkillsConstellation
            nodes={data.nodes}
            edges={data.edges}
            width={data.width}
            height={data.height}
            active={active}
            onChoose={onChoose}
          />
        ) : (
          <SkillList
            nodes={data.nodes}
            edges={data.edges}
            groups={data.groups}
            active={active}
            onChoose={onChoose}
          />
        )}
      </div>

      <p className="mono-label mt-8 mb-3">
        <span className="text-ink">Filter</span> · one skill at a time
      </p>
      <FilterChips
        groups={data.groups}
        active={active}
        onChoose={onChoose}
        allLabel="All work"
        label="Filter the timeline by skill"
      />
      {status !== undefined ? (
        <p className="sr-only" aria-live="polite" data-testid="explorer-status">
          {status}
        </p>
      ) : null}

      <p className="mono-label mt-10">
        <span className="text-ink">Timeline</span> · newest first, grouped by year
      </p>
      <Timeline entries={data.entries} active={active} />
    </div>
  );
}
