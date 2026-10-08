import type { ReactNode } from "react";

type FigureProps = {
  /** The image, video or SVG. */
  children: ReactNode;
  /** Figure number, rendered as "Fig. 3" in mono before the caption. */
  number?: number;
  caption?: ReactNode;
  /** Where the figure came from, e.g. "StimMap3D repo, docs/screenshots". */
  source?: string;
  className?: string;
};

/** Editorial figure: hairline frame and a mono, numbered caption (DESIGN §4.3). */
export function Figure({ children, number, caption, source, className = "" }: FigureProps) {
  return (
    <figure className={["my-8", className].join(" ")}>
      <div className="border-line bg-surface overflow-hidden rounded-md border">{children}</div>
      {caption || number ? (
        <figcaption className="mono-label mt-2.5 flex flex-wrap gap-x-3">
          {number !== undefined ? <span className="text-ink">Fig. {number}</span> : null}
          {caption ? <span>{caption}</span> : null}
          {source ? <span className="text-ink-3">Source: {source}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
