import Link from "next/link";

import { Tag } from "@/components/ui/Tag";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";

import type { TimelineEntry } from "./types";

type TimelineProps = {
  entries: readonly TimelineEntry[];
  /** The filtered skill; matching entries are highlighted and the rest dimmed, none removed. */
  active: string | null;
};

/** Entries grouped by the year their first period starts, newest year first. */
export function groupByYear(entries: readonly TimelineEntry[]) {
  const years = new Map<number, TimelineEntry[]>();
  for (const e of entries) years.set(e.year, [...(years.get(e.year) ?? []), e]);
  return [...years].sort(([a], [b]) => b - a);
}

/** Whether an entry carries the filtered skill (true/false), or null with no filter. */
export function matches(entry: TimelineEntry, active: string | null): boolean | null {
  return active ? entry.tags.some((t) => t.id === active) : null;
}

/**
 * The vertical career timeline (DESIGN §7.2): one rail, a year marker per group, and every
 * piece of work as one entry with its kind and dates, title (linking to the full record), the
 * organisation, one line of substance and its skill tags. A filter dims non-matching entries
 * rather than hiding them, so the shape of the career stays visible.
 */
export function Timeline({ entries, active }: TimelineProps) {
  return (
    <ol className="timeline" aria-label="Career timeline">
      {groupByYear(entries).map(([year, group]) => (
        <li key={year} className="timeline-year">
          <h3 className="timeline-year-label">{year}</h3>
          <ul className="timeline-entries" aria-label={`${year}`}>
            {group.map((entry) => {
              const match = matches(entry, active);
              return (
                <li
                  key={entry.id}
                  className="timeline-entry"
                  data-entry={entry.id}
                  data-match={match === null ? "none" : String(match)}
                >
                  <p className="mono-label">
                    <span className="text-ink">{entry.dates}</span>
                    {" · "}
                    {entry.kindLabel}
                  </p>
                  <p className="mt-1 text-lg leading-snug">
                    <Link href={entry.href} className="link-quiet font-display">
                      {entry.title}
                    </Link>
                    {entry.team ? <span className="text-ink-2">, {entry.team}</span> : null}
                  </p>
                  {entry.org ? (
                    <p className="text-ink-2 mt-0.5 text-[0.95rem]">{entry.org}</p>
                  ) : null}
                  <p className="text-ink-2 mt-1 max-w-prose text-[0.95rem] leading-relaxed">
                    <TextWithMetrics text={entry.line} metrics={entry.lineMetrics} />
                  </p>
                  {entry.disclaimer ? (
                    <p className="mono-label mt-1.5" data-testid="entry-disclaimer">
                      {entry.disclaimer}
                    </p>
                  ) : null}
                  {entry.tags.length > 0 ? (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Skills">
                      {entry.tags.map((tag) => (
                        <li key={tag.id}>
                          <Tag active={tag.id === active}>{tag.label}</Tag>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
