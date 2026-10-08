/**
 * Prints the scores of the Lighthouse runs `lhci autorun` left in .lighthouseci/ as a Markdown
 * table: to stdout, and to the GitHub job summary when CI provides one. lhci's own log only
 * says whether the assertions passed, and DESIGN §5.7's numbers are reported in every PR.
 */
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dir = ".lighthouseci";
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)) : [];
if (files.length === 0) {
  console.log("No Lighthouse reports in .lighthouseci/.");
  process.exit(0);
}
const runs = files
  .map((file) => JSON.parse(readFileSync(path.join(dir, file), "utf8")))
  .map((lhr) => ({
    route: new URL(lhr.finalDisplayedUrl).pathname,
    fetched: lhr.fetchTime,
    scores: ["performance", "accessibility", "best-practices", "seo"].map((id) =>
      Math.round(lhr.categories[id].score * 100),
    ),
    metrics: ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time"].map(
      (id) => `${Math.round(lhr.audits[id].numericValue)} ms`,
    ),
    cls: lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3),
    version: lhr.lighthouseVersion,
  }))
  .sort((a, b) => a.route.localeCompare(b.route) || a.fetched.localeCompare(b.fetched));

const lines = [
  `### Lighthouse ${runs[0].version}, mobile preset, simulated throttling`,
  "",
  "| route | performance | accessibility | best practices | SEO | FCP | LCP | TBT | CLS |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...runs.map((r) => `| ${[r.route, ...r.scores, ...r.metrics, r.cls].join(" | ")} |`),
  "",
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
