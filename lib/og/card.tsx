import type { ReactNode } from "react";

import { siteHost } from "@/lib/site";

/** 1200 × 630, the size every network crops from (DESIGN §5.5). */
export const OG_SIZE = { width: 1200, height: 630 };

// The light palette from app/globals.css. Satori draws a fixed image, so the theme is chosen
// here once; the light paper reads well on every network's light and dark surfaces.
const paper = "#f5f4ef";
const ink = "#1a1c1f";
const ink2 = "#605c55";
const accent = "#0e6b6b";

type CardProps = {
  /** Small mono line above the title (a name on a page card, a kicker on a project card). */
  kicker: string;
  /** The large serif line. */
  title: string;
  /** One or two lines under the title. */
  description: string;
  /** Extra line at the bottom left, e.g. a disclaimer. */
  footnote?: string;
};

/**
 * The one Open Graph layout: kicker, title, description, an accent rule and the site host,
 * all in the site's typography (Source Serif 4, Inter, JetBrains Mono). Satori supports
 * flexbox only, so every element is an explicit flex container.
 */
export function OgCard({ kicker, title, description, footnote }: CardProps): ReactNode {
  const long = title.length > 40;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 56px",
        background: paper,
        color: ink,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 26,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontFamily: "Source Serif 4",
            fontWeight: 600,
            fontSize: long ? 60 : 76,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 960,
            fontSize: 30,
            lineHeight: 1.35,
            color: ink2,
          }}
        >
          {description}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", width: 120, height: 6, background: accent }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
            fontFamily: "JetBrains Mono",
            fontSize: 24,
            color: ink2,
          }}
        >
          <div style={{ display: "flex" }}>{footnote ?? ""}</div>
          <div style={{ display: "flex" }}>{siteHost}</div>
        </div>
      </div>
    </div>
  );
}
