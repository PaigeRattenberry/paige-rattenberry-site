/**
 * Deterministic iso-line (contour) generation for the hero motif (DESIGN §4.3).
 *
 * A smooth 2D scalar field (a few Gaussians plus a gentle wave, all with fixed constants) is
 * sampled on a coarse grid and traced with marching squares. Cell segments are joined into
 * polylines so each level becomes one compact SVG path. Everything here runs at build time in
 * a server component; the client only receives path strings.
 */

export type ContourLevel = {
  /** Field value this iso-line traces. */
  value: number;
  /** SVG path data, absolute coordinates in the viewBox. */
  d: string;
};

export type ContourOptions = {
  width?: number;
  height?: number;
  /** Grid cell size in viewBox units. Smaller = smoother but larger output. */
  cell?: number;
  /** Number of iso-lines. */
  levels?: number;
  /**
   * Which region of the scalar field the viewBox samples, in field units (u, v). The default
   * maps x/height to u and y/height to v, so a 1200x640 box sees u in [0, 1.875], v in [0, 1].
   * A short band can pick its own window so it composes the loops instead of cropping them.
   */
  window?: FieldWindow;
};

export type FieldWindow = { u0: number; v0: number; u1: number; v1: number };

export const CONTOUR_DEFAULTS = {
  width: 1200,
  height: 640,
  cell: 24,
  levels: 9,
} as const satisfies Required<Omit<ContourOptions, "window">>;

function gaussian(u: number, v: number, cx: number, cy: number, s: number) {
  const dx = u - cx;
  const dy = v - cy;
  return Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
}

/** The scalar field. u and v are in viewBox units divided by height (so u spans ~[0, 1.9]). */
export function field(u: number, v: number): number {
  return (
    1.0 * gaussian(u, v, 0.55, 0.42, 0.34) +
    0.85 * gaussian(u, v, 1.38, 0.3, 0.3) -
    0.7 * gaussian(u, v, 1.05, 0.88, 0.32) +
    0.45 * gaussian(u, v, 1.75, 0.82, 0.3) +
    0.18 * Math.sin(3.1 * u + 0.6) * Math.cos(2.6 * v + 0.4)
  );
}

type Point = readonly [number, number];
type Segment = readonly [Point, Point];

function lerp(a: Point, b: Point, fa: number, fb: number, level: number): Point {
  const t = fa === fb ? 0.5 : (level - fa) / (fb - fa);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Marching-squares segment table. Edge indices: 0 top, 1 right, 2 bottom, 3 left. The case
 * index bits are TL, TR, BR, BL (high to low), set when the corner is >= level.
 */
const CASES: readonly (readonly [number, number][])[] = [
  [],
  [[3, 2]],
  [[2, 1]],
  [[3, 1]],
  [[0, 1]],
  [
    [3, 0],
    [2, 1],
  ],
  [[0, 2]],
  [[3, 0]],
  [[0, 3]],
  [[0, 2]],
  [
    [0, 1],
    [3, 2],
  ],
  [[0, 1]],
  [[3, 1]],
  [[2, 1]],
  [[3, 2]],
  [],
];

function traceLevel(
  grid: number[][],
  cols: number,
  rows: number,
  cell: number,
  level: number,
): Segment[] {
  const segments: Segment[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = grid[j][i];
      const tr = grid[j][i + 1];
      const br = grid[j + 1][i + 1];
      const bl = grid[j + 1][i];
      const idx =
        (tl >= level ? 8 : 0) |
        (tr >= level ? 4 : 0) |
        (br >= level ? 2 : 0) |
        (bl >= level ? 1 : 0);
      const cases = CASES[idx];
      if (cases.length === 0) continue;
      const x0 = i * cell;
      const y0 = j * cell;
      const x1 = x0 + cell;
      const y1 = y0 + cell;
      const TL: Point = [x0, y0];
      const TR: Point = [x1, y0];
      const BR: Point = [x1, y1];
      const BL: Point = [x0, y1];
      const edgePoint = (e: number): Point => {
        switch (e) {
          case 0:
            return lerp(TL, TR, tl, tr, level);
          case 1:
            return lerp(TR, BR, tr, br, level);
          case 2:
            return lerp(BL, BR, bl, br, level);
          default:
            return lerp(TL, BL, tl, bl, level);
        }
      };
      for (const [ea, eb] of cases) {
        segments.push([edgePoint(ea), edgePoint(eb)]);
      }
    }
  }
  return segments;
}

function key(p: Point) {
  return `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
}

/** Join loose segments into polylines by matching endpoints. */
function joinSegments(segments: Segment[]): Point[][] {
  const used = new Array<boolean>(segments.length).fill(false);
  const byEnd = new Map<string, number[]>();
  segments.forEach((s, i) => {
    for (const p of s) {
      const k = key(p);
      const list = byEnd.get(k);
      if (list) list.push(i);
      else byEnd.set(k, [i]);
    }
  });

  const takeNext = (p: Point): [number, Point] | null => {
    const list = byEnd.get(key(p));
    if (!list) return null;
    for (const i of list) {
      if (used[i]) continue;
      used[i] = true;
      const [a, b] = segments[i];
      return [i, key(a) === key(p) ? b : a];
    }
    return null;
  };

  const lines: Point[][] = [];
  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const [a, b] = segments[i];
    const line: Point[] = [a, b];
    // Extend forward from b.
    let next = takeNext(line[line.length - 1]);
    while (next) {
      line.push(next[1]);
      next = takeNext(line[line.length - 1]);
    }
    // Extend backward from a.
    let prev = takeNext(line[0]);
    while (prev) {
      line.unshift(prev[1]);
      prev = takeNext(line[0]);
    }
    lines.push(line);
  }
  return lines;
}

function fmt(n: number) {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function toPath(lines: Point[][]): string {
  let d = "";
  for (const line of lines) {
    if (line.length < 2) continue;
    const closed = key(line[0]) === key(line[line.length - 1]);
    const pts = closed ? line.slice(0, -1) : line;
    d += `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      d += `L${fmt(pts[i][0])} ${fmt(pts[i][1])}`;
    }
    if (closed) d += "Z";
  }
  return d;
}

/** Generate the contour levels. Pure and deterministic: same options, same output. */
export function generateContours(options: ContourOptions = {}): ContourLevel[] {
  const { width, height, cell, levels } = { ...CONTOUR_DEFAULTS, ...options };
  const win = options.window ?? { u0: 0, v0: 0, u1: width / height, v1: 1 };
  // Round up so the lines reach every edge even when `cell` does not divide the box (1200/28);
  // the overshoot is under one cell and the SVG viewport clips it. Flooring left a blank strip.
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);

  const grid: number[][] = [];
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j <= rows; j++) {
    const row: number[] = [];
    for (let i = 0; i <= cols; i++) {
      const u = win.u0 + ((i * cell) / width) * (win.u1 - win.u0);
      const v = win.v0 + ((j * cell) / height) * (win.v1 - win.v0);
      const value = field(u, v);
      row.push(value);
      if (value < min) min = value;
      if (value > max) max = value;
    }
    grid.push(row);
  }

  const out: ContourLevel[] = [];
  for (let n = 0; n < levels; n++) {
    // Evenly spaced strictly inside [min, max] so every level has something to trace.
    const value = min + ((max - min) * (n + 1)) / (levels + 1);
    const d = toPath(joinSegments(traceLevel(grid, cols, rows, cell, value)));
    if (d) out.push({ value: Number(value.toFixed(4)), d });
  }
  return out;
}

/** Total bytes of path data; a test keeps this under the DESIGN §4.3 budget. */
export function contourBytes(levels: ContourLevel[]): number {
  return levels.reduce((n, l) => n + l.d.length, 0);
}

/**
 * The two hero fields (DESIGN §4.3; Session 1 review call 3, option 1). Small screens get a
 * short band composed from the same scalar field rather than a crop of the landscape one. A
 * unit test caps the two path-data sets together, since both ship on the home page.
 */
export const HERO_FIELDS = {
  landscape: { width: 1200, height: 640, cell: 28, levels: 7 },
  // About 5rem tall at 390 px; the page box uses this aspect ratio so the band is never a crop.
  band: {
    width: 640,
    height: 140,
    cell: 20,
    levels: 6,
    window: { u0: 0.25, v0: 0.2, u1: 1.55, v1: 0.484 },
  },
} as const satisfies Record<string, ContourOptions>;
