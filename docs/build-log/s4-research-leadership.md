# Session 4 — Capstone and thesis deep pages, Research, Leadership
- Date: 2026-09-13 · Branch: s4-research-leadership · PR: #7

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal
IMPLEMENTATION_PLAN §4 Session 4 and its 2026-09-13 amendment, on top of Session 3a: write the
capstone and thesis case studies with recreated or original figures (nothing cropped from a
source PDF), ship the thesis PDF with original page 2 removed, build /research and
/leadership from content, and reuse Session 3a's `EmbedFrame` for the valedictorian video.
S0-D was not needed and the StimMap3D page was not touched.

## What shipped
- **Capstone body** (`content/projects/spinal-curvature-capstone.mdx`): the problem, the origin
  story from SFU's article, the system as built (garment, noise-filtering firmware, live heatmap on
  a CAD torso), standards, Best Overall Project at ICAMES 2022, and the ML model and ultrasound
  brace as proposals only. Two original diagrams (the brace-fitting loop; the sensing pipeline).
  The team is credited and SFU's article is linked; no teammate is named on the site (see
  Decisions).
- **Thesis body** (`content/projects/interpretable-medical-imaging-thesis.mdx`): the question,
  induced ground truth (watermarks, not annotations), method (ResNet-34, VGG-16, five CAM methods,
  IoU at ten thresholds, paired t-tests), results with two failure cases, why it matters, and the
  supervisor credit. Three recreated figures: an original drawing of the ground-truth procedure
  and two line charts replotting the thesis's Tables 4.6 and 4.7 digit for digit. Six new
  frontmatter metrics (thresholds, images averaged, alpha, the two peak IoUs) each with the thesis
  page in its note.
- **Figure pipeline.** Plotted values and diagram steps live in `content/figures.ts`, validated by
  `IouTableSchema` / `DiagramSchema` and reached through `figures`, `iouTable()` and `diagram()`
  in `lib/content/load.ts`; their sources join `allSourceIds()`. `components/figures/DiagramFigure.tsx`
  (HTML flow, numbered markers, across the column from md up for a short linear flow) and
  `components/figures/IouChartFigure.tsx` (SVG lines with non-scaling strokes, every label in HTML
  so text keeps its size at 390 px, one accent for FullGrad and a neutral ramp with dash patterns
  for the rest, a legend, and the full table under a disclosure) are registered in `lib/mdx.tsx`
  as `Diagram` and `IouChart`, taking an id and a figure number.
- **Thesis PDF.** `public/docs/paige-rattenberry-honours-thesis-2022.pdf`, derived by
  `scripts/derive-thesis-pdf.mjs` (pdf-lib 1.17.1) from the staged original with page 2 removed:
  49 pages to 48, page 2 of the copy is the abstract. Recorded in `content/assets.json` with the
  original's SHA-256, rights, permission, `removedPages: [2]`, people and the text check. After
  the PR review (see "Review follow-up"), the script also drops the named destination to page 2,
  deletes every object unreachable from the trailer and renumbers the page labels, with a fixed
  modification date so the output is reproducible.
- **Links to documents.** `LinkSchema.url` accepts a `/docs/<file>.pdf` site path beside absolute
  URLs; `lib/content/links.ts` makes the loaders refuse one that is not a `document` in
  `assets.json`. The thesis project and research item link the derived PDF.
- **Research page** (`app/research/page.tsx`): every `content/research.ts` item newest first with
  its kind, organisation, summary through `MetricStat`, skills and links; items with a deep page
  link to it. Conference reviewing (the MLADS item, `alsoResearch: true` in `leadership.ts`) is
  listed under "Reviewing" from leadership data, not retyped. The thesis item now declares the
  project's "five" metric.
- **Leadership page** (`app/leadership/page.tsx`): every `content/leadership.ts` item newest
  first; the valedictorian item's YouTube watch link becomes a click-to-load `EmbedFrame` whose
  iframe source is derived by `lib/embeds.ts` (`youtube-nocookie.com/embed/<id>?start=2727`) while
  the always-visible link keeps the watch URL with `t=2727s`. No poster, no photos.
- **EmbedFrame** gained optional `href` (link target, default `src`) and `allow` (default
  `fullscreen`), and an embed-neutral fallback sentence. Existing tests unchanged and green.
- **Deep page**: `FrontmatterOnly` and its "written in Session 4" line are gone; the loader refuses
  a `deepPage` project without a body. `DatedEntry` (`components/ui/`) is the shared dated-list
  layout for Experience, Research and Leadership.
- **Tests** (13 files, 91; 92 after the review follow-up): deep pages have bodies and only StimMap3D has the aside; research
  `projectSlug`s resolve and repeat the project's title, dates and periods; the thesis item carries
  "five"; the peak metrics agree with the replotted tables; `/docs/` links resolve to listed
  documents; no asset comes from the capstone decks or the SFU article; any thesis asset is the
  page-2-removed derivative; shipped PDFs have their recorded page count and, when the staged original is
  present, exactly the original's pages minus the removed ones; both bodies render every metric
  once with a public source label and numbered figures with no `<img>`; the capstone page says
  "Neither was built"; the two charts render legends, tables and peak notes; /research and
  /leadership render from content with the embed mounting only on click; `youtubeEmbed` parsing;
  `EmbedFrame` `href`/`allow`/fallback; body figure numbers run 1..n after any cover.
- `LinkSchema` gained an optional `note` (a sentence shown beside a link or its embed); the
  valedictorian link carries the "full ceremony, opened at the address" caption, so the page
  holds no fact of its own. `newestFirst()` in `lib/content/load.ts` orders both dated lists.
- Screenshots: `docs/screenshots/s4-*.png` (26).

## Decisions and why
- **Teammates are not named on the site**, which Paige settled on 2026-09-15 (below). The page
  credits "a six-person team" and links SFU's article.
- **The orthotist is "an orthotist" / "our industry collaborator".**
- **The thesis supervisor is named** in the body, as `content/research.ts` already did from
  Session 2. Committee members are not named in page text; they appear in the shipped PDF's own
  acknowledgements, which `assets.json` records under `people`.
- **Recreated, not cropped.** The thesis's figure images are JPEG 2000 streams that nothing on
  this machine decodes (no `pdftoppm`, sharp without OpenJPEG), so the heatmap figures were not
  even viewed; DESIGN §3.5 forbids inventing saliency maps anyway. The two charts replot the two
  tables the thesis prints twice (4.1/4.6 and 4.5/4.7), the diagram draws the procedure §3.2–3.7
  describe in prose. The capstone diagrams follow the architecture in the decks' own diagrams
  (viewed, since their images are JPEG) but are drawn from scratch with the site's tokens.
- **Chart design.** DESIGN §4.2 allows a neutral ramp plus the one accent, so identity comes from
  dash pattern and a legend rather than five hues; FullGrad, the finding, takes the accent and the
  only markers. Static, like a figure in a paper: no hover layer (the values sit in the table
  under the plot). Y scale runs to 0.7 so the peak note in the top-right corner never touches a
  line at 390 px; the first draft put the note beside the point and it collided.
- **Figure numbers are string attributes** (`number="2"`) because this MDX compile drops JSX
  expression attributes (see "What the AI got wrong").
- **No `aside` on these pages**: it always appends the "How this site was built" link. Team credit
  and provenance are in the bodies; a test pins that only StimMap3D has an aside.
- **Site-path links stay in `url`** rather than a second field, so every existing reader keeps
  working; the loader, not the schema, checks that the document is listed, the way `cover` is
  resolved.
- **The capstone research item links the case study; only the thesis item links a PDF.** The
  SFU article link stays on the project (facts column) rather than being retyped.
- **pdf-lib is a devDependency now** (Session 6 planned it): the derivation script and the
  document test use it, and it appears in no page bundle.

## Tools and model
Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Skills: `frontend-design` and `dataviz`
before the figures and page layouts; `/code-review` at high effort on the working tree before the
PR (see "What the AI got wrong"); Playwright for axe, the projects spec, the screenshots and a
scratch script that captured every figure in both themes at 1280 and 390 px; `pdftotext` for
every citation (page by page) and for the derived PDF's text check; pdf-lib for the derivation and
for a scratch image dump used to view the capstone decks' architecture slides.

Review follow-up (2026-09-14): Claude Code, model Claude Opus 5 (`claude-opus-5`), ran
`/code-review` (high) on PR #7 and implemented the fixes below; pdf-lib scratch scripts inspected
the shipped PDF's object graph, and a Playwright scratch script measured and captured the loop
diagram.

Second review (2026-09-15): Claude Code, model Claude Opus 5 (`claude-opus-5`), ran `/code-review`
(high) on PR #7 at 38ba7bd and implemented the fixes under "Second review" below.

## Constraints, human decisions and implementation direction
- Task: IMPLEMENTATION_PLAN §4 Session 4 with its 2026-09-13 amendment; SESSION_PROMPTS Session 4.
- Constraints honoured: only INVENTORY-publishable files used as sources; nothing cropped from a
  PDF; the decks and the SFU article are not republished; the proposal PDF (mojibake, unrenderable
  here) was not used; page 2 of the thesis never ships; no third-party name in page text but the
  supervisor's; no repo links; StimMap3D untouched; the private source folder unstaged.
- Human decisions applied: the 2026-09-12 page-2 decision; the split and run order; "five" and
  "six-person" as metrics (the amendment); the 45:27 timestamp and the "graduand address within
  the full ceremony" framing (INVENTORY).
- Consent for the people thanked by name in the thesis PDF's acknowledgements: recorded in the
  inventory, 2026-09-15.
- Implementation direction: server components, plain data to the one client island, numbers only
  through `MetricStat`, facts only from `content/`, figure values in `content/`.
- **Later sessions amended (requested by Paige, 2026-09-15, after the second review).**
  IMPLEMENTATION_PLAN §4 Sessions 3b, 5, 6, 7 and 8, their prompts in SESSION_PROMPTS.md and
  AGENTS.md's architecture notes now record what this session leaves them, each checked against
  the code. 3b: a cover makes body figures start at 2; MDX drops expression attributes;
  `EmbedFrame`'s `href`, `allow` and fixed margin. 5: `researchId` and `projectSlug` pairs are one
  piece of work each; order by `periods`; reviewing is leadership data; `DatedEntry` heading
  levels. 6: pdf-lib is present; the resume needs a document record that passes
  `documents.test.ts`; no test extracts PDF text yet, and the thesis text's reviewed phone-pattern
  matches need narrow exceptions. 7: chart class weight; the new pages in the sweep; one possibly
  flaky tooltip test. 8: `public/docs/` joins the asset reconciliation.

## Generated work and rejected suggestions
- Generated by Claude Code: everything in this PR, including both bodies, the figure data and
  components, the pages, the derivation script, the asset record and the tests.
- Rejected during the session: cropping or extracting thesis figure images (forbidden, and the
  JPEG 2000 streams could not be decoded anyway); an SVG-only chart (text shrank to ~7 px at
  390 px, so labels moved to HTML); markers on every point of every series (noise); the peak
  label beside the point (collided with lines); naming the teammates (DESIGN §3.4); a separate `path` field for document links (every reader would
  change); a second dated-entry layout for Research and Leadership (`DatedEntry` is shared with
  Experience instead).
- **Left undecided by this session, settled afterwards:** the GenAI literature review PDF. The card
  said the PDF was "a Session 4 decision", but Session 4's task list covered only the thesis, and no
  decision was made or recorded. On 2026-09-15 Paige decided it ships in Session 6, whole, linked from its
  `content/research.ts` item, with no deep page. (Session 6b later gave it one.)
- **Settled afterwards:** Paige decided on 2026-09-15 that the teammates stay unnamed.

## Verification (command, result, PR/commit)
- `npm run typecheck`, `npm run lint`, `npm run format:check`: clean.
- `npm test`: 13 files, 91 tests, green (claims gate over both bodies' `<MetricStat>` references,
  a body for every deep page, research `projectSlug` resolution, document links, assets and
  privacy gates over the new files and this log).
- `npm run build`: clean; 15 routes, all static; the three `/projects/<slug>` pages SSG.
- `grep -l` for the private source folder's path prefix over `.next/server/app/**/*.html`,
  `*.rsc` and `.next/static/chunks/*.js`: no matches.
- `npm run e2e:a11y`: 97 passed, both themes (twice; a third run after the review fixes had one
  failure, the StimMap3D tooltip test on a page this session did not touch, which passed when
  re-run alone, so it is load flakiness under parallel workers). `tests/e2e/projects.spec.ts`: 7
  passed.
- `$env:SESSION = "4"; npm run e2e:screenshots`: 26 files.
- `node scripts/derive-thesis-pdf.mjs`: 49 pages to 48; `pdftotext` on the copy: page 1 title
  page, page 2 abstract, no "[ADD " text; the DESIGN §3.4 phone pattern
  matches only IoU table rows and DOI strings in the extracted text.
- `git status` shows nothing from the private source folder.
- Commits: 6bf8ba5 (content layer), 3e44645 (thesis PDF), 4cee725 (case studies and figures),
  84cf214 (Research, Leadership, EmbedFrame), 653519a (tests), 8f283dc (review fixes), then this
  log and the screenshots (356c123). PR #7. IDs after the branch rebuild below.
- Review follow-up (2026-09-14): `npm run lint`, `npm run typecheck`: clean. `npm test`: 13
  files, 92 tests (the new orphaned-object test and the page-label assertion both failed against
  the previous PDF and pass against the re-derived one). `npm run build`: clean, 15 routes.
  `npm run e2e:a11y`: 97 passed. `tests/e2e/projects.spec.ts`: 7 passed. Running
  `node scripts/derive-thesis-pdf.mjs` twice gives identical bytes; the copy has 48 page objects for 48
  pages, 666 objects all reachable, no `PTEX.FileName` entry, and labels `i, iii…viii, 1…`.
  `pdftotext` (Git Bash's `/mingw64/bin`) on the re-derived copy: page 1 title page, page 2
  abstract, extracted text identical to the previous copy's; no "[ADD " text. (The follow-up first
  recorded `pdftotext` as unavailable, having looked only on the PowerShell path.) The capstone
  screenshots were re-captured (`SESSION=4`, `-g capstone`); the loop note's left edge measures
  131.85 px against the step titles' 131.84 px at 1280 px.
- Follow-up commits: fc66b4d (PDF derivation, test, asset record, cites), e895559 (loop-note
  indent and capstone screenshots), ecc6df9 (this log), 17967fb (text check), then the
  branch-rebuild note.
- Branch rebuild (2026-09-15, Paige's choice among ranked options, run by Paige from a script
  Claude Code wrote, because Claude Code's auto-mode safety check blocks force-pushes): the branch
  was rebuilt so the commit that first ships the thesis PDF already carries the re-derived copy.
  The script checked that the final tree matched the previous tip except for one dropped build-log
  note before force-pushing with a lease. Commit IDs from the thesis PDF commit onward changed.
- Paige reviewed the Vercel preview on 2026-09-15 and reported it correct.
- Second review (2026-09-15): `npm run lint`, `npm run typecheck`, `npm run format:check`: clean.
  `npm test`: 13 files, 92 tests. `npm run build`: clean, 15 routes. `npm run e2e:a11y`: 97
  passed. `/research` screenshots re-captured (`SESSION=4`, `-g "/research @"`); /leadership
  renders as before, so its screenshots stand.

## What the AI got wrong and how it was caught
- **MDX expression attributes were silently dropped.** `<Diagram number={2} />` rendered without
  its number while `number="2"` worked; the ProjectPage tests failed on "Fig. 1" and a five-case
  probe isolated it. The bodies use string attributes and the components coerce; the reason is
  noted in `lib/mdx.tsx`.
- **PowerShell wrote a UTF-8 BOM** into both MDX files while switching those attributes; caught
  by a byte check before the next test run and stripped.
- **Prose styling leaked into the diagram list** ("1. back to the start" rendered with a decimal
  marker) because Prose's `[&_ol]` utilities outrank component-layer rules; caught in the 1280 px
  screenshot; the list resets are utilities now.
- **The chart's peak label collided with the lines** and clipped at the plot's left edge at
  390 px; caught in the figure screenshots; moved to the top-right corner with y headroom.
- **`expect.anything()` used with `toBe`** in the aside test failed on first run; rewritten as a
  boolean comparison.
- **Two thesis claims were first drafted too strongly** and corrected against the text before
  the body was committed: "the maps were noise" in the low-accuracy VGG-16 run (FullGrad still
  found the watermark, p. 29) and "significant at every threshold except the highest" as if it
  applied to both models (it is VGG-16's 90–95% only, p. 30).
- **`/code-review` (high) was cut off by the session rate limit** while orchestrating, as in
  Sessions 2 and 3a: three of its five finder angles died with the orchestrator, two (line by
  line, efficiency) completed and returned twelve candidates, each verified by hand against the
  code and the screenshots. Confirmed and fixed (commit 8f283dc):
  1. **The four-step pipeline diagram rendered as four cramped columns at 390 px.** The column
     count was an inline `grid-template-columns` applied at every width while only the gap was
     behind `md:`; the screenshot showed the words broken mid-syllable. The count is a custom
     property read only inside the md media query now, and the 390 px screenshot is vertical.
  2. **A fact in a page**: the "SFU's recording of the full ceremony, opened at the address"
     caption was JSX in `app/leadership/page.tsx` and would have captioned any future YouTube
     link the same way. It is the link's `note` in `content/leadership.ts`.
  3. **`Number(number)` could ship "Fig. NaN"** for a missing or non-numeric MDX attribute
     (MDX is not type-checked) and a table value past the chart's 0.7 scale would plot outside
     the box while the peak note still quoted it. Both components throw at build.
  4. **A cover plus a body would number two figures "1"**, since the page renders a cover as
     Fig. 1 and bodies hard-code their sequence. A content test now requires body figure numbers
     to run consecutively from 2 when the project has a cover, 1 otherwise.
  5. `key={step.title}` would collide on a repeated step title (index keys now); unrounded
     polyline floats inflated the SVG strings that ship twice (rounded to a tenth of a unit).
  6. Tests: the shipped PDF was parsed three times (memoised); a `/docs/` link test could never
     fail on its own because the loaders throw first (reduced to a sentinel); a loop
     re-rendering every deep page duplicated the per-page tests (folded in); the newest-first
     sort was written in both pages (`newestFirst()` in `load.ts`).
  Not changed, with the reason: the chart's per-node utility classes cost about 1.5–2 KB raw
  per chart per serialisation; the reviewer marked it optional and Session 7 owns the budget
  pass.

### Review follow-up (2026-09-14)
`/code-review` (high) on PR #7 returned three findings; all were confirmed by hand and fixed.
- **The removed page still shipped inside the PDF.** pdf-lib's `removePage()` only
  unlinks a page from the page tree, and `save()` writes every object in the context. The first
  copy held 49 page objects for 48 pages: the old page 2 and the objects only it used, still
  reachable through a named destination. No viewer
  showed it, and the session's checks (`pdftotext`, the page count and page sizes) only looked at
  pages in the tree, so none of them could catch it. The script now drops destinations that target a
  removed page, deletes unreachable objects (10) and refuses to write if anything still points at
  a removed page. `tests/unit/documents.test.ts` fails on any orphaned object or on a page-object
  count that differs from `pageCount`. The `assets.json` transformation that said nothing else
  changed was corrected, with a new transformation recording the re-derivation.
- **Viewer page labels were one off past page 1.** `/PageLabels` still started arabic numbering
  at index 8, so the abstract showed as "ii" and printed p. 31 as "30". The labels are now
  rebuilt from the original's minus the removed page (`i, iii…viii, 1…`), tested against the
  original when the staged original is present. The IoU figure cites said "PDF p. 39", the original's
  page; the site links the copy, where it is p. 38, so the cites and the schema comment now name
  the shipped copy's page.
- **The loop diagram's "back to the start" note was not indented.** The list's
  `[&>li]:pl-0!` reset outranked the component rule. The first fix, a `pl-[2.55rem]!` utility on
  the note, still measured 0 px, because `.x > li` outranks a single class when both are
  `!important`; the reset is now scoped to `.flow-step` items.

### Second review (2026-09-15)
`/code-review` (high) on 38ba7bd found no correctness bugs and three low findings; all were
confirmed by hand and fixed.
- **The log named a commit the branch rebuild had replaced.** It is gone from this log; the
  current commit IDs are unaffected.
- **`my-6` on the leadership video frame did nothing.** `EmbedFrame` always adds `my-8`, which
  comes later in the generated CSS. The class is removed rather than made to win, so the page
  keeps the spacing its screenshots show, and `className`'s doc comment now says margins lose.
- **The Reviewing entry's h3 outsized its section h2** on /research (`text-2xl` under
  `text-xl`). `DatedEntry` sizes an h3 `text-xl`, as Card and Experience's h3s already are.

## Paige's review notes

## Screenshots
`docs/screenshots/s4-*.png`: every route at 1280 px and 390 px (home in both themes); the two
new deep pages, /research and /leadership are the ones this session changed. In 24 of them the
footer's build hash was blanked; nothing else in any image changed.
