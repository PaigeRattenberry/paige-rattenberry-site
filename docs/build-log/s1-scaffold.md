# Session 1 — Scaffold, design system, shell
- Date: 2026-09-08 · Branch: s1-scaffold · PR: #1

## Goal
Stand up the repo so every later session only adds content: Next.js 16 scaffold at the repo root,
the design tokens and typography from DESIGN §4, a shell (header, nav, theme toggle, footer) on
every DESIGN §2 route, the contour hero motif, the test harness (Vitest, Playwright + axe,
screenshots), CI jobs 1 and 2, and the project docs (README, LICENSE, CLAUDE.md, this log).

## What shipped
- `create-next-app@16.3.4` scaffold merged into the root (App Router, TypeScript strict, Tailwind 4,
  ESLint 9 flat config). Node 24 via `.nvmrc` and `engines`. Prettier with the Tailwind plugin.
- Design tokens in `app/globals.css`: light palette on `:root`, dark palette under
  `[data-theme="dark"]` only, `@theme inline` exposes them to Tailwind, `@custom-variant dark`
  remaps `dark:` to the attribute. One teal accent. Fonts via `next/font/google`: Source Serif 4
  (display), Inter (body), JetBrains Mono (data).
- Shell: `Header` (name, nav, theme toggle, mobile disclosure menu with Escape handling), `Footer`
  (email / LinkedIn / GitHub / resume, "Built with Claude Code" link, last-updated from git with a
  `VERCEL_GIT_COMMIT_SHA` + build-time fallback), `PageHeader`, `Prose`, `Card`, `Tag`, `Callout`,
  `Figure`, `PlaceholderPage`, `not-found`. Skip link and a single global `:focus-visible` ring.
- `app/icon.svg`: the tab icon, three iso-lines of the hero field, theme-aware (replaces the
  create-next-app stock favicon).
- Placeholder pages for all 12 DESIGN §2 routes (three project slugs via `generateStaticParams`
  with `dynamicParams = false`). `/resume` is a placeholder page until Session 6 replaces it with
  the `redirects()` entry.
- Hero motif: `components/hero/contour.ts` samples a fixed scalar field (four Gaussians plus a
  gentle wave), traces 9 iso-lines with marching squares on a 24 px grid, joins the cell
  segments into polylines, and emits ~6.7 KB of SVG path data at build time. `ContourField` is a client island
  that only enables the CSS drift (`useSyncExternalStore` on the reduced-motion media query).
- Tests: Vitest 5 + Testing Library + happy-dom (`Header` component test; contour determinism,
  bounds and size budget). Playwright 1.63: `tests/e2e/a11y.spec.ts` (axe over every route in both
  themes, plus keyboard menu, skip link, and reduced-motion checks) and
  `tests/e2e/screenshots.spec.ts` (every route at 1280 px and 390 px). Both import `lib/routes.ts`.
- CI: `.github/workflows/ci.yml`, job 1 (lint, typecheck, test, build) and job 2 (build,
  `next start`, a11y spec) on Node 24.
- Docs: README (PowerShell run steps), LICENSE (MIT for code, content © Paige Rattenberry),
  CLAUDE.md (via `/init`, then the IMPLEMENTATION_PLAN §0 conventions pasted verbatim), this log.
- `content/profile.ts`: the minimum the shell needs (name, role line, email, GitHub, LinkedIn,
  location), each with a `sources` note. No other facts on the site yet.

## Decisions and why
- **Installed versions (checked with `npm view` on 2026-09-08):** next 16.3.4, react 19.2.8,
  typescript 5.9.3 (what `create-next-app` installed; kept per DESIGN), tailwindcss 4.3.3,
  @tailwindcss/postcss 4.3.3, next-themes 0.4.6, eslint 9.39.5 (eslint-config-next 16.3.4 pins
  `^9`; eslint 10 exists but is not what the config ships with), eslint-config-prettier 10.1.8,
  prettier 3.9.6, prettier-plugin-tailwindcss 0.8.1, vitest 5.0.0, @vitejs/plugin-react 6.1.1,
  @testing-library/react 16.3.3, @testing-library/jest-dom 7.0.1, happy-dom 20.14.0,
  @playwright/test 1.63.0, @axe-core/playwright 4.13.0, @types/node 24.13.3.
- **Palette leans cool, not cream.** The paper is `#f5f4ef` and the ink `#1a1c1f`, deliberately a
  step away from the warm-cream-plus-terracotta look that reads as a generated template. The
  accent is deep teal `#0e6b6b` in light and bright teal `#45c7be` in dark; both pass AA on their
  backgrounds (axe reported no contrast issues in either theme).
- **The contour field is the one bold element.** Everything else is quiet: hairline rules, no
  shadows, no gradients, 150 ms colour transitions only. The hero carries a mono "Fig. 1" caption
  that states what the field is and that drift pauses under reduced motion, so the motif reads as
  a figure rather than decoration. On mobile the field fades vertically so it never sits behind
  the heading; on desktop it fades in from the left.
- **`typecheck` runs `next typegen` first.** Next 16's `PageProps`/`LayoutProps` globals come from
  the generated `next-env.d.ts`, which does not exist on a fresh clone; CI runs typecheck before
  build, so the script generates the types itself.
- **Mobile menu closes from the link click, not from an effect.** The
  `react-hooks/set-state-in-effect` rule in eslint-config-next 16 flags a close-on-route-change
  effect, and the pathname-keyed alternative tried first had its own bugs (see the review notes
  below), so each link simply calls `setOpen(false)`.
- **`content/profile.ts` exists already** (planned for Session 2) because the header and footer
  need the name and links, and the never-regress gate (e) forbids hard-coding facts in components.
  Session 2 extends it rather than creating it.
- **Playwright forces a theme via `localStorage.theme`** before navigation, which is exactly how a
  visitor's explicit choice is stored by next-themes, so the a11y spec tests the real light/dark
  code path rather than a media-query emulation.

## Skills / tools used
- Plan mode (short plan written after reading DESIGN.md, IMPLEMENTATION_PLAN.md,
  the private source inventory).
- `frontend-design` skill when establishing tokens, typography and the shell.
- `/init` for CLAUDE.md, then edited by hand to carry the §0 conventions verbatim (checked with a
  `diff` against IMPLEMENTATION_PLAN.md).
- Playwright for the a11y gate and screenshots; the screenshots were reviewed in-session and drove
  two layout fixes (see below).
- `/code-review` before opening the PR. After CI went green, two more passes over the whole
  branch: a direct read of every file (which recomputed the palette contrast ratios), and
  `/code-review` at high effort. Both lists are under "post-PR review" below.

## What Claude got wrong and how it was caught
- **Working directory drift.** A `cd` into `node_modules/next/dist/docs` to read the bundled Next
  16 docs persisted across shell calls, and the next multi-file write failed to parse before
  running anything. Caught immediately by the shell error; fixed by using absolute paths.
- **Prettier reformatted the planning documents.** The first `prettier --write .` rewrapped
  DESIGN.md, IMPLEMENTATION_PLAN.md and SESSION_PROMPTS.md. Caught by the file-change notices;
  reverted with `git checkout` and the three files (plus CLAUDE.md, AGENTS.md and the build log,
  where formatting must stay verbatim) were added to `.prettierignore`.
- **Prettier also broke the "verbatim" conventions block in CLAUDE.md** (turned `+ tests` into a
  nested list item and reflowed the build-log template). Caught by diffing the block against
  IMPLEMENTATION_PLAN.md; restored by hand, and the diff is now empty.
- **Two lint errors from eslint-config-next 16's `react-hooks/set-state-in-effect` rule** (the
  mounted flag in `ThemeToggle`, close-on-navigate in `Nav`). Caught by `npm run lint`; both were
  rewritten without effects (`useSyncExternalStore`; the menu now closes on link click).
- **Typecheck failed on a clean tree** because `next-env.d.ts` did not exist yet. Caught by
  running the scripts in CI order locally; fixed with `next typegen` in the `typecheck` script.
- **Contact page showed list bullets** because the `Prose` descendant selector outranked the
  `list-none` override. Caught in the 1280 px screenshot; the page now uses a `<dl>` outside
  `Prose`.
- **Contour lines ran behind the heading on mobile.** Caught in the 390 px screenshot; the mask
  now fades vertically below `md`.
- **`/code-review` (medium) found eight issues, all fixed before the PR:**
  1. `[&_a]:link-accent` on a plain `@layer components` class emitted no CSS (Tailwind 4 only
     stacks variants on utilities), so links inside `Prose` and `Callout` were unstyled. The link
     classes are now `@utility` definitions; the built CSS was checked for the descendant rule.
  2. `--container-prose: 42rem` never reached `max-w-prose` because Tailwind's default
     `--max-width-prose: 65ch` wins the lookup. The token is now `--max-width-prose`, and the
     built CSS reads `max-width: 42rem`.
  3. The mobile menu keyed its open state to the pathname, so tapping the current page's link
     left it open and Back could reopen it. It is a plain boolean again; each link closes it.
  4. The contour path data is in the HTML twice (markup plus the RSC payload), which is true of
     every server-rendered node in the App Router, not just client props (verified: "Selected
     work" also appears twice). The reviewer's suggested restructuring would not change that, so
     instead the grid is 24 px with 9 levels (~6.7 KB of path data, ~13.4 KB on the wire) and the
     unit test caps path data at 7 KB with a comment explaining the factor of two.
  5. Playwright's `reuseExistingServer` on port 3000 would have run the specs against a running
     `next dev` (dev-tools badge in the screenshots, dev markup under axe). E2E now uses port
     3100 (`E2E_PORT` to override).
  6. `outline-none` on the `Card` link suppressed the global focus ring; removed.
  7. `getLastUpdated()` spawned `git log` once per rendered route; it now runs once per process
     as a module-level constant.
  8. Project names had been typed into the home "Selected work" copy and the `/projects` meta
     description, against the "facts only from `content/`" rule. Both are now non-factual
     placeholder sentences.
- **Floor, not ceil, for the contour grid.** Changing the cell size to 24 px made the grid
  overshoot the 640 px viewBox and the bounds test failed. The grid now floors to fit.
- **Post-PR review pass (this branch, after CI went green) found four more, all fixed here:**
  1. **`--ink-3` failed WCAG AA in both themes.** The muted-label token was 3.29:1 on light paper
     and 4.04:1 on dark paper, against DESIGN §8's "colour contrast AA in both themes". Axe never
     saw it because the only consumer, `Figure`'s "Source:" line, is not on a page yet — so it
     would have shipped silently in Session 3. Now `#6d685f` / `#979289`, which clear 4.5:1 on
     paper, surface and surface-2 in their own theme (worst case 4.6:1 light, 4.8:1 dark); the
     ratios are recorded in the token comment. Every other pair in the palette was recomputed and
     passes.
  2. **`html { font-size: 17px }` overrode the reader's browser font-size setting.** A px value on
     the root element discards a raised default; every rem token then scales from 17px regardless.
     Now `106.25%`, which resolves to exactly 17px at a 16px default (verified in the browser:
     computed root font size and the h1 box are unchanged) but tracks the reader's preference.
  3. **Nothing enforced Prettier.** The repo has `format:check` but no job ran it, so the
     "formatting is settled" guarantee that later sessions rely on was unchecked. Added as the
     first step of CI job 1 (a step, not a fourth job).
  4. **"all 13 DESIGN §2 routes" — there are 12.** Corrected here and in the PR body. `lib/routes.ts`
     matches the DESIGN §2 table exactly; only the prose miscounted.
- **A second reviewer pass (`/code-review`, high) over the same branch found six more, five fixed:**
  1. **The site shipped the create-next-app favicon** — the untouched 25,931-byte stock file, so
     every tab, bookmark and history entry for the portfolio showed Vercel's mark, on a site whose
     stated goal is not to read as a generated template. Replaced with `app/icon.svg`: three
     iso-lines of the hero's own scalar field, theme-aware, legible down to 16 px. Placeholder in
     the sense that Paige may want something else, but not someone else's logo.
  2. **`execSync` goes through `cmd.exe` on Windows, which ate the git format string.** With any
     `CI` variable set, `git log -1 --format=%cI%n%h` came back as `"truen<sha>"` (cmd expanded
     `%cI%`), `Date.parse` gave `NaN`, and the footer silently degraded to the build-time stamp
     with no date and no sha. Reproduced on this machine; now `execFileSync`, which never involves
     a shell.
  3. **The footer date could be a day ahead of the commit.** `new Date(iso).toISOString()` threw
     away git's local offset, so an evening commit in Pacific time rendered as tomorrow. Git's
     `%cI` string is now kept verbatim; `<time dateTime>` carries the real offset.
  4. **`format:check` (added earlier in this pass) would have failed on a fresh Windows clone.**
     `core.autocrlf=true` with no `.gitattributes` checks the tree out as CRLF, which Prettier
     flags, while CI on Linux stays green. Added `.gitattributes` (`* text=auto eol=lf`).
  5. **Two holes in the a11y gate.** The 404 was never scanned (it is a real page in the same
     visual system but deliberately not in `routes`), and axe only ever ran at 1280 px, so the
     open mobile menu — the only interactive markup in the shell, and the only place the nav
     links are duplicated into the accessibility tree — was never scanned. Both added; the spec
     went from 28 to 32 passing checks, all green.
  6. **`reuseExistingServer` could serve a stale build.** A `next start` left over from an earlier
     run keeps serving the previous build, so screenshots and axe results would describe old
     markup with no warning. Now `false`.
- **Three judgement calls were raised rather than silently fixed**; one was then implemented and
  two are recorded with a recommendation under "Paige's review notes" below. The home CTA now
  reads "Resume" instead of "Download resume".
- **Not worth fixing:** the footer's last-updated sha means a committed screenshot can never show
  its own commit, so `docs/screenshots/` always trails HEAD by one. Inherent to stamping the sha;
  it just explains why all 26 PNGs churn on every screenshot run.

## Paige's review notes

Verdicts are Paige's; the three open calls below are written up by Claude with a recommendation
and the evidence behind it, so the decision is a yes/no rather than a re-investigation. Everything
else in this session was either fixed or is recorded above.

### Call 1 — `--line` at 1.32:1 on the two icon-only controls
**Recommendation: leave it as is.** WCAG 2.1 SC 1.4.11 asks for 3:1 on "visual information
*required to identify*" a control. On the theme toggle and the menu button the identifying visual
is the glyph, which measures 6–7:1 in both themes; the border is decoration around it, the same
hairline used for every rule on the site. Raising `--line` to 3:1 would darken every border and
rule everywhere and pull the design away from the hairline language in DESIGN §4. The narrower
alternative — a heavier border on just those two buttons — would make them visually louder than
the labelled CTAs beside them, which are correct at `--line-2`. Note this is the one place in the
review where I concluded the criterion is met rather than that we should accept a miss.

- Paige's verdict: **Agreed — leave it as is.** The glyph is the identifying visual and the hairline is the
  design language; raising `--line` to 3:1 would change every rule on the site to fix a criterion that
  is already met.

### Call 2 — the home "Download resume" CTA pointed at a placeholder
**Implemented.** The button promised a download and landed on a page reading "Content lands in
Session 6 of 8", which the claims gate exists to prevent. It now reads **"Resume"**, which is
accurate today and stays accurate in Session 6 when `/resume` becomes a `redirects()` entry to
the PDF — so this is one edit, not an edit and a revert. Change it back to "Download resume" in
Session 6 only if the wording is worth the extra word.

- Paige's verdict: **Agreed with the change.** "Resume" is accurate today and stays accurate when
  Session 6 turns `/resume` into a redirect; revisit the wording only if the extra word earns itself.

### Call 3 — the contour field is largely absent at 390 px
**Recommendation: fold into the Session 2 hero rebuild, not now.** Measured rather than eyeballed:
at 390 px the SVG box is 390×661 against a 1200×640 viewBox, and `preserveAspectRatio="…slice"`
therefore shows **31.5% of the field's width** at full height — the middle third, which is the
flattest, least interesting part of the field; the nested loops sit left and right of the crop.
The mobile mask then fades that strip to nothing by 62% of its height. Net visible area is roughly
an eighth of the field, most of it at partial opacity, while the "Fig. 1" caption still describes
iso-lines and drift. At 1280 px the same element shows 100% of the width and 87% of the height,
which is why it reads well there.

So this is a composition problem, not an opacity problem, and raising `--contour-opacity` or
softening the mask would only put more ink behind the heading — the thing the mask was added to
fix. The real options, in the order I would try them:

1. **Generate a second, portrait field for small screens.** `generateContours()` already takes
   `width`/`height` and is deterministic and pure, so `generateContours({ width: 640, height: 900 })`
   is nearly free; the mobile SVG then has its own composition instead of a crop of the desktop
   one. The 7 KB path-data budget test would need to cover both sets.
2. **Keep one field, change the mobile crop** (`xMidYMin`, or a wider viewBox on small screens) so
   the loops rather than the flat middle are what survives.
3. **Accept it** — treat the motif as a desktop flourish and drop the "Fig. 1" caption below `md`
   so the page never describes something the reader cannot see.

Session 2 rebuilds this hero (positioning line, three CTAs, "Currently", skills strip), so that is
the cheap moment to do 1 or 2. Doing it now would mean designing the mobile hero twice.

- Paige's verdict: **Option 1, folded into Session 2.** Generate a second, portrait field for small
  screens (`generateContours({ width: 640, height: 900 })`) as part of the Session 2 hero rebuild, and
  extend the path-data budget test to cover both sets. Do not raise `--contour-opacity` or soften the
  mask — the composition is the problem, not the opacity.

## Screenshots
`docs/screenshots/s1-*.png`: every route at 1280 px and 390 px (26 files). Home is captured in
both themes: `s1-home-1280.png`, `s1-home-1280-dark.png`, `s1-home-390.png`, `s1-home-390-dark.png`.
