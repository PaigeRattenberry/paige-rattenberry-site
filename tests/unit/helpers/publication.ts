import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(__dirname, "../../..");

/** The sections the gate reads; a list that exists must carry every one. */
export const SECTIONS = ["everywhere", "content-claims", "content-framing"] as const;

/** `private/` beside the main checkout: a linked worktree has none of its own. */
function localTermsFile(): string {
  const own = path.join(ROOT, "private", "publication-terms.txt");
  if (fs.existsSync(own)) return own;
  try {
    const common = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      {
        cwd: ROOT,
        encoding: "utf8",
      },
    ).trim();
    return path.join(path.dirname(common), "private", "publication-terms.txt");
  } catch {
    return own;
  }
}

/** The private term list: a CI secret written to a file, else Paige's local notes. Never committed. */
export const TERMS_FILE = process.env.PUBLICATION_TERMS_FILE ?? localTermsFile();

/**
 * Set to `1` where the list is knowingly absent (CI on a fork, a public clone): the test that the
 * list exists then skips instead of failing. Without it, a missing list fails `npm test`.
 */
export const TERMS_OPTIONAL = process.env.PUBLICATION_TERMS_OPTIONAL === "1";

/** What separates a term's words: whitespace, hyphens and comment or quote markers. */
const SEP = "(?:[\\s\\-/*#>]+)";
const WORD_START = "(?<![\\p{L}\\p{N}])";
const WORD_END = "(?![\\p{L}\\p{N}])";

/**
 * A regex term's source with each run of literal spaces and each `\s` (outside a character class)
 * made a separator run, so a phrase wrapped onto the next line, or behind a comment marker, matches.
 */
function wrapSeparators(source: string): string {
  let out = "";
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === "\\") {
      const next = source[i + 1] ?? "";
      out += !inClass && next === "s" ? SEP : c + next;
      i++;
    } else if (inClass) {
      out += c;
      if (c === "]") inClass = false;
    } else if (c === "[") {
      out += c;
      inClass = true;
    } else if (c === " ") {
      while (source[i + 1] === " ") i++;
      out += SEP;
    } else out += c;
  }
  return out;
}

/**
 * `[section]` headers (one of `SECTIONS`, any case); `#` comments; one literal term per line
 * (case-insensitive, whole words, its words matched across any separator run) or one
 * `/regex/flags` (`g` and `y` dropped, `i`, `m` and `u` added; a space or `\s` in it matches the
 * same separator run as a literal term's, so both kinds match across a line break). Terms before
 * the first header belong to `everywhere`. Empty when absent.
 */
export function loadTerms(file = TERMS_FILE): Record<string, RegExp[]> {
  if (!fs.existsSync(file)) return {};
  const sections: Record<string, RegExp[]> = {};
  let current = "everywhere";
  const lines = fs.readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const header = /^\[([^\]]+)\]$/.exec(line);
    if (header) {
      current = header[1].trim().toLowerCase();
      if (!(SECTIONS as readonly string[]).includes(current))
        throw new Error(`publication terms: line ${i + 1} is not a known section`);
      return;
    }
    const rx = /^\/(.+)\/([a-z]*)$/.exec(line);
    const words = rx ? [] : line.split(/[\s-]+/).filter(Boolean);
    if (!rx && !words.length) throw new Error(`publication terms: line ${i + 1} has no words`);
    let re: RegExp;
    try {
      re = rx
        ? new RegExp(
            wrapSeparators(rx[1]),
            [...new Set(rx[2].replace(/[gy]/g, "") + "imu")].join(""),
          )
        : new RegExp(
            `${WORD_START}${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(SEP)}${WORD_END}`,
            "iu",
          );
    } catch {
      // Never let the engine's message (which quotes the pattern) reach a log.
      throw new Error(`publication terms: line ${i + 1} is not a valid pattern`);
    }
    (sections[current] ??= []).push(re);
  });
  return sections;
}

/** `where:line: private term #n` for the first match of each term in `text`: the index, never the term. */
export function termHits(where: string, text: string, section: RegExp[]): string[] {
  const hits: string[] = [];
  section.forEach((re, n) => {
    const at = text.search(re);
    if (at !== -1) hits.push(`${where}:${lineAt(text, at)}: private term #${n + 1}`);
  });
  return hits;
}

/** A trailer's address: GitHub's noreply shapes or a tool's `noreply@` address. */
export const TRAILER_EMAIL = /^(\d+\+[^@\s]+@users\.noreply\.github\.com|noreply@[a-z0-9.-]+)$/i;

/** A `*-by:` trailer line, split around its address. */
const TRAILER_LINE = /^([\w-]+-by:.*<)([^>\s]+)(>\s*)$/gim;

/**
 * A commit message with each accepted trailer address blanked, so a tool's own `noreply@` domain
 * is not read as a private term; lines keep their numbers, and any other address stays for the
 * trailer-address check to report.
 */
export function withoutTrailerAddresses(body: string): string {
  return body.replace(TRAILER_LINE, (line, pre: string, address: string, post: string) =>
    TRAILER_EMAIL.test(address) ? pre + post : line,
  );
}

/** Where a path may start: not inside a URL, a word or another path. */
const PATH_START = "(?:^|[^\\w.~/:-])";
/**
 * A local absolute or home-relative path: Windows drive paths, Git Bash and WSL drive paths, macOS
 * and Linux home folders (with or without a trailing slash), and `$env:USERPROFILE`, `%USERPROFILE%`,
 * `$HOME` or `~` followed by a path.
 */
export const LOCAL_PATH = new RegExp(
  [
    "[A-Za-z]:(?:\\\\{1,2}|/)[Uu][Ss][Ee][Rr][Ss](?:\\\\{1,2}|/)[^\\\\/\\s]",
    `${PATH_START}(?:/mnt)?/[a-z]/[Uu]sers/[^/\\s]`,
    `${PATH_START}/(?:Users|home)/[^/\\s]`,
    "\\$env:[Uu][Ss][Ee][Rr][Pp][Rr][Oo][Ff][Ii][Ll][Ee][\\\\/]",
    "%[Uu][Ss][Ee][Rr][Pp][Rr][Oo][Ff][Ii][Ll][Ee]%[\\\\/]",
    "\\$\\{?HOME\\}?[\\\\/]",
    `${PATH_START}~[\\\\/][^\\s]`,
  ].join("|"),
);

/** A staged file's path segment as published: a lower-case slug, the inventory or a placeholder. */
const SLUG_SEGMENT =
  /^(?:|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9]+)*|INVENTORY\.md|<[a-z-]+>|\.\.\.|\*\*?)$/;

/**
 * Whether a line names a staged file by a path that is not all lower-case slugs. The pre-rename
 * names themselves are terms in the private list, which matches them in any form.
 */
export function namesStagedFile(line: string): boolean {
  // A regular expression's escaped slash is a slash.
  const text = line.replace(/\\\//g, "/");
  for (const m of text.matchAll(/_source[\\/]([^\s`"'()<>[\]{}|,;!?+^$]*)/g)) {
    // A double slash ends a regular expression literal, not a path.
    const ref = m[1].split("//")[0].replace(/[.:*]+$/, "");
    if (!ref.split(/[\\/]/).every((s) => SLUG_SEGMENT.test(s))) return true;
  }
  return false;
}

/** The 1-based line holding `index` in `text`. */
export function lineAt(text: string, index: number): number {
  let n = 1;
  for (let i = text.indexOf("\n"); i !== -1 && i < index; i = text.indexOf("\n", i + 1)) n++;
  return n;
}
