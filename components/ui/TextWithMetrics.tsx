import { Fragment } from "react";

import { splitByMetrics } from "@/lib/content/metrics";
import type { MetricView } from "@/lib/content/sources";

import { MetricStat } from "./MetricStat";

type TextWithMetricsProps = {
  text: string;
  /** Metrics whose `value` occurs in `text`; each is rendered at its first occurrence. */
  metrics: readonly MetricView[];
};

/**
 * Renders a sentence from content/ with every declared number routed through MetricStat, so a
 * resume bullet keeps its verbatim wording and still carries a source for each figure. Pure;
 * callers resolve source labels with `metricViews()` on the server.
 */
export function TextWithMetrics({ text, metrics }: TextWithMetricsProps) {
  const parts = splitByMetrics(text, metrics);
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <MetricStat key={i} metric={part} />
        ),
      )}
    </>
  );
}
