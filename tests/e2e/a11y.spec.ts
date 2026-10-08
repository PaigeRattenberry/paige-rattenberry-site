import { expect, test } from "@playwright/test";

import { buildLogRoutes, htmlRoutes, navRoutes } from "../../lib/routes";

import { expectNoBlockingViolations, settle, themes, useTheme } from "./helpers";

/**
 * Axe over every HTML route in both themes against the production build. Fails on any serious
 * or critical violation (DESIGN §5.7 job 2). Adding a page to lib/routes.ts adds it here; the
 * `/resume` redirect lands on a PDF and has its own checks in seo.spec.ts (DESIGN §5.2).
 *
 * `/does-not-exist` is appended by hand: the 404 is a real page in the same visual system
 * (DESIGN §2) but deliberately not in `routes`, so nothing else would ever scan it.
 */
const scanPaths = [...htmlRoutes.map((r) => r.path), "/does-not-exist"];

for (const theme of themes) {
  test.describe(`a11y (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await useTheme(page, theme);
    });

    for (const path of scanPaths) {
      test(`${path} has no serious or critical violations`, async ({ page }) => {
        await page.goto(path);
        await settle(page, theme);
        await expectNoBlockingViolations(page);
      });
    }
  });
}

/**
 * The desktop sweep above never opens the mobile disclosure panel, which is the only
 * interactive markup in the shell and the only place the nav links are duplicated into the
 * accessibility tree. Scan it open, in both themes.
 */
for (const theme of themes) {
  test(`the open mobile menu has no serious or critical violations (${theme})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await useTheme(page, theme);
    await page.goto("/");
    await settle(page, theme);

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expectNoBlockingViolations(page);
  });
}

test("the mobile menu opens and closes with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await useTheme(page, "light");
  await page.goto("/");
  await settle(page, "light");

  const button = page.getByRole("button", { name: "Open menu" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("the skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await useTheme(page, "light");
  await page.goto("/about");
  await settle(page, "light");

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("#main")).toBeFocused();
});

// The contour motif shows below lg (1024 px); from lg the Session 5 constellation teaser takes
// its place beside the hero text (DESIGN §7.2), so these two tests look at a tablet width.
test("the contour motif is static under prefers-reduced-motion", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await useTheme(page, "light");
  await page.goto("/");
  await settle(page, "light");

  const svg = page.getByTestId("contour-field").filter({ visible: true });
  await expect(svg).toHaveAttribute("data-motion", "static");
  const animation = await svg
    .locator(".contour-level")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});

test("the contour motif remains static when motion is allowed", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await useTheme(page, "light");
  await page.goto("/");
  await settle(page, "light");

  const svg = page.getByTestId("contour-field").filter({ visible: true });
  await expect(svg).toHaveAttribute("data-motion", "static");
  const animation = await svg
    .locator(".contour-level")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});

/**
 * MetricStat (DESIGN §3.3): every number carries a source tooltip that must open from the
 * keyboard as well as on hover, and the tooltip must be wired with aria-describedby.
 */
test("a metric source tooltip opens on keyboard focus and on hover", async ({ page }) => {
  await useTheme(page, "light");
  await page.goto("/experience");
  await settle(page, "light");

  const button = page.getByRole("button", { name: /^Source for 300\+/ });
  // The button sits far down the page (below the Session 5 explorer). Bring it to the middle of
  // the viewport in one step first: html has scroll-behavior: smooth, and Playwright's own
  // scroll-into-view before each hover can otherwise restart an animated scroll and see the
  // tooltip as never stable (the action log of a failing run showed exactly that).
  await button.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const tooltipId = await button.getAttribute("aria-describedby");
  expect(tooltipId).toBeTruthy();
  const tooltip = page.locator(`[id="${tooltipId}"]`);
  await expect(tooltip).toHaveAttribute("role", "tooltip");
  await expect(tooltip).toBeHidden();

  await button.focus();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("Source:");

  await button.blur();
  await expect(tooltip).toBeHidden();

  await button.hover();
  await expect(tooltip).toBeVisible();

  // WCAG 1.4.13: hoverable (the pointer can move onto it) and dismissible (Escape).
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await page.mouse.move(0, 0);
  await button.hover();
  await expect(tooltip).toBeVisible();

  await page.mouse.move(0, 0);
  await button.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(button).toBeFocused();
});

/**
 * An open tooltip stays inside the viewport at phone width, whether it opened from focus or
 * hover. A number near the end of a line once pushed its 16rem tooltip off-screen.
 */
for (const path of ["/", "/experience", "/projects", "/projects/stimmap3d"]) {
  test(`${path} metric tooltips stay on screen at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await useTheme(page, "light");
    await page.goto(path);
    await settle(page, "light");

    const buttons = page.getByRole("button", { name: /^Source for / });
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label");
      const tooltip = page.locator(`[id="${await button.getAttribute("aria-describedby")}"]`);
      // One instant step to the middle of the viewport, as in the tooltip test above: html has
      // scroll-behavior: smooth, and the tooltip opens from CSS :hover. If hover()'s own
      // scroll-into-view is still animating once the pointer has arrived, the button slides out
      // from under it, :hover drops and the tooltip is display: none again. That is the null
      // boundingBox() straight after toBeVisible() seen twice under parallel workers (Sessions
      // 4 and 3b), where a busy machine stretches the animation.
      await button.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      for (const open of ["focus", "hover"] as const) {
        await page.mouse.move(0, 0);
        await button.blur();
        // Opening and measuring are one retried step, so a tooltip that closed between the two
        // is opened again rather than measured as null. The edge assertions stay outside it.
        const measured: { box: { x: number; width: number } | null } = { box: null };
        await expect(async () => {
          if (open === "focus") await button.focus();
          else await button.hover();
          await expect(tooltip).toBeVisible();
          measured.box = await tooltip.boundingBox();
          expect(
            measured.box,
            `${name} (${open}) closed before it could be measured`,
          ).not.toBeNull();
        }).toPass({ timeout: 10_000 });
        const box = measured.box;
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(box!.x, `${name} (${open}) left edge`).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, `${name} (${open}) right edge`).toBeLessThanOrEqual(
          clientWidth,
        );
        expect(scrollWidth, `${name} (${open}) widened the page`).toBe(clientWidth);
      }
    }
  });
}

/**
 * No horizontal scroll at phone or laptop width (DESIGN §8: works at 360 px and up). Grid gaps
 * and hidden tooltips both widened the page once; this keeps them honest.
 */
for (const [width, height] of [
  [360, 780],
  [390, 844],
  [768, 800],
  [820, 800],
  [1024, 800],
  [1280, 800],
] as const) {
  // Session 8: the build-story page at every width here, and each build log's page (tables, long
  // paths and code) at the narrowest, below.
  const paths = ["/", "/about", "/experience", "/projects", "/projects/stimmap3d"];
  paths.push("/how-this-was-built");
  if (width === 360) paths.push(...buildLogRoutes.map((r) => r.path));
  for (const path of paths) {
    test(`${path} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await useTheme(page, "light");
      await page.goto(path);
      await settle(page, "light");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBe(
        clientWidth,
      );
    });
  }
}

// Catch vertical clipping as well as overflow; doubled root text approximates text-only zoom.
for (const theme of themes) {
  for (const width of [360, 390, 768, 820, 1024, 1280, 1920]) {
    for (const textScale of [1, 2]) {
      test(`header controls fit at ${width}px, ${textScale * 100}% text (${theme})`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await useTheme(page, theme);
        await page.goto("/");
        await settle(page, theme);
        await page.evaluate((scale) => {
          document.documentElement.style.fontSize = `${106.25 * scale}%`;
        }, textScale);
        const header = page.getByRole("banner");
        const bounds = await header.boundingBox();
        for (const control of await header.locator("a:visible, button:visible").all()) {
          const box = await control.boundingBox();
          const label = (await control.textContent()) || (await control.getAttribute("aria-label"));
          expect(box!.x, label!).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width, label!).toBeLessThanOrEqual(width);
          expect(box!.y, label!).toBeGreaterThanOrEqual(bounds!.y);
          expect(box!.y + box!.height, label!).toBeLessThanOrEqual(bounds!.y + bounds!.height);
        }
        const nav = page.getByRole("navigation", { name: "Primary" });
        const openMenu = page.getByRole("button", { name: "Open menu", includeHidden: true });
        // Every nav link fits inline on a wide header at normal text; otherwise the menu holds them.
        const inline = textScale === 1 && width >= 1280;
        await expect(openMenu).toBeVisible({ visible: !inline });
        if (inline) {
          for (const route of navRoutes) {
            await expect(nav.getByRole("link", { name: route.label, exact: true })).toBeVisible();
          }
        } else {
          // Open panel controls fit the viewport and remain reachable at enlarged text sizes.
          await openMenu.click();
          const menu = page.getByRole("button", { name: "Close menu" });
          const panel = page.locator(`[id="${await menu.getAttribute("aria-controls")}"]`);
          for (const link of await panel.getByRole("link").all()) {
            await link.scrollIntoViewIfNeeded();
            const box = await link.boundingBox();
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(width);
            expect(box!.y).toBeGreaterThanOrEqual(0);
            expect(box!.y + box!.height).toBeLessThanOrEqual(900);
          }
        }
        const experience = nav.getByRole("link", { name: "Experience", exact: true }).last();
        await experience.focus();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/experience$/);
        await expect(openMenu).toHaveAttribute("aria-expanded", "false");
        expect(errors).toEqual([]);
      });
    }
  }
}

for (const width of [390, 1280]) {
  test(`current work and project action lead the home page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await useTheme(page, "light");
    await page.goto("/");
    await settle(page, "light");
    const current = page.getByTestId("current-work");
    const box = await current.boundingBox();
    expect(box!.y + box!.height).toBeLessThan(800);
    expect(box!.y).toBeLessThan(
      (await page.getByRole("heading", { name: "Selected work" }).boundingBox())!.y,
    );
    await expect(current).toContainText("Hammerspace");
    await expect(current.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "href",
      "/experience#hammerspace",
    );
    await expect(page.getByRole("link", { name: "Explore projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
}

/**
 * Two defects Session 7's responsive sweep found at 360 px, both text running into its
 * neighbour without widening the page, so the overflow checks above could not see them.
 */
test("the thesis charts' threshold labels do not run together at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await useTheme(page, "light");
  await page.goto("/projects/interpretable-medical-imaging-thesis");
  await settle(page, "light");

  const charts = page.locator("figure").filter({ has: page.locator(".iou-plot") });
  expect(await charts.count()).toBeGreaterThan(0);
  for (const chart of await charts.all()) {
    const labels = chart.locator("span").filter({ hasText: /^\d+%$/, visible: true });
    const boxes = [];
    for (const label of await labels.all()) boxes.push((await label.boundingBox())!);
    expect(boxes.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < boxes.length; i++) {
      // The text itself, not its grid cell: measure the gap between neighbouring labels.
      const gap = await labels.nth(i).evaluate(
        (el, prev) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const self = range.getBoundingClientRect();
          range.selectNodeContents(prev!);
          return self.left - range.getBoundingClientRect().right;
        },
        await labels.nth(i - 1).elementHandle(),
      );
      expect(gap, `gap before label ${i}`).toBeGreaterThanOrEqual(4);
    }
  }
});

test("the posterless video frame's title clears its load button at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await useTheme(page, "light");
  await page.goto("/leadership");
  await settle(page, "light");

  const frame = page.locator('figure[data-embed-status="idle"]');
  const title = (await frame.locator("p").first().boundingBox())!;
  const button = (await frame.getByRole("button", { name: "Load the video" }).boundingBox())!;
  expect(title.y + title.height).toBeLessThanOrEqual(button.y);
});
