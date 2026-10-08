/**
 * Pure geometry the constellation shares between the build-time layout (`./layout.ts`), the
 * server view (`./view.ts`) and the client island: the drawing box, node radii and edge
 * widths. No content and no d3 here, so the island bundles nothing but arithmetic.
 */

/** The layout box (viewBox units) and the padding that keeps every node inside it. */
export const LAYOUT_BOX = { width: 760, height: 440, padding: 30 } as const;

/**
 * Node radius from the number of entries that carry the skill (DESIGN §7.2: size = entry
 * count). Area grows with the count, so a skill used four times reads as about twice a
 * one-off, never four times.
 */
export function nodeRadius(count: number): number {
  return 4.5 + 4 * Math.sqrt(count);
}

/** Edge stroke width from the co-occurrence weight: hairline for one shared entry, up to 3. */
export function edgeWidth(weight: number): number {
  return Math.min(3, 0.75 + 0.75 * weight);
}

/** Label size (viewBox units) the layout places labels for; the island draws them at this size. */
export const LABEL_SIZE = 12;
/** The home teaser's hub labels: larger, since that figure is drawn at about 60% scale. */
export const TEASER_LABEL_SIZE = 17;

/** Estimated width of a mono label at `size` (JetBrains Mono advances about 0.6 em). */
export function labelWidth(text: string, size = LABEL_SIZE): number {
  return text.length * size * 0.62;
}

/**
 * Where a node's label sits: its anchor point and text-anchor, in viewBox units, and whether
 * it found a spot clear of the always-shown labels and the circles (`fit`). A label that
 * did not fit is drawn only when it is the filtered skill itself.
 */
export type LabelPlacement = {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  fit: boolean;
};

/**
 * A node's laid-out position, rounded to a tenth of a viewBox unit, its label's place at
 * LABEL_SIZE, and, for a hub (three or more entries), a second place at TEASER_LABEL_SIZE.
 */
export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  labelAt: LabelPlacement;
  hubLabelAt?: LabelPlacement;
};

/** What `scripts/layout-explorer.ts` writes and `lib/content/explorer-layout.ts` reads. */
export type ExplorerLayout = {
  /** The script that produced the file, for a reader of the JSON. */
  generator: string;
  /** Installed d3-force version; a different one may lay out differently. */
  d3Force: string;
  seed: number;
  ticks: number;
  width: number;
  height: number;
  nodes: LayoutNode[];
};
