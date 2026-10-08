# Plan amendment — split Session 3 into 3a and 3b

- Date: 2026-09-13 · Branch: plan-split-session-3 · PR: #5
- Documentation only: `IMPLEMENTATION_PLAN.md`, `SESSION_PROMPTS.md`, `DESIGN.md`, `AGENTS.md` and
  this entry.

(redacted for publication, 2026-10-02)

## Goal

Let work continue while StimMap3D's deployment (S0-D) is still in progress. Session 3 required S0-D
before it could start, and Session 4 builds on Session 3's MDX pipeline, so both sessions were blocked
on the deployment.

## What shipped

- A dated split note at the top of both plan files. The run order is now
  S1 → S2 → S3a → S4 → S3b → S5 → S6 → S7 → S8.
- **Session 3a** (`s3a-projects-mdx`): the MDX pipeline, the extended `ProjectSchema`, folding
  `content/projects.ts` into MDX frontmatter, every project card, the `/projects` index with its
  URL-synced filter, a reusable click-to-load `EmbedFrame`, and the StimMap3D page body with its
  disclaimer. It has no S0-D prerequisite. The 2026-09-12 Session 3 amendment now applies to 3a.
- **Session 4** now requires 3a to be merged, reads 3a's build log, reuses `EmbedFrame` for the
  valedictorian video and leaves the StimMap3D page alone.
- **Session 3b** (`s3b-stimmap3d-embed`), placed after Session 4 in both files: live and repo links,
  a response-header check before framing, the embed on the StimMap3D page, the screenshots with
  public-commit provenance, `cover` and poster, re-checking 3a's quotes and metrics against that commit,
  the session-pack link, Playwright embed checks and the Lighthouse score. It requires S0-D, a public
  repo, and 3a and 4 merged.
- S0-D, the timeline table, the acceptance summary and the session-time estimate now refer to 3a/3b.

## Decisions and why

- **Split Session 3, not Session 4.** Only a small part of Session 3 depends on the live app or public
  repo. Splitting Session 4 instead would have left its capstone and thesis pages, the heaviest
  remaining work, waiting on the deployment.
- **StimMap3D screenshots move to 3b.** Repository provenance records a full commit SHA, and StimMap3D's
  commits may still change before the repo goes public, which would invalidate it.
- **`EmbedFrame` is built generically in 3a** so Session 4's click-to-load video reuses it instead of
  adding a second component, and 3b only mounts it with the live URL.
- **No placeholder URL in `content/`.** 3a leaves the embed and links out rather than committing a
  fact that is not yet true.
- **3a records the StimMap3D commit it quoted from** so 3b can re-check quotes and metrics (such as the
  test count) against the public revision.
- **`DESIGN.md` and `AGENTS.md` were updated in a follow-up commit.** The first commit touched only the
  two plan files, as Paige scoped it. Paige then asked for edits to `DESIGN.md` and `AGENTS.md` only if
  Claude Code recommended them. It did: `AGENTS.md` is loaded into every agent's context, and
  `DESIGN.md` §0 said StimMap3D must be public "before Session 3", which could stop a 3a session. Five
  references now say 3a or 3b (S0-D prerequisite, the `projects.ts` fold, the StimMap3D screenshot
  validation, and the session count in `AGENTS.md`). The split note's reading rule stays as a fallback.

## Tools and model

Claude Code (Claude Opus 5): read the plan files, both session prompts, the current project loader and
routes, and the private source inventory's StimMap3D section; edited the two plan files; git and GitHub CLI.

## Constraints, human decisions and implementation direction

Paige asked whether Session 4 could run before Session 3 while S0-D is in progress. Claude Code
recommended splitting Session 3 (3a → 4 → 3b) over splitting Session 4, waiting, or running Session 4
as written. Paige chose that option and asked for the change note in `IMPLEMENTATION_PLAN.md` and
`SESSION_PROMPTS.md`, with a split Session 3 prompt, the new order and new branch and log names, in a
new PR. The task lists, prerequisites and acceptance wording for 3a and 3b were drafted by Claude Code.

## Generated work and rejected suggestions

Rejected options: splitting Session 4 (moves only the smaller Research and Leadership work forward),
waiting for S0-D (stalls the build), and running Session 4 as written (it would improvise an MDX
pipeline outside the approved Session 3 amendment and leave MDX-body metrics outside the claims gate).

## Verification

Recorded on the PR: `npm run format:check` and `npm test` (the privacy gate scans this entry). No app
code, build, e2e or preview check is affected by a documentation-only change.

## What the AI got wrong and how it was caught

The first draft of the run order in `SESSION_PROMPTS.md` read "S3b → S5 → S8" and dropped Sessions 6
and 7. Caught by rereading the edited line before committing.

## Paige's review notes

## Screenshots

None — documentation-only change.
