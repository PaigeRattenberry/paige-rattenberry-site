import { execFileSync } from "node:child_process";

export type LastUpdated = {
  /** ISO 8601 timestamp, in the commit's own UTC offset when it came from git. */
  iso: string;
  /** Short commit SHA when known. */
  sha: string | null;
  /** Where the timestamp came from. */
  source: "git" | "vercel" | "build-time";
};

/**
 * Last-updated stamp for the footer (DESIGN §2). Runs once at build time in a server
 * component. Prefers the last commit date from git; when `.git` is absent (Vercel's build
 * container may not ship history) it falls back to VERCEL_GIT_COMMIT_SHA plus the build time.
 *
 * `execFileSync`, not `execSync`: on Windows `execSync` goes through `cmd.exe`, which expands
 * `%cI%` in the format string against the environment (with `CI` set it returns "truen<sha>",
 * `Date.parse` gives NaN, and the footer silently degrades to the build-time stamp).
 */
export function getLastUpdated(now: Date = new Date()): LastUpdated {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI%n%h"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    const [iso, sha] = out.split("\n");
    if (iso && !Number.isNaN(Date.parse(iso))) {
      // Kept verbatim rather than normalised to UTC: `new Date(iso).toISOString()` would push
      // an evening commit in a negative offset onto the next calendar day in the footer.
      return { iso, sha: sha ?? vercelSha, source: "git" };
    }
  } catch {
    // No git available; fall through to the build-time stamp.
  }
  return {
    iso: now.toISOString(),
    sha: vercelSha,
    source: vercelSha ? "vercel" : "build-time",
  };
}

/** Computed once per process (build or dev server), not once per rendered route. */
export const lastUpdated: LastUpdated = getLastUpdated();

/** "2026-09-08" style date for display; the leading 10 chars of an ISO 8601 timestamp. */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
