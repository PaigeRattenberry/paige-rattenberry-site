"use client";

import { type KeyboardEvent, useRef, useState } from "react";

import { ConstellationSvg } from "./ConstellationSvg";
import { entriesText } from "./format";
import type { ConstellationEdge, ConstellationNode } from "./types";

type SkillsConstellationProps = {
  nodes: readonly ConstellationNode[];
  edges: readonly ConstellationEdge[];
  width: number;
  height: number;
  active: string | null;
  /** Omitted in the server-rendered fallback; the nodes are then inert until hydration. */
  onChoose?: (id: string | null) => void;
};

/**
 * The interactive constellation (DESIGN §7.2): every node is a button (`role="button"`,
 * `aria-pressed`), clicking or pressing Enter/Space applies the same filter as a chip, and
 * the graph is one tab stop with arrow keys walking the nodes in vocabulary order (Home/End
 * jump). Hovering or focusing a node lights its neighbourhood and names it in the caption
 * below, so the picture stays readable where labels are small. Layout is precomputed; the
 * client only handles hover, focus and clicks.
 */
export function SkillsConstellation({
  nodes,
  edges,
  width,
  height,
  active,
  onChoose,
}: SkillsConstellationProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // The roving tab stop: the active skill, else the most-used one.
  const fallback = nodes.reduce<ConstellationNode | undefined>(
    (a, b) => (!a || b.count > a.count ? b : a),
    undefined,
  );
  const [current, setCurrent] = useState<string | null>(active ?? fallback?.id ?? null);
  const rootRef = useRef<SVGSVGElement>(null);

  // A filter chosen elsewhere (a chip, the URL) moves the tab stop onto that node: state
  // adjusted during render from the previous prop, as React recommends over an effect.
  const [seenActive, setSeenActive] = useState(active);
  if (active !== seenActive) {
    setSeenActive(active);
    if (active) setCurrent(active);
  }

  function focusNode(id: string) {
    setCurrent(id);
    rootRef.current?.querySelector<SVGGElement>(`[data-skill="${id}"]`)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<SVGGElement>, node: ConstellationNode) {
    const index = nodes.findIndex((n) => n.id === node.id);
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % nodes.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + nodes.length) % nodes.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = nodes.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onChoose?.(active === node.id ? null : node.id);
        return;
      default:
        return;
    }
    event.preventDefault();
    focusNode(nodes[next].id);
  }

  const named = hover ?? focus;
  const namedNode = named ? nodes.find((n) => n.id === named) : null;

  return (
    <div className="constellation-frame">
      <ConstellationSvg
        nodes={nodes}
        edges={edges}
        width={width}
        height={height}
        active={active}
        focus={named}
        labels="major"
        svgProps={{
          ref: rootRef,
          role: "group",
          "aria-label": "Skills constellation. Arrow keys move between skills; Enter filters.",
        }}
        nodeProps={(node) => ({
          role: "button",
          tabIndex: node.id === current ? 0 : -1,
          "aria-pressed": active === node.id,
          "aria-label": `${node.label}, ${entriesText(node.count)}`,
          onClick: onChoose ? () => onChoose(active === node.id ? null : node.id) : undefined,
          onKeyDown: (event) => onKeyDown(event, node),
          onFocus: () => setFocus(node.id),
          onBlur: () => setFocus((f) => (f === node.id ? null : f)),
          onMouseEnter: () => setHover(node.id),
          onMouseLeave: () => setHover((h) => (h === node.id ? null : h)),
        })}
      />
      <p className="mono-label mt-2 min-h-[1.4em]" aria-hidden="true">
        {namedNode ? (
          <>
            <span className="text-ink">{namedNode.label}</span> · {entriesText(namedNode.count)}
          </>
        ) : active ? (
          <>
            <span className="text-ink">{nodes.find((n) => n.id === active)?.label}</span> and the
            skills it was used with
          </>
        ) : (
          "Larger circles: more entries. Lines: used on the same work."
        )}
      </p>
    </div>
  );
}
