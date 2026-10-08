import { Figure } from "@/components/ui/Figure";
import { iouTable } from "@/lib/content/load";
import { sourceLabel } from "@/lib/content/sources";

type IouChartFigureProps = {
  /** Id in content/figures.ts. */
  id: string;
  /** Figure number in the page's own sequence (DESIGN §4.3); a string from MDX, see DiagramFigure. */
  number: number | string;
};

/** Plot box in SVG user units; strokes and dashes are set in CSS px via non-scaling-stroke. */
const W = 1000;
const H = 560;
/** Headroom above the last tick keeps the peak note clear of every line at 390 px. */
const Y_MAX = 0.7;
const Y_TICKS = [0, 0.2, 0.4, 0.6];

/**
 * One line style per method, fixed by name so the same method looks the same in every chart
 * (DESIGN §4.2: a neutral ramp plus the one accent, which marks the thesis's finding).
 */
const STYLES: Record<string, { stroke: string; dash?: string; width: number }> = {
  FullGrad: { stroke: "var(--accent)", width: 2.5 },
  "Grad-CAM": { stroke: "var(--ink-2)", width: 1.5 },
  "Eigen-CAM": { stroke: "var(--ink-2)", dash: "7 5", width: 1.5 },
  "Grad-CAM++": { stroke: "var(--ink-3)", dash: "2 4", width: 1.5 },
  "Layer-CAM": { stroke: "var(--ink-3)", dash: "8 4 2 4", width: 1.5 },
};
const FALLBACK = { stroke: "var(--ink-3)", width: 1.5 };

/** Values as the thesis prints them: three decimals, or the extra digit where the table has one. */
export function formatIou(v: number): string {
  return Number.isInteger(v * 1000) ? v.toFixed(3) : String(v);
}

/**
 * A recreated results figure: average IoU against threshold for every CAM method, plotted
 * from values kept in content/figures.ts with their table and page (DESIGN §3.5). The plot
 * is an SVG that scales with the column; every label is HTML positioned around it, so text
 * stays readable at 390 px instead of shrinking with the drawing. Static, like a figure in a
 * paper: no hover layer, and the full table sits under the plot for reading and for
 * assistive technology. Server component.
 */
export function IouChartFigure({ id, number }: IouChartFigureProps) {
  const t = iouTable(id);
  const figureNumber = Number(number);
  if (!Number.isFinite(figureNumber)) {
    throw new Error(`IouChart "${id}": number "${number}" is not a figure number`);
  }
  // The scale is fixed so the two charts compare; a value past it would plot outside the box.
  for (const s of t.series) {
    const over = s.values.find((v) => v > Y_MAX);
    if (over !== undefined)
      throw new Error(`IouChart "${id}": ${s.method} value ${over} exceeds the ${Y_MAX} scale`);
  }
  const n = t.thresholds.length;
  const x = (i: number) => ((i + 0.5) / n) * W;
  // A tenth of a user unit is invisible; rounding keeps the points strings short (they ship twice).
  const y = (v: number) => Math.round((H - (v / Y_MAX) * H) * 10) / 10;
  const highlight = t.series.find((s) => s.method === "FullGrad") ?? t.series[0];
  const peakIndex = highlight.values.indexOf(Math.max(...highlight.values));
  const peak = { v: highlight.values[peakIndex], i: peakIndex };

  return (
    <Figure
      number={figureNumber}
      caption={t.caption}
      source={`${sourceLabel(t.source)}, ${t.table}, ${t.cite}`}
    >
      <div className="px-5 pt-5 pb-4 sm:px-6">
        <ul className="mono-label flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Legend">
          {t.series.map((s) => {
            const style = STYLES[s.method] ?? FALLBACK;
            return (
              <li key={s.method} className="flex items-center gap-2">
                <svg width="28" height="8" aria-hidden="true" className="shrink-0">
                  <line
                    x1="0"
                    y1="4"
                    x2="28"
                    y2="4"
                    stroke={style.stroke}
                    strokeWidth={style.width}
                    strokeDasharray={style.dash}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-ink">{s.method}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 grid grid-cols-[2.5rem_1fr] gap-x-1">
          {/* y axis: labels are HTML so they keep their size at every width. */}
          <div className="relative" aria-hidden="true">
            {Y_TICKS.map((v) => (
              <span
                key={v}
                className="mono-label absolute right-1 -translate-y-1/2"
                style={{ top: `${(1 - v / Y_MAX) * 100}%` }}
              >
                {v === 0 ? "0" : v.toFixed(1)}
              </span>
            ))}
          </div>
          <div className="relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="iou-plot block h-auto w-full"
              style={{ aspectRatio: `${W} / ${H}` }}
              role="img"
              aria-label={`Line chart of average IoU against threshold for each CAM method explaining ${t.model}. The values are in the table below.`}
            >
              {Y_TICKS.map((v) => (
                <line
                  key={v}
                  x1="0"
                  x2={W}
                  y1={y(v)}
                  y2={y(v)}
                  className="iou-grid"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {t.series.map((s) => {
                const style = STYLES[s.method] ?? FALLBACK;
                return (
                  <g key={s.method}>
                    <polyline
                      points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeDasharray={style.dash}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </svg>
            {/* Markers only on the highlighted series (one on every point of five lines is noise),
                as HTML dots so they keep their size while the plot scales. */}
            {highlight.values.map((v, i) => (
              <span
                key={i}
                className={["iou-marker", i === peak.i ? "iou-marker-peak" : ""].join(" ")}
                style={{ left: `${((i + 0.5) / n) * 100}%`, top: `${(1 - v / Y_MAX) * 100}%` }}
                aria-hidden="true"
              />
            ))}
            {/* The one direct label: the highlighted series' peak, noted in the corner the
                lines never reach rather than beside the point, where it collided with them. */}
            <span
              className="mono-label text-ink pointer-events-none absolute top-0 right-0 whitespace-nowrap"
              aria-hidden="true"
            >
              {highlight.method} peak {formatIou(peak.v)} at {t.thresholds[peak.i]}%
            </span>
          </div>
          <div aria-hidden="true" />
          <div
            className="mono-label mt-1.5 grid text-center"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
            aria-hidden="true"
          >
            {/* Ten labels do not fit a phone's plot width (they ran together at 360 px), so
                every other one is hidden below sm; its column stays, and the table has them all. */}
            {t.thresholds.map((th, i) => (
              <span key={th} className={i % 2 === 1 ? "max-sm:invisible" : undefined}>
                {th}%
              </span>
            ))}
          </div>
          <div aria-hidden="true" />
          <p className="mono-label mt-1 text-center">threshold</p>
        </div>

        <details className="mt-4">
          <summary className="mono-label text-ink cursor-pointer">Values as a table</summary>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full text-[0.85rem] tabular-nums">
              <caption className="mono-label mb-2 text-left">
                {t.table}: average IoU by threshold, {t.model}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left">
                    Method
                  </th>
                  {t.thresholds.map((th) => (
                    <th key={th} scope="col" className="text-right">
                      {th}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.series.map((s) => (
                  <tr key={s.method}>
                    <th scope="row" className="text-left font-normal">
                      {s.method}
                    </th>
                    {s.values.map((v, i) => (
                      <td key={i} className="text-right">
                        {formatIou(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </Figure>
  );
}
