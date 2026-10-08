import Link from "next/link";

import { ConstellationSvg } from "./ConstellationSvg";
import type { ExplorerData } from "./types";

type ConstellationTeaserProps = {
  data: ExplorerData;
  className?: string;
};

/**
 * The home page's Fig. 1 at large widths (DESIGN §7.2): the constellation, filter-less and
 * static, rendered on the server with no client JavaScript and the compact markup, since the
 * HTML and its RSC twin both carry it. The whole figure links to the explorer; only the hub
 * skills (three or more entries) are labelled, at the larger size the layout placed for them.
 * `tests/unit/explorer.test.ts` caps the rendered markup.
 */
export function ConstellationTeaser({ data, className = "" }: ConstellationTeaserProps) {
  return (
    <figure className={className}>
      <Link
        href="/experience"
        className="constellation-teaser block rounded-md"
        aria-label={`Skills constellation: ${data.nodes.length} skills across ${data.entries.length} pieces of work. Explore it on the Experience page.`}
      >
        <ConstellationSvg
          nodes={data.nodes}
          edges={data.edges}
          width={data.width}
          height={data.height}
          labels="hubs"
          compact
          svgProps={{ "aria-hidden": true, focusable: "false" }}
        />
      </Link>
      <figcaption className="mono-label mt-2 text-right">
        <span className="text-ink">Fig. 1</span> Skills, sized by how often they appear, linked
        where they met on the same work.
      </figcaption>
    </figure>
  );
}
