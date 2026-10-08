/**
 * Deterministic d3-force layout of the skills graph (DESIGN §7.2). Imported by the build
 * script and by the test that checks the committed JSON against a fresh run; never by a page
 * or a component, so d3-force stays out of every client bundle.
 *
 * Determinism: d3-force's only randomness is the jiggle it adds to coincident nodes, which
 * already comes from a fixed-seed LCG, and `simulation.randomSource()` replaces it with our
 * own seeded generator anyway. Node and edge order follow the vocabulary (stable), the
 * simulation is stepped a fixed number of ticks with alpha decay disabled, and the d3-force
 * version is pinned exactly in package.json and recorded in the output. Positions are rounded
 * to a tenth of a unit so a last-bit difference in a transcendental function on another
 * platform cannot change the file.
 */
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type { SkillEdge, SkillNode } from "@/lib/content/explorer";

import {
  type ExplorerLayout,
  LABEL_SIZE,
  type LabelPlacement,
  LAYOUT_BOX,
  labelWidth,
  nodeRadius,
  TEASER_LABEL_SIZE,
} from "./geometry";

export const LAYOUT_SEED = 20260915;
export const LAYOUT_TICKS = 300;

/** mulberry32: a small, well-distributed 32-bit PRNG with a numeric seed. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

type Node = SimulationNodeDatum & SkillNode;
type Link = SimulationLinkDatum<Node> & { weight: number };

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Lay out the graph. The forces: links pull co-occurring skills together (shorter for heavier
 * edges), charge spreads everything apart (hubs more), collision keeps circles from touching,
 * and a weak pull to the centre lines keeps the picture compact; positions are then clamped
 * inside the box's padding.
 */
export function computeLayout(
  graph: { nodes: readonly SkillNode[]; edges: readonly SkillEdge[] },
  d3ForceVersion: string,
): ExplorerLayout {
  const { width, height, padding } = LAYOUT_BOX;
  const nodes: Node[] = graph.nodes.map((n) => ({ ...n }));
  const links: Link[] = graph.edges.map((e) => ({ ...e }));

  const simulation = forceSimulation<Node>(nodes)
    .randomSource(seededRandom(LAYOUT_SEED))
    .alphaDecay(0)
    .velocityDecay(0.35)
    .force(
      "link",
      forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance((l) => 80 - 10 * Math.min(3, l.weight))
        .strength((l) => Math.min(1, 0.3 + 0.15 * l.weight)),
    )
    .force(
      "charge",
      // -140 since Session 9 (from -120): the PyTorch tag on Hammerspace joined the agentic and
      // vision clusters, and at -120 five always-shown labels no longer found a clear spot.
      forceManyBody<Node>().strength((d) => -140 - 40 * d.count),
    )
    .force(
      "collide",
      forceCollide<Node>()
        .radius((d) => nodeRadius(d.count) + (d.count > 1 ? 26 : 12))
        .iterations(2),
    )
    .force("center", forceCenter(width / 2, height / 2))
    .force("x", forceX<Node>(width / 2).strength(0.04))
    .force("y", forceY<Node>(height / 2).strength(0.06))
    .stop();

  simulation.tick(LAYOUT_TICKS);

  const placed = nodes.map((n) => {
    const r = nodeRadius(n.count);
    return {
      ...n,
      r,
      x: round1(Math.min(width - padding - r, Math.max(padding + r, n.x ?? 0))),
      y: round1(Math.min(height - padding - r, Math.max(padding + r, n.y ?? 0))),
    };
  });
  // Every node's label at the island's size (multi-entry labels always shown), and the hubs'
  // labels at the teaser's larger size, placed among the hubs only.
  const labels = placeLabels(placed, LABEL_SIZE, (n) => n.count > 1);
  const hubs = placed.filter((n) => n.count > 2);
  const hubLabels = placeLabels(
    placed,
    TEASER_LABEL_SIZE,
    (n) => n.count > 2,
    (n) => n.count > 2,
  );

  return {
    generator: "scripts/layout-explorer.ts",
    d3Force: d3ForceVersion,
    seed: LAYOUT_SEED,
    ticks: LAYOUT_TICKS,
    width,
    height,
    nodes: placed.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      labelAt: labels.get(n.id)!,
      ...(hubs.includes(n) ? { hubLabelAt: hubLabels.get(n.id)! } : {}),
    })),
  };
}

type Box = { x0: number; y0: number; x1: number; y1: number };

function overlap(a: Box, b: Box): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

type Placed = { id: string; label: string; count: number; x: number; y: number; r: number };

/**
 * Place labels so they collide as little as possible. Nodes are taken most-used first, and
 * each tries eight spots around its circle (below, above, right, left and the diagonals),
 * scoring each by the area it overlaps with every circle (doubly), with every label already
 * placed and with the box's edges. A label fits when its best spot overlaps less than a tenth
 * of its own area. `alwaysShown` says which labels the picture always draws (they are placed
 * first and block the rest); `include` limits the pass to a subset, e.g. the hubs for the
 * teaser. The island draws a neighbour's label only when it fits, so lighting a hub never
 * piles fifteen names on top of each other. Deterministic, so the picture is fixed at build.
 */
export function placeLabels(
  nodes: readonly Placed[],
  size: number,
  alwaysShown: (n: Placed) => boolean,
  include: (n: Placed) => boolean = () => true,
): Map<string, LabelPlacement> {
  const { width, height } = LAYOUT_BOX;
  const gap = 4;
  const ascent = size * 0.85;
  const descent = size * 0.25;
  const circles: Box[] = nodes.map((n) => ({
    x0: n.x - n.r - 2,
    y0: n.y - n.r - 2,
    x1: n.x + n.r + 2,
    y1: n.y + n.r + 2,
  }));
  const taken: Box[] = [];
  const frame: Box = { x0: 0, y0: 0, x1: width, y1: height };
  const out = new Map<string, LabelPlacement>();
  const order = nodes
    .filter(include)
    .sort(
      (a, b) =>
        Number(alwaysShown(b)) - Number(alwaysShown(a)) ||
        b.count - a.count ||
        a.id.localeCompare(b.id),
    );
  for (const n of order) {
    const w = labelWidth(n.label, size);
    const d = n.r + gap;
    const mid = size * 0.35;
    const spots: Omit<LabelPlacement, "fit">[] = [
      { anchor: "middle", x: n.x, y: n.y + d + ascent },
      { anchor: "middle", x: n.x, y: n.y - d },
      { anchor: "start", x: n.x + d, y: n.y + mid },
      { anchor: "end", x: n.x - d, y: n.y + mid },
      { anchor: "start", x: n.x + d * 0.75, y: n.y + d * 0.75 + ascent },
      { anchor: "end", x: n.x - d * 0.75, y: n.y + d * 0.75 + ascent },
      { anchor: "start", x: n.x + d * 0.75, y: n.y - d * 0.75 },
      { anchor: "end", x: n.x - d * 0.75, y: n.y - d * 0.75 },
    ];
    let best = spots[0];
    let bestBox: Box | null = null;
    let bestScore = Infinity;
    for (const spot of spots) {
      const x0 =
        spot.anchor === "middle" ? spot.x - w / 2 : spot.anchor === "start" ? spot.x : spot.x - w;
      const box: Box = { x0, y0: spot.y - ascent, x1: x0 + w, y1: spot.y + descent };
      const area = (box.x1 - box.x0) * (box.y1 - box.y0);
      const outside = area - overlap(box, frame);
      const score =
        2 * circles.reduce((sum, b) => sum + overlap(box, b), 0) +
        taken.reduce((sum, b) => sum + overlap(box, b), 0) +
        outside * 4;
      if (score < bestScore) {
        bestScore = score;
        best = spot;
        bestBox = box;
      }
    }
    const area = w * (ascent + descent);
    out.set(n.id, {
      x: round1(best.x),
      y: round1(best.y),
      anchor: best.anchor,
      fit: bestScore < area * 0.1,
    });
    if (bestBox) taken.push(bestBox);
  }
  return out;
}
