/**
 * Reports the initial JavaScript a route ships, gzipped, and with `--max-site-kb=<n>` fails when
 * the site's own share of it is over budget (DESIGN §8, as restated 2026-09-21: site-owned client
 * JS on `/` ≤ 15 KB; the framework's floor alone is over the original 120 KB). Reads the
 * prerendered HTML in .next/server/app/, collects every <script src> it references, and sums
 * the gzipped size of those files from .next/. A `noModule` script (Next's polyfill bundle for
 * browsers without ES modules) is listed but excluded from the total, since a modern browser
 * never downloads it. Run after `npm run build`:
 *
 *   node scripts/js-budget.mjs            # the home page
 *   node scripts/js-budget.mjs /experience
 *   node scripts/js-budget.mjs / --max-site-kb=15   # what `npm run budget` and CI job 1 run
 *
 * (From Git Bash, prefix with MSYS_NO_PATHCONV=1 so "/" is not turned into a Windows path.)
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const route = args.find((a) => !a.startsWith("--")) ?? "/";
const maxSiteKb = Number(args.find((a) => a.startsWith("--max-site-kb="))?.slice(14) ?? NaN);
const root = process.cwd();
const htmlFile = path.join(
  root,
  ".next/server/app",
  route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`,
);
if (!existsSync(htmlFile)) {
  console.error(`No prerendered HTML at ${htmlFile}; run npm run build first.`);
  process.exit(1);
}
const html = readFileSync(htmlFile, "utf8");
const scripts = new Map();
for (const m of html.matchAll(/<script\b([^>]*?)\bsrc="([^"]+\.js(?:\?[^"]*)?)"([^>]*)>/g)) {
  const src = m[2].replace(/\?.*$/, "");
  const legacy = /\bnoModule\b/i.test(m[1] + m[3]);
  scripts.set(src, legacy);
}
let raw = 0;
let gz = 0;
let legacyGz = 0;
const rows = [];
for (const [src, legacy] of scripts) {
  const file = path.join(root, ".next", src.replace(/^\/_next\//, ""));
  if (!existsSync(file)) {
    console.error(`missing chunk ${src}`);
    continue;
  }
  const bytes = readFileSync(file);
  const zipped = gzipSync(bytes, { level: 9 }).length;
  if (legacy) legacyGz += zipped;
  else {
    raw += bytes.length;
    gz += zipped;
  }
  rows.push({ chunk: path.basename(file), raw: bytes.length, gzip: zipped, legacy });
}
rows.sort((a, b) => b.gzip - a.gzip);
console.table(rows);
console.log(
  `${route}: ${rows.filter((r) => !r.legacy).length} scripts for modern browsers, ` +
    `${(raw / 1024).toFixed(1)} KB raw, ${(gz / 1024).toFixed(1)} KB gzipped` +
    (legacyGz ? ` (plus ${(legacyGz / 1024).toFixed(1)} KB gzipped noModule polyfills)` : ""),
);

// The floor (Session 7): `rootMainFiles` is what every App Router page loads before any of the
// site's own code (React DOM, the router client, the bundler runtime). What a route ships above
// it is the site's share, the only part a change to the site can remove.
const manifestFile = path.join(root, ".next/build-manifest.json");
if (existsSync(manifestFile)) {
  const { rootMainFiles = [] } = JSON.parse(readFileSync(manifestFile, "utf8"));
  // Only the ones this page loads: a floor file missing from `scripts` is not in `gz`, and
  // subtracting it anyway would understate the site's share.
  const framework = rootMainFiles
    .filter((file) => scripts.get(`/_next/${file}`) === false)
    .map((file) => path.join(root, ".next", file))
    .filter((file) => existsSync(file))
    .reduce((sum, file) => sum + gzipSync(readFileSync(file), { level: 9 }).length, 0);
  const siteKb = (gz - framework) / 1024;
  console.log(
    `framework floor (build-manifest rootMainFiles): ${(framework / 1024).toFixed(1)} KB gzipped; ` +
      `the site's own client code on this route: ${siteKb.toFixed(1)} KB`,
  );
  if (!Number.isNaN(maxSiteKb)) {
    // A floor of zero would make every byte "the site's", so an unreadable manifest must not pass.
    if (framework === 0) {
      console.error("build-manifest.json lists no rootMainFiles; cannot tell the site's share.");
      process.exit(1);
    }
    if (siteKb > maxSiteKb) {
      console.error(
        `${route}: ${siteKb.toFixed(1)} KB of site-owned client JS is over the ${maxSiteKb} KB budget.`,
      );
      process.exit(1);
    }
    console.log(`within the ${maxSiteKb} KB budget for site-owned client JS.`);
  }
} else if (!Number.isNaN(maxSiteKb)) {
  console.error("No .next/build-manifest.json; run npm run build first.");
  process.exit(1);
}
