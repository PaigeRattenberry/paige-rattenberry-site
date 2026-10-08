function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Anything with a metric value: a content `Metric` or a rendered `MetricView`. */
type Valued = { value: string };

/**
 * Find a metric value in `text` as a whole token: "5%" must not match inside "95%", and
 * "3.89" must not match inside "13.89". A value may be preceded by punctuation such as "(" or
 * "-" (CodeLlama-7B-Instruct) and followed by anything that is not a letter or digit.
 * Returns the index of the first match at or after `from`, or -1.
 */
export function findMetric(text: string, value: string, from = 0): number {
  const re = new RegExp(`(?<![A-Za-z0-9.,])${escapeRegExp(value)}(?![A-Za-z0-9])`, "g");
  re.lastIndex = from;
  const m = re.exec(text);
  return m ? m.index : -1;
}

/**
 * Decide which text renders which metric. Each metric is wrapped at its first occurrence
 * across `texts` (a role's bullets, say), so a value that recurs, such as "7B" inside
 * "CodeLlama-7B-Instruct", gets one tooltip rather than one per mention.
 */
export function assignMetrics<M extends Valued>(
  texts: readonly string[],
  metrics: readonly M[],
): M[][] {
  const out: M[][] = texts.map(() => []);
  for (const metric of metrics) {
    const i = texts.findIndex((t) => findMetric(t, metric.value) >= 0);
    if (i >= 0) out[i].push(metric);
  }
  return out;
}

/**
 * Split `text` around one occurrence of each metric value, in reading order. Each step takes
 * the remaining metric that occurs earliest after the last wrapped span (the longer value on a
 * tie), so a metric whose first occurrence sits inside another's span moves to its next
 * occurrence without skipping past any other metric. A metric is left out only when no
 * occurrence remains outside the spans already taken.
 */
export function splitByMetrics<M extends Valued>(
  text: string,
  metrics: readonly M[],
): (string | M)[] {
  const remaining = [...metrics];
  const parts: (string | M)[] = [];
  let cursor = 0;
  for (;;) {
    let best = -1;
    let bestAt = -1;
    remaining.forEach((m, i) => {
      const at = findMetric(text, m.value, cursor);
      if (at < 0) return;
      if (
        bestAt < 0 ||
        at < bestAt ||
        (at === bestAt && m.value.length > remaining[best].value.length)
      ) {
        best = i;
        bestAt = at;
      }
    });
    if (best < 0) break;
    const [m] = remaining.splice(best, 1);
    if (bestAt > cursor) parts.push(text.slice(cursor, bestAt));
    parts.push(m);
    cursor = bestAt + m.value.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
