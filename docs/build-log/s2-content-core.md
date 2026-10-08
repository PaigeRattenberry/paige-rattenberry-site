# Session 2 — Content model, Home, About, Experience
- Date: 2026-09-12 · Branch: s2-content-core · PR: #3

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal
Turn the Session 1 shell into a site that says something true: a typed `content/` tree that
every page renders from (DESIGN §3.1), the claims and privacy gates as tests, a `MetricStat`
that gives every number a source, and three pages — Home (passing the DESIGN §1 30-second
test at 1280 px), About and Experience.

## What shipped
- `content/`: `profile.ts` (positioning line, "Currently", skills strip, headshot ref),
  `experience.ts` (six roles, Samsung included, resume wording verbatim), `education.ts`,
  `certifications.ts`, `skills.ts` (48 ids in the four DESIGN §3.2 categories), `research.ts`
  (seven items) and `leadership.ts` (five items) as data for Session 4, `projects.ts` (card data
  for the three deep pages, the Session 3 frontmatter seed), `about.ts` (five paragraphs),
  `assets.json` (the headshot, with consent, alt text and the sharp treatment recorded).
- `lib/content/`: zod 4 schemas (`schema.ts`), loaders that parse every module at import
  (`load.ts`), a `sourceLabel()` that throws on an unlabelled id (`sources.ts`; the label map
  itself is `content/sources.ts`), and whole-token metric placement (`metrics.ts`). Pages
  import only from `load.ts`; an ESLint rule forbids raw `@/content/*` imports elsewhere.
- `tests/unit/content.test.ts`: claims gate (every metric has a source, every source id has a
  label, every metric is rendered in its own text, About carries no digits, the featured
  projects equal the deep-page routes), skills-in-vocabulary, assets provenance both ways, the
  DESIGN §3.4 phone pattern over every text file under `app/ components/ content/ lib/ public/`
  (binaries skipped by a NUL-byte check and strict UTF-8 decoding), and a check that every
  staged-source reference exists when the private source folder is present.
- `components/ui/MetricStat.tsx` (value in mono + an `i` button whose `role="tooltip"` is wired
  with `aria-describedby`; shown on hover and keyboard focus; server component) and
  `TextWithMetrics.tsx` (a verbatim sentence with each declared number routed through
  `MetricStat`). `Card` now clips only its cover so tooltips can escape a card.
  `MetricTooltips.tsx` is one client island in the root layout with document-level listeners:
  it shifts an open tooltip back inside the viewport and closes it on Escape, so each metric
  stays server markup.
- Home: hero (name, positioning line, three CTAs, built-in-the-open line, contour field),
  three "Selected work" cards with one-line proofs (StimMap3D's disclaimer on its card),
  "Currently", skills strip. Small screens get a 640×300 band field composed from the same
  scalar field through a new `window` option on the generator; the budget test caps both
  fields together at 6.5 KB of path data (~13 KB measured on the wire, SVG markup plus RSC
  props, against the 15 KB DESIGN §4.3 budget).
- About: the five paragraphs beside the headshot (`next/image`, 220 px). Experience: the
  Session 5 explorer slot, every role (dates / org / location column, title + team, bullets,
  tags), then education and certifications.
- `tests/e2e/a11y.spec.ts`: contour checks filter the visible field; a new test opens a metric
  tooltip by keyboard focus, closes it on blur, opens it on hover, keeps it open with the
  pointer on it and closes it with Escape; two more open every tooltip on `/` and
  `/experience` at 360 px (by focus and by hover) and assert it stays on screen; nine more
  assert no horizontal overflow on `/`, `/about` and `/experience` at 360, 390 and 1280 px.
  44 checks, all green.
- Screenshots: `docs/screenshots/s2-*.png` (28 files, including the 1280×800 first screen in
  both themes as the 30-second-test evidence).

## Decisions and why
- **Resume headings are split into `title` + `team`** and rendered "Title, Team". The resume
  prints an en dash between them, DESIGN §0 gives the comma form for Hammerspace, and the dash
  is a formatting choice; storing the halves keeps both renderings possible.
- **Bullets keep the docx em dashes.** `pdftotext` prints them as `--`; the first draft turned
  those into en dashes and the review caught it (below). Headings keep the en dash the resume
  prints between title and team.
- **Metrics are objects, not numbers in prose.** `{ value, label, source, note? }` lives next
  to the text that uses it, and `TextWithMetrics` wraps the first occurrence of each value, so a
  bullet stays verbatim and still carries a source per figure. A test refuses a metric nothing
  renders, which is why the thesis IoU figures wait for Session 4.
- **Source labels are a lookup, not the file path.** Tooltips say "Resume, revised
  2026-09-11" or "GIAC GMLE exam grade report", not staged file paths; every id used must have
  a label (tested), and every staged-source id must be a real file when the private source
  folder is present.
- **The About narrative has no numbers**, tested. Everything numeric lives on a page that renders
  it through `MetricStat`, and the About test only allows digits inside `StimMap3D`, `BM25F` and
  `M365`.
- **The home CTA stays "Resume"** (Session 1 review call 2, Paige's verdict) rather than the
  session prompt's "Download resume"; it becomes accurate as a download in Session 6.
- **Skills strip is flat on the home page**, grouped by category only in the vocabulary. The
  grouped version cost ~50 px that the 30-second test could not spare; Session 5's explorer is
  where the categories earn their space.
- **Education and certifications are on the Experience page.** The spec lists only roles, but
  the data existed and "full work history" reads as including the degree. Flagged in the PR as
  removable.
- **`content/projects.ts` exists now** so the three home cards read from content rather than the
  page; Session 3 moves the same fields into MDX frontmatter.
- **Paige's answers to the PR's "facts I was unsure about" list (2026-09-12).** Each item was
  first checked against the staged sources. The changes:
  - **SEC595 issuer** is "SANS Technology Institute": Paige took it for credit through
    SANS.edu's graduate program. The certificate names only the SANS OnDemand program.
  - **About:**
    - The course-project sentence no longer says it "became" StimMap3D. The sources only say
      TMS runs through both.
    - The Egypt passage now says the tour group waved from the bus, as the speech does, not
      that the bus waved.
    - The closing "I still think that is the job." is gone. It was not in the speech and had
      been written in Paige's voice.
  - **The GIAC Advisory Board invitation** is no longer a Leadership item; it stays in the GMLE
    line as the resume words it.
  - **Capstone skill tags** lost `medical-imaging` (it measured pressure; no imaging) and
    `python` (no source says so).
  - **StimMap3D's `typescript` and `claude-code` tags** stay. It declares TypeScript in
    `web/package.json` and was built with Claude Code.

  Unchanged:
  - **Multi-Modal AI date** is still the placeholder "2021 – 2022". It needs the month from
    Paige's Coursera Accomplishments page.
  - **Google Intensive** stays "2025". The stored April month is unconfirmed and only affects
    the Session 5 timeline.
  - **Everything else on the list** was already settled.
- **Plan mode was not entered.** This session ran autonomously (the user was not present to
  approve a plan), so the plan was written as the first message instead and followed as written.

## Skills / tools used
- Plan (written in the first message, not plan mode; see above).
- `frontend-design` skill before composing the hero, About and Experience layouts. Its
  calibration list flags mono data labels and hairline rules as generated-page tells; DESIGN §4
  asks for exactly those, and the brief wins. What it did change: no numbered markers on the
  three cards (not a sequence), no eyebrow labels, and the skills strip lost its category
  labels on the home page.
- `pdftotext` on the resume of record, the LinkedIn snapshot and the valedictorian speech.
- `sharp` (already in `node_modules`) for the one-off headshot treatment INVENTORY prescribes;
  no build script depends on it.
- Playwright for the a11y gate, the screenshot set, and a throw-away spec that captured the
  1280×800 first screen in both themes; the screenshots drove three layout fixes (below).
- `/code-review` at high effort against `main` before opening the PR (findings below).

## What Claude got wrong and how it was caught
- **Three multi-file shell writes silently never landed.** Heredocs containing apostrophes
  ("Paige's") failed to parse in the shell wrapper, so the schema, loaders and all nine content
  files were missing after the first batch. Caught by the module-not-found diagnostics on
  `load.ts`; rewritten with the Write tool.
- **A `perl` substitution mangled a test file** (a `$1` in the replacement text). Caught by
  printing the file straight after; the file was rewritten whole.
- **The first hero failed the 30-second test.** At 1280×800 the "Selected work" cards began at
  y≈685 and their proof lines were cut off. Caught by the first-screen screenshot; fixed by
  tightening hero spacing, moving the figure caption into the hero's corner, flattening the
  skills strip, and shortening two proof lines. The re-capture shows all three proofs.
- **The small-screen field was a crop again.** The first attempt honoured the letter of the
  Session 1 verdict (a 640×900 portrait field) but showed it through a 160 px band, i.e. the
  middle sliver of a tall field: the exact problem the verdict named. Caught in the 390 px
  screenshot; the field is now 640×300 with its own window over the loops, shown whole in an
  aspect-ratio box above the name.
- **`Required<ContourOptions>` broke** once `window` became an option. Caught by typecheck;
  `CONTOUR_DEFAULTS` now satisfies `Required<Omit<ContourOptions, "window">>`.
- **The About "no digits" test tripped on real names** (StimMap3D, then BM25F). Caught by the
  test itself; names are stripped before the check.
- **The tooltip used `font-sans`**, Tailwind's default stack rather than the site's body font.
  Caught in the Experience screenshot; now `font-body`.
- **The tooltip e2e test tried to move focus to a heading**, which is not focusable, so the
  tooltip never closed. Caught by the failing assertion; the test blurs the button instead.
- **Two thesis metrics (IoU 0.53 / 0.560) were declared but rendered nowhere.** Caught by the
  "every metric is rendered" test on its first run; removed until Session 4 renders them.
- **"Coursera (DeepLearning.AI)"** appeared as an issuer with no staged source behind it. Caught
  on re-reading the content against INVENTORY; now "Coursera".
- **`/code-review` (high, against `main`) was cut off by an API rate limit while verifying**,
  after eight review angles had produced 22 deduplicated candidates. The candidates were
  recovered from the agent's transcript and verified by hand. Confirmed and fixed:
  1. **Horizontal scroll at phone width.** Every `grid-cols-12 gap-x-8` (hero, About,
     Experience, "Currently") needs 11 × 2rem of gaps, more than a 390 px container holds,
     so the page scrolled sideways; the full-page screenshots never showed it. Gaps now apply
     from `md` only, and a new e2e test asserts `scrollWidth === clientWidth` on `/`, `/about`
     and `/experience` at 360, 390 and 1280 px.
  2. **The hidden tooltip widened the page.** `visibility: hidden` boxes still count toward
     scrollable overflow, so a 16 rem tooltip anchored under a metric near the right edge
     pushed `scrollWidth` past the viewport before anything was hovered. It is `display: none`
     until hover or focus (same e2e test).
  3. **Bullets were not verbatim.** The docx uses em dashes inside bullets (pdftotext prints
     `--`); I had substituted en dashes and documented that as a "typographic change". Restored
     from `word/document.xml`; headings keep their en dashes as the resume prints them.
  4. **Metric matching had no token boundary.** `"5%"` would attach inside `"95%"`, and a
     metric whose first occurrence overlapped another was silently dropped. `findMetric` now
     matches whole tokens and `splitByMetrics` moves to the next occurrence; the claims-gate
     test uses the same matcher.
  5. **GMLE printed its name, issuer and dates twice** (fields plus the verbatim resume line).
     `detail` now carries only the trailing clause.
  6. **`priority` on `next/image` is deprecated in Next 16** (bundled docs); now
     `loading="eager"`.
  7. **`sourceLabel()` fell back to the raw id**, so an unlabelled staged-source path could
     have reached a public tooltip; it throws. The label map itself moved to
     `content/sources.ts`, since its dates are facts.
  8. **Raw `@/content/*` imports** remained in the layout, header, footer, contact page and a
     test, bypassing the schema; all go through `lib/content/load` now, and an ESLint
     `no-restricted-imports` rule (checked with a probe file) forbids the pattern outside
     `lib/content/`.
  9. **StimMap3D named on About without its disclaimer** (CLAUDE.md gate (c) says "wherever
     StimMap3D appears"). About now renders a `Callout` for any project with a disclaimer
     whose title occurs in the prose.
  10. **The "Fig. 1" caption overprinted the hero text at 768 px** once it was absolutely
      positioned; it is in-flow at `md` and absolute only from `lg`, where it fits one line.
  11. **The tooltip trigger was ~11 px** with `cursor: default`; now 1.25em at 0.68em with a
      `::before` hit area and `cursor: help`, and its two long class strings moved to
      `globals.css` so each metric ships less markup twice.
  12. **Contour bytes.** The reviewer measured the shipped SVG markup plus RSC props at ~16.8 KB,
      over DESIGN §4.3's 15 KB, because wrappers add ~15% to the path data the test counts.
      The landscape grid is now 28 px (7 levels); measured in `.next/server/app/index.html`:
      8.7 KB of SVG and 4.3 KB of RSC props, ~13 KB, and the test caps path data at 6.5 KB.
  13. Smaller: `bullet.slice(0, 40)` keys replaced by index keys for static lists; the Card
      cover radius is now `--radius-md − 1px` so it sits flush inside the border; `Thumbs.db`
      and `.DS_Store` are skipped by the assets test; `currentRole` throws unless exactly one
      role is ongoing; the headshot lookup moved into the loader; the duplicated entry layout
      on Experience is one `Entry` component and the three tag lists are one `TagList`.
  Not changed, with the reason: the band field is generated rather than cropped because
  Paige's Session 1 verdict chose option 1 explicitly; `honours`, `year`, `featured` and
  `deepPage` stay because DESIGN §3.1–3.2 specify them; `research.ts` repeats thesis and
  capstone wording next to its `projectSlug` cross-references so Session 4 can render the
  Research page without reaching into projects (a resume-wording fix must be applied in both
  files; noted for Session 4).
- **A second `/code-review` (high, on PR #3) found four more.** Each was checked against the
  code before fixing:
  1. **Tooltips ran off the screen on phones.** A 16 rem tooltip anchored at a number's left
     edge overflowed for any number past ~130 px from the left at 360–390 px (e.g. `220+` at the
     end of the first Hammerspace bullet), and tapping it scrolled the page sideways. The
     earlier overflow test only measured with every tooltip closed. `MetricTooltips` now sets
     `--metric-shift` to pull an open tooltip inside a 16 px gutter; the new e2e test fails
     against the old code on exactly that bullet.
  2. **Tooltips failed WCAG 1.4.13** (gate (d)). `pointer-events: none` plus the gap below the
     line meant the pointer could not move onto the tooltip, and nothing dismissed it. The
     tooltip is now hoverable, a `::before` bridges the gap, and Escape sets `data-dismissed`
     until the pointer or focus enters the metric again.
  3. **The hero lines stopped short of the right edge.** The grid was floored to whole cells,
     and cell 28 does not divide 1200 (nor 24 divide 640 on the band), leaving a 24- and
     16-unit blank strip where the mask is opaque. The grid now rounds up and the SVG clips the
     sub-cell overshoot; per-axis cell sizes were tried first and rejected because fractional
     grid coordinates pushed path data to 7.4 KB, over the 6.5 KB cap (rounding up: 6.3 KB).
     The contour test now asserts a line reaches the right edge. The home screenshots were
     re-captured, including both 1280×800 fold captures (again with a throw-away spec: 1280×800
     viewport, reduced motion); all three proof lines still show without a scroll.
  4. **`splitByMetrics` could still drop a metric.** Moving an overlapped metric to its next
     occurrence could jump past a third metric, which was then skipped (e.g. `CodeLlama-7B`,
     `7B`, `220+` on `"CodeLlama-7B x 220+ y 7B"`). It now takes, at each step, whichever
     remaining metric occurs earliest after the last span; a unit test covers that case. No
     current content triggered it.

## Paige's review notes

## Screenshots
`docs/screenshots/s2-*.png`: every route at 1280 px and 390 px (26 files), plus
`s2-home-1280-fold.png` and `s2-home-1280-fold-dark.png`, the 1280×800 viewport captures that
show the DESIGN §1 30-second test passing without a scroll.
