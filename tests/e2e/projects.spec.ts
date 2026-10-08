import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { otherProjects } from "../../lib/content/load";
import { htmlRoutes } from "../../lib/routes";

import { expectNoBlockingViolations, settle, useTheme } from "./helpers";

/**
 * The /projects filter against the production build (IMPLEMENTATION_PLAN §4 Session 3a):
 * direct filtered URLs, clearing, back/forward and an invalid value. The filter is a
 * client island inside a Suspense boundary whose fallback is the unfiltered grid; the
 * island alone renders the live-region status element, so waiting for it means hydration
 * is done and the chips have handlers.
 */
function grid(page: Page) {
  return page.getByRole("list", { name: "Projects" });
}

/** Direct children only: each card carries its own nested list of tags. */
function cards(page: Page) {
  return grid(page).locator("> li");
}

async function openProjects(page: Page, url: string) {
  // Not a React hook: it seeds next-themes' stored choice before navigation (helpers.ts).
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useTheme(page, "light");
  await page.goto(url);
  await settle(page, "light");
  await page.getByTestId("filter-status").waitFor({ state: "attached" });
}

const RAG = "RAG";
/** The grid lists every project but the featured ones; the content decides how many. */
const TOTAL = otherProjects.length;

test("every project is in the HTML before any JavaScript runs", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/projects?tag=rag");
  // No hydration, so the server fallback stays: every card, every chip, only "All" pressed.
  await expect(cards(page)).toHaveCount(TOTAL);
  await expect(page.getByTestId("filter-status")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "All projects" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("link", { name: "Measuring scoliosis brace pressure" }),
  ).toBeVisible();
});

test("a direct filtered URL shows only matching cards, and the chip is pressed", async ({
  page,
}) => {
  await openProjects(page, "/projects?tag=rag");
  const chip = page.getByRole("button", { name: RAG });
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  const count = await cards(page).count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(TOTAL);
  for (const card of await cards(page).all()) {
    await expect(card.getByRole("list", { name: "Tags" })).toContainText(RAG);
  }
  // The case-study cards above the grid are unaffected by the filter.
  await expect(page.getByRole("list", { name: "Case studies" }).locator("> li")).toHaveCount(3);
});

test("choosing, clearing, back and forward all keep the URL and the grid in step", async ({
  page,
}) => {
  await openProjects(page, "/projects");
  await expect(cards(page)).toHaveCount(TOTAL);
  const rag = page.getByRole("button", { name: RAG });
  await expect(rag).toHaveAttribute("aria-pressed", "false");

  await rag.click();
  await expect(page).toHaveURL(/\/projects\?tag=rag$/);
  await expect(rag).toHaveAttribute("aria-pressed", "true");
  const filtered = await cards(page).count();
  expect(filtered).toBeLessThan(TOTAL);
  await expect(page.getByTestId("filter-status")).toContainText(
    `${filtered} of ${TOTAL} projects tagged RAG`,
  );

  // A second chip replaces the first (single select).
  const pytorch = page.getByRole("button", { name: "PyTorch" });
  await pytorch.click();
  await expect(page).toHaveURL(/\/projects\?tag=pytorch$/);
  await expect(rag).toHaveAttribute("aria-pressed", "false");
  await expect(pytorch).toHaveAttribute("aria-pressed", "true");

  // Clear.
  await page.getByRole("button", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(cards(page)).toHaveCount(TOTAL);
  await expect(page.getByTestId("filter-status")).toContainText(`All ${TOTAL} projects`);

  // Back walks through the history: pytorch, then rag, then unfiltered.
  await page.goBack();
  await expect(page).toHaveURL(/\?tag=pytorch$/);
  await expect(pytorch).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(page).toHaveURL(/\?tag=rag$/);
  await expect(rag).toHaveAttribute("aria-pressed", "true");
  await expect(cards(page)).toHaveCount(filtered);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(cards(page)).toHaveCount(TOTAL);

  // Forward restores the filter.
  await page.goForward();
  await expect(page).toHaveURL(/\?tag=rag$/);
  await expect(rag).toHaveAttribute("aria-pressed", "true");
  await expect(cards(page)).toHaveCount(filtered);

  // Pressing the active chip again clears it.
  await rag.click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(cards(page)).toHaveCount(TOTAL);
});

test("an invalid or empty tag shows every project and leaves the URL alone", async ({ page }) => {
  await openProjects(page, "/projects?tag=not-a-skill");
  await expect(cards(page)).toHaveCount(TOTAL);
  await expect(page.getByRole("button", { name: "All projects" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveURL(/\?tag=not-a-skill$/);

  await openProjects(page, "/projects?tag=");
  await expect(cards(page)).toHaveCount(TOTAL);
  await openProjects(page, "/projects?other=1");
  await expect(cards(page)).toHaveCount(TOTAL);
});

test("the filter is keyboard operable and the filtered page passes axe", async ({ page }) => {
  await openProjects(page, "/projects");
  const rag = page.getByRole("button", { name: RAG });
  await rag.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\?tag=rag$/);
  await expect(rag).toBeFocused();
  await expectNoBlockingViolations(page);
});

/**
 * Every HTML page, not just /projects: a server component that hands a whole assets.json record
 * to a client island serializes the record's `_source/` staging path and permission memo into
 * the page's flight payload, which the prerendered HTML carries inline (DESIGN §3.4). Session 3b
 * shipped exactly that on /projects/stimmap3d until this test was widened to catch it.
 */
for (const route of htmlRoutes) {
  test(`no private source path reaches the served ${route.path} page`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(await response!.text()).not.toContain("_source/");
  });
}

const STIMMAP3D = "https://stimmap3d.pages.dev";
const DISCLAIMER = "Illustrative model — not for clinical use";

test("the StimMap3D embed asks the live app for nothing until the click (DESIGN §7.1)", async ({
  page,
}) => {
  // Deterministic: the live origin is stubbed, so this checks the page, not the deployment.
  const requested: string[] = [];
  await page.route(`${STIMMAP3D}/**`, (route) => {
    requested.push(route.request().url());
    return route.fulfill({ contentType: "text/html", body: "<title>stub</title><p>stub app</p>" });
  });
  await useTheme(page, "light");
  await page.goto("/projects/stimmap3d");
  await settle(page, "light");

  const note = page.getByRole("note");
  await expect(note).toContainText(DISCLAIMER);
  const load = page.getByRole("button", { name: "Load interactive demo" });
  const noteBox = await note.boundingBox();
  const loadBox = await load.boundingBox();
  const bodyBox = await page.getByRole("heading", { name: "What it is" }).boundingBox();
  expect(noteBox!.y).toBeLessThan(loadBox!.y);
  expect(loadBox!.y).toBeLessThan(bodyBox!.y);

  const figure = page.locator("[data-embed-status]");
  await expect(figure).toHaveAttribute("data-embed-status", "idle");
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(requested).toEqual([]);
  const open = figure.getByRole("link", { name: "Open full app" });
  await expect(open).toHaveAttribute("href", STIMMAP3D);
  await expect(figure.locator("figcaption")).toContainText(DISCLAIMER);

  await load.click();
  const frame = page.locator("iframe");
  await expect(frame).toHaveAttribute("src", `${STIMMAP3D}/?preset=F3&proto=10hz-hf-l&elec=1#/`);
  await expect(frame).toHaveAttribute("title", "StimMap3D interactive demo");
  await expect(figure).toHaveAttribute("data-embed-status", "loaded");
  await expect(page.frameLocator("iframe").getByText("stub app")).toBeVisible();
  expect(requested.length).toBeGreaterThan(0);
  // Still around the frame once the app has replaced the poster.
  await expect(figure.locator("figcaption")).toContainText(DISCLAIMER);
  await expect(open).toBeVisible();
  await expectNoBlockingViolations(page);
});

// Reaches the real deployment, so it runs only when asked: `$env:LIVE_EMBED = "1"`. Session 3b
// ran it on 2026-09-20; CI stays independent of a third-party origin's uptime.
test("the StimMap3D embed shows the live app, banner included, inside the frame", async ({
  page,
}) => {
  test.skip(!process.env.LIVE_EMBED, "set LIVE_EMBED=1 to load the live deployment");
  test.setTimeout(90_000);
  await useTheme(page, "light");
  await page.goto("/projects/stimmap3d");
  await settle(page, "light");
  await page.getByRole("button", { name: "Load interactive demo" }).click();
  await expect(page.locator("[data-embed-status]")).toHaveAttribute("data-embed-status", "loaded", {
    timeout: 30_000,
  });
  const app = page.frameLocator("iframe");
  await expect(app.getByRole("alert").first()).toContainText("not for clinical use", {
    timeout: 30_000,
  });
  await expect(app.locator("canvas").first()).toBeAttached({ timeout: 30_000 });
});
