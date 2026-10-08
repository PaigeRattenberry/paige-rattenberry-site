import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assets,
  buildLogBySlug,
  buildLogs,
  buildStats,
  buildStory,
  buildStoryGallery,
  projectBySlug,
} from "@/lib/content/load";
import { byLogOrder, parseBuildLog } from "@/lib/content/build-log";
import { BuildStatsSchema, BuildStorySchema } from "@/lib/content/schema";
import { renderMarkdown, resolveRepositoryLink } from "@/lib/mdx";
import { buildLogRoutes, htmlRoutes } from "@/lib/routes";

/**
 * Session 8, /how-this-was-built: the build-log loader, the history snapshot (D6), and the rules
 * that keep the synthesis honest. Its counts are list lengths, so the checks here are that every
 * item points at a log that exists and every quote is in its log word for word.
 */
const root = process.cwd();
const logFiles = readdirSync(path.join(root, "docs", "build-log")).filter((f) => f.endsWith(".md"));
/** A log's text with every run of whitespace as one space, so a wrapped sentence still matches. */
const flat = (slug: string) =>
  readFileSync(path.join(root, "docs", "build-log", `${slug}.md`), "utf8").replace(/\s+/g, " ");

describe("build logs", () => {
  it("loads every file in docs/build-log/, oldest first, each with a page", () => {
    expect(buildLogs.map((e) => `${e.slug}.md`).sort()).toEqual([...logFiles].sort());
    // A log without a pull request comes last on its day, as `byLogOrder` sorts it.
    const keys = buildLogs.map((e) => `${e.date} ${String(e.pr ?? 9999).padStart(4, "0")}`);
    expect(keys).toEqual([...keys].sort());
    for (const e of buildLogs) {
      expect(htmlRoutes.map((r) => r.path)).toContain(`/how-this-was-built/${e.slug}`);
    }
    expect(buildLogRoutes).toHaveLength(logFiles.length);
  });

  it("gives every entry a title, a date, a goal and a label that tells it apart", () => {
    for (const e of buildLogs) {
      expect(e.title, e.slug).not.toBe("");
      expect(e.goal, e.slug).not.toBe("");
      expect(e.body, e.slug).not.toMatch(/^# /m);
      // The page renders the log as written, so the whole date line (branch, further dates) stays.
      expect(e.body, e.slug).toMatch(/^- Date: .*Branch: /);
    }
    const shorts = buildLogs.map((e) => e.short);
    expect(new Set(shorts).size).toBe(shorts.length);
    const titles = buildLogs.map((e) => e.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("carries a redaction note only once, under the header lines", () => {
    // AGENTS.md's publication rules (amended 2026-10-02): a log that lost text says so in one
    // note above `## Goal`, never section by section. A quoted mention of the note is prose.
    const note = /^\(redacted for publication, \d{4}-\d{2}-\d{2}( and \d{4}-\d{2}-\d{2})*\)$/;
    for (const f of logFiles) {
      const lines = readFileSync(path.join(root, "docs", "build-log", f), "utf8").split(/\r?\n/);
      const notes = lines.flatMap((l, i) => (note.test(l) ? [i] : []));
      expect(notes.length, f).toBeLessThanOrEqual(1);
      if (notes.length) {
        expect(notes[0], f).toBeLessThan(lines.findIndex((l) => /^## Goal\s*$/.test(l)));
      }
      const rest = lines.filter((_, i) => !notes.includes(i)).join(" ");
      expect(rest.match(/(?<!")\(redacted\s+for\s+publication[^)]*\)/gi) ?? [], f).toEqual([]);
    }
  });

  it("parses the header shapes the logs use", () => {
    const session = parseBuildLog(
      "s9-x",
      "# Session 9 — A name\n- Date: 2026-10-02 · Branch: s9-x · PR: #21\n\n## Goal\nDo a thing\nwell.\n\nMore.\n",
    );
    expect(session).toMatchObject({
      kind: "Session 9",
      name: "A name",
      short: "Session 9",
      date: "2026-10-02",
      pr: 21,
      goal: "Do a thing\nwell.",
    });
    const review = parseBuildLog(
      "r",
      "# Small review — 2026-09-13\n\n- Date: 2026-09-13 / 2026-09-14 · PR: #<n>\n\n## Goal\n\nG\n",
    );
    expect(review).toMatchObject({ kind: "Small review", name: "Small review", pr: null });
    expect(review.short).toBe("Small review, 2026-09-13");
    // A date inside a name is part of the name; a title with no dash is a plain build log.
    expect(
      parseBuildLog("l", "# Launch — 2026-10-05 cutover\n- Date: 2026-10-05\n## Goal\nG\n"),
    ).toMatchObject({ kind: "Launch", name: "2026-10-05 cutover" });
    expect(parseBuildLog("l", "# Launch\n- Date: 2026-10-05\n## Goal\nG\n")).toMatchObject({
      kind: "Build log",
      name: "Launch",
      short: "Build log, 2026-10-05",
    });
    expect(() => parseBuildLog("x", "# T\n- Date: 2026-01-01\n")).toThrow(/Goal/);
    expect(() => parseBuildLog("x", "# T\n\n## Goal\nG\n")).toThrow(/Date/);
  });

  it("leaves an empty review-notes heading off the page, and keeps one with notes", () => {
    const log = (notes: string) =>
      parseBuildLog(
        "l",
        `# L\n- Date: 2026-10-07 · Branch: l\n## Goal\nG\n\n## Paige's review notes\n${notes}`,
      ).body;
    expect(log("\n## Screenshots\n\nNone.\n")).not.toMatch(/review notes/);
    expect(log("\n")).not.toMatch(/review notes/);
    expect(log("\nLooks right.\n\n## Screenshots\n")).toMatch(/^## Paige's review notes$/m);
    expect(log("\n### Call 1\n\nYes.\n")).toMatch(/^## Paige's review notes$/m);
    // Other ways CommonMark spells the same headings: an indented or tab-separated next heading,
    // closing `#`s, an indented review-notes heading, the template's line with its note.
    for (const notes of ["\n  ## Screenshots\n", "\n##\tScreenshots\n"]) {
      expect(log(notes), JSON.stringify(notes)).not.toMatch(/review notes/);
    }
    const spelled = (heading: string) =>
      parseBuildLog("l", `# L\n- Date: 2026-10-07\n## Goal\nG\n\n${heading}\n\n## Screenshots\n`)
        .body;
    for (const heading of [
      "## Paige's review notes ##",
      " ## Paige's review notes",
      "## Paige's review notes   (filled in by Paige at merge; leave the heading)",
    ]) {
      expect(spelled(heading), heading).not.toMatch(/review notes/);
    }
    // A copy inside a code fence is quoted text: it stays, and the real heading below still goes.
    const fenced = parseBuildLog(
      "l",
      "# L\n- Date: 2026-10-07\n## Goal\nG\n\n```md\n## Paige's review notes\n## Screenshots\n```\n\n" +
        "~~~\n```\n## Paige's review notes\n~~~\n\n## Paige's review notes\n\n## Screenshots\n",
    ).body;
    expect(fenced.match(/^## Paige's review notes$/gm)).toHaveLength(2);
    expect(fenced).toMatch(/~~~\n+## Screenshots$/);
    // Every log keeps the heading in its file; only Session 1's has notes under it.
    for (const f of logFiles) {
      const text = readFileSync(path.join(root, "docs", "build-log", f), "utf8");
      expect(text, f).toMatch(/^## Paige's review notes\s*$/m);
    }
    expect(buildLogBySlug("s1-scaffold")?.body).toMatch(/^## Paige's review notes$/m);
    // No log page keeps an empty heading: wherever one is left, text follows it.
    for (const e of buildLogs) {
      const lines = e.body.split("\n");
      lines.forEach((line, i) => {
        if (!/^ {0,3}##[ \t]+Paige's review notes/.test(line)) return;
        const next = lines.slice(i + 1).find((l) => l.trim() !== "");
        expect(next, `${e.slug}: empty review-notes heading`).toBeDefined();
        expect(next, `${e.slug}: empty review-notes heading`).not.toMatch(/^ {0,3}#{1,2}(\s|$)/);
      });
    }
  });

  it("sends relative links to the log pages or the public repository, and leaves the rest", () => {
    const base = { from: "docs/build-log", repository: buildStory.repository.url };
    expect(resolveRepositoryLink("s1-scaffold.md#goal", base)).toBe(
      "/how-this-was-built/s1-scaffold#goal",
    );
    expect(resolveRepositoryLink("../screenshots/s2-home-1280.png", base)).toBe(
      `${buildStory.repository.url}/blob/main/docs/screenshots/s2-home-1280.png`,
    );
    expect(resolveRepositoryLink("../../DESIGN.md", base)).toBe(
      `${buildStory.repository.url}/blob/main/DESIGN.md`,
    );
    for (const url of ["https://example.org/a.md", "#goal", "/projects", "mailto:x@y.z"]) {
      expect(resolveRepositoryLink(url, base)).toBe(url);
    }
    for (const url of ["../../../outside.md", "../../private/notes.md", "../../_source/x.pdf"]) {
      expect(() => resolveRepositoryLink(url, base), url).toThrow(/outside the published tree/);
    }
    for (const url of ["s1-scafold.md", "../screenshots/missing.png#x", "../../NOTES.md"]) {
      expect(() => resolveRepositoryLink(url, base), url).toThrow(/does not exist/);
    }
    // Letter case is checked on every platform, so a link that works on Windows works on Linux.
    for (const url of ["../../design.md", "S1-scaffold.md", "../Screenshots/s2-home-1280.png"]) {
      expect(() => resolveRepositoryLink(url, base), url).toThrow(/does not exist/);
    }
    // In the checkout (pretest renders it) but git-ignored, so not in the public repository.
    expect(() => resolveRepositoryLink("../../public/Paige-Rattenberry-Resume.pdf", base)).toThrow(
      /git ignores/,
    );
    // Percent-encoding is decoded before the check and re-applied to the repository URL.
    expect(resolveRepositoryLink("../../DESIGN%2Emd", base)).toBe(
      `${buildStory.repository.url}/blob/main/DESIGN.md`,
    );
    expect(() => resolveRepositoryLink("../../%E0%A4%A", base)).toThrow(/percent-encoded/);
  });

  it("refuses a synthesis note that lists the same log twice", () => {
    const story = structuredClone(buildStory);
    const note = story.synthesis.worked[0];
    note.logs = [note.logs[0], note.logs[0]];
    const parsed = BuildStorySchema.safeParse(story);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((i) => i.message)).toContain("a note lists the same log twice");
  });

  it("names in each page's description only sections every log has", () => {
    expect(buildStory.copy.logDescription).toBe(
      "goal, what shipped, decisions, tools, and what the AI got wrong and how it was caught",
    );
    const sections = [
      /^## Goal\b/,
      /^## What shipped\b/,
      /^## Decisions\b/,
      /^## .*\btools\b/i,
      /^## What (the AI|Claude) got wrong and how it was caught\b/,
    ];
    for (const file of logFiles) {
      const headings = readFileSync(path.join(root, "docs", "build-log", file), "utf8")
        .split(/\r?\n/)
        .filter((line) => line.startsWith("## "));
      for (const section of sections) {
        expect(
          headings.some((h) => section.test(h)),
          `${file}: ${section}`,
        ).toBe(true);
      }
    }
  });

  it("keeps HTML-like text as text, and refuses a relative image", async () => {
    const base = { from: "docs/build-log", repository: buildStory.repository.url };
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(await renderMarkdown("Open PR #<n> later.", base));
    expect(html).toContain("#&lt;n&gt; later");
    await expect(renderMarkdown("![Home](../screenshots/a.png)", base)).rejects.toThrow(
      /relative images/,
    );
    // Reference-style, to a file that exists, so the definition alone would pass.
    const shot = "../screenshots/s2-home-1280.png";
    await expect(renderMarkdown(`![Home][shot]\n\n[shot]: ${shot}\n`, base)).rejects.toThrow(
      /relative images/,
    );
    await expect(
      renderMarkdown("![Home][shot]\n\n[shot]: https://example.org/a.png\n", base),
    ).resolves.toBeTruthy();
  });

  it("orders a log without a pull request after the numbered logs of its day", () => {
    const day = "- Date: 2026-10-01";
    const entries = [null, 3, 2].map((pr, i) =>
      parseBuildLog(`l${i}`, `# L${i}\n${day}${pr ? ` · PR: #${pr}` : ""}\n## Goal\nG\n`),
    );
    expect(entries.sort(byLogOrder).map((e) => e.pr)).toEqual([2, 3, null]);
  });
});

describe("the pre-launch history snapshot (DESIGN §5.6, D6)", () => {
  it("holds counts and dates only", () => {
    const raw = JSON.parse(
      readFileSync(path.join(root, "content", "generated", "build-stats.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(BuildStatsSchema.parse(raw)).toEqual(buildStats);
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === "number") expect(Number.isInteger(value), key).toBe(true);
      else expect(value, key).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    }
  });

  it("is never fetched by a build, and needs no token", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    for (const [name, script] of Object.entries(pkg.scripts)) {
      expect(script, name).not.toContain("fetch-build-stats");
    }
    expect(readFileSync(path.join(root, ".env.example"), "utf8")).not.toMatch(/GITHUB_TOKEN/);
  });

  it("sits under DESIGN §5.6's sentence, verbatim", () => {
    const design = readFileSync(path.join(root, "DESIGN.md"), "utf8").replace(/\s+/g, " ");
    expect(design).toContain(buildStory.statsSentence);
  });
});

describe("the synthesis", () => {
  const { synthesis } = buildStory;
  const named = [
    ...synthesis.categories.flatMap((c) => c.items.map((i) => i.log)),
    ...synthesis.quotes.map((q) => q.log),
    ...synthesis.worked.flatMap((w) => w.logs),
    ...synthesis.didNot.flatMap((w) => w.logs),
    ...buildStory.gallery.map((g) => g.log),
  ];

  it("names only logs that exist", () => {
    for (const slug of named) expect(buildLogBySlug(slug), slug).toBeDefined();
  });

  it("quotes each log word for word", () => {
    for (const quote of synthesis.quotes) expect(flat(quote.log), quote.text).toContain(quote.text);
  });

  it("draws every item from a log with a 'What the AI got wrong' section", () => {
    for (const slug of new Set(synthesis.categories.flatMap((c) => c.items.map((i) => i.log)))) {
      expect(flat(slug), slug).toMatch(/## What (the AI|Claude) got wrong/);
    }
    const ids = synthesis.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("describes the logs' 'got wrong' sections as they are", () => {
    // Every log has the section (checked above); the intro says the older heading is the earliest
    // logs' only, so once a log uses the newer one, no later log goes back.
    const older = buildLogs.map((e) => /^## What Claude got wrong/m.test(e.body));
    const first = older.indexOf(false);
    expect(first, "the earliest logs use the older heading").toBeGreaterThan(0);
    expect(older.slice(first), "no later log uses the older heading").not.toContain(true);
  });

  it("says plainly what the record is not", () => {
    expect(synthesis.bound).toMatch(/not research, a benchmark, an evaluation or a dataset/);
  });
});

/** Width and height of a WebP file (VP8, VP8L or VP8X), read from its header. */
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  expect(b.toString("ascii", 0, 4) + b.toString("ascii", 8, 12)).toBe("RIFFWEBP");
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
}

describe("the screenshot gallery", () => {
  it("crops committed screenshots, each recorded in assets.json against its source", () => {
    for (const figure of buildStoryGallery) {
      expect(existsSync(path.join(root, figure.screenshot)), figure.screenshot).toBe(true);
      const record = assets.find((a) => a.path === figure.asset);
      expect(record?.provenance).toMatchObject({
        kind: "repository",
        sourceFile: figure.screenshot,
      });
      expect(figure.image).toMatchObject({ width: 1280, height: figure.crop.height });
      expect(webpSize(path.join(root, "public", figure.asset))).toEqual({
        width: figure.image.width,
        height: figure.image.height,
      });
    }
  });
});

describe("case study 1", () => {
  it("is a deep page whose aside links its repository's AI-assisted development notes", () => {
    const project = projectBySlug(buildStory.caseStudy.projectSlug);
    expect(project?.deepPage).toBe(true);
    expect(project?.disclaimer).toBeTruthy();
    // The page's description names the case study, so it must follow `caseStudy.projectSlug`.
    expect(buildStory.copy.description).toContain(project?.title);
    expect(project?.aside?.links?.map((l) => l.url)).toContainEqual(
      expect.stringMatching(/\/blob\/[0-9a-f]{40}\/docs\/agentic-development\.md$/),
    );
  });
});
