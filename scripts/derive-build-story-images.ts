/**
 * Writes the /how-this-was-built gallery images (Session 8): each is a crop of one committed
 * screenshot in docs/screenshots/, re-encoded as WebP into public/images/build-story/. The list
 * (screenshot, crop, output path) is `gallery` in content/build-story.ts, and every output must
 * have a record in content/assets.json with the screenshot as its repository source; the
 * loader refuses a gallery image without one. Run by hand after changing the list:
 *
 *   npx tsx scripts/derive-build-story-images.ts
 *
 * It prints each output's dimensions and size for the assets.json record. Not part of the
 * build: the outputs are committed, like the derived PDFs.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { buildStory as buildStoryRaw } from "../content/build-story";
import { BuildStorySchema } from "../lib/content/schema";

const buildStory = BuildStorySchema.parse(buildStoryRaw);

const PUBLIC = path.join(process.cwd(), "public");
/** The width every desktop screenshot was captured at; crops keep it. */
const WIDTH = 1280;

async function main() {
  for (const figure of buildStory.gallery) {
    const out = path.join(PUBLIC, figure.asset);
    mkdirSync(path.dirname(out), { recursive: true });
    const info = await sharp(figure.screenshot)
      .extract({ left: 0, top: figure.crop.top, width: WIDTH, height: figure.crop.height })
      .webp({ quality: 80, effort: 6 })
      .toFile(out);
    console.log(`${figure.asset}: ${info.width}×${info.height}, ${info.size} bytes`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
