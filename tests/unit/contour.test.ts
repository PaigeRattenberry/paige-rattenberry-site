import { describe, expect, it } from "vitest";

import {
  CONTOUR_DEFAULTS,
  HERO_FIELDS,
  contourBytes,
  generateContours,
} from "@/components/hero/contour";

describe("contour generator", () => {
  it("is deterministic", () => {
    expect(generateContours()).toEqual(generateContours());
    expect(generateContours(HERO_FIELDS.band)).toEqual(generateContours(HERO_FIELDS.band));
  });

  it.each([
    ["default", { ...CONTOUR_DEFAULTS }],
    ["landscape", { ...HERO_FIELDS.landscape }],
    ["band", { ...HERO_FIELDS.band }],
  ])("produces one non-empty path per level, covering the viewBox (%s)", (_name, opts) => {
    const levels = generateContours(opts);
    expect(levels).toHaveLength(opts.levels);
    let maxX = 0;
    let maxY = 0;
    for (const level of levels) {
      expect(level.d.startsWith("M")).toBe(true);
      const numbers = level.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      expect(numbers.length).toBeGreaterThan(4);
      for (let i = 0; i < numbers.length; i += 2) {
        // The grid may overshoot the right and bottom edges by less than one cell (clipped).
        expect(numbers[i]).toBeGreaterThanOrEqual(0);
        expect(numbers[i]).toBeLessThan(opts.width + opts.cell);
        expect(numbers[i + 1]).toBeGreaterThanOrEqual(0);
        expect(numbers[i + 1]).toBeLessThan(opts.height + opts.cell);
        maxX = Math.max(maxX, numbers[i]);
        maxY = Math.max(maxY, numbers[i + 1]);
      }
    }
    // Some line reaches the right edge, so no blank strip shows where the mask is opaque.
    expect(maxX).toBeGreaterThanOrEqual(opts.width);
  });

  it("keeps both hero fields together inside the DESIGN §4.3 budget (15 KB on the wire)", () => {
    // Every server-rendered node appears in the HTML and again in the RSC payload, and the SVG
    // wrappers add ~15% on top of the path data, so the wire cost is ~2.3x the path data. Both
    // fields ship on the home page (one per breakpoint), so their sum stays under 6.5 KB.
    const total =
      contourBytes(generateContours(HERO_FIELDS.landscape)) +
      contourBytes(generateContours(HERO_FIELDS.band));
    expect(total).toBeLessThan(6.5 * 1024);
  });
});
