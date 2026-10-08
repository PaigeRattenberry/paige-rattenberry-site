import Link from "next/link";

import { Figure } from "@/components/ui/Figure";
import type { BuildStory } from "@/lib/content/schema";

type Category = BuildStory["synthesis"]["categories"][number];

/**
 * The synthesis's one chart (Session 8): every item of the logs' "What the AI got wrong" sections,
 * grouped by the mechanism that caught it. Counts are the lengths of the item lists in
 * content/build-story.ts, never typed numbers. Each row is text first (label and count, read in
 * order by a screen reader); the bar is decoration scaled to the largest group. Under it, one
 * native disclosure per group lists the items with a link to the log each comes from, so the
 * figure can be checked without JavaScript.
 */
export function CaughtByFigure({
  categories,
  number,
  logTitle,
}: {
  categories: readonly Category[];
  number: number;
  /** The title of the log a slug names, for link text. */
  logTitle: (slug: string) => string;
}) {
  const rows = [...categories].sort((a, b) => b.items.length - a.items.length);
  const total = rows.reduce((sum, c) => sum + c.items.length, 0);
  const max = rows[0]?.items.length ?? 1;
  return (
    <Figure
      number={number}
      caption={`Items in the logs' "What the AI got wrong" sections, by what caught them (${total} in all).`}
    >
      <ol className="divide-line divide-y px-4 py-2 sm:px-5" aria-label="What caught each item">
        {rows.map((c) => (
          <li key={c.id} className="py-3">
            <details className="group">
              <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 sm:grid-cols-[14rem_1fr_auto] [&::-webkit-details-marker]:hidden">
                <span className="text-ink col-start-1 row-start-1">
                  <span
                    aria-hidden="true"
                    className="text-ink-3 mr-1.5 inline-block font-mono text-xs transition-transform group-open:rotate-90 motion-reduce:transition-none"
                  >
                    ›
                  </span>
                  {c.label}
                </span>
                <span
                  aria-hidden="true"
                  className="bg-surface-2 relative col-span-2 row-start-2 h-2 self-center overflow-hidden rounded-full sm:col-span-1 sm:col-start-2 sm:row-start-1"
                >
                  <span
                    className="bg-accent absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${(c.items.length / max) * 100}%` }}
                  />
                </span>
                <span className="text-ink col-start-2 row-start-1 font-mono text-sm tabular-nums sm:col-start-3">
                  {c.items.length}
                  <span className="sr-only"> items</span>
                </span>
              </summary>
              <p className="text-ink-2 mt-3 max-w-prose text-[0.95rem] leading-relaxed">
                {c.description}
              </p>
              <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed">
                {c.items.map((item, i) => (
                  <li key={i} className="border-line border-l pl-3">
                    <span className="text-ink">{item.what}</span>{" "}
                    <Link
                      className="link-accent text-ink-2 font-mono text-xs whitespace-nowrap"
                      href={`/how-this-was-built/${item.log}`}
                    >
                      {logTitle(item.log)}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
    </Figure>
  );
}
