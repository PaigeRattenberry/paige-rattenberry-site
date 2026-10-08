/**
 * The committed constellation layout (`content/generated/explorer-layout.json`, written by
 * `scripts/layout-explorer.ts`), checked against the derived graph at import: every node has
 * a position and no position is orphaned, so a stale file fails the build rather than
 * drawing a skill in the wrong place or not at all. Lives under lib/content/ because only
 * the loaders may import from content/ (ESLint).
 */
import { z } from "zod";

import layoutRaw from "@/content/generated/explorer-layout.json";

import { explorer } from "./explorer";
import type { ExplorerLayout } from "@/lib/explorer/geometry";

const PlacementSchema = z.object({
  x: z.number(),
  y: z.number(),
  anchor: z.enum(["start", "middle", "end"]),
  fit: z.boolean(),
});

const LayoutSchema = z.object({
  generator: z.string().min(1),
  d3Force: z.string().min(1),
  seed: z.number().int(),
  ticks: z.number().int().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      x: z.number(),
      y: z.number(),
      labelAt: PlacementSchema,
      hubLabelAt: PlacementSchema.optional(),
    }),
  ),
});

export const explorerLayout: ExplorerLayout = (() => {
  const layout = LayoutSchema.parse(layoutRaw);
  const laidOut = new Set(layout.nodes.map((n) => n.id));
  const derived = new Set(explorer.nodes.map((n) => n.id));
  const missing = [...derived].filter((id) => !laidOut.has(id));
  const stale = [...laidOut].filter((id) => !derived.has(id));
  if (missing.length || stale.length || laidOut.size !== layout.nodes.length) {
    throw new Error(
      `content/generated/explorer-layout.json is out of date (run npm run layout:explorer): ` +
        `missing [${missing.join(", ")}], stale [${stale.join(", ")}]`,
    );
  }
  return layout;
})();
