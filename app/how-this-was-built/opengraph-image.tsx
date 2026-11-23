import { ImageResponse } from "next/og";

import { buildStory, profile } from "@/lib/content/load";
import { OG_SIZE, OgCard } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

const title = "How this site was built";

export const alt = `${title}: ${buildStory.copy.ogCard}`;
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * The build story's card (DESIGN §5.5), which every build-log page below it shares: the name,
 * the page's title and the line in content/build-story.ts. It carries no count, because the
 * synthesis's bound cannot travel with a picture, and no StimMap3D, so no disclaimer (gate c).
 */
export default async function Image() {
  return new ImageResponse(
    <OgCard kicker={profile.name} title={title} description={buildStory.copy.ogCard} />,
    { ...size, fonts: await ogFonts() },
  );
}
