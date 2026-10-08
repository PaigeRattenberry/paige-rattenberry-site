import type { ReactNode, SVGProps } from "react";

import { edgeWidth, LABEL_SIZE, nodeRadius, TEASER_LABEL_SIZE } from "@/lib/explorer/geometry";

import type { ConstellationEdge, ConstellationNode } from "./types";

export type NodeState = "plain" | "active" | "near" | "dim";

type ConstellationSvgProps = {
  nodes: readonly ConstellationNode[];
  edges: readonly ConstellationEdge[];
  width: number;
  height: number;
  /** The filtered skill: drawn in the accent with its neighbourhood lit, the rest dimmed. */
  active?: string | null;
  /** The hovered or focused skill: its neighbourhood lit (over the filter's) without dimming more. */
  focus?: string | null;
  /**
   * Which nodes get a text label: every one, the multi-entry ones, the hubs (three or more
   * entries, at the teaser's larger size and its own placement), or none.
   */
  labels?: "all" | "major" | "hubs" | "none";
  /**
   * Static, minimal markup for the home teaser: bare lines and circles, no hit targets, no
   * state or id attributes, so the figure costs as little as possible on the wire.
   */
  compact?: boolean;
  /** Extra attributes and handlers for each node's group (the interactive wrapper). */
  nodeProps?: (node: ConstellationNode, state: NodeState) => SVGProps<SVGGElement>;
  /** Static wrapper attributes on the <svg>. */
  svgProps?: SVGProps<SVGSVGElement>;
  className?: string;
  children?: ReactNode;
};

/** The skills adjacent to `id`, plus `id` itself. */
export function neighbourhood(id: string, edges: readonly ConstellationEdge[]): Set<string> {
  const near = new Set<string>([id]);
  for (const e of edges) {
    if (e.source === id) near.add(e.target);
    else if (e.target === id) near.add(e.source);
  }
  return near;
}

/**
 * The teaser's edges: one <path> per stroke width, each edge a move-and-line pair, since a
 * static figure never lights or dims a single edge and one <line> per edge was most of the
 * teaser's markup. Every path carries its width as an attribute: the stylesheet sets no
 * stroke width on edges, since any author rule would outrank the attribute.
 */
function compactEdges(
  edges: readonly ConstellationEdge[],
  byId: ReadonlyMap<string, ConstellationNode>,
) {
  const byWidth = new Map<number, string[]>();
  for (const e of edges) {
    const a = byId.get(e.source)!;
    const b = byId.get(e.target)!;
    const w = edgeWidth(e.weight);
    let segments = byWidth.get(w);
    if (!segments) byWidth.set(w, (segments = []));
    segments.push(`M${a.x} ${a.y}L${b.x} ${b.y}`);
  }
  // Thinnest first, so heavier edges draw on top.
  return [...byWidth]
    .sort(([a], [b]) => a - b)
    .map(([w, segments]) => <path key={w} d={segments.join("")} strokeWidth={w} />);
}

/**
 * The skills constellation, drawn from precomputed positions (DESIGN §7.2): edges are
 * co-occurrence (width = shared entries), nodes are skills (radius from entry count), and
 * the one accent marks the filtered skill and its neighbourhood. Pure and server-renderable:
 * the home teaser renders it static and compact; `SkillsConstellation` adds hover, focus and
 * keyboard. Colour is a neutral ramp plus the accent; identity comes from the labels, the
 * caption and the list view.
 */
export function ConstellationSvg({
  nodes,
  edges,
  width,
  height,
  active = null,
  focus = null,
  labels = "major",
  compact = false,
  nodeProps,
  svgProps,
  className = "",
  children,
}: ConstellationSvgProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  // Hover or focus lights its own neighbourhood alongside the filter's, never instead of it:
  // the filter alone decides what is dimmed, so the focus cue is never just a stroke on a
  // faded dot and the filter's highlight survives the pointer passing over another node.
  const centres = [active, focus].filter((id): id is string => id !== null);
  const lit = centres.length
    ? new Set(centres.flatMap((id) => [...neighbourhood(id, edges)]))
    : null;

  function stateOf(id: string): NodeState {
    if (id === active) return "active";
    if (lit?.has(id)) return "near";
    return active ? "dim" : "plain";
  }

  function showLabel(n: ConstellationNode, state: NodeState) {
    switch (labels) {
      case "all":
        return true;
      case "major":
        // A neighbour's label appears only where the layout found it room (labelAt.fit).
        return n.count > 1 || state === "active" || (state === "near" && n.labelAt.fit);
      case "hubs":
        return n.count > 2 && n.hubLabelAt !== undefined;
      default:
        return false;
    }
  }

  const labelSize = labels === "hubs" ? TEASER_LABEL_SIZE : LABEL_SIZE;
  const placement = (n: ConstellationNode) =>
    labels === "hubs" ? (n.hubLabelAt ?? n.labelAt) : n.labelAt;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={["constellation", className].join(" ")}
      data-testid="constellation"
      {...svgProps}
    >
      <g className="constellation-edges" aria-hidden="true">
        {compact
          ? compactEdges(edges, byId)
          : edges.map((e) => {
              const a = byId.get(e.source)!;
              const b = byId.get(e.target)!;
              const on = centres.includes(e.source) || centres.includes(e.target);
              return (
                <line
                  key={`${e.source}|${e.target}`}
                  data-state={on ? "lit" : lit ? "dim" : "plain"}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={edgeWidth(e.weight)}
                />
              );
            })}
      </g>
      <g className="constellation-nodes">
        {nodes.map((n) => {
          const state = stateOf(n.id);
          const r = nodeRadius(n.count);
          const at = placement(n);
          const label = showLabel(n, state) ? (
            <text
              className="constellation-label"
              x={compact ? at.x : at.x - n.x}
              y={compact ? at.y : at.y - n.y}
              textAnchor={at.anchor}
              fontSize={labelSize}
            >
              {n.label}
            </text>
          ) : null;
          if (compact) {
            return (
              <g key={n.id}>
                <circle className="constellation-dot" cx={n.x} cy={n.y} r={r} />
                {label}
              </g>
            );
          }
          return (
            <g
              key={n.id}
              className="constellation-node"
              data-state={state}
              data-skill={n.id}
              transform={`translate(${n.x} ${n.y})`}
              {...nodeProps?.(n, state)}
            >
              {/* Hit target larger than the mark (dataviz: never only the painted pixels). */}
              <circle className="constellation-hit" r={r + 8} fill="transparent" />
              <circle className="constellation-dot" r={r} />
              {label}
            </g>
          );
        })}
      </g>
      {children}
    </svg>
  );
}
