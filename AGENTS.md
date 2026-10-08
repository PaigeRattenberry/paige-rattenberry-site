<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Shared project instructions

## What this is

Paige Rattenberry's portfolio site: Next.js 16 App Router, fully static, deployed on Vercel. The
authoritative specs are `DESIGN.md` (decisions, site map, visual direction, architecture) and
`IMPLEMENTATION_PLAN.md` (the sessions and their acceptance, one PR each; run order
S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S0-G → S8 → S9 → S9b → launch, as of 2026-10-07). Read both before starting a session; build only the session you were asked for. `SESSION_PROMPTS.md` holds the
paste-ready prompt for each session (S0-G's and S9's are kept with Paige's private notes). Amend these three files only when the user requests changes to their decisions or scope; they are also excluded from Prettier.

## Commands (PowerShell, Node 24)

```powershell
npm run dev                # next dev on http://localhost:3000 (predev renders the resume PDF first)
npm run lint               # eslint (eslint-config-next + eslint-config-prettier)
npm run typecheck          # next typegen && tsc --noEmit  (typegen creates next-env.d.ts + route types)
npm test                   # vitest run (tests/unit/**/*.test.{ts,tsx}, happy-dom); includes the publication gate
npx vitest run tests/unit/publication.test.ts    # the publication gate alone (fails without private/publication-terms.txt unless PUBLICATION_TERMS_OPTIONAL=1)
npx vitest run tests/unit/contour.test.ts        # one unit test file
npx vitest run -t "is deterministic"             # one test by name
npm run build              # next build; every route must prerender (no output: 'export')
npm run budget             # after a build: fails if the site's own client JS on / exceeds 15 KB gzipped (DESIGN §8; CI job 1)
npm run e2e:a11y           # playwright: axe over every route, both themes, against `next start`
npm run e2e:features       # playwright: the /projects filter, the /experience explorer, the Session 6 SEO specs and the font coverage spec
npm run layout:explorer    # rewrite content/generated/explorer-layout.json (prebuild only checks it)
npm run fonts              # rewrite app/fonts/ from the pinned @fontsource-variable packages (prebuild only checks it)
npm run lighthouse         # lhci autorun: what CI job 3 runs (Linux/macOS; after npm run build)
node scripts/lighthouse-local.mjs                # the same Lighthouse where lhci cannot finish (Windows); --runs=, --throttling=devtools, routes
node scripts/lighthouse-summary.mjs              # scores of the runs lhci left in .lighthouseci/, as a table
npm run resume             # render public/Paige-Rattenberry-Resume.pdf from content/ (prebuild and pretest run it)
npx tsx scripts/fetch-build-stats.ts             # by hand only (D6): rewrite content/generated/build-stats.json from GitHub (gh auth token)
npx tsx scripts/derive-build-story-images.ts     # by hand: re-crop the /how-this-was-built gallery from docs/screenshots/
node scripts/render-pdf-pages.mjs public/Paige-Rattenberry-Resume.pdf docs/screenshots s6-resume-page   # PDF pages to PNG
node scripts/capture-stimmap3d.mjs   # re-capture the live StimMap3D screenshots (by hand, never the build)
npm run e2e:screenshots    # playwright: docs/screenshots/s<N>-*.png; $env:SESSION = "<N>" first
npx playwright test tests/e2e/a11y.spec.ts -g "skip link"   # one e2e test
npm run format             # prettier --write .
```

Playwright's `webServer` runs `next start` on port 3100 (`E2E_PORT` overrides), so **run
`npm run build` before any e2e command**; a `next dev` on 3000 is never used by the specs.
First time on a machine: `npx playwright install chromium`. CI (`.github/workflows/ci.yml`) runs
job 1 (lint, typecheck, test with the `PUBLICATION_TERMS` secret written to a file, build, JS
budget; in Paige's two repositories a run without the secret fails, except a pull request from a
fork, which skips the private half, as does any run in a fork), job 2 (build, a11y spec, then the projects, explorer, SEO
and font specs) and job 3 (build, `lhci autorun` from `lighthouserc.json`: five mobile runs each
of `/`, `/projects/stimmap3d`, `/experience` and `/how-this-was-built` against `next start`; performance ≥ 0.9 on the
median, accessibility 1, best-practices ≥ 0.95 and SEO 1 on the worst run; scores go to the job
summary, reports to the `lighthouse-reports` artifact). Never point Lighthouse at a Vercel
preview (`noindex`) or at `/resume` (a redirect).

## Architecture

- **Static only.** All routes are prerendered by `next build`. Dynamic segments use
  `generateStaticParams` + `dynamicParams = false`. No route handlers, no serverless functions;
  `/resume` is a `redirects()` entry in `next.config.ts` (307 to `/Paige-Rattenberry-Resume.pdf`,
  the path in `lib/resume.ts`).
- **Server components by default; client islands are small and explicit** (`ThemeToggle`, `Nav`,
  `MetricTooltips`, the `/projects` filter grid, the `/experience` explorer, `EmbedFrame`). Build-time work (contour paths, git
  last-updated date) runs in server components and passes plain data down.
- **Theme:** `next-themes` with `attribute="data-theme"` and `enableSystem`. Tokens live in
  `app/globals.css`: light values on `:root`, dark values under `[data-theme="dark"]` only, exposed
  to Tailwind via `@theme inline`. Tailwind's `dark:` variant is remapped with `@custom-variant`.
  Do not add a `prefers-color-scheme` media query for tokens; it would override an explicit light
  choice. One accent (teal). Fonts: Source Serif 4 (display), Inter (body), JetBrains Mono (data),
  exposed as `--font-display`, `--font-body`, `--font-mono`.
- **Fonts (Session 7):** `next/font/local` over the committed files in `app/fonts/`, which
  `scripts/build-fonts.mjs` cuts from the exactly pinned `@fontsource-variable` packages (the
  bytes Google Fonts serves): every glyph of Google's latin subset, the weight axis limited to
  what the pages draw (serif 400–500 with its optical-size axis kept, Inter and mono 400–700),
  135 KB preloaded instead of 211 KB. `prebuild` runs it with `--check`; `npm run fonts` rewrites
  the files and `manifest.json`. A weight outside those ranges clamps, so widen the range in the
  script before using one. Source Serif reserves its font name, so the derivative's name table is
  renamed and the loader's const is `siteSerif` (`next/font/local` names the served `@font-face`
  family after the const, so a const holding the reserved name would put it back; a unit test
  fails on one); each family's OFL text sits beside the files. There is no latin-ext or greek file any
  more: the body-text characters outside the latin subset ("ć", "ğ", "ƒ", "φ") come from two tiny
  "extras" faces that lead the body stack with their own `unicode-range`, and since Session 8 a
  third leads the mono stack ("ć", "ğ", "ƒ" in the build logs' code spans). A new such character
  fails `tests/e2e/fonts.spec.ts`; add it to `INTER_EXTRAS` (or `MONO_EXTRAS` for code text), run
  `npm run fonts`, and update the literal `unicode-range` in `app/layout.tsx` (the font loader
  only accepts literals; `tests/unit/fonts.test.ts` holds them to the manifest). A character no
  subset of the family has goes on the spec's `SYSTEM_FONT_SYMBOLS` list ("→", "≤", "≥" and a few
  more from the build logs). Headings have no extras face. The manifest's digests are base64,
  because a hex digest can hold a phone-shaped digit run. Why bytes matter: Lighthouse's simulated LCP counts everything that finished loading
  before the first paint, which against localhost is every script and font.
- **Deferred rendering (Session 7):** `.render-when-near` (`app/globals.css`) puts
  `content-visibility: auto` on /experience's Roles and Education sections, because layout was
  that page's largest main-thread cost and Lighthouse's TBT on CI's two-vCPU runner is 4× whatever
  the page really costs. Two rules: put it on nothing **above** an in-page anchor target unless an
  anchor test proves the target still lands (a skipped block has an estimated height; with the
  timeline's year groups skipped, `/experience#hammerspace` landed up to 2,600 px off; Roles sits
  above `#education` and lands — `explorer.spec.ts` pins both), and
  only where `overflow-clip-margin` applies, since paint containment would otherwise clip a metric
  tooltip at the block's edge. To find main-thread cost, profile under a real CPU slowdown
  (CDP `Emulation.setCPUThrottlingRate`), not from Lighthouse's summary.
- **Routes list once:** `lib/routes.ts` holds serializable route metadata shared by Header and
  Playwright; its deep project routes come from `deepPageProjects` in `lib/content/load.ts`, and
  its build-log routes from `buildLogs` (Session 8), the same lists `generateStaticParams` reads,
  so there is no second slug list (Playwright resolves the
  `@/` alias, so specs can import it). Each route has a `kind`: `page` (HTML) or `redirect`
  (`/resume`, which lands on the PDF). `htmlRoutes` is what the axe sweep, the screenshots and
  the sitemap cover; the nav renders a redirect as a plain anchor so the client router never
  fetches a PDF as a page, and `seo.spec.ts` checks the redirect and the PDF instead. Header
  passes plain navigation data to Nav. Filesystem/MDX loaders stay server-only
  (`lib/content/project-files.ts` reads MDX relative to `process.cwd()`; the bundler rewrites
  `__dirname`).
- **Content is the single source of truth.** Every fact (names, links, dates, metrics) comes from
  `content/`, validated by the zod schemas in `lib/content/schema.ts`. Pages and components import
  content **only** from `lib/content/load.ts` (plus `sourceLabel` from `lib/content/sources.ts`),
  which parses every module at import; an ESLint
  `no-restricted-imports` rule forbids `@/content/*` outside `lib/content/`. Components never
  hard-code facts. Projects are `content/projects/*.mdx`: frontmatter (validated by
  `ProjectFrontmatterSchema`, merged into `ProjectSchema`) is the card and deep-page data, the body is
  the case study. A card whose facts already live in `content/research.ts` sets `researchId` and may
  not retype them; `mergeResearch` replaces such a card's `metrics` with the item's, so a number its
  body renders is declared on the research item, whose `summary` must then contain it. Three
  projects are featured and four have deep pages (Session 6b: the literature review has a page
  without being featured). A research item carries a `theme`, the `/research` group it is listed
  under (order in `RESEARCH_THEME_IDS`, headings in `lib/content/labels.ts`), and `/research` finds
  an item's deep page with `deepPageForResearch()`, through the item's `projectSlug` or the card's
  `researchId`, so the pairing is typed once. Skill labels also print in the resume's skills lines
  and decide label placement in the explorer layout, so relabel with `--check`. Every link a project publishes — `links` and the aside's own `aside.links` —
  passes `assertPublishableLinks` in `lib/content/projects.ts`: a `github.com` URL must sit inside a
  repository `_source/INVENTORY.md` has cleared (`CLEARED_REPOSITORIES`; today the public StimMap3D
  repository alone), and a `kind: "repo"` link must be a cleared URL exactly, not a path inside one.
  Bodies render numbers only as `<MetricStat value="…" />` referring to a frontmatter
  metric (`lib/mdx.tsx`); `Figure`, `Callout`, `Diagram`, `IouChart` and `Screenshot` are also
  available in MDX. `Diagram` and `IouChart` take an id into `content/figures.ts` (plotted values and
  diagram steps, zod-validated, reached through `load.ts`); `Screenshot` takes an image `path` in
  `assets.json` and reads its alt text and dimensions from there, so a picture cannot ship without
  its provenance record, plus a caption and a reader-facing `source` it refuses if that names
  `_source/`. This MDX compile drops JSX expression attributes, so write
  `number="2"`, never `number={2}`. A cover is Fig. 1 and a test makes body figure numbers follow it;
  on a page with an `embed` the frame is Fig. 1 with the cover as its poster, and the body still
  starts at 2.
  Link `url`s are absolute, or a `/docs/<file>.pdf` site path that `lib/content/links.ts` requires to
  be a `document` in `assets.json`. `/projects` filters by
  `?tag=<skill id>` through a `Suspense`-isolated island whose fallback is the same grid server-rendered.
  `components/embed/EmbedFrame.tsx` is the reusable click-to-load iframe (poster, load button, always
  visible new-tab link with optional `href`, optional `allow`, optional `posterSizes`, `number` and a
  `loadedFrameClassName` the frame takes only after the click, timeout fallback; no error event exists
  for iframes). It is a client island, so a server component passes it a narrowed
  `{ path, alt, width, height }` poster literal, never an `assets.json` record: every field of a
  client island's props is serialized into the page payload, and an asset carries its `_source/`
  staging path and permission memo. `components/ui/DatedEntry.tsx` is the dated-list layout for Experience, Research and
  Leadership. The shipped thesis PDF is derived by `scripts/derive-thesis-pdf.mjs` (pdf-lib; original
  page 2 removed along with every object only it used); `tests/unit/documents.test.ts` checks each
  listed document's page count, title and object graph, but not its text.
- **Explorer (Session 5):** `lib/content/explorer.ts` derives one entry per piece of work from roles,
  projects, research items and the degree (`researchId`, `projectSlug` and `roleId` pairs merge into one
  entry with the union of skills) plus the skill co-occurrence graph. `scripts/layout-explorer.ts`
  (d3-force pinned exactly, seeded, fixed ticks) writes `content/generated/explorer-layout.json`,
  which is committed; `lib/content/explorer-layout.ts` validates it against the graph at import, and
  `prebuild` only runs the script with `--check`. Any content change that adds, removes or re-tags a
  skill on an entry needs `npm run layout:explorer` and the regenerated file in the same commit.
  Chain later generators onto `prebuild` with `&&` rather than replacing it. `lib/explorer/view.ts`
  turns the derivation into plain `ExplorerData` (source labels, not ids) for `Explorer`, whose
  Suspense fallback is the same `ExplorerView` server-rendered; the order is constellation or list,
  then `FilterChips` (shared with `/projects`), then the timeline. `?skill=` is read and pushed
  through `lib/query-filter.ts`, as `?tag=` is on `/projects`. The Home hero shows the static
  `ConstellationTeaser` from `lg` (a unit test caps its markup at 16 KB, since it ships twice) and
  the contour motif below that. `node scripts/js-budget.mjs <route>` reports a built route's
  initial JS, gzipped, beside the framework's floor (`rootMainFiles`, 127.3 KB) and the site's own
  share (`MSYS_NO_PATHCONV=1` in Git Bash). DESIGN §8 budgets that share on `/` at 15 KB
  (9.8 KB today); `npm run budget` enforces it in CI job 1. The shell's islands count on every page.
- **Resume PDF (Session 6):** `scripts/build-resume.tsx` renders `content/` with
  `@react-pdf/renderer` into `public/Paige-Rattenberry-Resume.pdf` (git-ignored; `predev`,
  `prebuild` and `pretest` run it, so run `npm run resume` before a bare `vitest` or `next build`;
  a deploy must use `npm run build`). `scripts/load-env.ts` is imported first and calls
  `@next/env`'s `loadEnvConfig` (development files under `predev`, production files otherwise),
  so the PDF reads the same env files as the `next` command it precedes (imports are hoisted;
  inline loading would run too late).
  No name, date, link, number or bullet is typed in the script; only the section headings and
  the skill-line order are, layout copied from the resume of record (except the projects
  heading, widened in Session 9 to "Computer vision, AI research & engineering projects" for this
  site's own entry, since a second heading would cost the two-page fit), the way
  `lib/content/labels.ts` keeps display labels outside content. What it prints is decided in
  content by `resume.include` on projects (with `resume.bullets`, or the project's own bullets,
  the first `resume.firstBullets` of them when set, so no bullet is typed twice; and
  `resume.org`, the line under the title when no research item supplies one, else the
  tagline), research items and leadership items,
  `resumeDetail` on certifications (the shorter line the PDF prints in place of `detail`), plus
  `profile.summary`, the roles, the skills vocabulary, the degree and the certifications. Fonts
  are the `@fontsource` woff files (v5 ships no TTF); react-pdf has no fallback across families,
  so text outside the latin subset ("ć", "ğ") is given the latin-ext face by `runs()`, and a
  character in neither subset fails the build. react-pdf 4.9 quirks found by bisecting: a
  `lineHeight` on the page style suppresses render-prop text (the page number), and a unitless
  `lineHeight` on a text style without its own `fontSize` is scaled by the default size (18), so
  every line height sits next to an explicit font size. The script fails on more than two pages
  (the overflow is written beside the output as `*.overflow.pdf`), sets direct metadata strings
  and deletes pdfkit's orphan objects so the file passes `tests/unit/documents.test.ts`.
  Its `assets.json` record pins `revision` to the commit whose generator and content the PDF
  reflects; when a change alters what the resume prints, update it in a follow-up commit.
  `scripts/pdf-graph.mjs` is the one pdf-lib reachability walk, used by every generator and by
  that test, so what the generators delete and what the gate accepts never diverge.
  `tests/unit/resume.test.ts` is the resume gate (page count, key strings, phone pattern,
  `[ADD ` placeholder, the redirect in `next.config.ts`). The site origin comes from
  `NEXT_PUBLIC_SITE_URL` through `lib/site.ts`; unset, the PDF omits the site line.
- **Documents:** every PDF under `public/docs/` and at the root is a `document` in `assets.json`.
  `tests/unit/documents.test.ts` checks page count, PDF title, the object graph, and, with
  `pdf-parse`, that no page holds `[ADD ` or a DESIGN §3.4 phone-shaped string (the pattern lives
  once in `tests/unit/helpers/privacy.ts`); the reviewed IoU-row and DOI matches in the thesis
  and the literature review have page-specific exceptions in `REVIEWED_MATCHES`, each of which
  still rejects a phone number typed as its own token. `scripts/derive-literature-review-pdf.mjs` copies the GenAI
  review whole (title metadata set, one orphan object dropped). The sitemap lists HTML pages only.
- **Build story (Session 8):** `/how-this-was-built` and one page per build log under it.
  `lib/content/build-log.ts` reads `docs/build-log/*.md` (title, date, the first paragraph of
  `## Goal`, and the PR number when the log records one; a log without a title, date or goal fails
  the build), and `renderMarkdown` in
  `lib/mdx.tsx` renders a log as plain Markdown, sending relative links to the log pages or to the
  public repository. The page's own words are `content/build-story.ts`: the transparency lists, the
  one public-repository URL constant (not a project link, so `assertPublishableLinks` never sees
  it), the synthesis and the gallery. The synthesis's counts are never typed: each category lists
  its items with the log each came from, and `tests/unit/build-story.test.ts` checks that every
  log named exists and every quote is in its log word for word. The history numbers are the
  committed snapshot `content/generated/build-stats.json` (D6, counts and dates only), written
  by hand by `scripts/fetch-build-stats.ts` and never by a build. The gallery images are crops of
  committed screenshots by `scripts/derive-build-story-images.ts`, each with an `assets.json`
  record whose repository provenance names the screenshot. PR numbers are plain text. A new
  build log appears on the page and in the sitemap by itself; it needs a `## Goal` paragraph.
  Its page leaves out an empty `## Paige's review notes` heading (Session 9b); the file keeps it.
- **SEO (Session 6):** `metadataBase` and every absolute URL come from `lib/site.ts`; each page
  wraps its metadata in `canonical(path, …)` from `lib/seo.ts` (bare path, so filtered views
  share the page's canonical URL). `app/sitemap.ts` and `app/robots.ts` derive from
  `htmlRoutes`; `app/opengraph-image.tsx` and `app/projects/[slug]/opengraph-image.tsx` render
  `lib/og/card.tsx` with the site's fonts (`lib/og/fonts.ts`), prerendered at build; the home
  page carries a schema.org Person from `personJsonLd()`. `app/favicon.ico` is the icon SVG
  rasterised once with sharp (CSS variables substituted); regenerate it if the icon changes.
- **Metrics:** measured results, rankings and substantive counts are `{ value, label, source, note? }` stored next to the text that
  contains it, and rendered through `MetricStat` (usually via `TextWithMetrics`, which wraps each
  value in a verbatim sentence). Source ids need a reader-facing label in `content/sources.ts`,
  and a non-`_source/` id must also be a literal in `SourceIdSchema`.
  `MetricStat` and `TextWithMetrics` are pure and take a `MetricView` (value, label, note, source
  *label*) produced on the server by `metricViews()` in `lib/content/sources.ts`, so a source id
  (possibly a `_source/` path) never reaches a component, a client island or the page payload.
  The single `MetricTooltips` island in the root layout keeps open tooltips on screen and closes
  them on Escape. `tests/unit/content.test.ts` is the claims gate
  (declared metrics sourced, labelled and present in their associated text, not proof of source
  support or page rendering) and part of the privacy gate (public text including build logs;
  managed images/documents/root PDFs ⇔ `assets.json`); a new content host must be added to
  `allMetrics()`/`allSourceIds()`/`allSkillRefs()` in `load.ts` and to the "every declared metric occurs in its associated content text" test (`profile.summary`, the resume's opening paragraph, is one such host). Dates and identifiers do not
  need metric objects. Review prose claims against originals, including spelled-out counts; add
  explicit MDX claim references and targeted rendering checks when building deep pages. Source
  tooltips use public labels, never private file paths.
- **Hero motif:** `components/hero/contour.ts` traces iso-lines of a fixed scalar field with
  marching squares at build time (deterministic). `HERO_FIELDS` holds a landscape field and a
  short band for small screens; a unit test caps their path data together at 6.5 KB, because the
  App Router ships every server-rendered node twice (HTML and RSC payload) and DESIGN §4.3 allows
  15 KB on the wire. The grid rounds up past the viewBox so lines reach every edge.
  `ContourField` is a static server component. No perpetual decorative animation.
- **Tests:** unit tests in `tests/unit/` (Vitest + Testing Library; `next/navigation` is mocked
  in component tests). `publication.test.ts` is the publication gate (see "Publication rules" below). E2E in `tests/e2e/`; `helpers.ts` forces a theme by seeding
  `localStorage.theme` before navigation. `a11y.spec.ts` also checks
  360–1920 px header bounds in both themes at normal/doubled text size, intermediate-width
  overflow, and that every metric tooltip stays on screen at 360 px; its contour checks run at
  1000 px, where the motif still shows. `explorer.spec.ts` covers the explorer's URL sync,
  back/forward, invalid values, list view, keyboard, reduced motion and axe on a filtered page;
  `projects.spec.ts` covers the `/projects` filter, the StimMap3D embed (nothing is requested from
  the live origin before the click; the origin is stubbed, so CI does not depend on a third-party
  deployment, and an opt-in `LIVE_EMBED=1` test loads the real one) and one per-route check that no
  `_source/` path reaches any served HTML page; `seo.spec.ts` covers the `/resume` redirect
  and the PDFs, the sitemap, robots.txt, the Open Graph images, per-page metadata, the JSON-LD
  and the icons. `screenshots.spec.ts` with `SESSION=6` also saves the two Open Graph images. `html` has `scroll-behavior: smooth`, so a
  hover test far down a page scrolls its target into view in one instant step first.

## Conventions (from IMPLEMENTATION_PLAN.md §0; apply to every session)

- **Definition of Done (global):** `npm run build` clean; zero console errors; the three CI jobs (build
  + tests, axe, Lighthouse) green; Vercel preview URL works in an incognito window; claims gate and
  privacy gate pass (DESIGN §3.3–3.4); a build-log entry exists for the session.
- **Branch and PR discipline:** one branch per session (`s1-scaffold`, `s2-content-core`, …), small
  commits, PR against `main` via `gh pr create`, body maps work to the session's acceptance list and
  gives PowerShell verify steps. **Never merge in-session**; Paige merges.
- **Plan-first:** read DESIGN and the relevant implementation-plan section, state a concise plan,
  then use relevant available capabilities (design review, code review, browser automation,
  security review). No model-specific slash command or plan-mode tool is required.
- **Build-log entry (every session):** `docs/build-log/sN-<name>.md` with this template:

  ```markdown
  # Session N — <name>
  - Date: YYYY-MM-DD · Branch: sN-<name> · PR: #<n>
  ## Goal
  ## What shipped
  ## Decisions and why
  ## Tools and model (model only when actually known)
  ## Constraints, human decisions and implementation direction
  ## Generated work and rejected suggestions
  ## Verification (command, result, PR/commit)
  ## What the AI got wrong and how it was caught
  ## Paige's review notes   (filled in by Paige at merge; leave the heading)
  ## Screenshots            (docs/screenshots/sN-*.png)
  ```
- **Screenshots:** capture with Playwright at 1280 px and 390 px widths into `docs/screenshots/`.
- **Gates that never regress:** (a) claims gate: every metric has a source; (b) privacy gate: no
  `_source/` file committed, no `_source/` path in any served page (a client island's props are
  serialized into the payload, so it gets a projected view, never a manifest record), no phone
  number, `assets.json` provenance for every asset; (c) StimMap3D
  disclaimer wherever StimMap3D is shown or embedded (its card, deep page, embed, timeline entry,
  Open Graph card and resume entry; a passing mention in narrative prose such as About does not
  carry it, amended 2026-09-21 at Paige's request); (d) both themes, keyboard operable, reduced-motion honored;
  (e) no facts hard-coded in components.

### `_source/` is read-only and untracked

`_source/` holds Paige's PDFs, documents and photos and is git-ignored. Read it (start with
`_source/INVENTORY.md`, which says what may be published and who appears in each file) but never
commit anything from it. Two approved exceptions to "read-only", both still never committed:
`INVENTORY.md` itself is the ledger a prerequisite step fills in (S0-D did, 2026-09-20), and
Session 3b wrote its live-app screenshot captures to `_source/stimmap3d/` so they have a staged
original (DESIGN §3.5, amended 2026-09-20); `node scripts/capture-stimmap3d.mjs` is that capture,
run by hand and never by the build. Nothing else in `_source/` is written by an agent.
Assets are copied into `public/` only after being listed in
`content/assets.json` with media-specific metadata, rights/permission evidence and transformation notes. Before every commit, `git status` must not show
`_source/` or `private/`. Every staged file has a lower-case slug name (Paige renamed them in
place on 2026-09-30, S0-G decision D1; the bytes and their recorded digests are unchanged). No phone number anywhere in the tree; check with the DESIGN §3.4 pattern
`\(?\d{3}\)?[ .-]*\d{3}[ .-]*\d{4}`, never the real number.

### Facts only from `content/`

Role titles, dates and numbers are copied verbatim from the resume into `content/` with a source,
and rendered from there. If a fact is not in `content/`, add it there first; do not type it into a
component or page.

### Review follow-up rules (2026-09-13)

- Only resume-level Hammerspace detail appears, on Experience; anything more is a content change
  Paige approves.
- Assets use the image/document union in lib/content/schema.ts. Staged provenance records the source
  path and revision; repository provenance records source id, URL, file and full commit SHA.
  Always record rights, permission, transformations, people and consent. Images need alt/dimensions;
  PDFs need title, mediaType, pageCount and removedPages. A schema-valid fixture is not clearance.
- The real StimMap3D screenshots were validated in Session 3b (2026-09-20): one copied byte-identical
  from the public repository with repository provenance at a full commit SHA, five captured from the
  live app with staged provenance. See `docs/build-log/s0d-stimmap3d.md` and
  `docs/build-log/s3b-stimmap3d-embed.md`. Validate the actual thesis derivative in
  Session 4: remove original page 2, inspect the resulting PDF and record the transformation. Extract
  shipped PDF text for privacy/placeholder checks; inspect images/signatures too. The current regex
  is one check, not a complete privacy review; source and full-history reviews remain launch work.
- Replot experimental results only from recorded values, citing the source figure/page. Never invent
  measurements or saliency maps. Label conceptual drawings as illustrations; use prose when exact
  outputs cannot be reproduced. Use available PDF text extraction and page rendering tools; visually
  inspect image-only pages or broken extraction instead of guessing from unreadable text.
- Before adding generators, define deterministic generation before artifact-dependent tests and use
  npm run build for deployment. For URL filters, prerender core content; isolate useSearchParams in
  a small Suspense boundary if used. Test direct URLs, clear, back/forward and invalid filters in production.
- Preserve historical Claude-only logs. Credit the Codex review as review, and this follow-up as
  implementation. Attribute Paige's decisions only when confirmed; record task, constraints, design,
  implementation direction and evaluation with actual evidence. Leave Paige's review notes for Paige.
- Current checks are build/tests (including the publication gate since S0-G), axe and (since
  Session 7) Lighthouse. Record checks that cannot be completed (such as an authenticated preview
  inspection) without implying they passed.

### Publication rules (S0-G, 2026-09-30)

Public text states what was built, how, with which tools, and what went wrong, and nothing else
about the site; it never names a private repository other than the site's own
pre-launch archive, `PaigeRattenberry/paigewebsite`; never names a private file or local path
(content records, their tests and the derive scripts keep lower-case slug staging paths for
provenance, and `_source/INVENTORY.md` is named where an agent must be told where the inventory
is); and never records third-party consent beyond "recorded in the inventory, <date>". Read
Paige's private notes if present.

- "Public text" is every committed file (specs, `AGENTS.md`, `README.md`, build logs, code
  comments), every PR title and body, every branch name and every commit message. Cite a staged
  source by its reader-facing label (`content/sources.ts`) and page, never by file name. A
  clearance question goes to Paige outside GitHub; the PR records only "cleared by Paige, <date>".
- Tool credits name the product and model exactly ("Claude Code, Opus 5.5", "Codex review"); the
  `Co-Authored-By` and `Claude-Session` trailers stay. A credit sentence states only who did
  what. A redaction removes a sentence or replaces a path with a label, and never removes a
  credit or re-attributes a decision. A build log that lost text carries one note,
  "(redacted for publication, <date>)" (every date it was cut, joined with "and"), as its own
  paragraph under the header lines and above `## Goal`, never inside a section (amended 2026-10-02
  at Paige's request; `build-story.test.ts` holds it). In a pasted prompt, a section that lost text
  is marked once. Replacing a path with a label is not a loss.
  The specs and this file are amended in place instead; `DESIGN.md` and `IMPLEMENTATION_PLAN.md`
  carry one S0-G note at the top saying so.
- Build logs are rendered on `/how-this-was-built`, whose per-route check rejects the string
  `_source/`, so a build log never contains it at all.
- `tests/unit/publication.test.ts` enforces the mechanical part under `npm test`: no local
  path (a drive, home-folder, `$env:USERPROFILE`, `%USERPROFILE%`, `$HOME` or `~` path; build
  launch-step paths from the checkout, as IMPLEMENTATION_PLAN §6 does) and no `_source/` path with
  a segment that is not a lower-case slug in any tracked text file, and no term from Paige's
  private list (`private/publication-terms.txt`, git-ignored, found from a linked worktree too;
  in CI the `PUBLICATION_TERMS` secret). The pre-rename staged file names are terms in that list,
  one exact term each, so they are caught in any form; the shape check only covers `_source/`
  paths. Both kinds of term match across a line break (a regex term's spaces and `\s` match the
  same separator run as a literal's). A missing list fails `npm test` unless
  `PUBLICATION_TERMS_OPTIONAL=1` (CI sets it where the secret cannot exist: a fork's runs and a
  pull request from one); a list must carry every section in `SECTIONS`, and an unknown header
  fails the load. After changing the list, re-set the secret (IMPLEMENTATION_PLAN §6, L1). In
  the public repository it also scans every commit message (paths, staged names, terms, trailer
  addresses). It reports a hit by `file:line` and term index only (`termHits` in
  `tests/unit/helpers/publication.ts`, which every private-term check uses) and never prints the
  term or the text it matched.
  The gate's own patterns have tests; extend them when you widen a pattern.
  The gate cannot catch a breach of these rules in new words, so they are read every session.
- **Two repositories (D3).** `PaigeRattenberry/paigewebsite` is private and stays private as the
  pre-launch archive: never change its visibility, and never add another repository as its remote.
  At launch its tree is seeded as one commit into `PaigeRattenberry/paige-rattenberry-site`
  (IMPLEMENTATION_PLAN §6), where all later sessions run. `private/` (Paige's notes) and
  `_source/` are git-ignored in both.
