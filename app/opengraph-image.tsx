import { ImageResponse } from "next/og";

import { profile } from "@/lib/content/load";
import { OG_SIZE, OgCard } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

export const alt = `${profile.name}, ${profile.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** The site-wide card (DESIGN §5.5): name, role and positioning from content/profile.ts. */
export default async function Image() {
  return new ImageResponse(
    <OgCard kicker={profile.role} title={profile.name} description={profile.positioning} />,
    { ...size, fonts: await ogFonts() },
  );
}
