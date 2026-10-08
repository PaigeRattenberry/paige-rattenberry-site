import type { ReactNode } from "react";

type DatedEntryProps = {
  id?: string;
  /** Date range exactly as content prints it. */
  dates: string;
  org: string;
  /** Small mono line under the organisation: a location, a kind. */
  meta?: string;
  heading: ReactNode;
  /** 2 on a page whose sections are the entries; 3 inside a titled section. */
  headingLevel?: 2 | 3;
  children?: ReactNode;
};

/**
 * One dated entry in an editorial list (Experience, Research, Leadership): dates,
 * organisation and a mono line on the left, the heading and substance on the right, one
 * hairline above. Stacks at narrow widths.
 */
export function DatedEntry({
  id,
  dates,
  org,
  meta,
  heading,
  headingLevel = 2,
  children,
}: DatedEntryProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <div
      id={id}
      className="border-line grid scroll-mt-20 grid-cols-12 gap-y-3 border-t py-9 md:gap-x-8"
    >
      <div className="col-span-12 md:col-span-4">
        <p className="mono-label text-ink">{dates}</p>
        <p className="mt-1 text-lg">{org}</p>
        {meta ? <p className="mono-label mt-1">{meta}</p> : null}
      </div>
      <div className="col-span-12 md:col-span-8">
        {/* An h3 sits under a text-xl section h2, so it takes that size rather than outgrowing it. */}
        <Heading className={headingLevel === 3 ? "text-xl" : "text-2xl"}>{heading}</Heading>
        {children}
      </div>
    </div>
  );
}
