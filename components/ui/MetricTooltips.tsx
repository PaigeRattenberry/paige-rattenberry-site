"use client";

import { useEffect } from "react";

/** Space kept between an open tooltip and either side of the viewport, in px (1rem). */
const GUTTER = 16;

function metricOf(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(".metric") : null;
}

/** Shift the tooltip sideways so it stays inside the viewport; no-op while it is hidden. */
function place(metric: HTMLElement) {
  const tip = metric.querySelector<HTMLElement>(".metric-tooltip");
  if (!tip) return;
  tip.style.removeProperty("--metric-shift");
  const rect = tip.getBoundingClientRect();
  if (rect.width === 0) return;
  const viewport = document.documentElement.clientWidth;
  let shift = 0;
  if (rect.right > viewport - GUTTER) shift = viewport - GUTTER - rect.right;
  if (rect.left + shift < GUTTER) shift = GUTTER - rect.left;
  if (shift !== 0) tip.style.setProperty("--metric-shift", `${Math.round(shift)}px`);
}

/**
 * One document-level listener set for every MetricStat, so the metrics themselves stay server
 * markup. The tooltip opens with CSS (`:hover`, `:focus-within`); this island only
 * (1) keeps an open tooltip inside the viewport, since a number near the end of a line on a
 * phone would otherwise push it off-screen, and (2) makes it dismissible with Escape without
 * moving focus or the pointer (WCAG 1.4.13). Entering the metric again reopens it.
 */
export function MetricTooltips() {
  useEffect(() => {
    const onEnter = (e: FocusEvent | PointerEvent) => {
      const metric = metricOf(e.target);
      if (!metric || metric.contains(e.relatedTarget as Node | null)) return;
      delete metric.dataset.dismissed;
      place(metric);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document
        .querySelectorAll<HTMLElement>(".metric:hover, .metric:focus-within")
        .forEach((metric) => {
          metric.dataset.dismissed = "";
        });
    };
    document.addEventListener("focusin", onEnter);
    document.addEventListener("pointerover", onEnter);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onEnter);
      document.removeEventListener("pointerover", onEnter);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
