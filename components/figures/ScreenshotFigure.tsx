import Image from "next/image";

import { Figure } from "@/components/ui/Figure";
import { assets } from "@/lib/content/load";

type ScreenshotFigureProps = {
  /** `path` of an image in content/assets.json; its alt text and pixel size come from there. */
  asset: string;
  /** Figure number in the page's own sequence; a string because MDX bodies write `number="2"`. */
  number: number | string;
  caption: string;
  /** Reader-facing origin of the image; never a `_source/` path. */
  source: string;
};

/**
 * A screenshot in an MDX body (Session 3b). The body names the asset; the image's alt text and
 * dimensions are the manifest's, so a picture cannot ship without its provenance record, the
 * way `cover` cannot. Throws at build for an unknown asset or a malformed number.
 */
export function ScreenshotFigure({ asset, number, caption, source }: ScreenshotFigureProps) {
  const image = assets.find((a) => a.path === asset);
  if (!image || image.kind !== "image") {
    throw new Error(`Screenshot "${asset}" is not an image in content/assets.json`);
  }
  const n = Number(number);
  if (!Number.isFinite(n)) {
    throw new Error(`Screenshot "${asset}": number "${number}" is not a figure number`);
  }
  if (!caption || !source || source.includes("_source/")) {
    throw new Error(`Screenshot "${asset}": needs a caption and a public source`);
  }
  return (
    <Figure number={n} caption={caption} source={source}>
      <Image
        src={`/${image.path}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 48rem, 100vw"
        className="my-0! h-auto w-full"
      />
    </Figure>
  );
}
