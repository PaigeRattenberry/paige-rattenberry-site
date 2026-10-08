# Session S0-G — Publication scrub

- Date: 2026-10-01 (started 2026-09-30) · Branch: s0g-publication-scrub · PR: #17

(redacted for publication, 2026-10-02)

## Goal

Prepare this repository's tree to become the first commit of the public repository
(`PaigeRattenberry/paige-rattenberry-site`, decision D3): add a publication gate that keeps local
paths, staged file names and a private term list out of every tracked text file; bring the specs,
`AGENTS.md`, `README.md` and the build logs in line with the publication rules; and re-specify
Session 8 and the launch for two repositories. No UI change.

## What shipped

- **The publication gate** (`tests/unit/publication.test.ts`, `tests/unit/helpers/publication.ts`),
  run by `npm test`. Its committed half bans two shapes in every tracked text file: a local path
  (absolute, or from a home-folder variable or `~`), and a staged-folder path with a segment that
  is not a lower-case slug. Its private half reads a term list that is never committed (locally
  `private/publication-terms.txt`, git-ignored; in CI the `PUBLICATION_TERMS` secret written to a
  file) and reports a hit as `file:line` plus the term's index, never the term. The list holds the
  pre-rename staged file names as exact terms, so an old name is caught however it is written. A
  missing list fails `npm test` unless `PUBLICATION_TERMS_OPTIONAL=1`. In the public repository
  only, a third check requires every commit to use a noreply address. CI job 1 now checks out full
  history and writes the secret before `npm test`. In Paige's two repositories a run without the
  secret fails, except a pull request from a fork; that pull request, and any run in a fork, warns
  and skips the private half (D7 as narrowed at Paige's request, 2026-10-01; it first exempted
  every pull request).
- **The two content wording checks** in `tests/unit/content.test.ts` now load their patterns from
  the private list's two content sections. A failure names the field and the term index only.
- **Staged provenance paths (D1).** Paige renamed the staged files in place to lower-case slugs,
  bytes unchanged. The content records, the two derive scripts and the schema comments now carry
  the slug paths; every recorded digest still matches.
- **Specs.** IMPLEMENTATION_PLAN §3 records S0-G as an agent session with Paige's decisions D1–D9,
  and S0-F's scrub and history steps as superseded by S0-G and the seed (rendering stays with
  Session 8). The run order is S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S0-G → S8 → launch
  in the plan, the prompt pack and `AGENTS.md`. Session 8 now runs in this repository, takes a
  counts-and-dates build-stats snapshot by hand (D6, not chained onto `prebuild`, no token in
  Vercel), links the planning documents through one repository URL constant, and renders PR
  numbers as plain text. §6 holds the launch steps L1–L10: create the public repository private,
  seed it from `git archive` of `main`, re-point Vercel and re-set the S0-E locks, a go/no-go list,
  make the public repository public with branch protection, Paige's GitHub Support request (D9),
  archive this repository, and the first agent session there. DESIGN's Purpose and Repo rows, §5.6
  (build stats) and §5.7 (branch protection) follow. The prompt pack's Session 8 prompt is
  rewritten for the two repositories; an S0-G entry points at the plan.
- **`AGENTS.md`** gains a "Publication rules" section (what public text may say, how credits and
  redactions work, the gate, and the rule that `PaigeRattenberry/paigewebsite` stays private).
  **`README.md`** reflects S0-G and the launch.
- **Build logs.** Fifteen of the sixteen earlier logs were edited (`s0e-vercel.md` needed no
  change): staged file paths became the reader-facing source labels from `content/sources.ts` or
  generic mentions, so no log contains a staging path string (Session 8 renders them, and the
  per-route e2e check rejects one); links to this repository's PR pages became plain `#N`; the
  Session 5 log's literal NUL byte became the `\0` escape it meant to show. Where a section lost
  text, it carried "(redacted for publication, 2026-10-01)" once, so the record says it was edited;
  replacing a path with a label is not counted as a loss. DESIGN and the plan, amended in place,
  carry one such note at the top instead. (Session 8 replaced the per-section notes with one note
  under each log's date line, at Paige's request, 2026-10-02.)
- **Content, tests and comments.** About's unrendered source list is labels and dates (D2); asset
  permission strings point at the private source inventory with dates; a test name, two test
  comments and a page comment were reworded; `.env.example` lost its build-stats token line (D6).
- **The package name and the resume PDF's Creator string** are now `paige-rattenberry-site`.
- **The September 13 Codex review** is no longer in the tree; its credit stays in
  `review-follow-up-2026-09-13.md`, which no longer links it.
- **`.gitignore`**: Paige's "Local notes" entry, committed first.
- **Screenshots** (D5): all 266 stay; every one was opened and checked, though very tall captures
  were downscaled for viewing, so their small text was checked at layout level only. In 24 Session 4
  captures, at Paige's direction (2026-10-01), the footer's build hash was painted over with the
  footer's own background colour. A pixel comparison against the committed files shows every
  changed pixel inside the hash's box, and the Session 4 log's Screenshots section notes it.

## Decisions and why

Paige's decisions, 2026-09-30, are D1–D9 in IMPLEMENTATION_PLAN §3 S0-G. Implementation choices:

- **No staging-path string at all in a build log**, not only no file name: the logs become a served
  page, and the existing per-route e2e check fails on the string itself. The specs keep the bare
  folder name and the inventory's path where an agent needs them; file names there became labels.
- **The private list also carries identifiers**, so a stray paste of one fails the gate the same way
  a term does. Paige can add to it, then re-run the secret command (§6, L1).
- **A test that checks for a private term reports indices only.** `expect(text).not.toMatch(re)`
  prints both the pattern and the text on failure, and Actions logs become public with the
  repository.
- **Edited historical prompts are marked.** The prompt pack's earlier prompts are the record of what
  was pasted; where a private reference was removed, the prompt says so.
- **`package-lock.json`'s two `name` fields were edited directly** rather than through
  `npm install --package-lock-only`, so no dependency resolution could move in a scrub PR. The
  install check (`npm ci` in CI) covers it.

## Tools and model (model only when actually known)

Claude Code, Opus 5.5 (`claude-opus-5-5`). Four forked subagents of the same model scrubbed the
build logs in parallel, one group of files each, without committing; every diff was read before it
was committed. Five Claude Code subagents, Sonnet 5.5 (`claude-sonnet-5-5`, read from their
transcripts), opened the 266 screenshots read-only. A `/code-review` pass (Claude Code, Opus 5.5)
reviewed the PR, and a second pass reviewed the fixes; the findings of both and their fixes are
listed below. A last read of the redacted specs and logs against the publication rules (Claude
Code, Opus 5.5, with three forked subagents of the same model, read-only; every finding was
re-checked against the files) found the scrub's own errors listed last below. Node scripts for the mechanical replacements, Vitest, Prettier, ESLint, Playwright, git and the
GitHub CLI.

## Constraints, human decisions and implementation direction

- Paige answered D1–D9 before the session and renamed the staged files herself; the agent wrote no
  file in the private source folder, and wrote to `private/` only after `git check-ignore -v`
  confirmed it is ignored.
- No merge, no change to any repository's visibility or settings, no Vercel change. Paige sets the
  `PUBLICATION_TERMS` secret on this repository before merging, and re-sets it after the agent
  added the old names to the local list (the second review's fixes).
- Terms are referred to by index everywhere outside the private list.
- Every "Tools and model" section, credit and "What the AI got wrong" lesson is kept, and so is
  every decision that could be published; where text was removed, the section was marked. Two
  earlier logs lost a clause inside their tools section, a usage note rather than a credit; both
  carry the redaction note.

## Generated work and rejected suggestions

- Generated: the gate and its CI step, the term list's initial contents, the spec and prompt text,
  the launch steps, and the redactions, all for Paige's review in the PR diff.
- Not done, by design: a committed `git grep` for the private terms in CI (it would publish them).
- Session 4 footers: of the four options offered (blank the hash, keep, drop the set, re-capture),
  Paige chose blanking.

## Verification (command, result, PR/commit)

| Check | Command | Result |
| --- | --- | --- |
| staged digests, with the staged files present | `npm test` (content and documents tests) | green; the digest and page-removal checks ran |
| publication gate, failing first | `npx vitest run tests/unit/publication.test.ts` | 52 hits before the scrub |
| publication gate, after | same | green (noreply check skipped outside the public repository) |
| private-term tests, no list | `PUBLICATION_TERMS_FILE` pointed at a missing file | first run: all three reported as skipped; after the second review: the presence test fails, and with `PUBLICATION_TERMS_OPTIONAL=1` it skips too |
| pre-rename names | a scratch test (not committed) over the inventory's rename table | each of the 22 old names caught as a full path, a staged-folder path, a bare name, a name wrapped across a line and in lower case; no slug name and not the site's resume file matched |
| CI terms step | the step's script run under five repository and event combinations | fails in either of Paige's repositories without the secret, except a fork's pull request; a fork's push skips |
| failure output | a forced hit from a scratch list | prints `field: term #n` only |
| format, lint, types | `npm run format:check`, `npm run lint`, `npm run typecheck` | clean |
| unit tests | `npm test` | 165 passed, 2 skipped (the two history checks, public repository only); after the second review, 167 passed, 2 skipped; after the last read, 168 passed, 2 skipped |
| build and budget | `npm run build`, `npm run budget` | every route prerendered; site-owned JS on `/` 9.8 KB |
| e2e | `npm run e2e:features`, `npm run e2e:a11y` (after the build) | 57 passed, 1 skipped (the opt-in live-embed test); 99 passed |
| tree | `git ls-files docs/reviews private` | prints nothing |
| screenshots | all 266 opened; every footer hash read from labelled crops | no phone number, path, overlay or third-party name (small text on the downscaled tall captures checked at layout level only); 24 Session 4 footer hashes blanked, verified by a pixel diff against `HEAD` and by eye |

## What the AI got wrong and how it was caught

- **Backslashes in two replacement scripts.** A heredoc and then a `String.raw` literal ending in a
  backslash failed to parse; `sed` matched nothing. Each failed before writing, and a `grep` for the
  local-path shape confirmed nothing had changed; the four lines were then edited one by one.
- **The CI step's `printf '%s\n'` lost its escape** when written through a JavaScript string and
  split across two lines. Caught by reading the workflow diff before committing.
- **The forked agents dated their redaction notes with the session's start date**, while the rule
  is the PR's date. Caught in review of their diffs and normalised in one pass.
- **One rewritten log sentence read backwards** (the method came before the correction it
  qualified). Caught in review and reordered.
- **The first version of the gate had gaps**, found by a `/code-review` pass on this PR and fixed
  in a follow-up commit. It matched a private term one line at a time, so a two-word term wrapped
  across a line break passed. Its staged-name rule saw only a path inside a folder of the staged
  directory, so a top-level file, a backslash path and a spaced name with no prefix passed. Its
  local-path rule missed a capitalised user folder and a Linux home folder, and a sentence ending
  in a valid slug path was flagged. A `y` flag on a pattern term made each match depend on the
  previous one, a misspelled or missing section header skipped that section's checks silently,
  commit messages went unscanned, and a linked worktree could not find the private list. The
  screenshot subagents' model credit also lacked its version. Each gap now has a test in
  `publication.test.ts`: the "gate's own patterns" block, the section check or the commit-message
  check.
- **The fixed gate still had gaps**, found by a second `/code-review` pass. The staged-name rule
  recognised an old name by its shape (at most seven words, no brackets or punctuation), so a
  longer old name, one with a bracketed date, and a bare name in backticks passed; the fix was at
  the wrong depth, since the old names are a known, finite list, which now sits in the private
  list. Without the list, the content wording checks skipped silently where they used to fail. A
  regex term's spaces did not match across a line break, and it lacked the `u` flag. The launch
  steps spelled out the local checkout layout through a home-folder variable the local-path rule
  did not know, while that rule flagged a URL path under `/users/` and missed a home folder with
  no trailing slash. CI failed every run in a fork, where the secret cannot exist. A term with an
  edge hyphen compiled to a required separator. Each now has a test.
- **Backslashes again.** Shell heredocs in this environment halved doubled backslashes, so the
  first write of the new pattern tests had single ones; the failing tests caught it, and the
  lines were rewritten with the editor.
- **The scrub went past removal in four places**, found by the last read of the redacted text. It
  rewrote the Session 6b log so About's present-tense paragraph read as Paige's own, where the agent
  had drafted it from options she chose; it dropped the September 13 Codex review's drafting
  credit from DESIGN's positioning-line entry; it removed two of Paige's 2026-09-12 About decisions
  from the Session 2 log and one of her 2026-09-15 decisions from the Session 4 log, none of them
  private; and this log then said every decision was kept. Each is
  restored or reworded.
- **The same read found smaller gaps, also fixed.** The Session 0 spec-amendments log's lesson
  had been reworded so its next bullet referred to nothing; it is restored. Three log sections
  lost text without the mark, the specs had no note at all, and AGENTS.md's marker rule disagreed
  with this log's; the rule now covers logs and pasted prompts, with one note atop DESIGN and the
  plan. The Session 6b prompt's header did not say four passages were reworded rather than cut,
  and one added sentence is gone. The Session 4 log kept a line the rules leave out. The Session 8
  spec still linked StimMap3D to a session pack it does not have, and the launch steps' re-run
  note could set `$Old` to the public copy; L1 now verifies it. README still said the plan had
  eight sessions and kept a stale clause about the September 13 follow-up and hosting.
- **The commit-message check would have failed the first agent commit in the public repository.**
  It did not exempt the accepted attribution trailers. Caught by running the gate's matcher over
  this branch's own messages; accepted trailers are now exempted, with a test.

## Paige's review notes

## Screenshots

None: no UI change.
