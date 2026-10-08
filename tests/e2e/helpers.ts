import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export type Theme = "light" | "dark";
export const themes: readonly Theme[] = ["light", "dark"];

/**
 * Force a theme the way a visitor's explicit choice would: next-themes reads its stored
 * value from localStorage on load, so set it before navigation. (Not a React hook, despite
 * the name it has carried since Session 1.)
 */
export async function useTheme(page: Page, theme: Theme) {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t);
    } catch {
      // Storage unavailable: next-themes falls back to the system preference.
    }
  }, theme);
}

/** Wait for next-themes to stamp the attribute and for fonts to settle. */
export async function settle(page: Page, theme: Theme) {
  await page.waitForFunction((t) => document.documentElement.dataset.theme === t, theme);
  await page.evaluate(() => document.fonts.ready);
}

/** Axe with the project's rule set; fails on any serious or critical violation. */
export async function expectNoBlockingViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  const report = blocking
    .map((v) => {
      const targets = v.nodes.map((n) => n.target.join(" ")).join("\n  ");
      return `${v.id} (${v.impact}): ${v.help}\n  ${targets}`;
    })
    .join("\n");
  expect(blocking, report).toEqual([]);
}
