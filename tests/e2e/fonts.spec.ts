import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { htmlRoutes } from "../../lib/routes";

/**
 * Session 7: the site's fonts are the axis-limited latin files in app/fonts/ plus "extras"
 * faces for the few body-text (and, since Session 8, code-text) characters outside the latin subset (scripts/build-fonts.mjs).
 * With no latin-ext or greek file behind them any more, a new character outside those sets
 * would silently fall back to a system font in the middle of a word. This walks every page's
 * text and fails on one, naming the character and where to add it. It also pins what that work
 * bought: three preloaded font files per page, nothing from Google, and an extras face only on a
 * page that draws one of its characters.
 */
type ManifestEntry = { unicodeRange: string };
const manifest = JSON.parse(
  readFileSync(path.join(process.cwd(), "app", "fonts", "manifest.json"), "utf8"),
) as Record<string, ManifestEntry>;

function codePoints(range: string): Set<number> {
  const set = new Set<number>();
  for (const part of range.split(",")) {
    const [from, to] = part
      .trim()
      .replace("U+", "")
      .split("-")
      .map((hex) => parseInt(hex, 16));
    for (let cp = from; cp <= (to ?? from); cp++) set.add(cp);
  }
  return set;
}

const latin = codePoints(manifest["inter.woff2"].unicodeRange);
const extras = new Set(
  Object.entries(manifest)
    .filter(([file]) => file.endsWith("-extras.woff2"))
    .flatMap(([, entry]) => [...codePoints(entry.unicodeRange)]),
);
/**
 * Characters in no subset of any of the three families, so a system font draws them, as it did
 * before Session 7: the operators in StimMap3D's quoted method statement ("∂∇"), and the arrows,
 * relations and markers the build logs on /how-this-was-built use in prose ("→≈≤≥") and quote
 * from tool output in code ("⋯○●").
 */
const SYSTEM_FONT_SYMBOLS = new Set([..."∂∇→≈≤≥⋯○●"].map((c) => c.codePointAt(0)!));

// The 404 is a real page outside `routes` (see a11y.spec.ts), so it is appended by hand here too.
for (const route of [...htmlRoutes.map((r) => r.path), "/does-not-exist"]) {
  test(`${route} draws no character its fonts lack`, async ({ page }) => {
    const fontRequests: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "font") fontRequests.push(request.url());
    });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const drawn = await page.evaluate(() => {
      // The faces that draw a character through their own unicode-range: the extras faces. A face
      // with no range (the three preloaded families) reports the whole of Unicode and is skipped.
      const covers = (range: string, cp: number) =>
        range.split(",").some((part) => {
          const [from, to] = part
            .trim()
            .replace(/^U\+/i, "")
            .split("-")
            .map((h) => parseInt(h, 16));
          return cp >= from && cp <= (to ?? from);
        });
      const ranged = [...document.fonts].filter(
        (face) => !/^U\+0-10FFFF$/i.test(face.unicodeRange),
      );
      const found: { char: string; family: string; faces: string[]; text: string }[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style")) continue;
        for (const char of node.textContent ?? "") {
          if (char.codePointAt(0)! <= 0x7e) continue;
          found.push({
            char,
            family: getComputedStyle(parent).fontFamily,
            faces: ranged
              .filter((face) => covers(face.unicodeRange, char.codePointAt(0)!))
              .map((face) => face.family.replace(/^["']|["']$/g, "")),
            text: (node.textContent ?? "").trim().slice(0, 60),
          });
        }
      }
      return found;
    });

    const usesExtras = new Set<number>();
    for (const { char, family, faces, text } of drawn) {
      const cp = char.codePointAt(0)!;
      if (latin.has(cp) || SYSTEM_FONT_SYMBOLS.has(cp)) continue;
      const where = `"${char}" (U+${cp.toString(16).toUpperCase()}) in "${text}"`;
      expect(
        extras.has(cp),
        `${where} is in no shipped font: add it to INTER_EXTRAS (body text) or MONO_EXTRAS (code) ` +
          `in scripts/build-fonts.mjs, ` +
          `run npm run fonts, and update the unicode-range in app/layout.tsx`,
      ).toBe(true);
      // An extras face leads only its own stack (Inter's the body, JetBrains Mono's code), so the
      // element's stack must name one of the declared faces that covers the character.
      const stack = family.split(",").map((name) => name.trim().replace(/^["']|["']$/g, ""));
      expect(
        faces.some((face) => stack.includes(face)),
        `${where} is set in ${family}, which names none of the faces that cover it (${faces.join(", ")})`,
      ).toBe(true);
      usesExtras.add(cp);
    }

    const fontPaths = fontRequests.map((url) => new URL(url));
    for (const url of fontPaths) expect(url.host).toBe(new URL(page.url()).host);
    const extrasRequested = fontPaths.filter((url) => /extras/.test(url.pathname));
    if (usesExtras.size === 0) expect(extrasRequested).toEqual([]);
    else expect(extrasRequested.length).toBeGreaterThan(0);
    expect(fontPaths.length - extrasRequested.length).toBeLessThanOrEqual(3);
  });
}
