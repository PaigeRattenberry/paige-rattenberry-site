# Session 8 — How This Site Was Built, and launch preparation

- Date: 2026-10-01 / 2026-10-02 · Branch: s8-launch · PR: #18

## Goal

IMPLEMENTATION_PLAN §4 Session 8 with its 2026-09-15, -16, -17, -21 and -30 amendments: a
counts-and-dates snapshot of the pre-launch history (decision D6), the `/how-this-was-built` page
with every build log rendered as a timeline, the snapshot, a screenshot gallery, a draft synthesis
of what the AI got wrong and what caught it, and StimMap3D as case study 1; then the launch
checklist, executed and ticked in the PR, so the tree is ready to seed the public repository. No
merge, and no change to any repository's visibility or settings.

## What shipped

- **The history snapshot (D6).** `scripts/fetch-build-stats.ts`, run once by hand with
  `gh auth token`, asks GitHub's GraphQL API for the pre-launch repository's merged pull requests
  and the commits on `main`, and writes `content/generated/build-stats.json`: merged pull
  requests, commits, merge commits, first and last merge, and when it was taken. Nothing else can
  be written: `BuildStatsSchema` is strict. It is not chained onto `prebuild`, and neither Vercel
  nor `.env.example` gets a token; a unit test fails if any npm script names it. The counts agree
  with `git rev-list --count` on `main`, with and without merges.
- **`/how-this-was-built`**, server-rendered, no client island: who did what (what Claude Code
  generated; what Paige decided, chose, turned down and reviewed; the tools and models the logs
  record); links to `DESIGN.md`, `IMPLEMENTATION_PLAN.md` and `SESSION_PROMPTS.md` in the public
  repository through one URL constant in `content/build-story.ts`; the synthesis; the snapshot
  under DESIGN §5.6's sentence; every build log as a timeline entry (date, kind, pull request as
  plain text, the first paragraph of its goal); a six-figure screenshot gallery; StimMap3D as case
  study 1, with its disclaimer, its aside's own words and its link to `docs/agentic-development.md`
  at the pinned commit. Title and description are unique and wrapped in
  `canonical("/how-this-was-built", …)`.
- **A page per build log**, `/how-this-was-built/<file name>`, rendering the log as written.
  `lib/content/build-log.ts` reads `docs/build-log/*.md` and parses only the title, the date line
  (date and pull request) and the goal; a log without them fails the build. `renderMarkdown` in
  `lib/mdx.tsx` compiles a log as plain Markdown, not MDX, so a `<` or `{` in a log is text, and
  sends relative links to the matching log page or to the file in the public repository. The routes
  come from the loader in `lib/routes.ts`, so the sitemap, the axe sweep, the font spec, the SEO
  spec and the per-route private-path check cover every log page, and a new log adds itself.
- **The synthesis, drafted for Paige.** The items in the "What the AI got wrong" sections
  of the logs written before this one, grouped by what caught them: a review pass, the agent's own
  check, a unit or component test, an end-to-end test, the type checker or the build, the privacy
  or publication gate, the claims gate, a lint rule, the axe check, and Paige. Each item whose log says a gate, test or rule
  was added because of the failure names that gate. No count is typed, here or in the content:
  each category in `content/build-story.ts` lists its items with the log each came from, and the
  page counts the lists. Three quotes, "what worked" and "what did not", and a paragraph saying
  what the record is not (not research, a benchmark, an evaluation or a dataset).
- **Gallery images.** `scripts/derive-build-story-images.ts` crops six committed screenshots to
  1280×800 and writes WebP to `public/images/build-story/`. Each has an `assets.json` image record
  whose repository provenance names the screenshot.
- **Fonts.** The logs draw "ć", "ğ" and "ƒ" inside code spans, so a third extras face, cut from
  JetBrains Mono's latin-ext subset (1.4 KB, not preloaded, loaded only on a page that draws one),
  leads the mono stack; Inter's latin-ext extras face gains "ƒ" for this log's prose.
  `tests/e2e/fonts.spec.ts` now checks that the element's font stack names one of the
  `@font-face` families whose `unicode-range` covers the character. "→", "≈", "≤", "≥", "⋯", "○" and "●" are in no subset of the
  three families and join the spec's system-font symbols. The font manifest's digests are base64.
- **Lighthouse.** `/how-this-was-built` is the fourth route in `lighthouserc.json`.
  `scripts/lighthouse-local.mjs` now survives chrome-launcher's cleanup error in both its forms.
- **Tests.** `tests/unit/build-story.test.ts`: every log loads, sorts and has a route; the
  header shapes parse and a log without a pull request sorts last on its day; relative links
  resolve, and one that leaves the tracked tree, names a git-ignored file or gets the letter case
  wrong fails the build; a synthesis note may not list a log twice; HTML-like text in a log stays
  text, and a relative image fails; the snapshot holds counts and dates only and no
  script fetches it; DESIGN's sentence is quoted verbatim; every log the synthesis names exists;
  every quote is in its log word for word; the gallery's images match their records and crops; case
  study 1 has a disclaimer and links its development notes. `a11y.spec.ts`'s horizontal-overflow
  check now covers `/how-this-was-built` at every width and every log page at 360 px.
  `screenshots.spec.ts` gains a Session 8 set.
- **Docs.** `AGENTS.md` (commands, a "Build story" architecture bullet, fonts, routes, the
  Lighthouse routes), `README.md` (status, a hero screenshot, commands, layout, deployment),
  DESIGN's status line, the plan's Session 8 as-built note and L10 (below), and a status line in
  the prompt pack.

## Decisions and why

- **One page per log, not one long page.** The logs before this one ran to about 3,800 lines; rendered on
  one page, the App Router would send that text twice (HTML and the RSC payload). The plan's
  2026-09-15 amendment allows per-entry routes if they are derived in `lib/routes.ts`; they are.
- **Counts are list lengths, and every item names its log.** A typed "115" could drift from what it
  counts; a list cannot, and a reader can open any bar and follow each item to its log. The
  grouping is still a judgment: where a log is ambiguous, the item sits under the mechanism the log
  names first. Left out, and said so in the content file: notes that a reviewer found nothing,
  failures a log records as unexplained, three drifts in the StimMap3D brief that were not the
  agent's errors, design changes made at Paige's question that the log does not frame as errors,
  and one idea dropped before it was tried. Only Session 1's log records Paige's verdicts, so the
  "Paige" group counts what the logs say, not what she caught, and the page says that.
- **A mono extras face rather than a looser font spec.** The alternative was to excuse extras
  characters in mono text, which would let a real fallback through elsewhere.
- **The gallery copies crops into `public/` with records**, rather than importing the PNGs from
  `docs/screenshots/` through the bundler, which would have put images on the site that the
  `assets.json` reconciliation never sees. The records' provenance points at this (the pre-launch)
  repository, so L10 now re-pins them along with the resume record.
- **Dates in Pacific time.** The last merge happened on the evening of 2026-10-01 here, which is
  2026-10-02 in UTC; the page shows the local date so it agrees with the logs.
- **The Session 8 screenshot set is small**: Home (for the README), `/how-this-was-built` in both
  themes and this log's page, at 1280 and 390 px. No other page changed, and full-height captures
  of every log would add many megabytes of near-duplicates.
- **The public repository's links are left in place although they 404 until launch step L7.**
  They are the links the page must carry after launch, and L10 re-checks them.

## Tools and model

Claude Code, Opus 5.5 (`claude-opus-5-5`). Skills: `frontend-design` before the page layout;
`security-review` for the pre-launch check (a subagent read the diff; no finding reached its
confidence bar of 8, see Verification); `/code-review` at high effort on the branch before the PR
(findings below). A Claude Code subagent read every earlier log and returned the item rows the synthesis
is built from; every count was re-derived from the content file by script. Also: the GitHub CLI
and GraphQL API, `sharp` (through the derive script), Playwright (scratch captures and the specs),
ripgrep and curl for the launch checklist, Lighthouse through `scripts/lighthouse-local.mjs`,
Vitest, ESLint, Prettier and git.

## Constraints, human decisions and implementation direction

- Task: IMPLEMENTATION_PLAN §4 Session 8 and the Session 8 prompt, pasted by Paige, with Paige's
  decisions D3, D6 and D9 from S0-G.
- Not done here, by design: no merge; no change to any repository's visibility or settings; no
  Vercel change; no token added anywhere; launch steps L1–L9 are Paige's. Nothing from the private
  source folder was read for this session's content, and `git status` showed neither it nor
  `private/` before each commit.
- The synthesis was drafted for Paige to edit, under a "Draft" callout. On 2026-10-02 she chose to
  publish it as drafted, so `draft` is false and the callout is gone.
- Decided by Paige on 2026-10-02, from ranked options: the publication read's fixes go on this
  branch as a targeted edit rather than a rewrite of whole logs, and a log carries one redaction
  note instead of one per section.

## Generated work and rejected suggestions

- Generated by Claude Code: everything in this PR, the synthesis included.
- Rejected during the session: all logs on one page (weight); typed counts (drift); importing
  screenshots straight from `docs/screenshots/` (outside the asset reconciliation); excusing
  extras characters in mono text (weakens the font gate); a hex digest kept beside a reworded
  test; capturing every log page for the screenshot set.

## Verification (command, result, PR/commit)

| check | command | result |
|---|---|---|
| format, lint, types | `npm run format:check`; `npm run lint`; `npm run typecheck` | clean |
| unit, publication gate included | `npm test` (private term list present) | 20 files, 185 passed, 2 skipped (the public-repository-only history checks) |
| build | `npm run build` | clean; 41 static pages, the eighteen log pages among them |
| JS budget | `npm run budget` | site-owned JS on `/` 9.8 KB of 15 KB; unchanged |
| axe, both themes, and overflow | `npm run e2e:a11y` | 159 passed after the review round. Before it, one run had 1 failure from Playwright's own `write UNKNOWN` while writing a trace; that test then passed 12 of 12 alone |
| features | `npm run e2e:features` | 93 passed, 1 skipped (the opt-in live embed); the font spec and the private-path check pass on every log page |
| Lighthouse, local | `node scripts/lighthouse-local.mjs --runs=3 /how-this-was-built /how-this-was-built/s6-resume-seo` | performance 93, 94, 93 and 95, 95, 94; accessibility, best practices and SEO 100; CLS 0 |
| second review round | `npm run lint`; `npm run typecheck`; `npm test`; `npm run build`; `npx playwright test tests/e2e/seo.spec.ts`; `npx playwright test tests/e2e/a11y.spec.ts -g "how-this-was-built"` | clean; 186 passed, 2 skipped; clean; 10 passed; 62 passed. The full a11y and feature specs were not re-run |
| third review round | `npm run typecheck`; `npm run lint`; `npm test`; `npm run build`; `npm run e2e:a11y`; `npm run e2e:features` | clean; clean; 187 passed, 2 skipped; clean; 159 passed; 93 passed, 1 skipped |
| fourth review round | `npm run lint`; `npm run typecheck`; `npm test`; `npm run build`; `npx playwright test tests/e2e/a11y.spec.ts -g "how-this-was-built"`; `npx playwright test tests/e2e/fonts.spec.ts tests/e2e/seo.spec.ts` | clean; clean; 188 passed, 2 skipped; clean; 62 passed; 41 passed. The rest of the a11y and feature specs were not re-run |
| security review | `security-review` skill (subagent, read-only) | no finding at confidence 8 or above; ten candidates examined and dropped (raw HTML is removed in Markdown mode, link schemes come only from committed logs, the token goes only to GitHub's API and is never written) |

**Launch checklist** (the working tree; history is not scanned because the public repository
starts from one commit of this tree):

- DESIGN §3.4's phone pattern with `rg` over every text file outside dependencies, build output
  and the two private folders: three matches, all reviewed and not phone numbers (a pre-release
  version stamp in `package-lock.json`, and two comments in `tests/unit/documents.test.ts`
  describing the reviewed table-cell and identifier exceptions).
- Secret patterns with `rg` (GitHub, OpenAI, AWS, Slack and Google key shapes, private-key blocks,
  quoted credential assignments): none. Mentions of "secret" and "token" are documentation (the
  `PUBLICATION_TERMS` secret, `gh auth token`, design tokens). No `.env` file is tracked besides
  `.env.example`, which holds only the site origin.
- The publication gate green with the private term list present (`npm test`).
- `assets.json` against `public/images/`, `public/docs/` and the root PDFs, after a build so the
  generated resume exists: 16 records, 16 files, none missing on either side. Nothing the resume
  prints changed, so its `revision` stands.
- External links in every built page, with `curl` following redirects: every link outside the
  public repository answered 200 (GitHub profile, StimMap3D's repository and three pinned files,
  the live app, Kaggle, LinkedIn, the SFU article, YouTube). The eleven links into the public
  repository answered 404, as expected until L7. This was a scripted check, not a click-through
  in a browser.
- `LICENSE` is MIT, 2026, Paige Rattenberry, matching `package.json`; the README states that site
  content is not covered by it.
- `.gitignore` still ignores the private source folder and `/private/`, checked with
  `git check-ignore -v` on a file in each.

## What the AI got wrong and how it was caught

- **Two phone-shaped digit runs, caught by the privacy gate.** The new font face's hex SHA-256
  held one, and so did the commit SHA first chosen as the gallery records' revision. The digests
  are base64 now, and the gallery is pinned to a later commit holding the same screenshots, after
  checking that its SHA passes the pattern; `main`'s own head SHA did not.
- **The chart drew each bar before its label** at desktop widths: the bar's explicit row placement
  pulled it into the first column. Caught in the 1280 px screenshot; every cell now has an explicit
  column.
- **The local Lighthouse run never finished.** chrome-launcher's cleanup error arrived as a rejected
  promise, which the script's `try`/`catch` could not see; the unhandled rejection ended the script
  after one run, and its server kept the port, so the shell call waited for its full timeout.
  Caught by finding the server still listening; the script now absorbs both forms.
- **A shell command waited on input that never came** (a stray `cat >` with no input) and timed
  out. Caught by the timeout; nothing was written.
- **An edit script assumed Python**, which this machine does not have, and a second one matched text
  that Prettier had since rewrapped. Both failed before writing; the edits were redone with the
  editor.
- **The first draft of the "Paige" list credited her with setting up the repositories.** The
  planning record says the first repository was created during the planning session, so the claim
  had no support; it was cut before the first commit.
- **Heredocs again.** Two edit scripts passed regular expressions through a shell heredoc and a
  JavaScript template literal, and lost their backslashes (`\d` became `d`, `U\+` became
  `U+`); a `sed` replacement containing `&` pasted the matched text back into a class list. Each
  was caught by reading the result before running anything, and redone with the editor. The first
  draft of this very bullet then lost its own backslashes the same way, and was fixed in the editor
  too.
- **Wording read on the rendered page**: the snapshot line said "this session's own pull request",
  which is wrong on a permanent page, and the case study's first sentence repeated the aside's.
  Caught in the screenshots; both reworded.

### Found by the code review

A `/code-review` pass at high effort (Claude Code, Opus 5.5, a forked agent) read the branch
before the PR and reported ten findings. Eight were fixed; one was kept as specified, with a guard
added; one was already resolved.

- **The page credited Claude Code with every build log and all the code**, but Codex implemented
  the September 13 follow-up and wrote its log. The lede and the "generated" list now say so.
- **Prose typed in the page component** ("Three documents", the draft note, two introductions):
  moved into `content/build-story.ts`; the count is gone from the sentence.
- **Any title without a " — " part, or with a date anywhere after it, became "Review follow-up"**:
  a special case for one file applied to every title. Now a title with no dash is a "Build log",
  and only a part that is exactly a date is treated as one.
- **A log with no pull request sorted first on its day**; it sorts last now (`byLogOrder`, tested).
- **The font spec's family check matched "mono" inside generic names** such as `monospace`, so
  it could not fail for code text. It now compares the element's stack with the `@font-face`
  families that cover the character. Run again, it failed twice: "ƒ" in this log's prose had no
  face (now in Inter's extras), and a bare URL on the S0-D log page widened it to 463 px at 360 px
  (found by the next fix; links in a log now wrap anywhere).
- **The overflow check did not cover the new pages**; it does now (above).
- **Inline HTML-like text** such as a `<n>` placeholder would vanish in Markdown mode, so a page
  could differ from its file. It is kept as text now. No log body had one outside code, so nothing
  had been lost.
- **A relative image in a log would break silently**; it fails the build now. No log has one.
- **Kept as specified: the public-repository links do not go through `assertPublishableLinks`.**
  The plan says that constant is not a project link. The finding's concrete risk, a log link
  that names a git-ignored folder or leaves the repository, now fails the build.
- **The CI comment named three Lighthouse routes**; it names four. (The finding also noted no
  log on the branch yet; this one was being written.)

### Found by the second code review

A second `/code-review` pass at high effort (Claude Code, Opus 5.5, a forked agent) read the open
PR and reported ten findings. At Paige's request the top six were confirmed in the code and fixed;
the other four (a title whose second part is a date repeats its name on the timeline, timestamps
compared as strings in `BuildStatsSchema`, the weight of the synthesis lists, the heading plugins
copied between the two compiles) are left for Paige to decide.

- **The first review's sort fix left its test behind.** `byLogOrder` puts a log without a pull
  request last on its day, but the "oldest first" test still keyed such a log as 0, so it would
  fail as soon as one shared a date with a numbered log. The key now matches the sort.
- **A link to a log or file that does not exist shipped as a 404.** A relative link was rewritten
  without a look at the checkout, although the comment said a bad link failed the build. It fails
  now; no committed log had one.
- **A claim typed into the page component**: "most gates on this site exist because something got
  past the ones before them", which the counts beside it do not show. Replaced in
  `content/build-story.ts` by what each listed item records, that its log says the gate was added
  because of that failure.
- **Every log page's description listed a verification section** that four logs do not have. The
  description now comes from `content/build-story.ts`, names only sections every log has, and a
  test checks the logs for each; the timeline's introduction said the same and is corrected.
- **A colour override that did nothing.** The snapshot paragraph appended `text-ink` to a class
  list holding `text-ink-2`; Tailwind orders the two by name, so `text-ink-2` won. Confirmed in
  the built CSS; the paragraph now carries one colour.
- **The review-pass count looked its category up by id and fell back to zero.** A renamed category
  now fails the build.

### Found by the third code review

A third `/code-review` pass at high effort (Claude Code, Opus 5.5, a forked agent) read the open
PR and reported ten findings, which were not verified separately at that effort. The top five were
confirmed in the code before anything changed. At Paige's request the top four were fixed, and
three of the other six were fixed on Claude Code's recommendation, with Paige's go-ahead. The rest were left: the content
loader failing everywhere on one bad log (that is how it treats every content error), moving the
log page's wrapping rules into the shared prose styles (no project body has a table or code block,
and the finding was wrong that those styles had no table or code rules), and a second range parser
in the font spec (test-only).

- **A sentence typed into the page component said StimMap3D's disclaimer is shown wherever the
  project appears**, which gate (c) no longer requires since 2026-09-21. The sentence now lives in
  `content/build-story.ts` and names the places the gate lists.
- **A log link to a git-ignored file passed**, since the check only asked whether the file was in
  the checkout; the generated resume PDF or an env file would have become a 404 link to the public
  repository. A target must now be a file git would publish (`git ls-files` with untracked,
  non-ignored files included), with a plain existence check where git is absent.
- **The link check ignored letter case on Windows and did not percent-decode the path**, so a
  wrongly cased link passed here and failed on Linux, and an encoded one failed everywhere. Both
  are checked now, segment by segment for case.
- **A note listing the same log twice** would have given two links one React key. The schema
  refuses it now.
- **The snapshot dates relied on one locale's short date pattern** being `yyyy-mm-dd`; they are
  assembled from the date's parts now.
- **The fonts comment in `app/layout.tsx`** said every extras face leads the body stack; the mono
  one leads the mono stack. The heading plugins copied between the two compiles (left by the
  second review) are one shared constant now.
- **The same shell mistakes again**: a stray `cat >` waited on input until it was stopped, and an
  edit script was written for Python, which this machine does not have. Neither wrote anything;
  the edits were redone with Node scripts.

### Found by the fourth code review

A fourth `/code-review` pass at high effort (Claude Code, Opus 5.5, a forked agent) read the open
PR and reported ten findings, not verified separately at that effort. The top two and the last
were confirmed in the code before anything changed. At Paige's request the top three were fixed,
and five of the other seven on Claude Code's recommendation. Left: re-reading directories for every
link's letter-case check (cheap at this many logs, and it also catches a tracked file missing
from the checkout), and a directory or query-string link failing as "does not exist" (no log has
one, and the build still fails rather than shipping a bad link).

- **This log typed the synthesis counts it said were never typed**, and two of its numbers were
  already wrong: the build-story tests had grown by one since it was written, and its count of
  the logs the routes cover left out this log. The counts are gone from this log; what was read
  is described as "every log written before this one".
- **The synthesis said every log ends with a section called "What the AI got wrong and how it was
  caught"**: four of the earliest logs call it "What Claude got wrong", and every log ends with
  Paige's review notes and screenshots. It now says every log has the section, under the older
  name in the earliest ones, and a test holds the older name to the earliest logs.
- **Each log page dropped the log's date line** after reading its first date and pull request, so
  branches, date ranges and notes such as "(started 2026-09-30)" never appeared on a page that
  says it renders the log as written. The body now keeps the whole line, and a test checks it.
- **The planning-document links were built by hand**, skipping the existence, letter-case and
  git-ignore checks the log links get; they now go through `resolveRepositoryLink`.
- **The page's meta description was typed in the component** and named StimMap3D, while the case
  study is chosen in content. It is `copy.description` in `content/build-story.ts` now, and a
  test checks that it names the case study's project.
- **The case study's disclaimer was rendered only if present**, so a missing one passed the
  build; the page now throws without it, as it does without a deep page or aside.
- **A reference-style relative image** (`![x][ref]` with a relative definition) passed the
  relative-image guard and would have rendered a GitHub page as an image. It fails the build now.
- **`fetch-build-stats.ts` used an empty `GITHUB_TOKEN`** instead of falling back to
  `gh auth token`.
- **The same shell mistake again**: a first edit script passed text through a shell-quoted
  `node -e` and lost its escapes; it stopped before writing anything but one comment, and the
  edits were redone with the editor.

### Found by the publication read

At Paige's request (2026-10-02), a read-only review (Claude Code, Opus 5.5, with four subagents of
the same model, one group of logs each) read every log and the page's own copy as the new pages
serve them, against AGENTS.md's publication rules. The publication gate had passed throughout;
what the read found was wording no pattern can see. At Paige's direction the fixes are on this
branch:

- **Sentences in eleven earlier logs, and five of the synthesis's item lines, said more than the
  publication rules allow.** S0-G's scrub and this session's synthesis both missed them. Each was
  removed or reworded. Every lesson and tool credit stays, and most decisions, a few with less
  detail; three clauses went with the sentences around them, one of them a small credit to
  Paige.
- **One note per log.** The per-section redaction notes are now a single note under each log's
  header lines (AGENTS.md and DESIGN amended at Paige's request), and `build-story.test.ts`
  fails on a note anywhere else.
- **The S0-E log's header still had the template's `PR: #<n>`**, so its timeline entry showed no
  pull request; it is #2, the PR that added the log.
- Smaller: one log said "I" for the agent, and one named a launch step from the plan before S0-G.

### Found by the second publication read

At Paige's request (2026-10-02), a second read-only review (Claude Code, Opus 5.5, with five
subagents of the same model: three over groups of logs, one over this log, the page's copy and the
screenshots, one over the whole tree, the commit messages and the pull request's text) read the
same material after the first read's fixes. At Paige's direction the fixes are on this branch:

- **The first read's own edits re-attributed three things.** A resume revision became "Claude's",
  in an earlier log and in the synthesis, and wording Paige cleared became wording she "supplied",
  in two logs. All three say again what the logs said before; a redaction never re-attributes.
- **One clause the first read missed** still described what the removed thesis page held. It is
  gone.
- **This page's screenshots were captured before the first read**, so they showed wording it had
  removed. They are re-captured.
- **From Paige's choices among ranked options:** the Session 6b log's heading and this page's copy
  say "headline" where they said "positioning line" (the log's address, its branch name and the
  older logs' bodies keep the design term); three StimMap3D sentences are reworded to rest on its
  public repository alone; and the Session 7 log says "the agent" where it said "I".
- Smaller: seven sentences the first read left awkward or inaccurate are repaired, among them a
  file list missing `.gitignore` and an acceptance item quoted short of the plan.

Verified locally: format, lint, typecheck; `npm test` 189 passed, 2 skipped (private term list
present); `npm run build` and `npm run budget` clean (9.8 KB); the built log pages no longer hold
the removed wording.

### Found by the pre-merge review

At Paige's request (2026-10-02), a read-only review of the pull request (Claude Code, Opus 5.5,
with two subagents of the same model: one over the code, one over the specs and the publication
rules) found nothing that blocked a merge, and five pieces of text that were wrong. At Paige's
direction they are fixed on this branch:

- **Three status lines said Session 8 was in review** (DESIGN, the plan and the prompt pack).
  Nothing is committed to the pre-launch repository after the merge, so the public repository's
  first commit would have carried them. They now hold after the merge.
- **"A review pass before every merge"** on the page: the two plan-amendment logs and the S0-E
  log record no review pass. It now says "most merges", and "nearly every gate" is now "most of
  the gates".
- **AGENTS.md said a log without a PR number fails the build**; the loader treats the number as
  optional.
- **This log said every decision survived the first publication read**; three clauses did not.
  The bullet above now says so.
- **The pull request's CI checkbox** was still unticked after all three jobs had passed.

Paige also chose to publish the synthesis as drafted (above), and this page's screenshots are
re-captured without the callout.

Verified locally: format, lint, typecheck; `npm test` 189 passed, 2 skipped (private term list
present); `npm run build` and `npm run budget` clean (9.8 KB); the `/how-this-was-built` a11y and
overflow tests 62 passed; the font and SEO specs 41 passed. The full e2e suites were not re-run
locally.

One more, from the build output after that round, fixed at Paige's direction (2026-10-03):

- **The letter-case check on log links made the build trace the whole checkout.** Its
  directory reads start from the working directory, so Turbopack warned "Dynamic filesystem
  access causes tracing of the whole project", and the server traces of `/how-this-was-built`,
  the log pages and the project pages listed every file in the private source folder and in
  `private/`. Nothing private shipped: Vercel builds from git, where both folders are absent, and
  the pages are static. A deployment built on a machine holding them would have carried them,
  though. Every review round and CI had missed it, because it is a warning and the build passes.
  Turbopack's ignore comment on the three calls removes the warning, and no trace lists a file
  from either folder now. Of three ranked options, Paige chose (2026-10-03) to add a check that
  fails on whole-project tracing at L10 rather than in this pull request; the step is in
  IMPLEMENTATION_PLAN §6.

Verified locally: the build has no warning; format, lint, typecheck; `npm test` 189 passed, 2
skipped; `npm run budget` clean (9.8 KB); the `/how-this-was-built` a11y and overflow tests 62
passed; the projects and SEO specs 46 passed, 1 skipped.

## Paige's review notes

## Screenshots

`docs/screenshots/s8-*.png` (10), at 1280 and 390 px: Home in both themes (the README's hero is
`s8-home-1280.png`), `/how-this-was-built` in both themes, and this log's page in light. The
gallery's six crops are in `public/images/build-story/`.
