/**
 * Local Lighthouse runs with the same Lighthouse that `lhci autorun` uses in CI (job 3), for
 * machines where `lhci` cannot finish: on Windows, chrome-launcher fails to remove its temp
 * profile (EPERM) and takes the whole run down with it. This script launches Chrome itself and
 * ignores that cleanup error. Mobile preset (Lighthouse's default), simulated throttling.
 *
 *   npm run build
 *   node scripts/lighthouse-local.mjs                       # the audited routes (lighthouserc.json), 3 runs each
 *   node scripts/lighthouse-local.mjs --runs=1 /research    # any routes
 *   node scripts/lighthouse-local.mjs --save=<dir> /        # also write each run's JSON report
 *
 * (From Git Bash, prefix with MSYS_NO_PATHCONV=1 so "/" is not turned into a Windows path.)
 * CI's assertions live in lighthouserc.json; this only reports.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = Number(process.env.LH_PORT ?? 3100);
const args = process.argv.slice(2);
const runs = Number(args.find((a) => a.startsWith("--runs="))?.slice(7) ?? 3);
const saveDir = args.find((a) => a.startsWith("--save="))?.slice(7);
// "simulate" (Lantern, what CI asserts on) or "devtools" (the load itself is throttled).
const throttlingMethod = args.find((a) => a.startsWith("--throttling="))?.slice(13) ?? "simulate";
const rc = JSON.parse(readFileSync("lighthouserc.json", "utf8"));
const routes = args.filter((a) => !a.startsWith("--"));
const urls = routes.length
  ? routes.map((r) => `http://localhost:${PORT}${r}`)
  : rc.ci.collect.url.map((u) => u.replace(/:\d+/, `:${PORT}`));

// `npx` needs a shell on Windows, and the shell is then the parent of `next start`: on POSIX the
// server gets its own process group, so the whole group can be signalled at the end.
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  shell: true,
  detached: process.platform !== "win32",
  stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((resolve, reject) => {
  server.stdout.on("data", (chunk) => String(chunk).includes("Ready in") && resolve());
  server.on("exit", (code) => reject(new Error(`next start exited with ${code}`)));
});

const rows = [];
try {
  for (const url of urls) {
    for (let run = 1; run <= runs; run++) {
      const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
      try {
        const { lhr } = await lighthouse(url, {
          port: chrome.port,
          logLevel: "error",
          throttlingMethod,
        });
        const score = (id) => Math.round(lhr.categories[id].score * 100);
        const ms = (id) => Math.round(lhr.audits[id].numericValue);
        rows.push({
          url: new URL(url).pathname,
          perf: score("performance"),
          a11y: score("accessibility"),
          bp: score("best-practices"),
          seo: score("seo"),
          fcp: ms("first-contentful-paint"),
          lcp: ms("largest-contentful-paint"),
          tbt: ms("total-blocking-time"),
          cls: Number(lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
          si: ms("speed-index"),
        });
        if (saveDir) {
          mkdirSync(saveDir, { recursive: true });
          const name = `${new URL(url).pathname.replace(/\W+/g, "_") || "_"}-${run}.json`;
          writeFileSync(path.join(saveDir, name), JSON.stringify(lhr));
        }
      } finally {
        // Windows: the temp profile is still locked when chrome-launcher tries to delete it. The
        // failure can arrive as a thrown error or as a rejected promise, and an unhandled
        // rejection would end the script before the server is stopped, so both are absorbed.
        await Promise.resolve()
          .then(() => chrome.kill())
          .catch(() => {});
      }
    }
  }
} finally {
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    process.kill(-server.pid);
  }
}
console.table(rows);
