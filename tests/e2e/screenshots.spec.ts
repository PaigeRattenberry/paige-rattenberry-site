import { mkdirSync, writeFileSync } from "node:fs";

import { type Page, test } from "@playwright/test";

import { buildLogRoutes, htmlRoutes } from "../../lib/routes";

import { settle, useTheme } from "./helpers";

/**
 * Full-page screenshots of every HTML route at 1280 px and 390 px into docs/screenshots/, named
 * `s<N>-<route>-<width>[-dark].png`. Set SESSION to the current session number (default 1).
 * The home page is captured in both themes; other routes in light only. The `/resume` redirect
 * is a document, not a page (DESIGN §5.2); Session 6 saves the Open Graph images instead (see
 * `images`) and renders the PDF's pages with scripts/render-pdf-pages.mjs.
 * REVIEW_SCREENSHOTS=1 adds 768/820 px for the tablet follow-up. Session 7 is the mobile set:
 * every route at 390 px in both themes and at the 360 px floor of DESIGN §8 in light.
 * Session 8 is the build-story set: Home (for the README), /how-this-was-built in both themes,
 * and the newest build log's page, since the other pages did not change and a full-height
 * capture of every log would add many megabytes of near-duplicates.
 * Session 9b is the log-end set: no full-page route captures, only the ends of two log pages
 * (see `LOG_ENDS`).
 */
const SESSION = process.env.SESSION ?? "1";
const MOBILE_SET = SESSION === "7";
const widths = MOBILE_SET
  ? [390, 360]
  : process.env.REVIEW_SCREENSHOTS
    ? [1280, 390, 768, 820]
    : [1280, 390];
const outDir = "docs/screenshots";
const BUILD_STORY_SET = SESSION === "8";
const LOG_END_SET = SESSION === "9b";
const newestLog = buildLogRoutes[buildLogRoutes.length - 1]?.path;
const routesToCapture = BUILD_STORY_SET
  ? htmlRoutes.filter((r) => ["/", "/how-this-was-built", newestLog].includes(r.path))
  : LOG_END_SET
    ? []
    : htmlRoutes;

// Session 6: the generated Open Graph images, fetched as the networks would and saved as-is.
// Session 3b: the StimMap3D card again, to show that setting `cover` left it unchanged.
// Session 6b: the site card, which draws the new positioning line into a fixed 1200×630 image
// with no overflow handling, and the card of the new literature-review page.
const images: { path: string; name: string }[] =
  SESSION === "6"
    ? [
        { path: "/opengraph-image", name: "og-home" },
        { path: "/projects/stimmap3d/opengraph-image", name: "og-projects-stimmap3d" },
      ]
    : SESSION === "3b"
      ? [{ path: "/projects/stimmap3d/opengraph-image", name: "og-projects-stimmap3d" }]
      : SESSION === "6b"
        ? [
            { path: "/opengraph-image", name: "og-home" },
            {
              path: "/projects/genai-literature-review/opengraph-image",
              name: "og-projects-genai-literature-review",
            },
          ]
        : [];

for (const image of images) {
  test(`${image.path} (${image.name})`, async ({ request }) => {
    const response = await request.get(image.path);
    test.expect(response.ok()).toBe(true);
    test.expect(response.headers()["content-type"]).toBe("image/png");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(`${outDir}/s${SESSION}-${image.name}.png`, await response.body());
  });
}

/**
 * A full-page capture never scrolls, so lazy images below the fold would be blank boxes (the
 * StimMap3D page has five). Ask for them all and wait before the capture.
 */
async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
      img.loading = "eager";
    }
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((done) => {
              img.onload = img.onerror = done;
            }),
      ),
    );
  });
}

function slug(path: string) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}

type Extra = {
  path: string;
  name: string;
  /** Waits for the island to hydrate and, optionally, acts before the capture. */
  ready: (page: Page) => Promise<void>;
};

// Session 3a: the /projects grid filtered by one skill, as evidence for the URL-synced filter.
// Session 5: the /experience explorer filtered by one skill, and its list view.
// Session 3b: the StimMap3D page with the live app loaded in its frame (reaches the deployment).
const extras: Extra[] =
  SESSION === "3b"
    ? [
        {
          path: "/projects/stimmap3d",
          name: "projects-stimmap3d-embed-loaded",
          ready: async (page) => {
            await page.getByRole("button", { name: "Load interactive demo" }).click();
            await page
              .frameLocator("iframe")
              .locator("canvas")
              .first()
              .waitFor({ state: "attached", timeout: 30_000 });
            // The field solve and the first painted frame land after the canvas mounts.
            await page.waitForTimeout(5000);
          },
        },
      ]
    : SESSION === "3a"
      ? [
          {
            path: "/projects?tag=rag",
            name: "projects-filtered",
            ready: (page) =>
              page
                .getByRole("button", { name: "RAG" })
                .and(page.locator("[aria-pressed='true']"))
                .waitFor(),
          },
        ]
      : SESSION === "5"
        ? [
            {
              path: "/experience?skill=rag",
              name: "experience-filtered",
              ready: async (page) => {
                await page.getByTestId("explorer-status").waitFor({ state: "attached" });
                await page
                  .getByRole("button", { name: "RAG", exact: true })
                  .and(page.locator("[aria-pressed='true']"))
                  .waitFor();
              },
            },
            {
              path: "/experience",
              name: "experience-list",
              ready: async (page) => {
                await page.getByTestId("explorer-status").waitFor({ state: "attached" });
                await page.getByRole("button", { name: "View as list" }).click();
                await page.getByTestId("skill-list").waitFor();
              },
            },
          ]
        : [];

for (const extra of extras) {
  for (const width of widths) {
    test(`${extra.path} (${extra.name}) @ ${width}px (light)`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await useTheme(page, "light");
      await page.goto(extra.path);
      await settle(page, "light");
      await extra.ready(page);
      await loadLazyImages(page);
      await page.screenshot({
        path: `${outDir}/s${SESSION}-${extra.name}-${width}.png`,
        fullPage: true,
      });
    });
  }
}

// Session 9b: the end of two log pages, cropped around one heading: Session 9's, whose empty
// review-notes heading is now left out (so its last sections end on "Screenshots"), and Session
// 1's, the one log whose notes still render. Full-page captures of long logs would add megabytes.
const LOG_ENDS = LOG_END_SET
  ? [
      { slug: "s9-content-update", heading: "#screenshots", name: "log-end-no-notes" },
      { slug: "s1-scaffold", heading: "#paiges-review-notes", name: "log-end-with-notes" },
    ]
  : [];

for (const end of LOG_ENDS) {
  for (const width of widths) {
    test(`/how-this-was-built/${end.slug} (${end.name}) @ ${width}px (light)`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await useTheme(page, "light");
      await page.goto(`/how-this-was-built/${end.slug}`);
      await settle(page, "light");
      const box = await page.locator(end.heading).boundingBox();
      if (!box) throw new Error(`${end.slug}: no ${end.heading}`);
      const y = await page.evaluate((top) => top + window.scrollY, box.y);
      await page.screenshot({
        path: `${outDir}/s${SESSION}-${end.name}-${width}.png`,
        fullPage: true,
        clip: { x: 0, y: Math.max(0, y - 400), width, height: 800 },
      });
    });
  }
}

for (const route of routesToCapture) {
  for (const width of widths) {
    const themesFor =
      route.path === "/" ||
      (MOBILE_SET && width === 390) ||
      (BUILD_STORY_SET && route.path === "/how-this-was-built")
        ? (["light", "dark"] as const)
        : (["light"] as const);
    for (const theme of themesFor) {
      test(`${route.path} @ ${width}px (${theme})`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await useTheme(page, theme);
        await page.goto(route.path);
        await settle(page, theme);
        await loadLazyImages(page);
        const name = `s${SESSION}-${slug(route.path)}-${width}${theme === "dark" ? "-dark" : ""}.png`;
        await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
      });
    }
  }
}
