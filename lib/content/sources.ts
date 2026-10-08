import { SOURCE_LABELS } from "@/content/sources";

import type { Metric, SourceId } from "./schema";

/**
 * The tooltip label for a source id. Throws rather than falling back to the raw id, so an
 * unlabelled `_source/...` path can never reach a public page (DESIGN §3.4).
 */
export function sourceLabel(id: SourceId): string {
  const label = SOURCE_LABELS[id];
  if (!label) throw new Error(`No reader-facing label for source "${id}" in content/sources.ts`);
  return label;
}

/**
 * What a rendered metric carries: the value, its label and note, and the source *label*. The
 * source id (which may be a `_source/` path) is resolved here, on the server, and never
 * reaches a component, so a client island can render metrics without bundling the label map
 * or serialising private paths into the page.
 */
export type MetricView = {
  value: string;
  label: string;
  note?: string;
  sourceLabel: string;
};

export function metricView(metric: Metric): MetricView {
  return {
    value: metric.value,
    label: metric.label,
    ...(metric.note ? { note: metric.note } : {}),
    sourceLabel: sourceLabel(metric.source),
  };
}

export function metricViews(metrics: readonly Metric[]): MetricView[] {
  return metrics.map(metricView);
}
