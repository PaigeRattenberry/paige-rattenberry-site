# Plan amendment — add Session 6b, and open S0-F

- Date: 2026-09-20 · Branch: `s6b-spec-amendments` · PR: #13
- Documentation only: `DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `SESSION_PROMPTS.md`, `README.md`,
  `.gitignore` and this entry. No file under `app/`, `components/`, `content/`, `lib/`, `public/`,
  `scripts/` or `tests/` was touched.

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

Two things, both requested by Paige on 2026-09-20.

1. **Define Session 6b** so an agent can build it: an editorial pass that names the thread already
   running through the work — a system's output can be checked, the checker is itself tested, and
   the check runs automatically or it does not count — on Home, in About and on `/research`, gives
   the GenAI interpretability literature review a deep page in place of a one-line card, and moves
   the thesis up one slot in the featured row. It changes emphasis, ordering and vocabulary over
   facts that are already in `content/`; it introduces no new fact and no new claim.
2. **Open S0-F**, a prerequisite of Paige's own, covering what the published build logs may say.

Session 6b could not simply be handed to a coding agent as a note. AGENTS.md lets an agent amend
`DESIGN.md`, `IMPLEMENTATION_PLAN.md` and `SESSION_PROMPTS.md` only at Paige's request, and every
session prompt tells the agent to read its section of the plan and build only that. Until the plan
had a Session 6b section, there was no session to build — and one of 6b's tasks (the featured
reorder) is pinned by a unit test that mirrors DESIGN §0, so an agent would have had to change a
spec it was not allowed to touch in order to make the suite pass. The amendments come first, on their
own branch, as the Session 3 split did in September.

## What shipped

**`DESIGN.md`**

- Status: Sessions 1–6 and 3b merged (3b as PR #12, `dc0a8af`); Sessions 6b, 7 and 8 remain.
- §0 "Sections": four deep pages, not three.
- §0 "Deep project pages": the GenAI literature review added as the fourth.
- §0 **"Featured order"**, a new row: StimMap3D, Honours thesis, Adolescent Spinal Curvature capstone.
  Three, not four — both the Home "Selected work" row and the `/projects` "Case studies" row are
  `md:grid-cols-3`, so a fourth featured card wraps onto a second row by itself. The row also records
  that `tests/unit/content.test.ts` pins the featured order to it, which was previously an unwritten
  coupling between a test and a prose table.
- §0 **"Editorial pass"**, a new row: what Session 6b changes and the bound it works inside.
- §1 answer 1: rewritten, with the old answer kept beside it so the change is legible. It also records
  that `profile.positioning` feeds three surfaces — the Home hero, the site-wide Open Graph card's
  description and the JSON-LD `Person` description — and therefore has a length ceiling of about 280
  characters, because the card is a fixed 1200×630 image with no overflow handling.
- §2: a site-map row for `/projects/genai-literature-review`; the `/research` row amended for the
  three themes and for the rule that the theme is a field on the content item, not a list typed into
  the page; the thesis row amended for its new tagline and its one added paragraph.

**`IMPLEMENTATION_PLAN.md`**

- §3: **S0-F** added, and the "every prerequisite is now closed" line corrected — S0-F is open and is
  the only one outstanding.
- §4: **Session 6b** added between Session 6 and Session 7: prerequisite, the five decisions Paige
  settled on 2026-09-20, eleven tasks, a latitude clause, verification and ten acceptance items.
- §4 Session 7: prerequisite updated (3b merged; 6b now runs first), with a note that 6b adds one
  HTML route to every sweep, adds no client JavaScript, and leaves one label-fitting observation for
  Session 7's polish pass.
- §4 Session 8: task 2 amended — S0-F must be done first, and the "what worked / what did not"
  synthesis is written as a taxonomy of what the agent got wrong and which mechanism caught it, with
  an explicit accuracy bound on what that record is and is not.
- §5 and §7: timeline row and acceptance-summary row for 6b; the hours estimate updated.

**`SESSION_PROMPTS.md`**

- Top banner: the new run order (**S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S8**), 3b recorded
  as merged rather than in review, and S0-F announced.
- A paste-ready **SESSION 6b** prompt before Session 7's, in the pack's existing shape.

**`README.md`** — status paragraph: 3b merged, 6b added.

## Decisions and why

- **Session 6b is its own session, not a fold into 7 or 8.** Session 7 is accessibility and
  performance gates and Session 8 is the build story and launch; both are structural. 6b is content,
  and it has to land before 7 so the new route is inside Session 7's axe, responsive and Lighthouse
  sweeps, and before 8 so the launch snapshot and the asset reconciliation include it.
- **Three featured cards, not four.** Both grids are three-column. A fourth featured card makes the
  first screen worse, not better, and a literature review is a survey rather than a built artifact,
  unlike the deployed application and the capstone beside it. Moving the thesis from third to
  second instead costs little churn: two `order` fields and one test array.
- **The skill relabel is specified as short, and the length was measured rather than assumed.**
  `lib/explorer/layout.ts` places each label from `labelWidth(n.label)`, which is a function of the
  label's character count, and `scripts/layout-explorer.ts --check` compares the committed layout byte
  for byte. Measured on 2026-09-20: `"Interpretability (XAI)"` (22 characters) regenerates the file
  **byte-identically**, while a 39-character alternative moves the `xai` label and its hub label, and
  the hub label is drawn in the Home hero teaser. The plan and the prompt both specify the short form
  and ask the session to prove `--check` passed without regenerating.
- **The session may go beyond its task list, inside a written bound.** Paige asked that the session
  be allowed to add what it finds, so the plan carries a latitude clause: sourced from `content/` or
  an already-cleared source, no touching the verbatim resume bullets, `profile.summary`, the staged
  source folder, the approved wording or StimMap3D's disclaimer, no change to the skill graph or the
  spec files, verifiable by a check that runs in this repo, and disclosed under its own heading in
  the PR body and the build log. Anything failing one of those is a recommendation, not a change.
- **S0-F is Paige's step, not an agent's.** Rendering the build logs publicly is already in Session 8,
  and gate (b) forbids a staged-source path in a served page, so a scrub was required.
  Paige set its scope; any change to a repository's history is hers to run, and an agent may only
  list candidates and draft the request.

## Tools and model

Claude Code with Claude Opus 5 (1M context). No code generation; documentation edits plus four
read-only measurements against the working tree (below).

## Constraints, human decisions and implementation direction

Paige decided, on 2026-09-20: the positioning line; the featured order; that the resume PDF may
change; that she writes the About present-tense paragraph and approves its exact wording, and that
the session ships without it if it is not approved in time; the agent-oversight wording; that
Session 6b's prompt grants latitude for additional verifiable changes; and S0-F.

Paige cleared the agent-oversight wording on 2026-09-20: the multi-agent infrastructure-automation
work involved guardrails, permissioning and oversight of what agents were allowed to do, and the
grounding and evaluation work targeted hallucination and groundedness failure modes.

## Generated work and rejected suggestions

Rejected, with reasons now recorded in the plan:

- **Featuring the literature review as a fourth case study.** Rejected for the grid geometry and for
  over-promoting a survey; superseded by the reorder.
- **Re-tagging content so the skills constellation foregrounds evaluation.** Measured and rejected:
  adding one skill to one entry re-lays out all 42 nodes, invalidates the Session 5 screenshots and
  changes the Home teaser, and the label in question still does not fit, so the picture does not
  actually improve. Recorded instead as a label-fitting note for Session 7.
- **Grouping `/research` by theme inside the page component.** Rejected against gate (e) — a theme is
  a fact about the work — and because it cannot be derived from the existing `kind` field, since the
  interpretability thread spans three kinds. The plan specifies a content field plus display strings
  in the labels module.

## Verification (command, result, PR/commit)

Measurements taken on the working tree before writing the amendments, each restored afterwards:

| Check | Command | Result |
| --- | --- | --- |
| Baseline | `npm test` | 17 files, 136 tests passed, exit 0 |
| Layout baseline | `npx tsx scripts/layout-explorer.ts --check` | up to date (42 nodes, 173 edges) |
| Long skill label | relabel `xai` to 39 characters, then `--check` | **exit 1**, layout out of date; the `xai` label and its hub label both move |
| Short skill label | relabel `xai` to `"Interpretability (XAI)"`, then regenerate | file **byte-identical** to the committed one |
| Skill-set change | add one skill to one entry, then regenerate | all 42 node placements change; the label still does not fit |

Added by the review pass on the same day, after the first four commits:

| Check | Command | Result |
| --- | --- | --- |
| Both relabels together | `xai` → `"Interpretability (XAI)"` **and** `grounding` → `"Grounding & claim verification"`, then `--check` | exit 0, layout up to date |
| Negative control | `xai` → a 45-character label, then `--check` | exit 1, layout out of date — the check is label-sensitive |
| Which labels are drawn | read `labelAt.fit` in `content/generated/explorer-layout.json` | eight do not fit: `agent-loops`, `openai-agents-sdk`, `gemini-vertex-ai`, `bm25f`, `eval-harness`, `ci-gated-validation`, `access-control`, `embedded`. `grounding` fits |
| Reference count | extract the shipped review PDF's reference list with `pdf-parse` | 14 numbered references, `[1]`–`[14]` |
| Build-log entries citing staged-source paths | `grep -l` for the staged-source folder prefix over `docs/build-log/*.md` | 11 of the 13 entries present before this one |
| Suite, after the corrections | `npm run lint`; `npm test` | clean; 17 files, 136 tests passed |

After the amendments: `npm test` re-run — 17 files, 136 tests passed. Nothing in this branch is
imported by code, and the featured-order test still matches `content/`, which this branch does not
change, so the suite is unaffected. `git status` shows no staged-source file.

## What the AI got wrong and how it was caught

- **The first-pass review of this material asserted that a skill *label* change needs no explorer
  regeneration, twice.** Caught by reading `lib/explorer/layout.ts` and then testing it: the long
  label made `--check` exit 1. The plan now specifies the short label and asks the session to prove
  `--check` passed.
- **It also said the positioning line renders on Home "and nowhere else".** Caught by grepping for
  the field: it also feeds the Open Graph card and the JSON-LD `Person`. That is why DESIGN §1 now
  carries a character ceiling.
- **It said a fourth featured card would cost "a grid-class change"** and named grid classes that
  exist nowhere in the repository. Both grids are `md:grid-cols-3`. It also missed that two unit
  tests pin the current three slugs.
- **It said the new deep page needs nothing registered.** The route and the sitemap do derive
  automatically, but `ProjectPage.test.tsx` requires a body test per deep page and `seo.spec.ts`
  requires a site-unique description. Both are now tasks.
- **A first attempt to write this branch's longest file through a shell heredoc failed**
  (`ENAMETOOLONG` at spawn). Rewritten with the file tool; no partial file was left behind.
- **A first attempt to edit a file with a shell-quoted inline script** broke on an apostrophe.
  Rewritten as a script file with the text read from disk, after backing the file up.

Found by a review pass over this branch on 2026-09-20, and fixed in it:

- **S0-F said all thirteen present entries cite staged-source paths.** Caught by running the grep:
  eleven do; `plan-reorder-2026-09-15.md` and `s0e-vercel.md` do not. The scrub is still required,
  but the count was wrong in three places (S0-F, the Session 8 amendment and the PR body).
- **Session 6b task 5 sent the `14` metric to the wrong file**, saying task 6 (the MDX) declares it.
  `mergeResearch` in `lib/content/projects.ts` replaces a `researchId` card's `metrics` with the
  research item's, so a metric declared in MDX frontmatter is discarded and the claims gate would
  never see it. The task now names `content/research.ts` and the mechanism.
- **The Session 7 note listed `grounding` among the constellation labels that never get drawn.**
  Caught by reading `labelAt.fit` in the committed layout: `grounding` fits. The note now names the
  four of the eight non-fitting labels it meant, and lists the rest.
- **Task 1 called the `skillsStrip` change a reorder.** It also drops `python` and adds
  `grounding`; the task now says so, and says why the strip is display-only.
- **Acceptance 9 was worded too broadly.** Read literally it failed on employers, institutions and
  venues already on the site. Reworded to what it meant: the session adds no fact and no
  organisation that is not already in `content/`.
- **The "measured" claim covered one label, not two.** The plan said both label lengths had been
  measured; only `xai` was. `grounding` has now been measured too, separately and together with
  `xai`, and the table above records it.

## Paige's review notes

## Screenshots

None — documentation only.
