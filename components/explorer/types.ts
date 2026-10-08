/**
 * Plain, serialisable explorer data: what the server derives (`lib/explorer/view.ts`) and
 * hands to the client island. Skill labels and source labels are resolved, so the island
 * imports no content loader and no `_source/` path is serialised (AGENTS.md).
 */
import type { TagItem } from "@/components/ui/Tag";
import type { FilterGroup } from "@/components/ui/FilterChips";
import type { MetricView } from "@/lib/content/sources";
import type { LabelPlacement } from "@/lib/explorer/geometry";

export type TimelineEntry = {
  id: string;
  /** "Role", "Project", "Coursework", "Honours thesis", ... */
  kindLabel: string;
  title: string;
  org?: string;
  team?: string;
  /** Date range as content prints it. */
  dates: string;
  /** Year of the first period's start; the timeline groups by it. */
  year: number;
  /** One line of substance; numbers in it render through MetricStat. */
  line: string;
  lineMetrics: readonly MetricView[];
  /** Shown under the line wherever the work appears (StimMap3D's non-clinical wording). */
  disclaimer?: string;
  tags: readonly TagItem[];
  /** The page holding the full record. */
  href: string;
};

export type ConstellationNode = {
  id: string;
  label: string;
  category: string;
  /** Entries carrying the skill (node size). */
  count: number;
  /** Precomputed position in viewBox units, and where its text label sits. */
  x: number;
  y: number;
  labelAt: LabelPlacement;
  /** A hub's label place at the teaser's size (three or more entries only). */
  hubLabelAt?: LabelPlacement;
};

export type ConstellationEdge = {
  source: string;
  target: string;
  /** Entries carrying both skills (edge width). */
  weight: number;
};

export type ExplorerData = {
  entries: readonly TimelineEntry[];
  /** Chip groups: used skills only, by vocabulary category. */
  groups: readonly FilterGroup[];
  nodes: readonly ConstellationNode[];
  edges: readonly ConstellationEdge[];
  /** The constellation's viewBox. */
  width: number;
  height: number;
};

/** The query parameter that carries the chosen skill (`/experience?skill=rag`). */
export const SKILL_PARAM = "skill";
