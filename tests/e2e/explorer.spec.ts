import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { expectNoBlockingViolations, settle, useTheme } from "./helpers";

/**
 * The /experience explorer against the production build (IMPLEMENTATION_PLAN §4 Session 5):
 * direct filtered URLs, chips and constellation nodes writing the URL, clearing, back and
 * forward, an invalid value, the list view, full keyboard operation, reduced motion and axe.
 * The island alone renders the live-region status element, so waiting for it means hydration
 * is done and the controls have handlers.
 */
async function openExperience(page: Page, url: string) {
  // Not a React hook: it seeds next-themes' stored choice before navigation (helpers.ts).
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useTheme(page, "light");
  await page.goto(url);
  await settle(page, "light");
  await page.getByTestId("explorer-status").waitFor({ state: "attached" });
}

function entries(page: Page) {
  return page.getByRole("list", { name: "Career timeline" }).locator("[data-entry]");
}

function matched(page: Page) {
  return entries(page).and(page.locator("[data-match='true']"));
}

test("every entry is in the HTML before any JavaScript runs", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/experience?skill=rag");
  const total = await entries(page).count();
  expect(total).toBeGreaterThan(10);
  await expect(page.getByTestId("explorer-status")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "All work" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("constellation")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Roles" })).toBeVisible();
});

test("a direct filtered URL highlights the right entries and presses the chip and node", async ({
  page,
}) => {
  await openExperience(page, "/experience?skill=rag");
  await expect(page.getByRole("button", { name: "RAG", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: /^RAG, \d+ entries$/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const total = await entries(page).count();
  const hits = await matched(page).count();
  expect(hits).toBeGreaterThan(0);
  expect(hits).toBeLessThan(total);
  // Every highlighted entry carries the tag; every dimmed one does not.
  for (const entry of await entries(page).all()) {
    const has = (await entry.getByRole("list", { name: "Skills" }).getByText("RAG").count()) > 0;
    await expect(entry).toHaveAttribute("data-match", String(has));
  }
  // Dimmed entries stay in the document (dimmed, not removed).
  await expect(entries(page)).toHaveCount(total);
});

test("chips and nodes write the URL; clear, back and forward keep everything in step", async ({
  page,
}) => {
  await openExperience(page, "/experience");
  const pytorch = page.getByRole("button", { name: "PyTorch", exact: true });
  await pytorch.click();
  await expect(page).toHaveURL(/\/experience\?skill=pytorch$/);
  await expect(pytorch).toHaveAttribute("aria-pressed", "true");
  const total = await entries(page).count();
  const hits = await matched(page).count();
  await expect(page.getByTestId("explorer-status")).toHaveText(
    `${hits} of ${total} entries use PyTorch`,
  );

  // A constellation node applies the same filter (single select).
  await page.getByRole("button", { name: /^Interpretability \(XAI\), / }).click();
  await expect(page).toHaveURL(/\?skill=xai$/);
  await expect(pytorch).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Interpretability (XAI)", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "All work" }).click();
  await expect(page).toHaveURL(/\/experience$/);
  await expect(matched(page)).toHaveCount(0);
  await expect(page.getByTestId("explorer-status")).toHaveText(`All ${total} entries`);

  await page.goBack();
  await expect(page).toHaveURL(/\?skill=xai$/);
  await page.goBack();
  await expect(page).toHaveURL(/\?skill=pytorch$/);
  await expect(pytorch).toHaveAttribute("aria-pressed", "true");
  await expect(matched(page)).toHaveCount(hits);
  await page.goForward();
  await expect(page).toHaveURL(/\?skill=xai$/);
  await expect(pytorch).toHaveAttribute("aria-pressed", "false");

  // Pressing the active node again clears the filter.
  await page.getByRole("button", { name: /^Interpretability \(XAI\), / }).click();
  await expect(page).toHaveURL(/\/experience$/);
});

test("an invalid or empty skill shows everything and leaves the URL alone", async ({ page }) => {
  await openExperience(page, "/experience?skill=not-a-skill");
  await expect(matched(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "All work" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveURL(/\?skill=not-a-skill$/);
  await openExperience(page, "/experience?skill=");
  await expect(matched(page)).toHaveCount(0);
});

test("the list view is an equivalent of the constellation", async ({ page }) => {
  await openExperience(page, "/experience?skill=rag");
  await page.getByRole("button", { name: "View as list" }).click();
  await expect(page.getByTestId("constellation")).toHaveCount(0);
  const list = page.getByTestId("skill-list");
  await expect(list.getByRole("button", { name: "RAG", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await list.getByRole("button", { name: "Python", exact: true }).click();
  await expect(page).toHaveURL(/\?skill=python$/);
  await expectNoBlockingViolations(page);
});

test("the explorer is fully keyboard operable", async ({ page }) => {
  await openExperience(page, "/experience");
  // A chip: Tab reaches it, Enter applies it, focus stays put.
  const rag = page.getByRole("button", { name: "RAG", exact: true });
  await rag.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\?skill=rag$/);
  await expect(rag).toBeFocused();

  // The graph is one tab stop: its current node is the active skill; arrows walk the nodes.
  const svg = page.getByRole("group", { name: /Skills constellation/ });
  const ragNode = svg.locator("[data-skill='rag']");
  await expect(ragNode).toHaveAttribute("tabindex", "0");
  await ragNode.focus();
  await expect(ragNode).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const focused = svg.locator("[data-skill][tabindex='0']");
  await expect(focused).toHaveCount(1);
  await expect(focused).toBeFocused();
  await expect(focused).not.toHaveAttribute("data-skill", "rag");
  // Enter on the focused node filters by it and the caption names it.
  const id = await focused.getAttribute("data-skill");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`\\?skill=${id}$`));
  await expect(focused).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Home");
  await expect(svg.locator("[data-skill][tabindex='0']")).toBeFocused();

  // The view toggle and the entries' links are ordinary tab stops.
  const list = page.getByRole("button", { name: "View as list" });
  await list.focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("skill-list")).toBeVisible();
});

// Every animated element of the explorer: marks, labels, the chips and the view toggle.
const ANIMATED =
  ".constellation-dot, .constellation-edges > line, .constellation-label, .constellation-teaser, " +
  ".explorer button";

test("the explorer has no transitions under prefers-reduced-motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExperience(page, "/experience?skill=rag");
  const durations = await page.evaluate(
    (selector) =>
      [...document.querySelectorAll(selector)].map((el) => getComputedStyle(el).transitionDuration),
    ANIMATED,
  );
  expect(durations.length).toBeGreaterThan(50);
  for (const d of durations) expect(d).toBe("0s");
});

test("the explorer animates only colour, briefly, when motion is allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExperience(page, "/experience");
  const styles = await page.evaluate(() => {
    const read = (selector: string) => {
      const style = getComputedStyle(document.querySelector(selector)!);
      return { property: style.transitionProperty, duration: style.transitionDuration };
    };
    return { dot: read(".constellation-dot"), chip: read(".explorer button") };
  });
  expect(styles.dot.property.split(", ").sort()).toEqual(["fill", "opacity", "stroke"]);
  expect(styles.dot.duration).toBe("0.15s, 0.15s, 0.15s");
  expect(styles.chip.property).toMatch(/color/);
  expect(styles.chip.duration).toBe("0.15s");
});

test("StimMap3D's disclaimer travels with its timeline entry (gate c)", async ({ page }) => {
  await openExperience(page, "/experience");
  const entry = entries(page).and(page.locator("[data-entry='stimmap3d']"));
  await expect(entry.getByTestId("entry-disclaimer")).toHaveText(
    "Illustrative model — not for clinical use",
  );
  await expect(page.getByTestId("entry-disclaimer")).toHaveCount(1);
});

test("a dimmed entry's title link still shows its hover colour", async ({ page }) => {
  await openExperience(page, "/experience?skill=rag");
  const dimmed = entries(page).and(page.locator("[data-match='false']")).first();
  const link = dimmed.getByRole("link").first();
  const before = await link.evaluate((el) => getComputedStyle(el).color);
  await link.hover();
  const after = await link.evaluate((el) => getComputedStyle(el).color);
  expect(after).not.toBe(before);
});

for (const theme of ["light", "dark"] as const) {
  test(`a filtered /experience has no serious or critical axe violations (${theme})`, async ({
    page,
  }) => {
    await useTheme(page, theme);
    await page.goto("/experience?skill=xai");
    await settle(page, theme);
    await page.getByTestId("explorer-status").waitFor({ state: "attached" });
    await expectNoBlockingViolations(page);
  });
}

test("the home teaser is static, links to the explorer and ships no filter", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await useTheme(page, "light");
  await page.goto("/");
  await settle(page, "light");
  const teaser = page.getByRole("link", { name: /^Skills constellation: / });
  await expect(teaser).toBeVisible();
  await expect(teaser).toHaveAttribute("href", "/experience");
  await expect(teaser.locator("[role='button']")).toHaveCount(0);
  // Hidden below lg; the contour motif stays.
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(teaser).toBeHidden();
  await expect(page.getByTestId("contour-field").filter({ visible: true })).toHaveCount(1);
});

// Edge width is the co-occurrence weight (DESIGN §7.2). It is a presentation attribute, which
// any author rule outranks, so a stroke-width in the stylesheet would draw every edge alike.
for (const [route, edge] of [
  ["/", ".constellation-teaser .constellation-edges > path"],
  ["/experience", ".constellation-edges > line"],
] as const) {
  test(`${route} draws each constellation edge at its own width`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(route);
    const widths = await page.locator(edge).evaluateAll((els) =>
      els.map((el) => ({
        attr: Number(el.getAttribute("stroke-width")),
        drawn: parseFloat(getComputedStyle(el).strokeWidth),
      })),
    );
    expect(widths.length).toBeGreaterThan(0);
    for (const { attr, drawn } of widths) expect(drawn).toBe(attr);
    expect(new Set(widths.map((w) => w.drawn)).size).toBeGreaterThan(1);
  });
}

test("no private source path reaches the served /experience page", async ({ page }) => {
  const response = await page.goto("/experience");
  expect(await response!.text()).not.toContain("_source/");
});

/**
 * Session 7 put `content-visibility: auto` on the Roles and Education sections. A skipped block
 * has an estimated height, so anything skipped *above* an anchor target moves the target after
 * the scroll has been computed: with the timeline's year groups skipped as well, this link
 * landed up to 2,600 px off. Home's "Experience" link and every timeline title use these
 * anchors, so both paths are pinned. html scrolls smoothly, hence the polling.
 */
for (const width of [360, 1280]) {
  test(`in-page anchors land on their target at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    // scroll-mt-20 is 5rem at the site's 17 px root, so a target stops 85 px below the top.
    const landed = (id: string) =>
      page.evaluate((target) => {
        const top = document.getElementById(target)!.getBoundingClientRect().top;
        return top >= 80 && top <= 90;
      }, id);

    await page.goto("/experience#hammerspace");
    await expect.poll(() => landed("hammerspace"), { timeout: 10_000 }).toBe(true);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator('.timeline a[href$="#education"]').first().click();
    await expect.poll(() => landed("education"), { timeout: 10_000 }).toBe(true);
  });
}
