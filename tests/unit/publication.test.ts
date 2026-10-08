import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LOCAL_PATH,
  ROOT,
  SECTIONS,
  TERMS_FILE,
  TERMS_OPTIONAL,
  TRAILER_EMAIL,
  lineAt,
  loadTerms,
  namesStagedFile,
  termHits,
  withoutTrailerAddresses,
} from "./helpers/publication";

/** The public repository (decision D3); the history checks run only there. */
const PUBLIC_REPO = "PaigeRattenberry/paige-rattenberry-site";
/** GitHub's noreply shapes: a user's `id+login@users.noreply.github.com`, and the web committer. */
const NOREPLY = /^(\d+\+[^@\s]+@users\.noreply\.github\.com|noreply@github\.com)$/i;
const BINARY = /\.(png|webp|jpe?g|gif|ico|woff2?|ttf|otf|pdf)$/i;

/** Every tracked text file, with its contents, read once for both checks that scan them. */
const trackedFiles: [string, string][] = execFileSync("git", ["ls-files", "-z"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\0")
  .filter(
    (f) => f && !BINARY.test(f) && f !== "package-lock.json" && fs.existsSync(path.join(ROOT, f)),
  )
  .map((f) => [f, fs.readFileSync(path.join(ROOT, f), "utf8")]);

/** Shapes only; nothing here names what the gate keeps out. */
const BANS: { test: (line: string) => boolean; why: string }[] = [
  { test: (line) => LOCAL_PATH.test(line), why: "a local path" },
  { test: namesStagedFile, why: "a staged file name that is not a lower-case slug" },
];

/** `where:line` for each shape ban in `text`. */
function banHits(where: string, text: string): string[] {
  const hits: string[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const b of BANS) if (b.test(line)) hits.push(`${where}:${i + 1}: ${b.why}`);
  });
  return hits;
}

const terms = loadTerms();

function inPublicRepo(): boolean {
  const want = PUBLIC_REPO.toLowerCase();
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY.toLowerCase() === want;
  try {
    const origin = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    // Exact owner/name at the end of the URL: a name that is a prefix of another must not match.
    const m = /[/:]([^/:]+\/[^/]+?)(?:\.git)?\/?\s*$/.exec(origin);
    return m?.[1].toLowerCase() === want;
  } catch {
    return false;
  }
}

/** Every commit message in the history, as `commit <hash>` and its text. */
function commitMessages(): [string, string][] {
  return execFileSync("git", ["log", "--format=%H%x00%B%x01"], { cwd: ROOT, encoding: "utf8" })
    .split("\x01")
    .map((c) => c.replace(/^\s+/, ""))
    .filter(Boolean)
    .map((c): [string, string] => {
      const [hash, body] = c.split("\0");
      return [`commit ${hash.slice(0, 12)}`, body];
    });
}

describe("publication gate", () => {
  it("no tracked text file carries a local path or a staged file name", () => {
    const hits: string[] = [];
    for (const [f, text] of trackedFiles) hits.push(...banHits(f, text));
    expect(hits).toEqual([]);
  });

  it.skipIf(TERMS_OPTIONAL && !fs.existsSync(TERMS_FILE))(
    "the private list exists and has every section the gate reads",
    () => {
      // Every private-term test here and in content.test.ts skips without the list, and a missing
      // or misspelled header skips that section's; this one fails instead.
      expect(fs.existsSync(TERMS_FILE), "private term list not found").toBe(true);
      expect(SECTIONS.filter((s) => !terms[s])).toEqual([]);
    },
  );

  it.skipIf(!terms.everywhere)("no tracked text file carries a term from the private list", () => {
    const hits: string[] = [];
    for (const [f, text] of trackedFiles) hits.push(...termHits(f, text, terms.everywhere ?? []));
    expect(hits).toEqual([]);
  });

  it.skipIf(!inPublicRepo())("every commit uses a noreply address", () => {
    const emails = execFileSync("git", ["log", "--format=%ae%n%ce"], {
      cwd: ROOT,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
    // Pull-request runs check out GitHub's synthetic merge commit: author = the PR author's web
    // commit email (noreply while "Keep my email addresses private" is on), committer = noreply@github.com.
    expect([...new Set(emails)].filter((e) => !NOREPLY.test(e))).toEqual([]);
  });

  it.skipIf(!inPublicRepo())(
    "no commit message carries a local path, a staged file name, a private term or a personal trailer address",
    () => {
      const hits: string[] = [];
      for (const [where, body] of commitMessages()) {
        hits.push(
          ...banHits(where, body),
          ...termHits(where, withoutTrailerAddresses(body), terms.everywhere ?? []),
        );
        for (const m of body.matchAll(/^[\w-]+-by:.*<([^>\s]+)>\s*$/gim))
          if (!TRAILER_EMAIL.test(m[1]))
            hits.push(`${where}:${lineAt(body, m.index)}: a trailer address`);
      }
      expect(hits).toEqual([]);
    },
  );
});

describe("the gate's own patterns", () => {
  // Assembled from parts, so that this file does not trip the gate it tests.
  const S = ["_", "source"].join("");
  const spaced = (...words: string[]) => words.join(" ");

  it("finds local paths in every shell's form, and passes URLs", () => {
    for (const p of [
      ["C:", "Users", "x", "dev"].join("\\"),
      ["c:", "users", "x"].join("/"),
      ["", "c", "Users", "Paige", "dev"].join("/"),
      ["", "mnt", "c", "Users", "Paige"].join("/"),
      ["", "Users", "paige", "dev"].join("/"),
      `cd ${["", "home", "paige"].join("/")}`,
      `"${["", "Users", "paige"].join("/")}"`,
      ["$env:USERPROFILE", "dev"].join("\\"),
      ["%userprofile%", "dev"].join("\\"),
      ["$HOME", "dev"].join("/"),
      ["~", "dev", "x"].join("/"),
    ])
      expect(LOCAL_PATH.test(p), p).toBe(true);
    for (const p of [
      "the /users/ page",
      "https://github.com/users/x/projects/1",
      "https://example.com/home/x",
      "https://x.dev/Users/y",
      "a ~ b",
    ])
      expect(LOCAL_PATH.test(p), p).toBe(false);
  });

  it("finds a staged path that is not all slugs, and passes slug paths", () => {
    for (const bad of [
      `${S}/${spaced("Paige", "Photo.jpg")}`,
      `${S}/photos/${spaced("My", "photo.jpg")}`,
      `${S}/Thesis/x.pdf`,
      `${S}\\thesis\\${spaced("SFU", "Thesis.pdf")}`,
      `${S}/resume/Resume_(1).pdf`,
    ])
      expect(namesStagedFile(bad), bad).toBe(true);
    for (const good of [
      `see ${S}/thesis/honours-thesis-2022.pdf.`,
      `**${S}/thesis/honours-thesis-2022.pdf**`,
      `${S}/thesis/honours-thesis-2022.pdf | x`,
      `${S}\\resume\\resume-2026-09-11.pdf`,
      `${S}/INVENTORY.md, ${S}/<dir>/<file>`,
      `\`${S}/\` holds the photos and the thesis.pdf`,
      `/^${S}\\/.+/`,
      `/${S}\\/thesis\\//.test(x)`,
    ])
      expect(namesStagedFile(good), good).toBe(false);
  });

  function termsFrom(lines: string[]): Record<string, RegExp[]> {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "terms-"));
    const file = path.join(dir, "terms.txt");
    try {
      fs.writeFileSync(file, lines.join("\n"));
      return loadTerms(file);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  }

  it("matches a literal term across a line break, and a regex term the same way every time", () => {
    const t = termsFrom([
      "alpha beta",
      "/gamma/gy",
      "-epsilon-",
      "[Content-Claims]",
      "delta",
      "[content-framing]",
      "x",
    ]);
    const [literal, rx, hyphened] = t.everywhere;
    expect(literal.test("an alpha\n// beta here")).toBe(true);
    expect(literal.test("an alpha-beta")).toBe(true);
    expect(literal.test("alphabeta")).toBe(false);
    expect([rx.test("a gamma"), rx.test("a gamma"), rx.test("x\ngamma")]).toEqual([
      true,
      true,
      true,
    ]);
    // An edge hyphen adds no word: the term is its words.
    expect([hyphened.test("epsilon"), hyphened.test("an epsilon here")]).toEqual([true, true]);
    expect(t["content-claims"]).toHaveLength(1);
  });

  it("matches a regex term's spaces and \\s across a line break, and reads it as unicode", () => {
    const [phrase, ws, cls, letters] = termsFrom([
      "/open to (work|roles)/",
      "/zeta\\s+eta/",
      "/[a ]theta/",
      "/^\\p{L}{3}$/",
    ]).everywhere;
    expect(phrase.test("open to\nwork")).toBe(true);
    expect(phrase.test("open\n  // to roles")).toBe(true);
    expect(phrase.test("opento work")).toBe(false);
    expect(ws.test("zeta\n * eta")).toBe(true);
    // A space inside a character class stays a space.
    expect([cls.test(" theta"), cls.test("\ntheta")]).toEqual([true, false]);
    expect([letters.test("ÀÉÎ"), letters.test("p{L}}}")]).toEqual([true, false]);
  });

  it("reads a commit's trailer name but not its accepted address as text for the terms", () => {
    const [tool, person] = termsFrom(["examplecorp", "Jane Roe"]).everywhere;
    const body = [
      "Subject",
      "",
      "Co-Authored-By: Some Model <noreply@examplecorp.com>",
      "Co-Authored-By: Jane Roe <jane@example.org>",
    ].join("\n");
    const kept = withoutTrailerAddresses(body);
    expect(tool.test(body)).toBe(true);
    expect(tool.test(kept)).toBe(false);
    // A personal address stays for the trailer-address check, and a name in a trailer still counts.
    expect(kept).toContain("<jane@example.org>");
    expect(person.test(kept)).toBe(true);
    expect(kept.split("\n")).toHaveLength(4);
  });

  it("rejects an unknown section and a term with no words, without quoting the line", () => {
    expect(() => termsFrom(["[content-claim]", "delta"])).toThrow(/line 1 is not a known section/);
    expect(() => termsFrom(["[everywhere]", "--"])).toThrow(
      /^publication terms: line 2 has no words$/,
    );
    expect(() => termsFrom(["/(secret/"])).toThrow(
      /^publication terms: line 1 is not a valid pattern$/,
    );
  });
});
