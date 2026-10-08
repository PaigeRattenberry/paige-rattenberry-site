# Session 5 — Career timeline + skills explorer
- Date: 2026-09-15 · Branch: s5-explorer · PR: #9

## Goal
IMPLEMENTATION_PLAN §4 Session 5 with its 2026-09-15 amendment, run after Session 4 per the
run-order change (S0-D and Session 3b not required): derive one explorer entry per piece of work
from experience, projects and research, lay out the skills constellation deterministically at
build, ship the timeline, filter chips and constellation as small client islands at the top of
/experience with a static teaser on Home, and report the home page's JavaScript budget. The
StimMap3D page was not touched; its missing links and cover are irrelevant to the explorer.

## What shipped
- **Derivation** (`lib/content/explorer.ts`): 18 entries from 24 records (6 roles, 10 projects,
  7 research items, the degree). A project's `researchId`, a research item's `projectSlug` and a research
  item's `roleId` each fold the pair into one entry that takes the primary record's title, dates
  and line and the union of both records' skills; Stryker is one entry from the role. Entries are
  ordered by `periods` through `newestFirst()`. The degree is an entry too, so the timeline
  runs from 2017 (added 2026-09-16 at Paige's request, on Claude Code's recommendation; it has no
  skill tags, so the graph is unchanged). Nodes are the 42 skills at least one entry uses
  (count = entries), edges are the 173 unordered co-occurring pairs (weight = shared entries).
  Conference reviewing stays in leadership data.
- **Layout** (`lib/explorer/layout.ts`, `scripts/layout-explorer.ts`): d3-force 3.0.0 (pinned
  exactly) with `simulation.randomSource(mulberry32(20260915))`, alpha decay off, 300 ticks,
  vocabulary-ordered input, positions rounded to a tenth, then a deterministic label-placement
  pass (eight candidate spots per label scored against circles, earlier labels and the frame,
  with a `fit` flag). Written to `content/generated/explorer-layout.json` by
  `npm run layout:explorer` (`prebuild` only checks it, after review fix 7 below); `lib/content/explorer-layout.ts` validates the file
  against the derived graph at import, so a stale file fails the build. Two runs are identical
  byte for byte.
- **Islands** (`components/explorer/`): `Explorer` (URL-synced `?skill=` through
  `useSearchParams` + `history.pushState`, inside a Suspense boundary whose fallback is the same
  markup server-rendered), `ExplorerView` (composition shared by island and fallback), `Timeline`
  (vertical rail, grouped by year newest first, each entry with kind, dates, title linking to its
  full record, organisation, one line through `TextWithMetrics`, skill tags), `SkillsConstellation`
  (interactive wrapper: hover/focus lights a neighbourhood, nodes are `role="button"` with
  `aria-pressed`, one tab stop with arrow/Home/End roving, Enter/Space filters, a caption names the
  hovered or focused skill), `ConstellationSvg` (pure SVG: edges by weight, circles by count, labels
  from the placement pass), `SkillList` ("View as list": the same buttons by category with entry
  and link counts), `ConstellationTeaser` (Home Fig. 1, static, server-rendered, hub labels only,
  links to /experience). `components/ui/FilterChips.tsx` is the single-select chip row extracted
  from the projects grid, which now wraps it with its own wording.
- **Pages**: /experience opens with the explorer as Fig. 1 under an h2, then "Roles" and
  "Education" h2 sections whose `DatedEntry`s are h3s (certifications h4). Home shows the teaser
  in the right five columns from lg; the contour landscape now shows at md only, the band below md.
- **Styles** (`app/globals.css`): constellation and timeline component classes, state from data
  attributes, 150–200 ms colour/opacity transitions only, all off under `prefers-reduced-motion`.
  Dimmed timeline entries turn every text `--ink-3` (AA on paper and surfaces) rather than fading.
- **Tests**: `tests/unit/explorer.test.ts` (every record appears exactly once; the six pairs
  collapse, Stryker from the role with the item's skills; order by periods; reviewing excluded;
  vocabulary-ordered skills; node counts and edge weights recomputed and symmetric; graph pure;
  committed layout equals a fresh run, twice; every node inside the box; every always-shown label
  fits; PRNG repeats; view data resolves labels and serialises no private staging path; year groups),
  `tests/unit/components/Explorer.test.tsx` (query parsing; highlight/dim by URL; chips and nodes
  push the URL and announce counts; list view; arrow-key roving; the fallback renders every entry
  with tags, links and MetricStat and no live region), `tests/e2e/explorer.spec.ts` (HTML before
  JS; direct URL; chips/nodes/clear/back/forward; invalid values; list view; keyboard; reduced
  motion; transition property; axe on a filtered page in both themes; the static teaser; no
  private staging path). The two contour axe tests now run at 1000 px, where the motif still shows.
  `scripts/js-budget.mjs` measures a route's initial gzipped JS from the build.
- Screenshots: `docs/screenshots/s5-*.png` (30): every route at 1280/390, Home in both themes,
  plus `s5-experience-filtered-*` (`?skill=rag`) and `s5-experience-list-*`.

## Decisions and why
- **Stryker matched through `roleId`.** The amendment says there is no link field, but
  `ResearchItemSchema.roleId` has existed since Session 2 and the Stryker item sets it, so the
  derivation follows that field (generic for any future item) and the test pins
  `stryker-xai.roleId === "stryker"` and the single role-kind entry.
- **The degree is an entry, so the timeline starts at 2017.** DESIGN §7.2 lists experience,
  projects and research as the explorer's data but runs the timeline from 2017, which only the
  degree reaches. The first PR draft left it out and named the choice as open; Paige asked on
  2026-09-16 whether it should be added and, on the recommendation that the 2017 span in the spec
  outweighs the data list, chose to add it. Education has no skill tags, so no node or edge
  changes.
- **The "one line" is content already on the site**: a project's tagline (also for the five paired
  entries), a role's location (its team joins the title as on /experience), a research-only item's
  summary. Numbers inside it render through `MetricStat` with the entry's metrics filtered by
  `findMetric`, so the claims gate holds; nothing is paraphrased in a component.
- **Dim with colour, not opacity.** The first pass faded non-matching entries to 45% and axe
  flagged serious contrast failures on the small mono text. Dimmed entries now set every text to
  `--ink-3` and hollow their rail marker; matched entries keep full ink with an accent marker and
  an accent-tinted tag.
- **Labels placed at build.** With 42 nodes, two dense clusters (the Hammerspace clique of 15
  skills, the ML cluster) and long vocabulary labels, on-the-fly labels overlapped. The layout
  script places each label once, records whether it fits, and the island shows a lit neighbour's
  label only when it does; multi-entry labels are always shown and always fit (tested). The
  caption, the chips and the list view name every skill regardless.
- **The teaser replaces the contour from lg** (DESIGN §7.2: constellation as Fig. 1 on large
  screens, contour on mobile); md keeps the contour as before. The teaser is a server component,
  so Home gains no JavaScript.
- **Node radius grows with the square root of the count** (area proportional to entries); edge
  width 1.5–3 units by weight; one accent for the active node, its neighbourhood and lit edges;
  labels in text tokens, never the mark colour (dataviz skill rules).
- **`FilterChips` generalised** rather than duplicated; the projects tests are unchanged and green.

## Tools and model
Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Skills: `dataviz` and `frontend-design`
before the graph and layout; Playwright (a scratch script for close-ups of the constellation in
both themes and the filtered/hover states at 1280 and 390 px, then the specs); `/code-review`
(high) on the working tree before the PR (see "What the AI got wrong"). Versions installed:
d3-force 3.0.0, @types/d3-force 3.0.10, tsx 4.23.13.
The PR #9 follow-ups on 2026-09-16 (the second review, the reorder and the doc updates below) used
Claude Code with Claude Opus 5 (1M context), running `/code-review` (high) as a background agent
and Playwright scripts to measure element positions.

## Constraints, human decisions and implementation direction
- Task: IMPLEMENTATION_PLAN §4 Session 5 and its 2026-09-15 amendment; SESSION_PROMPTS Session 5.
- Constraints honoured: content only through `lib/content/load.ts`; no facts in components; source
  ids resolved to labels before data reaches the island; the private source folder untouched and unstaged; no
  StimMap3D changes; one accent; no perpetual animation; reduced motion honoured; heading order
  valid on /experience.
- Human decisions applied: Stryker as one entry from the role (2026-09-15); run order 3a → 4 → 5;
  reviewing stays leadership data unless Paige says otherwise.
- Implementation direction: derive at build, lay out at build, hydrate only hover/focus/click;
  server-rendered fallback identical to the island; plain serialisable props.

## Generated work and rejected suggestions
- Generated by Claude Code: everything in this PR.
- Rejected during the session: laying out on the client (jank, non-deterministic); HTML-positioned
  node buttons scaled in px (overlap at 390 px); showing every label (unreadable in the cliques);
  a larger label font on the teaser at every count (overlaps; hubs only instead); opacity dimming
  (contrast); adding the degree as an entry (outside DESIGN §7.2's data list); a second chip
  component for the explorer (shared one instead).
- Open for Paige: whether the "View as list" choice should also live in the URL (it is local
  state now). (Education on the timeline: decided 2026-09-16, added.)

## Verification (command, result, PR/commit)
- `npm run typecheck`, `npm run lint`, `npm run format:check`: clean.
- `npm test`: 15 files, 114 tests, green (92 before this session).
- `npm run layout:explorer` twice: identical files. `npm run build` (whose `prebuild` runs the
  layout script with `--check` and passes): clean, 15 routes, all static.
- `npm run e2e:features` (explorer and projects specs): 21 passed (14 + 7).
- `npm run e2e:a11y`: 97 passed after the two fixes below. The first full run had the two
  contour tests fail at 1280 px, where the teaser now stands in for the motif; they run at 1000 px
  now. The "metric source tooltip opens on keyboard focus and on hover" test, which Session 4's
  log already called possibly flaky, failed in two of three full runs, then four times in four
  when run alone, then passed three in three and one in three on later unchanged runs. Its action
  log showed why: the explorer pushes the 220+ button to about 5,400 px down the page, and with
  `scroll-behavior: smooth` on `html` Playwright's scroll-into-view before each hover can
  restart an animated scroll, so the tooltip is "not stable" until the timeout. The test now
  scrolls the button to the viewport centre in one instant step first; with that it passed four
  in four (8.7 s for the four, against 37 s for three before).
- `$env:SESSION = "5"; npm run e2e:screenshots`: 30 files.
- `MSYS_NO_PATHCONV=1 node scripts/js-budget.mjs /`: **136.6 KB gzipped** of initial JavaScript
  for modern browsers on `/` (seven chunks: React DOM 69.7 KB, the App Router client 42.6 KB, the
  app's own client code 9.2 KB, router/prefetch 8.8 KB, Turbopack runtime 4.2 KB, 2.0 KB), plus a
  38.6 KB `noModule` polyfill bundle that only browsers without ES modules download (175.1 KB
  counting it). **Over the DESIGN §8 target of 120 KB, and unchanged by this session**: a build of
  `main` in a separate worktree ships the same seven chunks with the same bytes. Home's teaser is
  server-rendered and adds no script; /experience ships 140.6 KB, its page chunk (the explorer
  island included) being 4.0 KB larger than Home's. The budget is inherited framework weight for
  Session 7's performance pass.
- Wire weight of the static SVG (not JavaScript): the compact teaser is 15.6 KB raw (about
  1.5 KB gzipped) in Home's HTML and again in its RSC twin, down from 31.5 KB before the review;
  the full constellation adds 36.4 KB raw / 2.9 KB gzipped to /experience's HTML.
- The served /experience HTML, fetched with `curl` and searched with `grep`, carries no private
  staging path; the e2e spec asserts the same for the served page.
- `git status` shows nothing from the private source folder.

## What the AI got wrong and how it was caught
- **Labels piled up in both clusters** on the first render (caught in the 1280 px close-up):
  stronger repulsion, a wider collision radius for labelled nodes and the placement pass fixed the
  default view; the filtered view still overlapped until every placed label blocked later ones and
  unfitted neighbour labels were suppressed.
- **The PRNG divisor, two to the thirty-second power written out as ten digits, matched the
  privacy gate's phone pattern**; caught by
  `content.test.ts`; written as `2 ** 32`.
- **`setState` inside an effect** to move the roving tab stop; caught by the React Compiler lint
  rule; replaced with the adjust-state-during-render pattern.
- **Opacity dimming failed axe colour contrast** (serious) on every dimmed entry's small mono text;
  caught by the explorer spec's axe check; replaced with `--ink-3` text.
- **The live region rendered in the server fallback too**, so the "HTML before JavaScript" test
  saw it; `status` is optional now and only the island passes it.
- **A `\d` lost its backslash** in a test written through a template string (`/^RAG, d+ entries$/`),
  so the filtered screenshots timed out; rewritten to wait on the pressed chip.
- **The amendment's "no link field" was out of date**: `roleId` exists and is set; used it and
  recorded the fact here rather than adding a redundant constant.
- **Two project slugs equal their research item's id** (`clinical-copilot`,
  `spinal-curvature-capstone`), so a test asserting the research id was absent from the entry map
  failed; it checks the entry kind now.
- **The tooltip test's "flakiness" was smooth scrolling over a longer page** (above); found by
  running the test alone four times after a full-sweep failure, then probing the tooltip's box
  over time with a scratch script (stable once in view).
- **Git Bash rewrote `/` to a Windows path** when the budget script was given the route, and a
  junctioned `node_modules` made Turbopack refuse to build the baseline worktree (`npm ci` there
  instead). Neither affected shipped code.
- **The StimMap3D timeline entry shipped without its disclaimer** (gate c), found by
  `/code-review`; the entry now carries `disclaimer` and the Timeline renders it under the line,
  pinned by a unit test, a component test and an e2e test.

### `/code-review` (2026-09-15/16)
The first run at high effort died with the session rate limit before reporting, as in Sessions
2, 3a and 4; a second run at medium effort returned eight findings, each checked against the
code or the build output and fixed:
1. **StimMap3D disclaimer missing on /experience** (above).
2. **The unlayered dim rule recoloured the title link's hover and the tooltip's label**: the
   selector now excludes `.metric-tooltip` and its children, and a second rule keeps the link's
   hover and focus colour; an e2e test hovers a dimmed link.
3. **`setInteracted` committed before Next's transition applied the URL**, so the live region
   could announce the previous filter's sentence: the state update now joins the transition
   (`startTransition`), in the explorer and in the /projects grid, which had the same pattern.
4. **The teaser inlined 31.5 KB of SVG into Home's HTML and again into its RSC payload** with
   no cap: the teaser now renders a compact variant (bare lines and circles, no hit targets or
   state attributes, the default stroke width in the stylesheet), 15.6 KB raw, and a unit test
   caps the markup at 16 KB the way the contour test caps the motif.
5. **CI never ran the explorer or projects specs**: job 2 now runs `npm run e2e:features`
   after the axe sweep (AGENTS.md updated).
6. **Teaser labels were drawn at 17 units on placements computed for 12**, so hub labels
   crossed circles: the layout places hub labels a second time at the teaser size
   (`hubLabelAt`), tested to fit.
7. **`prebuild` rewrote the committed layout on every build**, so the staleness guard could
   never fire and CI built whatever the host computed: `prebuild` now runs the script with
   `--check`, which fails the build on a diff and tells you to run `npm run layout:explorer`.
8. **Chips and the view toggle kept their 150 ms transition under reduced motion**: the shared
   chip class uses `motion-safe:`, the toggle reuses it, and the e2e reduced-motion test now
   covers every explorer button.
Cleanup candidates the review listed were taken too: the URL read/push helpers are shared with
/projects in `lib/query-filter.ts`; `skillGroups()` in `lib/project-cards.ts` serves both
filters; the pair count and the empty-node fallback are derived rather than hard-coded; the
timeline entry's unused opacity transition is gone; hover or focus lights its own neighbourhood
while a filter is on (as first written it replaced the filter's; corrected below). Of the two process notes, the timeline's 2018 start was settled by adding the degree, and the
Home JS figure stands as an unmet acceptance criterion inherited from `main` (PR body).

### `/code-review` of PR #9 (2026-09-16)
A high-effort review of the open PR returned one finding, which was confirmed in the code and
fixed:
1. **Hovering or focusing a node while a filter was on dimmed the filter's own neighbourhood.**
   The earlier cleanup lit `focus ?? active`, so on `/experience?skill=rag`, pointing at
   `pytorch` faded RAG's neighbours and edges that PyTorch does not share. That contradicted the
   component's own doc comment. `ConstellationSvg` now lights the union of both neighbourhoods
   and both nodes' edges, and only the filter decides what is dimmed. The unit test only
   checked PyTorch's neighbours, so it missed this. It now asserts the state of every node and
   edge, and it failed on the old code before the fix.
   Verification after the fix: `npm run lint` and `npm run typecheck` clean; `npm test` 114
   passed; `npm run build` clean; `npm run e2e:features` 21 passed. The first `npm run e2e:a11y`
   run had one failure, "/contact has no serious or critical violations" (light), on a page
   this change does not touch. That test then passed six of six alone, and a full rerun passed
   97 of 97. The failure is recorded here as unexplained, not as fixed.

### Constellation above the chips (2026-09-16)
Paige asked whether the graph should come before the skill chips so that it sits higher on the
page. Measured on the production build, the graph had started at 1,035 px on desktop (below a
900 px first screen) and at 1,814 px at 390 px, after 1,100 px of chips. `ExplorerView` now
renders the Skills header, the view toggle and the graph (or list) first. After that come the
chips, under a new "Filter · one skill at a time" label, the live region and the timeline, so
the chips sit directly above the entries they filter. DESIGN §7.2 does not fix an order. The
graph now starts at 540 px on desktop and at 686 px at 390 px, so it shows on the first screen
at both widths. Re-checked: lint, typecheck, 114 unit tests, build, `e2e:features` (21) and
`e2e:a11y` (97) all passed. The `/experience` screenshots were retaken; the other pages'
screenshots were not updated because their layout did not change.

### Planning docs brought up to date (2026-09-16)
Paige asked whether the prompts, plans and docs needed updating now that Session 5 is
implemented. Sessions 3a and 4 amended the plan in their own PRs, so these updates are in this PR
too:
- `IMPLEMENTATION_PLAN.md` and `SESSION_PROMPTS.md`: 2026-09-16 amendments for Sessions 3b, 6, 7
  and 8. They cover the check-only `prebuild`, which later generators must chain onto with `&&`;
  StimMap3D as a timeline entry with its disclaimer; regenerating the layout when skills change;
  filtered URLs as views, not sitemap routes; the unmet 136.6 KB Home JS budget, handed to
  Session 7 with the target kept at 120 KB; the existing filtered-page axe check; SVG weight; the
  explorer in the responsive sweep; and the smooth-scroll hover-test fix. The deployment note in §6
  now says `prebuild` checks the layout rather than generating it.
- `AGENTS.md`: the client-island list is current, and a new "Explorer" architecture bullet
  covers the layout workflow, the committed-file check, the view data, the shared chips and query
  helper, the teaser and `js-budget.mjs`. The "Tests" bullet adds the feature specs, the 1000 px
  contour checks and the smooth-scroll note.
- `README.md`: the status had not been updated since Session 2; it now lists what is merged, in
  review and still to come. It also adds `e2e:features`, the layout regeneration step and the new
  directories.
- DESIGN.md is unchanged: §7.2 already describes what shipped, and it fixes no order for the chips
  and the graph.

While reading the code for this, the agent found that `lib/content/explorer.ts` joined skill-pair keys with a
**literal NUL byte**. It worked, but `grep` and `file` treated the source as binary. The separator
is now a named constant written as the `\0` escape; the committed layout check and the
explorer tests pass unchanged. On the first attempt, GNU `sed` and then the file-edit tool each
wrote the wrong text (`0000`, then the raw byte again), so the fix was written with Node and
checked with `file`. The module's header comment also pointed at `lib/explorer-view.ts`; it now
names `lib/explorer/view.ts`.

## Paige's review notes

## Screenshots
`docs/screenshots/s5-*.png`: every route at 1280 px and 390 px (Home in both themes), plus
`s5-experience-filtered-1280.png`, `s5-experience-filtered-390.png` (`?skill=rag`) and
`s5-experience-list-1280.png`, `s5-experience-list-390.png` ("View as list").
