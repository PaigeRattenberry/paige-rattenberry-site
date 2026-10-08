# Session 7 — Accessibility + performance gates, cross-device polish

- Date: 2026-09-21 · Branch: s7-quality-gates · PR: #15

## Goal

IMPLEMENTATION_PLAN §4 Session 7 with its 2026-09-15, -16, -17 and -20 amendments: confirm the axe
sweep covers every route added since Session 1 (with the embed loaded and an explorer filter on),
add Lighthouse as CI job 3 with DESIGN §5.7's assertions, fix what Lighthouse surfaces without
relaxing a target, measure Home's JavaScript against 120 KB, sweep 360/768/1280/1920 px in both
themes, and fix the 360 px tooltip test's wait. Nothing else: no content change, no new page.

Prerequisites checked first: the 5, 6, 3b and 6b build logs are on `main` (6b merged as PR #14).

## What shipped

- **Lighthouse CI (job 3).** `lighthouserc.json` runs `/`, `/projects/stimmap3d` and `/experience`
  five times each against `next start` on port 3100, mobile preset, simulated throttling, and
  asserts performance ≥ 0.9 on the **median** and accessibility = 1, best-practices ≥ 0.95,
  SEO = 1 on the **worst** run. `.github/workflows/ci.yml` gains the job; scores go to the job
  summary (`scripts/lighthouse-summary.mjs`, since `lhci` only logs pass or fail) and the reports
  to a `lighthouse-reports` artifact. Reports are never uploaded to Lighthouse's public storage.
  `actions/checkout` and `actions/setup-node` move from v4 to v5 and `actions/upload-artifact` to
  v6; each older major runs on Node 20.
- **Self-hosted, axis-limited fonts.** `scripts/build-fonts.mjs` cuts the exactly pinned
  `@fontsource-variable` files (byte-identical to what Google Fonts served) down to the weight
  range the pages draw, keeping every glyph of Google's latin subset and Source Serif's
  optical-size axis, and writes them to `app/fonts/` with a manifest (source, axes, size,
  SHA-256) and each family's OFL text. `app/layout.tsx` loads them through `next/font/local`.
  Preloaded fonts go from **211 KB to 135 KB** on every page. Two "extras" faces (1.7 KB and
  1.2 KB) hold the three body-text characters outside the latin subset, replacing the **85 KB**
  latin-ext file that a single "ć" pulled on four pages and the 19 KB greek file a "φ" pulled on
  one. The output is committed and `prebuild` checks it (`--check`), like the explorer layout;
  job 1 on Linux reproduced the Windows bytes. Nothing visible changes (pixel comparison below).
- **Deferred layout on /experience.** `content-visibility: auto` on the Roles and Education
  sections (`.render-when-near`): layout −28 % and all main-thread tasks −12 % under a 4× CPU
  slowdown, which is what took the page's CI scores from "about 92 ± 2, failed once" to 91–98
  over ten runs. Anchors verified and pinned by a test; see Task 3.
- **Tests.** Unit 142 → 158 (`tests/unit/fonts.test.ts`: files match the manifest; the literal
  `weight` and `unicode-range` in `app/layout.tsx` match it; nothing loads from
  `next/font/google`; preloaded families under 140 KB; the Source Serif derivative carries no
  reserved name outside its copyright notice and has `opsz` 8–60 and `wght` 400–500; licences
  present). E2E: `tests/e2e/fonts.spec.ts` walks every page's text and fails on a character no
  shipped face covers, on any font request off-origin, on an extras request from a page that
  draws none of its characters, and on more than three other font files; two 360 px checks for
  the sweep's findings; the tooltip fix below. `e2e:features` runs the font spec, so CI job 2 does.
- **The 360 px tooltip flake, fixed at the wait.** See "What the AI got wrong… / found".
- **Two 360 px collisions fixed** (below), `scripts/js-budget.mjs` now prints the framework floor,
  `scripts/lighthouse-local.mjs` for machines where `lhci` cannot finish, and a `SESSION=7` mobile
  screenshot set.
- Docs: AGENTS.md (commands, CI, a Fonts bullet), README, DESIGN §4.1's loader note, the plan's
  Session 7 outcome and a Session 8 amendment, and the Session 8 prompt.

## Task 1 — axe coverage (confirmed, nothing duplicated)

`a11y.spec.ts` builds its list from `htmlRoutes`, which takes deep pages from
`deepPageProjects`, so `/projects/genai-literature-review` (6b) was already swept in both themes
along with the 404: 99 tests after this session. Axe with the embed loaded is
`projects.spec.ts` ("loads the live app only after the click", stubbed origin) and axe with a
filter on is `explorer.spec.ts` (`/experience?skill=xai`, both themes); CI job 2 runs both. Per
the 2026-09-16 and -20 amendments they are pointed at, not copied.

## Task 3 — what Lighthouse surfaced, and what moved the number

Baseline on this machine (Lighthouse 12.6.1, the version `@lhci/cli` 0.15.1 bundles; three runs):
`/` 85, 92, 88 · `/projects/stimmap3d` 90, 89, 89 · `/experience` 87, 87, 88. Accessibility, best
practices and SEO were 100 on every run, so the canonical audit passes with the origin mismatch
the 2026-09-17 amendment asked about (canonical `http://localhost:3000`, server on 3100); no
origin override was needed. CLS is 0 on all three, the embed poster included (re-check done).

**Why the simulated LCP is 3.3–3.9 s when the observed one is 0.2 s.** Lantern's LCP graph takes
every request that *finished before the observed LCP* and replays it over a 1.6 Mbps, 150 ms link.
A script is excluded only if its evaluation started after that paint. A trace of `/` shows the
first frame committed at 139 ms and React's chunk evaluated at 142 ms, but headless Chrome stamps
the paint at 217 ms (presentation), so every script, every preloaded font and even a lazy image
that loaded early counts as render-blocking. Against localhost that is everything: about 390 KB,
of which 137 KB is JavaScript and 211 KB was fonts. Roughly 18 KB costs 0.1 s. None of this
ordering is the site's doing, and on a real network the page paints long before the JS arrives
(applied DevTools throttling measured LCP 2.0–2.4 s on the same build, but with run-to-run
performance scores of 81–96, so it is not a steadier gate and the DESIGN's default stays).

A ceiling experiment with no web fonts at all scored 94–95 / 91–92 / 94, so the framework's JS
sets a floor near 3.0 s and fonts were the only large item the site controls:

| change | `/` | `/projects/stimmap3d` | `/experience` |
|---|---|---|---|
| baseline | 85, 92, 88 | 90, 89, 89 | 87, 87, 88 |
| drop Source Serif's `opsz` axis (−71 KB), **rejected** | 95, 92, 93 | 91, 91, 91 | 89, 90, 90 |
| shipped: axis-limited local fonts + extras faces | 95, 95, 95 | 92, 93, 91 | 95, 95, 95 |
| shipped, on GitHub's runner (PR #15's second CI run, three runs) | 79, 96, 95 | 90, 92, 93 | 94, 96, 93 |
| the same, five runs (a later CI run) | 85, 95, 94, 95, 95 | 87, 92, 92, 96, 91 | 91, 92, 77, 96, 87 |
| the same, five runs (the run after that) | 82, 95, 98, 95, 95 | 90, 91, 92, 91, 96 | 93, 95, 91, 93, 94 |

Each CI run's first audit of `/` (79, 85, 82) is a cold server and a cold Chrome (TBT 370–590 ms
against 50–120 ms afterwards); the median assertion exists for that, and five runs make it
sturdier. Medians on the runner: `/` 95, 95, 95 · `/projects/stimmap3d` 92, 92, 91 ·
`/experience` 94, 91, 93.

**The gate flaked once, and that was the useful result.** With five runs the next two CI runs gave
`/experience` 91, 92, 77, 96, 87 and 93, 95, 91, 93, 94, and the agent wrote here that a spurious
failure was "roughly a 3 % event". The very next run, on a commit that changed only this file,
scored 86, 88, 89, 92, 94 — median 89 — and **failed**. The estimate was wrong: the same build's
median had been 94, 91, 93, 89, so `/experience` sat at about 92 ± 2 on that runner, which is not a
margin a required check can live on. The noise is total blocking time: 26–38 ms on this machine,
95–570 ms on a shared two-vCPU VM once Lighthouse multiplies every task by four. The options were to
loosen the gate or to find real main-thread work; the gate was not touched.

**Where /experience's main-thread time goes (real 4× CPU slowdown, no network throttling).** The
largest task was not React: it was **layout**, 195 ms for the first paint and 84 ms again when the
fonts swap, then style and layout a third time when the explorer hydrates. Bisecting by hiding
sections showed nothing pathological (`text-wrap: balance`/`pretty` cost nothing measurable;
the constellation SVG about 10 ms): the cost is proportional to content — timeline about 105 ms,
Roles and Education about 85 ms — on the site's longest page (1,080 elements).

| `/experience`, median of 4–6 loads at 4× CPU | layout | style | all tasks |
|---|---|---|---|
| before | 242 ms | 107 ms | 890 ms |
| `content-visibility: auto` on the timeline's year groups **and** the two sections, **rejected** | 82 ms | 65 ms | 681 ms |
| shipped: the Roles and Education sections only | 175 ms | 87 ms | 781 ms |

The larger saving was rejected because it broke navigation: a skipped block has an *estimated*
height, and with year groups skipped above the target, `/experience#hammerspace` — the link
Home's hero uses — settled 388 to 2,592 px away from its entry, on both the direct and the
client-side path. The two sections hold the targets themselves, and scrolling to a target inside
a skipped block lays that block out first, so every anchor still lands exactly (85 px below the
top, all seven timeline links checked at 360 and 1280 px; `tests/e2e/explorer.spec.ts` pins it).
Paint containment would clip a metric tooltip that opens past a section's edge, so the rule only
applies where `overflow-clip-margin` can widen the clip; no tooltip overflows a section today.
Layout shift while scrolling the whole page measured 0. `#education` used to land under the
sticky header; both section headings now carry the entries' scroll margin.

On the runner, the ten `/experience` runs since then scored 93, 94, 91, 98, 93 and 96, 96, 92,
93, 94 (TBT 70–185 ms): none under 90, against 5 of the 18 before. Medians since the change:
`/` 95, 95 · `/projects/stimmap3d` 92, 91 · `/experience` 93, 94. `/projects/stimmap3d` is the
thin one but also the quiet one: outside each job's cold first run it has scored 91–92 every
time. A failure there would mean something real was added to the page.

**One hypothesis tested and rejected, twice.** The explorer island reads `useSearchParams`, so in
a static build React re-creates it on the client instead of hydrating the server-rendered
fallback. Replacing that read with a constant, so the island hydrates in place, changed nothing:
five Lighthouse runs each way (script evaluation 273 ms against 272 ms), and then six loads each
way under the real 4× slowdown (all tasks 775 ms against 766 ms). Session 5's Suspense design is
not the cost, and it was left alone.

Other items reviewed and left alone, with reasons:
- **Images.** The poster and figures are served by `next/image` as WebP at the 750w candidate for
  a 412 px, DPR 1.75 phone, which is the right candidate (640w is 4 px short). The byte-identical
  366 KB `visualizer.png` is re-encoded on the way out to 28 KB; the original is untouched.
- **"Legacy JavaScript" (13 KiB) and "unused JavaScript" (26 KiB)** are inside the framework's
  own chunk; Next's module polyfill file is 1.4 KB. Not the site's code.
- **Chart utility classes (2026-09-15 amendment).** Measured: 2.8 KB raw per chart, about 11 KB
  across two charts and two serialisations, but **469 bytes gzipped** in the HTML, a 19.7 KB
  transfer (measured by stripping the charts' class attributes and re-compressing), more than
  half of it `text-right` on table cells. It does not matter on the wire; not consolidated.
- **Static SVG weight.** The teaser and constellation are in the HTML document (23 KB and 30 KB
  transferred for `/` and `/experience`), unchanged; `/experience` scores as high as `/`.

## Home's initial JavaScript: 137.1 KB against 120 KB — not reachable here; target restated by Paige

`node scripts/js-budget.mjs /` → **137.1 KB gzipped** (unchanged), `/experience` 141.4 KB,
`/projects/stimmap3d` 143.7 KB. The script now also prints `build-manifest.json`'s
`rootMainFiles`, the chunks every App Router page loads before any site code: **127.3 KB**. The
site's own client code on Home is 9.8 KB (theme provider, nav, theme toggle, tooltip island,
`next/link`), so removing all of it would still leave 127.3 KB. A webpack build
(`next build --webpack`) measured 134.4 KB. The target cannot be met without leaving the App
Router (or React), which the prompt says to report rather than act on. The PR put three ranked
options to Paige: restate the target as the site's own client JS, keep 120 KB as permanently unmet,
or leave the App Router.

**Paige's decision, 2026-09-21: the first, which was the recommendation.** DESIGN §8 now reads
"site-owned client JS for `/` ≤ 15 KB gzipped", with the reason beside it. It is enforced, not
just written down: `scripts/js-budget.mjs` takes `--max-site-kb`, `npm run budget` runs it for `/`
at 15, and CI job 1 runs that after the build (checked both ways: exit 0 at 15, exit 1 at 5; it
also refuses to pass if the manifest lists no framework chunks, since a floor of zero would make
the comparison meaningless). Today's share is 9.8 KB, so the shell has about 5 KB of headroom.
This changes what is measured, on the evidence above, at Paige's instruction; total page weight
is still held by the Lighthouse performance gate, which was not touched.

## Decisions and why

- **Keep the optical-size axis.** Dropping it was the cheap 71 KB, but side-by-side screenshots
  showed the hero name and card titles losing their display cut and wrapping differently. That is
  a design change, so the bytes were found elsewhere: Google serves the same 122 KB file whatever
  weight range is asked for, but limiting the axis with harfbuzz gives 75 KB with `opsz` intact.
- **Keep every latin glyph.** Glyph-subsetting to the characters in use would save a few KB more
  and make any new character a silent fallback. Limiting axes carries no such risk.
- **Rename the Source Serif derivative.** Its copyright notice reserves the font name "Source",
  and an instanced file is a Modified Version under the OFL, so the generator rewrites the name
  table ("PR Site Serif") and leaves the notice. Inter and JetBrains Mono reserve nothing.
  harfbuzz keeps name ids 0–6 only, which drops the licence-URL record, so the OFL texts are
  copied beside the files.
- **Extras faces lead the body stack.** `--font-inter` expands to Inter *and* its metric-matched
  Arial fallback, which would supply "ć" before a later family could. Their `unicode-range` has
  no space character, so they are never a line's primary font.
- **Committed output with a `--check`,** not a build-time step: a deploy needs no WebAssembly
  subsetting, lint/typecheck/test need no pre-step, and CI proves the bytes reproduce.
- **Median for performance, worst run for the rest.** `lhci`'s default takes the *best* run, and
  `median-run` picks a "representative" run that let the baseline `/` pass on its 92; against the
  saved baseline reports, `median` fails all three routes and passes the shipped state.
- **The eight constellation labels that never fit (6b's note) are left.** They are drawn when
  their own node is active; `fit` only keeps them from piling up as lit neighbours inside the
  15-skill clique. Making them fit means re-running the force layout (moving the whole committed
  figure) or loosening the overlap threshold; the caption, chips and list view name every skill.

## Tools and model

Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Playwright (scratch scripts for the
sweep, font-usage audit, pixel comparison and a trace dump through Lighthouse's artifacts),
`@lhci/cli` 0.15.1 / Lighthouse 12.6.1, `subset-font` 2.9.0 (harfbuzzjs), `fontverter` 2.0.0,
`sharp` for image diffs, `gh` for CI; a `feature-dev:code-reviewer` agent on the branch diff
before the PR was marked ready (findings below).

## Constraints, human decisions and implementation direction

- Task: IMPLEMENTATION_PLAN §4 Session 7 and SESSION_PROMPTS Session 7, pasted by Paige.
- Constraints honoured: no target relaxed; Lighthouse against `next start`, never a preview, never
  `/resume`; the 366 KB PNG not re-encoded; no retries added for the flaky test; content untouched
  (the explorer layout `--check` passes unchanged); nothing from the private source folder staged.
- Decided by Paige during the session: the JS target (above). Left for Paige: whether the font
  approach should instead be the simpler, visible `opsz` drop.
- **Branch protection could not be set (2026-09-23).** Paige asked for it after the merge; GitHub
  refuses both the branch-protection API and a ruleset with `403 Upgrade to GitHub Pro or make this
  repository public`, because the repo is private on a free personal account. At her decision it
  moves to the launch steps (L7), on the public repository, where it costs nothing
  (IMPLEMENTATION_PLAN S0-E, amended the same day). Until then the three checks run on every PR
  but nothing enforces them.
- `npm audit` reports 10 advisories, all inside `@lhci/cli`'s dev-only tree
  (`npm audit --omit=dev`: 0).

## Generated work and rejected suggestions

- Generated by Claude Code: everything in this PR.
- Rejected during the session: dropping `opsz` (visible); glyph-subsetting to used characters
  (silent fallbacks); switching to webpack for 2.7 KB; DevTools throttling as the gate (noisier,
  and a change of method rather than a fix); `lhci`'s default best-of-N aggregation; uploading
  reports to temporary public storage; consolidating chart classes (469 bytes); re-tagging or
  re-laying-out the constellation for its unfit labels; rounding image `sizes` for a Lighthouse
  hint that ignores device pixel ratio.

## Verification (command, result, PR/commit)

| check | command | result |
|---|---|---|
| format, lint, types | `npm run format:check`; `npm run lint`; `npm run typecheck` | clean |
| unit | `npm test` | 18 files, 158 tests, green |
| fonts reproduce | `node scripts/build-fonts.mjs --check` | up to date on Windows; job 1 on Linux passed the same check |
| build | `npm run build` | clean; 23 static pages; explorer layout and fonts `--check` passed |
| axe, both themes | `npm run e2e:a11y` | 99 passed |
| features | `npm run e2e:features` | 57 passed, 1 skipped (the opt-in live embed test) |
| anchors still land | every in-page timeline link and `/experience#hammerspace`, direct and from Home, 360 and 1280 px | target 85 px below the top every time; 0 layout shift scrolling the page |
| tooltip test under load | `npx playwright test tests/e2e/a11y.spec.ts -g "tooltips stay on screen" --repeat-each=5 --workers=8` | 20 of 20 |
| new 360 px tests detect the defects | the same two tests against the unfixed components | both failed (label gap −0.7 px; title 10.7 px under the button) |
| no visual change from the fonts | pixel diff of Home, Research and the thesis page, both themes, 1280 px @2x | 0.17–0.3 % of channels differ, all anti-aliasing on large headings |
| assertions bite | `npx lhci assert` over the saved baseline reports | fails all three routes; passes the shipped reports |
| Lighthouse, local | `node scripts/lighthouse-local.mjs` | table above |
| CI | `gh pr checks 15` | three jobs green on every push but one, the Lighthouse flake described above (run ids are not written here: an eleven-digit id is phone-shaped to the privacy gate) |
| JS budget | `node scripts/js-budget.mjs /` | 137.1 KB; floor 127.3 KB; site's share 9.8 KB |
| privacy | `git status`; per-route private-staging-path e2e | nothing from the private source folder; green |

Checked by Paige after the merge (2026-09-23): she opened the Vercel preview in an incognito
window and signed in to reach it. Not checked from here: that preview (login-gated); `lhci autorun`
end to end on Windows, where chrome-launcher cannot delete its temp profile (EPERM) — CI on Linux
runs it, and `scripts/lighthouse-local.mjs` drives the same Lighthouse locally.

## Responsive sweep

Scripted over 15 URLs (every route, `/experience?skill=rag`, `/projects?tag=pytorch`, the 404) ×
360/768/1024/1280/1920 px × both themes under reduced motion: horizontal overflow, elements
outside the viewport, one `h1` and no skipped heading level, `alt` on every image, unnamed SVGs,
broken or distorted images, frames wider than the viewport, running animations, a visible focus
indicator on every focusable element, console errors and status codes. All clean. Two reports
were checked by hand and are not defects: the 10.98 px "i" is the glyph inside a labelled tooltip
button, and a constellation node's focus ring is a stroke on its dot, not an outline on the `g`.
Then read by eye at 360 px (Home, StimMap3D, thesis, capstone, Leadership, filtered Experience in
dark) and at 768/1024/1920 px (the contour-to-teaser switch at 1024 px, the centred layout).

## What the AI got wrong and how it was caught / what the session found

- **Found: the thesis charts' ten threshold labels ran together at 360 px** ("50%55%60%…"). Seen
  in the tiled screenshot; every other label is hidden below `sm`, the values table has all ten.
- **Found: the posterless video frame's title ran under its "Load the video" button at 360 px.**
  Seen in the Leadership screenshot; the title is smaller below `sm`. Neither defect widened the
  page, so no existing check could see them; each has an e2e check that fails on the old markup.
- **Found: the cause of the 360 px tooltip flake.** The tooltip opens from CSS `:hover`, `html`
  scrolls smoothly, and `hover()` scrolls first: while that animation is still running after the
  pointer arrives, the button slides out from under it and the tooltip closes — a null
  `boundingBox()` right after `toBeVisible()`, likelier on a busy machine. The test scrolls each
  button into place in one instant step and opens-and-measures as one retried step; the edge
  assertions stay outside the retry.
- **`median-run` is not the median.** The agent's first assertion config let the baseline `/` (85,
  92, 88) pass. Caught by replaying the saved baseline reports through `lhci assert` before trusting
  it.
- **The first CI run kept no Lighthouse reports**: `upload-artifact` skips hidden directories and
  `.lighthouseci/` is one. Caught when the download found nothing; `include-hidden-files: true`.
- **The first draft of this log tripped the privacy gate**: a GitHub run id is eleven digits, which
  DESIGN §3.4's pattern reads as a phone number. Caught by `content.test.ts`; runs are described, not
  numbered.
- **The font test expected the licence-URL name record**, which harfbuzz drops. Caught by the
  test's first run; the comment, the generator's header and the shipped licence files say so now.
- **The agent's first fallback order put the extras after Inter**, where Inter's Arial fallback
  would have drawn "ć" first. Caught while reading what `var(--font-inter)` expands to, before
  building.
- **The agent put a number on the gate's flakiness from too little data, and it was wrong within the
  hour** (above). Caught by CI failing on a docs-only commit. What fixed it was profiling under a
  real CPU slowdown instead of reasoning from Lantern's summary numbers.
- **The agent nearly shipped `content-visibility` on the timeline's year groups**, the variant with
  twice the saving. Caught by the check it wrote before trusting it: the anchor landed thousands of
  pixels off. It then misread its own first measurement of the *baseline* as broken too, because it
  sampled 800 ms into a 1.5 s smooth scroll; sampling over five seconds showed the baseline lands
  exactly and only the year-group variant does not.
- **A spec-level idea the agent dropped:** treating the simulated-LCP gap as something to engineer
  around (reordering scripts, switching throttling method). The trace showed it is a lab artifact;
  the honest lever was bytes.

### Found by the code review

A `feature-dev:code-reviewer` agent read the branch diff against `main` with eight named risk
areas (the sfnt reassembly and name-table rewrite, the font stack, whether the font tests can pass
vacuously, whether the tooltip retry weakens the test, `lhci` assertion semantics, process cleanup,
the privacy and claims gates, docs against code). It reported **no finding at its confidence bar**
and said why for each area; it checked `median` and `pessimistic` against `@lhci/utils`' source.
It was a static review: the agent had no shell, so it ran nothing. That is an automated review,
not Paige's. Two notes it rated below its bar were cheap to close and were taken:
- `tests/e2e/fonts.spec.ts` walked `htmlRoutes` only, so the 404 page (outside `routes` by design)
  was never checked; it is appended by hand now, as `a11y.spec.ts` does (13 tests).
- `scripts/lighthouse-local.mjs` spawns `npx` through a shell, and on macOS or Linux `server.kill()`
  would have signalled the shell and orphaned `next start`; the server gets its own process group
  there and the group is signalled. Windows already used `taskkill /T`.

A second review of PR #15 (Claude Code, Opus 5, 2026-09-21, at Paige's request; also automated,
not Paige's) read the diff and checked the built CSS. It found four things, all fixed on the branch:
- The Source Serif derivative's name table was renamed, but `next/font/local` names the served
  `@font-face` family after the loader's const, and that was `sourceSerif`: the built CSS declared
  `font-family: sourceSerif`. The const is `siteSerif` now, and `tests/unit/fonts.test.ts` fails on
  a const for `serif.woff2` that contains "source".
- `scripts/js-budget.mjs` subtracted every `rootMainFiles` entry as the framework floor, including
  any the page did not load, which would understate the site's share and let the budget pass. It
  now subtracts only the floor files the page's HTML references (all five today, so 9.8 KB stands).
- The rule "never put `content-visibility: auto` above an anchor target", in `app/globals.css` and
  AGENTS.md, was contradicted by what shipped: Roles sits above `#education`. That anchor does land
  (the explorer spec pins it), so the rule now says a block above a target needs an anchor test.
- IMPLEMENTATION_PLAN called Session 7 "shipped" while this PR is in review; it says "in review" now.

Verified locally after the fixes: lint, typecheck, `npm test` (158), `npm run build`, `npm run budget`
(9.8 KB), and the built CSS now declares `siteSerif`. The fonts, explorer and a11y specs ran four
times (128 tests each): three clean, and one run failed `in-page anchors land on their target at
360px` once. The report was overwritten before it was read, so which anchor missed is unknown, and
50 repeats of that test on 12 workers then all passed. It is recorded here as unexplained, not fixed.

A docs sweep on 2026-09-23 found one rule the session had left behind: IMPLEMENTATION_PLAN §0 still
said site fonts go through `next/font/google` and that `@fontsource` exists only for the PDF. It is
amended there (the site is on `next/font/local` over `app/fonts/`; plain `@fontsource` feeds the PDF
and the Open Graph cards). Everything else in DESIGN, AGENTS, the plan, the prompts and the README
already matched what shipped; the earlier sessions' prompts and task lists were left as the history
they are.

## Paige's review notes

## Screenshots

`docs/screenshots/s7-*.png` (37): the mobile set — every route at 390 px in both themes and at
360 px in light.
