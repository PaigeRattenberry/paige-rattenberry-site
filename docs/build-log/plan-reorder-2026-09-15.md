# Plan amendment — defer Session 3b behind Sessions 5 and 6

- Date: 2026-09-15 · Branch: plan-reorder-s5-s6 · PR: #8
- Documentation only: `IMPLEMENTATION_PLAN.md`, `SESSION_PROMPTS.md`, `DESIGN.md`, `AGENTS.md` and
  this entry.

## Goal

Keep the build moving while StimMap3D's deployment (S0-D) is still in progress. The 2026-09-13 split
put Session 3b immediately after Session 4, so the whole plan stalled on S0-D again once Session 4
merged. Paige asked which remaining sessions could run first.

## What shipped

- A dated run-order note at the top of both plan files. The order is now
  **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S7 → S8**. The 2026-09-13 split note keeps its wording and
  gains a pointer saying only 3b's position is superseded.
- The SESSION 3b prompt block moved below Session 6 in `SESSION_PROMPTS.md`, so the file's promise
  that prompts appear in run order stays true. Its prerequisite check now also looks for the Session 5
  and 6 build logs, explicitly as *expected but not required*, and its closing line points at Session 7.
- **Session 5** gains a prerequisite note (Session 4 only; the StimMap3D project has no `live`/`repo`
  link and no `cover` until 3b, and a missing link field is not an error) and the answer to its open
  Stryker question.
- **Session 6** gains the same kind of prerequisite note, the name of the approved fallback resume, and
  the placeholder finding below.
- **Session 3b** gains a run-order note covering what Session 6 will have shipped by the time it runs:
  re-open `/projects/stimmap3d/opengraph-image` after setting `cover`, re-run the `assets.json`
  reconciliation now that the screenshots exist, and confirm Session 5's explorer derivation tests are
  untouched by the new frontmatter links.
- **Session 7** gains an explicit prerequisite: it is the first session that genuinely needs S0-D, and
  there is no useful partial version of it.
- §3's prerequisite line, the §5 timeline table and the §7 acceptance summary follow the new order.
  `DESIGN.md` §0, §5.4 and §7.2 and `AGENTS.md`'s session-order line were updated to match.

## Decisions and why

- **Defer 3b rather than split it further or wait.** Sessions 5 and 6 read only `content/` and existing
  routes, so neither needs the live app, the public repo or the screenshots. Nothing in 3b's task list
  is a prerequisite for either.
- **3b is deferred, not repositioned permanently.** Its real dependency is S0-D plus Sessions 3a and 4.
  Both plan files say it may run as soon as S0-D is done, and its prompt tells the session to carry on
  (after saying so) if the Session 5 and 6 logs are absent. That avoids a second amendment if the
  deployment finishes early.
- **Sessions 7 and 8 stay put.** Session 7's task list requires axe with the embed loaded, an explorer
  filter, and Lighthouse on `/projects/stimmap3d`; pulling it forward would only split a session.
- **Stryker is one entry, from the `experience` role** (Paige, 2026-09-15). The `content/research.ts`
  Stryker item describes the same work. There is no link field between them, unlike the `researchId`
  and `projectSlug` pairs, so Session 5 must match them deliberately and keep the research item's
  skills on the single entry so no co-occurrence is lost.
- **The approved fallback resume is the 2026-09-11 PDF** (Paige, 2026-09-15), which answers the
  question Session 6's prompt was told to ask. Recorded in `DESIGN.md` §5.4 next to the fallback rule
  rather than only in the session prompt, because §5.4 is what a session reads first.
- **The placeholder finding is recorded as a blocker, not a footnote.** `pdftotext` on that PDF returns
  `[ADD PORTFOLIO URL]` in the page-1 contact line and `[ADD LIVE URL]` on the StimMap3D entry. DESIGN
  §5.4 and the Session 6 resume test both forbid a shipped `[ADD ` string, so the fallback path is
  closed until Paige supplies a corrected export. The generated PDF renders from `content/` and is
  unaffected, so Session 6 is not blocked — only its contingency is. Both placeholders need Paige's
  input rather than a guess: the portfolio URL commits to the production URL that serves nothing until
  Session 8, and the StimMap3D live URL comes from S0-D itself.

## Tools and model

Claude Code (Claude Opus 5, 1M context): read both plan files, `DESIGN.md` §§0, 5.4, 7.2, `AGENTS.md`
and the privacy-gate test; ran `pdftotext -layout` over the three staged resume PDFs' text (Git Bash);
edited four documentation files; a short Node script moved the 3b prompt block with a length assertion
so no content could be lost; git and GitHub CLI.

## Constraints, human decisions and implementation direction

Paige asked whether any remaining session could be implemented before Session 3b while she finishes
deploying StimMap3D, and whether to proceed with a different session now. Claude Code analysed the
dependencies and recommended, in order, Session 5 then Session 6, with Session 7 staying blocked.
Paige asked for a PR amending the plans and docs to record the reorder, answered the Stryker question
(one entry) and named the approved resume file. The amendment wording, the 3b run-order note and the
Session 5/6/7 prerequisite notes were drafted by Claude Code.

## Generated work and rejected suggestions

Rejected: pulling Session 7 forward without 3b (its acceptance list cannot be met, so it would have to
be split for no gain); rewriting the 2026-09-13 split note in place rather than marking one clause
superseded (it is the historical record of what was requested); and leaving the 3b prompt where it sat
with only a note (the file states its blocks are in run order).

## Verification (command, result, PR/commit)

Recorded on the PR: `npm run format:check` and `npm test` (the privacy gate scans this entry). No app
code changed, so no build, e2e or preview check is affected. The placeholder finding was verified with
`pdftotext -layout "<approved resume>" - | grep -c "\[ADD "` → 2.

## What the AI got wrong and how it was caught

- The first attempt to move the SESSION 3b prompt block used a single find-and-replace that swapped the
  3b heading for a Session 5 heading and left 3b's body orphaned beneath it, corrupting the file.
  Caught immediately by re-reading the result; the edit was reversed and redone with a script that
  asserts the output length is unchanged.
- Two amendment cross-references said the new note was "above" the 2026-09-13 split note when it is
  below it. Caught by re-reading the rendered top-of-file order after the move.

## Paige's review notes

## Screenshots

None — documentation-only change.
