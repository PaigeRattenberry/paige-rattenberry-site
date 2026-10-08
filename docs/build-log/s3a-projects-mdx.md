# Session 3a — Projects index, MDX pipeline, EmbedFrame, StimMap3D page body
- Date: 2026-09-13 · Branch: s3a-projects-mdx · PR: #6

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal
Everything in the original Session 3 that does not need StimMap3D to be deployed or public
(IMPLEMENTATION_PLAN split note, 2026-09-13): an MDX pipeline for project pages, Session 2's
`content/projects.ts` folded into MDX frontmatter, a card for every DESIGN §3.2 project, the
`/projects` index with a URL-synced skill filter, a reusable click-to-load `EmbedFrame`, and the
StimMap3D page body with its disclaimer. Session 4 builds on this; Session 3b adds the embed,
the live and repository links, the screenshots and the cover once S0-D is done.

## What shipped
- **MDX pipeline.** `next-mdx-remote` 6.0.0 (RSC `compileMDX`), `gray-matter` 4.0.3,
  `remark-gfm` 4.0.1, `rehype-slug` 6.0.0, `rehype-autolink-headings` 7.1.0 (versions from
  `npm view` on 2026-09-13). `lib/mdx.tsx` compiles a body with `Figure`, `Callout` and a
  `MetricStat` that takes only `value` and looks the metric up in the project's frontmatter, so a
  body can render a number but never introduce one. `Prose` styles the output (headings get ids
  and self-links, tables and blockquotes covered) and no longer owns the page gutters.
- **Content.** `content/projects/*.mdx`, ten files: `stimmap3d` (body written), the capstone and
  thesis (frontmatter only, bodies in Session 4), and cards for MentalWell, Clinical CoPilot,
  CMPT 412, ML for cybersecurity, the EEG-TMS app (MSE 491), the capnography/EEG research and the
  GenAI literature review. `content/projects.ts` is deleted. Three cards set `researchId` and take
  title, dates, summary, metrics, skills and source from `content/research.ts`; the schema
  rejects a retyped copy. One new source label (the MSE 491 final report). No project carries a
  repository or live link, and the loader refuses `kind: "repo"` while INVENTORY clears none.
- **Schema and loaders.** `ProjectSchema` extended with `cover` (optional, must be an image in
  `assets.json`), `resume { include, bullets }`, typed link `kind`, `researchId`, `order` and
  `aside`; `ProjectFrontmatterSchema` is the pre-merge shape. `lib/content/project-files.ts` is
  the one fs reader (`process.cwd()`-relative); `lib/content/projects.ts` validates, merges and
  resolves the cover onto the record. `load.ts` still exports `projects` and `featuredProjects`,
  adds `otherProjects`, `deepPageProjects` and `projectBySlug`, and folds MDX projects into
  `allMetrics`, `allSourceIds` and `allSkillRefs`; `lib/routes.ts` takes its project routes
  from `deepPageProjects`. `MetricStat`/`TextWithMetrics` are now pure and take a `MetricView`
  (source already a public label, from `metricViews()` in `lib/content/sources.ts`).
- **Pages.** `/projects/[slug]` (static, `generateStaticParams` from content, `dynamicParams =
  false`): kicker, official title, tagline, the disclaimer callout first where 3b mounts the
  embed, the body, and a facts column (dates, kind, skills, links, the "Built with Claude Code"
  aside linking to `/how-this-was-built`). Frontmatter-only projects render their resume
  bullets and say the case study comes in Session 4. `/projects`: three case-study cards, then
  chips grouped by skill category and the grid of the other seven. The grid is a client island
  in a `Suspense` boundary whose fallback is the same chips and cards server-rendered, so every
  project is in the HTML; chips push `?tag=<skill>` with `history.pushState` (Next syncs it into
  `useSearchParams`, no fetch) and an unknown value shows everything. Home reuses `ProjectCard`.
- **`components/embed/EmbedFrame.tsx`.** Poster (from `assets.json` data) or title in a 16:9
  frame, one load button, iframe mounted only after the click, an always-visible new-tab link,
  and a fallback message when no load event arrives within a timeout. Nothing in it knows
  StimMap3D; no StimMap3D URL is in `content/`.
- **Tests.** Unit (54): the claims gate now checks every frontmatter metric occurs in the card
  text or as a `<MetricStat>` reference in the body, and every reference is declared; research
  merge, cover resolution, repo-link refusal, slug/file-name agreement; the StimMap3D page renders
  the disclaimer before the body, every metric with its source, the aside, and no GitHub or
  Pages link; a frontmatter-only page renders its bullets; a card slug 404s; `EmbedFrame` with a
  fixture URL (no iframe before the click, src/title after, timeout fallback, poster); filter
  parsing and the chip set. E2E: `tests/e2e/projects.spec.ts` (6) covers the no-JavaScript
  fallback, direct filtered URL, choose/clear/back/forward, invalid and empty values, keyboard
  use with axe on the filtered page, and the StimMap3D disclaimer-before-body with no iframe.
  The axe suite (97) also checks overflow and tooltips on `/projects` and `/projects/stimmap3d`.
- Screenshots: `docs/screenshots/s3a-*.png` (28), including `s3a-projects-filtered-*.png`.

## Decisions and why
- **Research-backed cards merge, not copy.** The amendment offered "resolve from the item or a
  test that the copies match"; merging removes the second copy entirely, and the schema refine
  makes a retyped field a build error rather than a drifting duplicate.
- **`lib/routes.ts` derives its project routes from the validated loader** (`deepPageProjects`
  in `load.ts`), the same list `generateStaticParams` reads, rather than a generated manifest or
  a second frontmatter reader (the first draft had one; the review removed it, see below).
- **Numbers in bodies go through `<MetricStat value>` bound to frontmatter.** The value is
  written once in frontmatter with its label and source; the body only points at it. The
  claims-gate test treats a `<MetricStat>` reference as an occurrence.
- **The filter island uses `pushState`, not `router.push`**, following the bundled Next.js
  "Native History API" guidance: the page is static, so a router navigation would refetch an
  identical RSC payload on every chip click. Back/forward work because each choice is a history
  entry. Invalid values are ignored and the URL left alone; rewriting it on load would add a
  history entry nobody asked for.
- **The Suspense fallback is the real grid.** `useSearchParams` makes the island client-rendered
  in a static route, so the fallback is what the HTML carries. Rendering the same chips and cards
  there keeps the content prerendered (checked by the no-JavaScript e2e test).
- **Grid cards show the tagline and the proof.** The proof holds the metrics (Clinical CoPilot's
  ranking); the tagline alone hid them. Case-study cards stay compact (proof only) as on Home.
- **`EmbedFrame` has no error path**, deliberately: browsers fire no error event for a blocked
  or unreachable iframe and React listens only for `load` on iframes, so a timeout is the only
  signal. The new-tab link is always visible rather than only on failure.
- **Cards without a deep page are not links to themselves.** `Card.href` is optional; such cards
  show their external links (MentalWell's Kaggle notebook) inline instead.
- **Kind labels** are "Project", "Research", "Coursework". The first draft said "Independent
  project" for every `project`, which misdescribed the six-person capstone.
- **StimMap3D quotes and the test count were read on 2026-09-13.** The test count (436 across 32
  files) is the README's at that point; this site's DESIGN §2 said 418 from the seed, and Paige
  approved amending it (see below). Session 3b re-checks every quote and metric against the public
  repository at a pinned commit.
- **`content/projects/*.mdx` is Prettier-ignored** so the verbatim quotations keep their source
  text; everything else is formatted.

## Tools and model
Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Skills: `frontend-design` before the
index and case-study layouts; `/code-review` at high effort on the branch before the PR;
Playwright for the filter, axe and screenshot runs; the bundled Next.js docs
(`node_modules/next/dist/docs`) for MDX, `useSearchParams`, `generateStaticParams` and the
native history API; `pdftotext` on the resume of record, the MentalWell write-up and the MSE 491
report's front matter.
PR review follow-up (2026-09-13): Claude Code, model Claude Opus 5 (`claude-opus-5`), ran
`/code-review` at high effort on PR #6, verified its three findings against the code, and
implemented the fixes described at the end of "What the AI got wrong".

## Constraints, human decisions and implementation direction
- Task: IMPLEMENTATION_PLAN §4 Session 3a and its 2026-09-12 amendment; the 2026-09-13 split note.
- Constraints honoured: no S0-D dependency (no live URL, deep link, repo link, screenshots or
  cover); no copy of StimMap3D's screenshots; the private source folder read-only; facts only
  from `content/`; the source inventory's "no repo links" rule.
- Human decisions applied: Paige's Session 2 answers (StimMap3D tags, capstone tags) carried
  into frontmatter unchanged; the split and run order (Paige, 2026-09-13).
- Implementation direction from AGENTS.md: server-only loaders, plain data to islands,
  `useSearchParams` isolated in Suspense, filters tested against `next start`.

## Generated work and rejected suggestions
- Generated by Claude Code: everything in this PR, including the StimMap3D body (quotations
  verbatim from its README and DESIGN; the feature list paraphrased from the README), the seven
  card taglines and proofs, and the tests.
- Rejected by Claude Code during the session: a second project schema (extended the existing
  one); a generated route manifest (fs reader shared instead); `router.push` for chips (see
  above); an `onError` handler on the iframe (never fires); an `Aside` MDX component for the
  sidebar (the sidebar is page layout, so its text lives in frontmatter `aside`).
- MentalWell's date: April 2025, confirmed by Paige on 2026-09-13 after the PR opened; the
  Google Intensive certification entry (its parent, pending since Session 2) now carries the
  same month.
- **Paige's decisions after the PR opened (2026-09-13).** Asked for a recommendation on both
  open items and approved it: (1) DESIGN §2 no longer fixes StimMap3D's test count; it points at
  the README count recorded in the build log and re-checked in 3b, noting the seed's 418 and the
  436 read this session, so the spec cannot go stale again. (2) `ml-cybersecurity` is filed as
  coursework: its dates are the GMLE period, the resume ties the models to SANS SEC595, and
  SEC595 was taken for credit through SANS.edu's graduate program, the same footing as the
  CMPT 412 and MSE 491 cards. Its tagline names the course. The /projects screenshots were
  re-captured.
- **Session 4 context amended (requested by Paige, 2026-09-13, after the PR review follow-up).**
  IMPLEMENTATION_PLAN §4 Session 4 and its prompt in SESSION_PROMPTS.md now record what this
  session left for Session 4, each checked against the code: a body replaces the proof/bullets
  fallback, so body numbers go through `<MetricStat>` and the fallback and its capstone test go;
  MDX offers only `Figure`, `Callout` and `MetricStat`, so figures are registered components
  with their values in `content/`; `LinkSchema` rejects site paths, so the thesis PDF link needs
  a form that resolves to an `assets.json` document; `content/research.ts` repeats the thesis and
  capstone title and dates unchecked, `projectSlug` is unverified, and the thesis item's "five"
  has no metric; frontmatter `aside` always adds the How-this-site-was-built link; `EmbedFrame`
  needs an optional `href`, `allow` and embed-neutral fallback text for the YouTube video; and
  the Home cards already link to all three deep pages.

## Verification (command, result, PR/commit)
- `npm run typecheck`: clean. `npm run lint`: clean. `npm run format:check`: clean.
- `npm test`: 9 files, 57 tests, green (includes the claims and privacy gates over the new MDX
  files and this log). After the PR review follow-up: 9 files, 60 tests, green; lint, typecheck,
  build (15 routes), `e2e:a11y` (97 passed) and `projects.spec.ts` (7 passed) re-run clean.
- `npm run build`: clean; 15 routes, `/projects` static, the three `/projects/<slug>` pages SSG,
  no dynamic routes. A `grep` of `.next/server/app/projects.html`, `.next/server/app/projects.rsc` and
  `.next/static/chunks/*.js` for the private source folder's path prefix: no matches after the
  review fixes (three before).
- `npx playwright test tests/e2e/projects.spec.ts`: 7 passed against `next start`.
- `npm run e2e:a11y`: 97 passed, both themes.
- `$env:SESSION = "3a"; npm run e2e:screenshots`: 28 files, re-captured after the review fixes.
- `git status` shows nothing from the private source folder; the diff contains no StimMap3D URL, repository link
  or screenshot (unit test "no project links to a repository or a live app" and the page test
  "has no live-app or repository link yet").
- Commits: e340c26 (loader and schema), e82b082 (MDX content), d9f2b17 (deep pages), a73a86d
  (index and filter), 7a3d730 (EmbedFrame and tests), then the review fixes, then this log and
  the screenshots.

## What the AI got wrong and how it was caught
- **`__dirname` in the fs reader** became `C:\ROOT\...` under Turbopack, so `next build` failed
  with ENOENT while typecheck and Vitest passed. Caught by the first build; the reader is now
  `process.cwd()`-relative, as the Next.js MDX guide's fs example assumes.
- **Event handlers in the Suspense fallback.** The server-rendered chips passed `onClick` even
  when no handler existed, which a server component cannot do; `next build` failed prerendering
  `/projects`. Caught by the build; the handler is attached only when `onChoose` is given.
- **`getByRole("listitem")` counted nested tag lists** (32 items instead of 7), so four e2e tests
  failed on first run. Caught by the spec; the locator now takes direct children of the grid.
- **`onError` on the iframe never fires in React** (React listens only for `load` on iframes),
  so the "frame errors" test failed. Caught by the test; the component relies on the timeout and
  says so in its doc comment.
- **A test fixture retyped research-derived fields** for a research-backed card and was
  rejected by the very refine it was meant to exercise. Caught by the test run; the fixture now
  declares only what frontmatter may.
- **Grid cards first rendered only the tagline**, so Clinical CoPilot's ranking was never
  rendered on the grid even though the claims-gate test passed (it checks text, not rendering).
  Caught by the ProjectGrid component test; cards show tagline and proof.
- **"Independent project" as the kicker of the capstone page.** Caught in the 1280 px screenshot;
  the kind label is "Project".
- **A spelled-out count in prose** ("six years later" in the EEG-TMS proof). Caught on re-reading
  against DESIGN §3.3; rewritten with the year.
- **`/code-review` (high) was cut off by the session rate limit while verifying**, exactly as
  in Session 2, after its eight finder angles had produced 29 deduplicated candidates. The
  candidates were recovered from the agent transcript and verified by hand against the code
  and the `.next` build output. Confirmed and fixed:
  1. **A private staging path was in the served /projects page.** `toCard` handed raw
     metric objects, source ids included, to the client island, so the MSE 491 report's
     staging path was serialised into `projects.html`, `projects.rsc` and a client chunk that
     also carried the whole source-label map (measured with `grep` on `.next`). `MetricStat`
     and `TextWithMetrics` now take a `MetricView` whose source is already a public label,
     resolved on the server by `metricViews()`; the island never sees an id. A unit test
     asserts no card data contains a staging path and an e2e test asserts the served HTML does not.
  2. **Two metrics rendered unsourced.** The claims gate accepted a value in the tagline, but
     cards printed the tagline as plain text, so the CMPT 412 grade and the MSE 491 team size
     had no tooltip; the EEG-TMS app count lived only in bullets, which grid cards never
     render. Cards now route tagline and proof through `TextWithMetrics`; the gate counts only
     the texts a page renders (tagline and proof; plus bullets and `<MetricStat>` references
     for deep pages; a raw number in a body no longer counts); the EEG-TMS proof carries the
     count. The ProjectGrid test checks every card metric has its button.
  3. **The case studies reordered themselves.** Sorting by year then start month put the
     thesis before the capstone, against DESIGN §0 and the deleted array. Featured projects
     now carry an `order` in frontmatter, and a test pins the sequence.
  4. **Three predicates for "has a deep page".** `generateStaticParams` used `featured &&
     deepPage`, the routes and the page guard used `deepPage` alone; a deep page that was not
     featured would have been routed but 404'd. One `deepPageProjects` list feeds both, and
     `lib/routes.ts` now derives its project routes from the validated loader instead of a
     second raw frontmatter reader (Playwright resolves the `@/` alias, so the no-alias
     reason for that reader was not real; it also read every MDX file twice per process).
  5. **Nested complementary landmarks** on the StimMap3D page (an `<aside>` inside the facts
     `<aside>`); axe rates it moderate, below the gate. The inner box is a labelled `<section>`.
  6. **The frontmatter-only page rendered the proof with no metrics**, so the first "six-person"
     a reader saw had no source. `assignMetrics` now runs over proof and bullets together.
  7. **Page-level prose stated a fact** ("an educational visualization, not a medical device")
     that content/ does not carry; the callout body now only says whose wording it is. The
     /projects meta description named the three projects in a literal; it derives from them.
  8. **The EEG-TMS card named StimMap3D without its disclaimer** (gate c). The mention is gone.
  9. **`loading="lazy"` on a click-mounted iframe** could defer the load event past the timeout
     and mark a fine embed failed; removed. The reviewer also noted that a frame refused by
     X-Frame-Options still fires `load`, which a cross-origin parent cannot detect; the
     component's comment now says so and points 3b at its header check.
  10. **The e2e chip clicks could land before hydration** (the fallback chips have no
      handler). The spec now waits for the live-region element only the island renders; the
      no-JavaScript test asserts that element is absent.
  11. Cleanups: `Card` and `TagList` share one `TagRow`; chips take their colours from `Tag`;
      the axe helper lives in `helpers.ts` for both specs; the frontmatter mask is built from
      the derived-field list; the unreachable duplicate-slug check and the unused `data-filter`
      prop are gone; the cover asset is resolved once onto the record; `KIND_LABELS` moved to
      `lib/content/labels.ts` with a shared `projectMeta()`; the live region derives its text
      instead of an effect; same-tab links lost a meaningless `rel="noopener"`; multiple card
      links get a gap; malformed `<MetricStat>` tags fail the gate loudly.
  Not changed, with the reason: the Suspense fallback duplicates the grid in the payload
  (about 5 KB on an 85 KB page) because the plan asks for `useSearchParams` in a Suspense
  boundary and the no-JavaScript HTML must carry every card; a `useSyncExternalStore` rewrite
  is noted for Session 7's budget pass. The loader still refuses `repo` links in code as well
  as in the tests, since the plan words it as a rule for this session and 3b lifts it
  deliberately.
- **PR review follow-up (`/code-review` high on PR #6, after the PR opened).** Three findings,
  each verified against the code and fixed:
  1. **The claims gate still over-counted project text.** It counted every tagline, but
     featured deep-page projects appear only as compact cards (proof only) and in the deep-page
     header, which prints the tagline as plain text; and it counted deep-page bullets even when
     a body exists, though bullets then render nowhere. A metric in either place would have
     passed while showing without a source, or not at all. Nothing failed today. The gate now
     counts the proof for compact cards, tagline and proof for grid cards, bullets only for a
     deep page without a body, and body `<MetricStat>` references; a new test asserts no
     deep-page tagline contains a declared metric.
  2. **`EmbedFrame` dropped keyboard focus on load.** The clicked button unmounts, so focus fell
     to `<body>`. Focus now moves to the iframe that replaces it; a component test checks
     `document.activeElement`.
  3. **The timeout message's live region was inserted already filled**, which screen readers
     often do not announce. The caption's status span is now the one persistent
     `role="status"` region and only its text changes; a test asserts it is the same element
     before and after the timeout.

## Paige's review notes

## Screenshots
`docs/screenshots/s3a-*.png`: every route at 1280 px and 390 px (home in both themes), plus
`s3a-projects-filtered-1280.png` and `s3a-projects-filtered-390.png` (`/projects?tag=rag` with
the RAG chip pressed and only matching cards shown).
