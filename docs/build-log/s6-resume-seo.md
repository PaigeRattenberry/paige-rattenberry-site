# Session 6 — Resume PDF from the single source of truth + SEO, Open Graph images, sitemap
- Date: 2026-09-16 · Branch: s6-resume-seo · PR: #10

## Goal
IMPLEMENTATION_PLAN §4 Session 6 with its 2026-09-15 and 2026-09-16 amendments, run after
Session 5 per the run-order change (S0-D and Session 3b not required): generate the resume PDF
from `content/` at build, gate it with tests, ship the GenAI literature review PDF, turn `/resume`
into a redirect, and add `metadataBase`, per-page metadata, the sitemap, robots.txt, Open Graph
images, JSON-LD and a favicon. The StimMap3D page was not touched; its OG image renders from
frontmatter and Session 3b re-checks it once the `cover` exists.

## What shipped
- **Resume generator** (`scripts/build-resume.tsx`, @react-pdf/renderer 4.9.0): a two-page
  Letter PDF in the resume of record's section order (header and summary, technical work
  experience, computer vision & AI research projects, AI leadership & research contributions,
  technical skills, education and certifications) with the site's fonts (Source Serif 4 for the
  name, Inter for text, JetBrains Mono for dates, section heads and the footer) and the teal
  accent as the section rule in place of the resume's blue bars. Every line is a field from
  `lib/content/load.ts`; what is printed is decided in content: `resume.include` on projects
  (with `resume.bullets` or the project's own bullets), and new `resume.include` flags on research
  and leadership items. Contact line: email, LinkedIn, GitHub and the site host (when
  `NEXT_PUBLIC_SITE_URL` is configured), then the location. Deep-page projects link to their
  page when the origin is known. The StimMap3D heading carries the disclaimer (gate c).
  `prebuild` chains it after the explorer layout check with `&&`; `pretest` runs it too, so
  `npm test` checks the file the build ships. The output is git-ignored; more than two pages
  fails the build and writes the overflow beside the output for inspection.
- **Content**: `profile.summary` (the resume's opening paragraph, verbatim, with its `220+` as
  a metric) and its host in the claims-gate test; `resume: { include }` on every research and
  leadership item (the podcast and valedictorian items say `false` because the education bullets
  already state them; the thesis, capstone, Stryker, review and hackathon items say `false`
  because a project card or a role prints them); the capnography card's `resume.include` set to
  `false` because the resume prints that work under research contributions, as the resume of
  record does.
- **Resume test** (`tests/unit/resume.test.ts`): page count ≤ 2 (pdf-lib); name, email,
  Hammerspace, StimMap3D, every role title, every included project title and the StimMap3D
  disclaimer present (pdf-parse); the DESIGN §3.4 phone pattern absent; no `[ADD ` placeholder;
  the file is a listed `document` with a repository provenance and the recorded page count;
  `/resume` is the one redirect route and `next.config.ts` sends it to the PDF path.
- **Literature review PDF** (`public/docs/paige-rattenberry-genai-interpretability-review-2024.pdf`,
  10 pages) copied whole by `scripts/derive-literature-review-pdf.mjs` (pdf-lib): the only
  content change is the `/Title` the Word export lacked (every shipped document needs one for
  the documents test), plus a fixed modification date and one unreachable empty `/Names`
  dictionary dropped. Recorded in `content/assets.json` with the original's SHA-256, rights,
  permission, `people: ["Paige Rattenberry (author)"]`, `removedPages: []` and the text check;
  linked from the `genai-literature-review` research item as a `/docs/` link. No deep page and
  no figure lifted out (Paige, 2026-09-15).
- **Document text checks** (`tests/unit/documents.test.ts`, pdf-parse 2.4.5): every listed PDF
  has its recorded page count in text extraction, no page holds `[ADD `, and every phone-shaped
  match must fall on a reviewed page and fit that page's shape (IoU rows on thesis pages 35, 37
  and 38; DOI, arXiv and page-range strings on thesis pages 47–48 and review pages 9–10). The
  resume PDF is checked the same way with no exceptions.
- **`/resume` redirect** in `next.config.ts` (307 to `/Paige-Rattenberry-Resume.pdf`, the path
  in `lib/resume.ts`); `app/resume/page.tsx` deleted. `lib/routes.ts` routes now carry
  `kind: "page" | "redirect"` with `htmlRoutes` for the axe sweep, the screenshots and the
  sitemap; the nav, the footer and the home hero render the resume link as a plain anchor so
  the client router never prefetches a PDF as a page.
- **SEO**: `lib/site.ts` (`NEXT_PUBLIC_SITE_URL`, then Vercel's production hostname, then
  localhost), `metadataBase`, Open Graph defaults and the Twitter card type in the root layout;
  `canonical()` in `lib/seo.ts` gives every page a canonical URL on the bare path (filtered
  views share it); `app/sitemap.ts` (HTML pages only, `lastmod` from the last commit)
  and `app/robots.ts`; `app/opengraph-image.tsx` and `app/projects/[slug]/opengraph-image.tsx`
  rendering `lib/og/card.tsx` (kicker, title, description, accent rule, site host, and the
  disclaimer as a footnote where a project has one) with the fontsource woff files; schema.org
  Person JSON-LD on Home from `personJsonLd()` (name, role, positioning, email, links, current
  employer, alma mater, headshot, location); `app/favicon.ico` rasterised once from `icon.svg`.
- **Tests and specs**: `tests/e2e/seo.spec.ts` (redirect status and target, the PDF served as
  application/pdf with two pages, every resume link points at `/resume`, both `/docs/` PDFs
  served, sitemap lists exactly the HTML routes with no PDF, robots allows and names the sitemap,
  both OG images are 1200 × 630 PNGs, unique title and description plus canonical, `og:image`,
  `twitter:card` and `twitter:image` per page, the JSON-LD Person, the icons);
  `a11y.spec.ts` and `screenshots.spec.ts` sweep `htmlRoutes`; with `SESSION=6` the screenshot
  spec also saves the two OG images. `npm run e2e:features` now includes the SEO spec.
- **Docs**: `.env.example` explains the origin fallbacks; README and AGENTS.md record the
  commands, the route kinds, the generator, the document checks and the SEO pieces;
  `scripts/render-pdf-pages.mjs` renders a PDF's pages to PNG for the screenshots.
- Screenshots: `docs/screenshots/s6-*.png`: every HTML route at 1280/390 (Home in both themes),
  `s6-og-home.png`, `s6-og-projects-stimmap3d.png`, `s6-resume-page-1.png`, `s6-resume-page-2.png`.

## Decisions and why
- **The fallback rule was not applied.** The generated layout fit two pages after tuning and
  reads as a resume, so the hand-made PDF (which still carries both `[ADD ` placeholders) was
  never needed and no corrected export was requested.
- **Fonts are woff, not TTF.** @fontsource v5 ships woff and woff2 only; react-pdf reads woff
  (fontkit) and Satori accepts woff, so the plan's "TTF" became the woff files. The subsets are
  split into separate files, and react-pdf has no fallback across families, so `runs()` gives
  every character outside the latin subset (`ć` in the supervisor's name, `ğ` in Boğaziçi) the
  latin-ext face of the same family; a character in neither subset fails the build rather than
  print a box.
- **What the resume prints is a content decision, not a script rule.** Rather than derive "which
  research items are already covered by a project" in the script, research and leadership items
  carry `resume.include`, and the capnography card's flag is `false` with a comment. The
  generator's only judgement calls are presentation: the organisation line under a project is
  its research item's `org` when one pairs with it, else the card's tagline; certifications are
  grouped by issuer, one bullet each; skill lines follow the resume's order (full-stack, agentic,
  ML, then tooling).
- **The site line is omitted when the origin is unknown** rather than printing localhost or a
  placeholder, which the resume test forbids. Production will print the host once
  `NEXT_PUBLIC_SITE_URL` is set in Vercel.
- **The PDF is generated, not committed.** react-pdf embeds a creation date, so the bytes differ
  per run; `prebuild` and `pretest` regenerate it, and `assets.json` records it with repository
  provenance pinned to the commit whose generator and content it reflects (the fixture in
  `assets.test.ts` already modelled this record).
- **The sitemap lists HTML pages only** (DESIGN §5.2): `/resume` is a redirect and the two
  `/docs/` PDFs are documents reached from the pages that link them.
- **307, not 308**, for `/resume`: a permanent redirect would be cached by browsers and search
  engines against a file name that may still change.
- **One OG layout** for the site card and the project cards, light palette only: Satori draws a
  fixed image, and the paper background reads on both light and dark network surfaces.
- **The literature review ships with a title set.** The plan says "as-is", but the documents
  test requires a PDF title and the Word export had none; setting `/Title` is recorded as the
  one transformation, and the page-size and page-label checks prove the pages are untouched.
- **pdf-lib rewrites the resume once** after react-pdf renders it: pdfkit leaves an empty
  dictionary and a stray producer string outside the object graph and stores every info value as
  an indirect object, so the documents test's orphan check failed until the metadata was
  re-written as direct strings and the unreachable objects dropped.

## Tools and model
Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Skills: `/code-review` (high) on the
working tree before the PR; Playwright for the SEO spec, the axe and feature sweeps and the
screenshots; pdf-parse for text extraction and page rendering (no poppler on this machine beyond
`pdftotext` in Git Bash, which was used for the first per-page phone-pattern scan); pdf-lib for
the derivation, the object-graph checks and the resume post-processing; sharp (transitive, one
off) for the favicon. Versions installed: @react-pdf/renderer 4.9.0, @fontsource/source-serif-4
5.3.0, @fontsource/inter 5.3.0, @fontsource/jetbrains-mono 5.3.0, pdf-parse 2.4.5 (pdf-lib 1.17.1
and tsx 4.23.13 were already present).

The PR #10 review, its fixes and the plan and prompt updates that followed: Claude Code, model
Claude Opus 5 (`claude-opus-5`), with `/code-review` (high).

## Constraints, human decisions and implementation direction
- Task: IMPLEMENTATION_PLAN §4 Session 6 with its 2026-09-15 (resume fallback file, pdf-lib,
  documents test, literature review) and 2026-09-16 (`prebuild` chaining, filtered views are not
  routes) amendments; SESSION_PROMPTS Session 6.
- Constraints honoured: content only through `lib/content/load.ts`; no facts in the script or
  components; no route handler; the private source folder untouched and unstaged; the StimMap3D page untouched;
  no phone number and no `[ADD ` placeholder in any shipped PDF; the `[ADD ` assertion kept exactly
  as specified; no figure lifted from the review; the sitemap and canonical URLs use bare paths.
- Human decisions applied: the approved fallback file is named but was not needed; the review
  ships whole with no deep page (2026-09-15); `prebuild` chained with `&&` (2026-09-16).
- Implementation direction: generate at build, test the generated file, keep every URL derived
  from one origin, prerender the OG images, keep HTML pages and documents apart in every sweep.

## Generated work and rejected suggestions
- Generated by Claude Code: everything in this PR.
- Rejected during the session: committing the generated PDF (non-deterministic bytes, and the
  build regenerates it anyway); a route handler for `/resume` (a serverless function); a separate
  `twitter-image` (Next derives the Twitter image from the OG image); downloading full TTFs from
  Google Fonts (network at build, 3 MB of binaries) instead of the fontsource subsets; deriving
  the "already printed elsewhere" rule for research items in the script instead of a content
  flag; transliterating `ć` and `ğ` (facts are verbatim); a 308 redirect; listing the PDFs in the
  sitemap.
- Open for Paige: whether the resume should also print the certification `detail` lines (the
  SEC595 line restates its completion date because both `dates` and `detail` carry it); whether
  the OG cards should use the dark palette instead.

## Verification (command, result, PR/commit)
- `npm run lint`, `npx tsc --noEmit`, `npm run format:check`: clean.
- `npm test` (`pretest` renders the PDF first): 16 files, 124 tests, green (114 before this
  session; new: 8 resume tests, 2 document text tests).
- `npm run build` (`prebuild` runs the layout check then the generator, which reports
  `public/Paige-Rattenberry-Resume.pdf: 2 pages, 38 KB`): clean; 21 static pages including
  `/opengraph-image`, the three `/projects/[slug]/opengraph-image` routes, `/robots.txt` and
  `/sitemap.xml`, all `○`/`●` (prerendered), no `ƒ`.
- `npx playwright test tests/e2e/seo.spec.ts`: 10 passed. Its first full run failed the
  per-page metadata test on every page below the root: `canonical()` set `openGraph.url`, and a
  child segment's `openGraph` replaces the parent's whole, dropping the root image (see "What
  the AI got wrong"). Fixed and re-run: 10 passed.
- `npm run e2e:features` (projects, explorer, SEO): 31 passed (21 before this session); run
  again after the review fixes: 31 passed.
- `npm run e2e:a11y`: 95 passed (97 before: `/resume` is no longer an HTML route, so its two
  themed scans are gone; the redirect and the PDF are checked in the SEO spec instead).
- `$env:SESSION = "6"; npm run e2e:screenshots`: 26 passed, 28 files (24 route captures, the two
  OG images, and the two resume pages rendered separately).
- `node scripts/render-pdf-pages.mjs public/Paige-Rattenberry-Resume.pdf docs/screenshots
  s6-resume-page 1.6`: two PNGs, inspected (both pages full, page numbers `1 / 2` and `2 / 2`).
- `node scripts/derive-literature-review-pdf.mjs` twice: identical bytes
  (SHA-256 `45089a4a…b50508`); `pdftotext` and pdf-parse over all 10 pages: no `[ADD `, no email,
  no phone-shaped string except the DOIs and one page range on pages 9–10.
- After the review fixes: a `.env.local` with `NEXT_PUBLIC_SITE_URL=https://paigerattenberry.vercel.app`
  makes the generator print `site paigerattenberry.vercel.app` and the contact line carry it; a
  value without a scheme fails with the message naming the variable; both derivation scripts
  re-run on the shared graph module reproduce the committed bytes (`git status` clean).
- After the PR #10 review fixes: `npm run lint`, `npm run typecheck`, `npm run format:check`
  clean; `npm test` 17 files, 127 tests, green; `npm run build` clean; `npx playwright test
  tests/e2e/seo.spec.ts` 10 passed.
- `git status` shows nothing from the private source folder; the generated PDF is ignored.
- **With the real origin (2026-09-17).** Paige added `NEXT_PUBLIC_SITE_URL` in Vercel as a
  Config (not Secret) variable for Preview and Production, value
  `https://paigerattenberry.vercel.app`. An empty commit (2b54b68) rebuilt the PR #10 preview,
  since no Vercel CLI is installed here; the deployment succeeded and Paige confirmed the site
  line now appears on the preview's `/resume` PDF and looks right. The preview itself is
  login-gated, so the rest was checked against a local `npm run build` with the same origin in
  `.env.production` (deleted afterwards), served with `next start`:
  - Both OG images render 1200 × 630 PNGs with `paigerattenberry.vercel.app` on the host line,
    the StimMap3D card keeping its disclaimer footnote.
  - The home page's canonical link, every `og:`/`twitter:` URL, all 13 `sitemap.xml` entries
    and the `Sitemap:` line in `robots.txt` use that origin.
  - The resume PDF's link annotations: the three deep-page projects point at the site, plus
    mailto, LinkedIn, GitHub and one Kaggle link.
  - Both PDF pages rendered to PNG and read, then the extracted text diffed against
    the hand-made resume of record, revised 2026-09-11. Every role, title, date,
    bullet and number matches; the differences are the content decisions above (contact line with
    GitHub, site and city; projects newest first with the record's "Additional AI/ML Exploration"
    group split into its items; StimMap3D's disclaimer and tagline in place of the record's
    subtitle and `[ADD LIVE URL]`; Rostrum/HealthTech and FAISAL as two dated entries; the fuller
    skills, certifications and education lines that `content/` carries).
- Not checked here: the Vercel preview's own pages (login-gated), and Lighthouse (Session 7).

## What the AI got wrong and how it was caught
- **The first render overflowed to three pages** and the second to four; caught by the
  generator's own page-count guard. The type scale and spacing were tuned from rendered PNGs.
- **The page number never rendered**: react-pdf 4.9 draws no render-prop text when the page
  style carries a `lineHeight`; found by bisecting the document against a minimal reproduction
  (both orders of fixed elements, style arrays, fonts, hyphenation, metadata all passed there).
  Line heights moved onto text styles, which then exposed the second quirk: a unitless
  `lineHeight` on a text style with no `fontSize` of its own is multiplied by the default size
  (18), so bullets rendered three lines apart. Every line height now sits beside an explicit
  font size. Both quirks are recorded in AGENTS.md.
- **react-pdf's CommonJS build cannot be required under tsx**: `@react-pdf/hyphenate` exports
  `./en-us` to `import` only. The script loads react-pdf with a dynamic `import()` and builds the
  document once the module is in hand.
- **The file-writing tool decoded `U+0000`-style escapes into raw bytes**, leaving a literal NUL
  in the script's regular expressions (the same failure Session 5's log records); caught by
  `file` reporting the script as binary. The subset ranges are now parsed at run time from
  `@fontsource/inter/unicode.json`, so the source holds no escape sequences at all.
- **The favicon came out black**: librsvg ignores the icon's CSS custom properties; caught by
  inspecting the rendered pixels. The light palette is substituted before rasterising.
- **The literature review had no PDF title**, so "copy as-is" would have failed the documents
  test; caught by that test. One transformation, recorded.
- **The resume PDF failed the orphan check twice**: first for pdfkit's two stray objects, then,
  after the sweep, for the producer string that pdf-lib's own `load()` in the test orphans when
  it rewrites the producer over an indirect value. Direct metadata strings fixed it.
- **The DOI shape in the document test needed both separators optional** (one DOI fragment in
  the review's references has no separator between its first two digit groups); caught by the
  test on its first run. The first draft of this log then quoted that fragment, and the privacy
  gate's own scan of `docs/build-log/` caught it, as DESIGN §3.4 says it must.
- **The per-page metadata test loaded thirteen pages in one browser test** and hit the 30 s
  timeout; it now reads the prerendered HTML through the request fixture.
- **The Playwright PDF check counted `/Type /Page` in the raw bytes**, which pdf-lib packs into
  object streams; it now loads the body with pdf-lib.
- **Every page below the root lost its Open Graph image** once `canonical()` added
  `openGraph.url`: Next replaces a parent's `openGraph` object with the child's rather than
  merging, so the file-convention image from `app/opengraph-image.tsx` vanished from /about and
  the rest while the home page (same segment) kept it. Caught by the SEO spec; `canonical()` now
  sets only `alternates.canonical`, and the spec asserts an `og:image` on every page.
- **Shell heredocs with certain content were rejected or mis-terminated** by the tool twice; the
  edits were re-run as scripts written to the scratchpad.
### `/code-review` (2026-09-16)
A high-effort review of the working tree (after commits 85987e8 and 1100aff) returned nine
findings; each was checked against the code and fixed:
1. **`process.loadEnvFile` ran after `lib/site` was evaluated**: tsx hoists imports, so a
   `.env.local` never reached the generator and the PDF omitted the site line while the HTML
   used it. Env loading moved to `scripts/load-env.ts`, imported first; verified with a
   `.env.local` set and unset.
2. **A stale `*.overflow.pdf` from a failed run survived later good runs** and would have been
   served and failed the root-PDF reconciliation; the script now removes it at start.
3. **`next dev` had no hook**, so a fresh checkout's Resume link redirected to a 404: `predev`
   renders the PDF too, and the README notes that a deploy must use `npm run build`.
4. **Role, contact, location, date and skill strings bypassed `Runs`**, so a latin-ext
   character there would have been drawn in Helvetica silently (verified by the reviewer with a
   probe string); every printed string now passes through `Runs`.
5. **The DOI exception shape was itself a phone-number shape**, so a real number on those pages
   would have passed; the exception now requires the match to sit inside a longer token that
   starts with a letter or "10." (a DOI or arXiv id), and a test proves four common phone shapes
   are rejected on every excepted page. The pattern itself is unchanged, as the amendment asks,
   and now lives once in `tests/unit/helpers/privacy.ts` for the three tests that use it.
6. **This log held a literal NUL byte** (the same escape-decoding failure it describes), which
   `rg` and GitHub treat as binary; replaced with the text "U+0000".
7. **`NEXT_PUBLIC_SITE_URL` was not validated**: a value without a scheme failed deep in the
   build with a bare "Invalid URL"; `lib/site.ts` now throws naming the variable.
8. **Nothing tested the research and leadership `resume.include` flags**: the resume test now
   asserts that a flagged research item is not also printed through a card or a role, that every
   flagged item's title is in the PDF, and that the summary and degree are printed.
9. **`/^U+/` and `/s+/g` regex typos** (both worked by accident): fixed, and the pdf-lib
   reachability walk that existed four times now lives once in `scripts/pdf-graph.mjs`, used by
   the three generators and the documents test.

A second angle of the same review reported after the PR opened. Three of its findings (the
NUL byte, the unfilled placeholders, the asset revision) were already fixed above; the fourth
was that the section headings and the skill-line order are typed in the generator while
AGENTS.md said "no fact is typed in the script". The wording now says exactly what is typed
(layout copy from the resume of record, as `lib/content/labels.ts` keeps display labels outside
content), and a category id the order list does not name sorts last instead of first.

### PR #10 review (2026-09-16)
A high-effort `/code-review` of PR #10 (`origin/main...HEAD`) returned three findings. All
three were checked against the code and fixed:
1. **The JSON-LD escape did nothing**: the replacement string was the JS escape for "<", which
   is "<" again, so a content value holding a closing script tag would have ended the element
   early. Confirmed in Node. The escape is now the six-character JSON escape, in
   `jsonLdHtml()` in `lib/seo.ts`, and `tests/unit/seo.test.ts` covers it. The file tools
   decoded that escape in the new test as well; the expected string is now built with
   `String.fromCharCode(92)`.
2. **A trailing slash in `NEXT_PUBLIC_SITE_URL` failed the build**, because the origin check
   ran before the slash was stripped. `https://example.com/` is now accepted and stripped,
   while a value with a path or without a scheme still throws; both cases are unit-tested.
3. **The generator read only `.env.local` and `.env`**, while `next build` also reads
   `.env.production(.local)` and gives them priority, so a local production build could print
   one origin in the PDF and another in the HTML. `scripts/load-env.ts` now calls Next's own
   `loadEnvConfig` (`@next/env`, a dev dependency pinned to the `next` version), in
   development mode under `predev` only. Verified with temporary `.env.production` and
   `.env.development` files: `prebuild` printed the production host and `predev` printed
   the development host. Vercel was never affected.

### Plan, prompts and docs brought up to date (2026-09-17)
Paige asked whether the plan, the prompts and the docs needed changes now that Session 6 is
implemented. They did, and the changes went into this PR, as Session 5's did in its own PR:
- **IMPLEMENTATION_PLAN.md**: 2026-09-17 amendments to Sessions 3b, 7 and 8. For 3b: the project
  OG card does not draw `cover`, the sitemap and metadata already cover the page, the assets
  reconciliation is a unit test, and a `live` link changes the generated resume. For 7: the
  re-measured JS, `/resume` is a redirect, CI already runs the SEO spec, and Lighthouse's SEO
  audits read the absolute origin. For 8: the current `prebuild`, the build-story route's canonical
  URL, and what `NEXT_PUBLIC_SITE_URL` changes on the resume. The file tree and package table now
  say woff, not TTF, and list the icons under `app/`.
- **SESSION_PROMPTS.md**: matching bullets in the 3b, 7 and 8 prompts. Session 8's post-merge
  steps now check the production PDF and name the resume of record for the placeholders. The
  Session 0 text no longer says Session 6 ships the hand-made PDF.
- **DESIGN.md**: a current status line; §5.4 says woff and records that the fallback was not
  needed. **README.md** credits Claude Code for Sessions 1–6. **AGENTS.md** lists the SEO spec in
  CI job 2 and states the resume asset's `revision` rule.
- **The resume's `assets.json` revision was stale.** It named 85987e8, but 69e4e26, 290d961,
  19d85f6, 67a34d4 and 86f32e7 changed the generator, the content or the site origin since. It
  now names 86f32e7, the last of those. No test checks this field against history, so it was found
  by listing the commits after the recorded one that touched those paths.
- Re-measured after `npm run build`: `node scripts/js-budget.mjs /` 137.1 KB gzipped,
  `/experience` 141.4 KB.
- The origin checks above were run after Paige set the Vercel variable; they replace the
  "not checked" line this log used to carry for the OG images.

## Paige's review notes

## Screenshots
`docs/screenshots/s6-*.png`: every HTML route at 1280 px and 390 px (Home in both themes), plus
`s6-og-home.png` and `s6-og-projects-stimmap3d.png` (the Open Graph images as served) and
`s6-resume-page-1.png`, `s6-resume-page-2.png` (the generated PDF's pages, rendered with
pdf-parse at 1.6×).
