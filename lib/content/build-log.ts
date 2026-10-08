/**
 * The one place that reads `docs/build-log/*.md` (Session 8). Node-only (fs), resolved from the
 * working directory like the project loader. Each log follows the IMPLEMENTATION_PLAN §0
 * template loosely enough that only four things are parsed out of it: the title (its `#`
 * heading), the date line's first date, its pull-request number, and the first paragraph of
 * `## Goal`. Everything after the title, the date line included, is rendered as written, on the
 * entry's own page, except an empty `## Paige's review notes` heading (Session 9b): the template
 * keeps the heading in every log for notes added at merge, and on the page an empty one reads as
 * a section with its text missing.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const BUILD_LOG_DIR = path.join(process.cwd(), "docs", "build-log");

export type BuildLogEntry = {
  /** File name without `.md`; the entry's route is /how-this-was-built/<slug>. */
  slug: string;
  /** The log's `#` heading, verbatim. */
  title: string;
  /**
   * "Session 7", "Plan amendment", …: the part of the title before " — ". A title with no such
   * part is a "Build log"; a title whose part after the dash is only a date ("Small review
   * follow-up — 2026-09-13") is its own kind and name.
   */
  kind: string;
  /** The rest of the title, or the whole title when it has no such part. */
  name: string;
  /** A label that tells entries apart: the kind for a session, the kind and date otherwise. */
  short: string;
  /** First ISO date on the `Date:` line. */
  date: string;
  /** The pull request that merged the work, when the log records one. Plain text on the site. */
  pr: number | null;
  /** The first paragraph under `## Goal`, as Markdown. */
  goal: string;
  /**
   * Everything after the title, the date line included, as Markdown; an empty review-notes
   * heading is left out.
   */
  body: string;
};

const DATE = /\d{4}-\d{2}-\d{2}/;
/** A CommonMark ATX heading: up to three spaces, 1–6 `#`s, its text, an optional closing run. */
const ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
/** A code fence line: up to three spaces, three or more backticks or tildes, then the rest. */
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
/** The heading's text; the template's line carries a note after it, which a copy may keep. */
const REVIEW_NOTES = /^Paige's review notes(?:\s|$)/;

type Heading = { level: number; text: string } | null;

/** Each line's ATX heading, or null; a line inside a code fence is never a heading. */
function headings(lines: string[]): Heading[] {
  let fence: string | null = null;
  return lines.map((line) => {
    const f = FENCE.exec(line);
    if (fence !== null) {
      // A fence closes on a run of its own character at least as long, with nothing after it.
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null;
      return null;
    }
    // A backtick fence's info string may not contain a backtick (that line is inline code).
    if (f && !(f[1][0] === "`" && f[2].includes("`"))) {
      fence = f[1];
      return null;
    }
    const h = ATX.exec(line);
    return h ? { level: h[1].length, text: (h[2] ?? "").trim() } : null;
  });
}

/**
 * Drop the review-notes heading when no text follows it before the next `#` or `##` heading or
 * the end of the log. A `###` heading counts as text: notes may open with one. Headings are read
 * as CommonMark reads ATX headings (indent, closing `#`s, a tab after the `#`s), and nothing
 * inside a code fence is one, so a quoted copy of the heading is neither removed nor matched.
 */
function withoutEmptyReviewNotes(lines: string[]): string[] {
  const hs = headings(lines);
  const at = hs.findIndex((h) => h?.level === 2 && REVIEW_NOTES.test(h.text));
  if (at === -1) return lines;
  const next = lines.findIndex((l, i) => i > at && l.trim() !== "");
  if (next !== -1 && (hs[next]?.level ?? 3) > 2) return lines;
  return [...lines.slice(0, at), ...lines.slice(at + 1)];
}

/** Parse one log. Throws on a file that lacks a title, a date or a goal, so the build fails. */
export function parseBuildLog(slug: string, source: string): BuildLogEntry {
  const text = source.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const titleIndex = lines.findIndex((l) => l.startsWith("# "));
  if (titleIndex === -1) throw new Error(`build log ${slug}: no "# " title`);
  const title = lines[titleIndex].slice(2).trim();

  const dateIndex = lines.findIndex((l) => /^- Date:/.test(l));
  const date = dateIndex === -1 ? null : DATE.exec(lines[dateIndex])?.[0];
  if (!date) throw new Error(`build log ${slug}: no "- Date: YYYY-MM-DD" line`);
  const prMatch = /PR: #(\d+)/.exec(lines[dateIndex]);

  const goalStart = lines.findIndex((l) => /^## Goal\s*$/.test(l));
  if (goalStart === -1) throw new Error(`build log ${slug}: no "## Goal" section`);
  const goalLines: string[] = [];
  for (const line of lines.slice(goalStart + 1)) {
    if (line.startsWith("#")) break;
    if (line.trim() === "") {
      if (goalLines.length) break;
      continue;
    }
    goalLines.push(line);
  }
  if (!goalLines.length) throw new Error(`build log ${slug}: empty "## Goal" section`);

  const [left, ...rest] = title.split(" — ");
  const right = rest.join(" — ");
  const kind = right ? left : "Build log";
  const name = !right || /^\d{4}-\d{2}-\d{2}$/.test(right) ? left : right;
  return {
    slug,
    title,
    kind,
    name,
    short: kind.startsWith("Session") ? kind : `${kind}, ${date}`,
    date,
    pr: prMatch ? Number(prMatch[1]) : null,
    goal: goalLines.join("\n"),
    body: withoutEmptyReviewNotes(lines.slice(titleIndex + 1))
      .join("\n")
      .trim(),
  };
}

/**
 * Every build log, oldest first: by date, then by pull-request number (merge order), so two
 * logs from one day keep the order their work landed in; a log with no number sorts after the
 * numbered ones of its day.
 */
export function readBuildLogs(dir = BUILD_LOG_DIR): BuildLogEntry[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) =>
      parseBuildLog(name.replace(/\.md$/, ""), readFileSync(path.join(dir, name), "utf8")),
    )
    .sort(byLogOrder);
}

/** Oldest first: by date, then by pull request, a log without one last on its day. */
export function byLogOrder(a: BuildLogEntry, b: BuildLogEntry): number {
  const pr = (e: BuildLogEntry) => e.pr ?? Number.MAX_SAFE_INTEGER;
  return a.date.localeCompare(b.date) || pr(a) - pr(b);
}
