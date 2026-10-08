/**
 * Capture the StimMap3D screenshots the public repository does not ship (IMPLEMENTATION_PLAN §4
 * Session 3b, 2026-09-20 amendment). Each capture is written to `_source/stimmap3d/` first (the
 * staged original, git-ignored; an approved exception to `_source/` being read-only, AGENTS.md),
 * then re-encoded with sharp into `public/images/stimmap3d/` at the same pixel size.
 *
 *   node scripts/capture-stimmap3d.mjs
 *
 * Prints each file's dimensions and the staged original's SHA-256 for content/assets.json. Run
 * by hand, never by the build: the result depends on the live deployment, so every image is
 * looked at before it is committed. The app's getting-started card is dismissed through the
 * app's own localStorage flag (what its close button sets); nothing else in the page is touched.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const ORIGIN = "https://stimmap3d.pages.dev";
const STAGED = "_source/stimmap3d";
const SHIPPED = "public/images/stimmap3d";
const FIRST_RUN_KEY = "stimmap3d:first-run-dismissed:v1";

/**
 * Every shot is the viewport, so the app's sticky disclaimer banner is in frame. `scrollTo`
 * names a heading to bring up under the banner first, for a panel further down the page.
 */
const SHOTS = [
  {
    name: "hero-dlpfc",
    url: "/?preset=F3&proto=10hz-hf-l&elec=1#/",
    viewport: { width: 1440, height: 810 },
  },
  {
    name: "focality-glyphs",
    url: "/?preset=F3&proto=10hz-hf-l&contour=1&glyph=1#/",
    viewport: { width: 1440, height: 1000 },
  },
  {
    name: "methods-limitations",
    url: "/#/methods",
    viewport: { width: 1440, height: 1000 },
  },
  {
    name: "dose-response",
    url: "/?preset=F3&proto=10hz-hf-l#/",
    viewport: { width: 1440, height: 1000 },
    scrollTo: /Dose.response by protocol/,
  },
  {
    name: "synthetic-trajectory",
    url: "/?preset=F3&proto=10hz-hf-l#/",
    viewport: { width: 1440, height: 1000 },
    scrollTo: /Synthetic MADRS trajectory/,
  },
];

mkdirSync(STAGED, { recursive: true });
mkdirSync(SHIPPED, { recursive: true });

const browser = await chromium.launch();
try {
  for (const shot of SHOTS) {
    const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 1 });
    await context.addInitScript((key) => localStorage.setItem(key, "1"), FIRST_RUN_KEY);
    const page = await context.newPage();
    await page.goto(ORIGIN + shot.url, { waitUntil: "networkidle" });
    // The field solve and the first painted frame land after network idle.
    await page.waitForTimeout(4000);
    const staged = path.join(STAGED, `${shot.name}.png`);
    if (shot.scrollTo) {
      const heading = page.getByRole("heading", { name: shot.scrollTo });
      // `boundingBox()` waits for the banner and throws if the app ever stops exposing it as an
      // alert; scroll to the heading itself in that case rather than dying on a 30 s timeout.
      const banner = await page
        .getByRole("alert")
        .first()
        .boundingBox()
        .catch(() => null);
      // Instant, not smooth: the frame is taken right after.
      await heading.evaluate(
        (el, top) => {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - top,
            behavior: "instant",
          });
        },
        (banner?.height ?? 0) + 24,
      );
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: staged });
    const shipped = path.join(SHIPPED, `${shot.name}.webp`);
    const info = await sharp(staged).webp({ quality: 86 }).toFile(shipped);
    const hash = createHash("sha256").update(readFileSync(staged)).digest("base64");
    console.log(`${shipped}  ${info.width}x${info.height}  ${info.size} bytes`);
    console.log(`  staged ${staged}  sha256-base64:${hash}`);
    console.log(`  final URL ${page.url()}`);
    await context.close();
  }
} finally {
  await browser.close();
}
