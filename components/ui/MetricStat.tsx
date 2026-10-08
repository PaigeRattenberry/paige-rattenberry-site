import { useId } from "react";

import type { MetricView } from "@/lib/content/sources";

type MetricStatProps = {
  metric: MetricView;
  className?: string;
};

/**
 * A number with its provenance (DESIGN §3.3, §4.4). The value is set in mono; a small button
 * beside it opens a tooltip naming what the number counts and where it was checked. The
 * tooltip is wired with `aria-describedby`, so assistive tech reads it whether or not it is
 * shown; sighted readers get it on hover or keyboard focus. It is `display: none` until then,
 * so it never widens the page. Styles live in globals.css (`.metric-*`) to keep the markup
 * small: every metric ships twice, in the HTML and in the RSC payload. Pure: it takes a
 * `MetricView` whose source is already a public label (lib/content/sources.ts), so it renders
 * the same on the server and inside a client island without touching content/.
 */
export function MetricStat({ metric, className = "" }: MetricStatProps) {
  const id = useId();
  return (
    <span className={["metric relative inline", className].join(" ")}>
      <span className="metric-value">{metric.value}</span>
      <button
        type="button"
        aria-describedby={id}
        aria-label={`Source for ${metric.value}: ${metric.label}`}
        className="metric-button"
      >
        i
      </button>
      <span role="tooltip" id={id} className="metric-tooltip">
        <span className="text-ink block">{metric.label}</span>
        {metric.note ? <span className="mt-1 block">{metric.note}</span> : null}
        <span className="mono-label mt-1.5 block">Source: {metric.sourceLabel}</span>
      </span>
    </span>
  );
}
