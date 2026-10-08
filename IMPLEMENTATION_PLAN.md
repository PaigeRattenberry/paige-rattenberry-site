# Paige Rattenberry — Portfolio Site: Implementation Plan

**Companion to `DESIGN.md`.** A session-by-session build plan for a solo developer on **Windows 11 /
PowerShell** using an available coding agent, one fresh session per numbered section, each ending in a PR on a
feature branch. Ship as a **statically generated Next.js 16 site on Vercel**.

> Build nothing until `DESIGN.md` §0 decisions stand. Session prompts that paste into a coding agent are in
> `SESSION_PROMPTS.md`; this file is the spec those prompts point at.

> **Run order as of 2026-10-07:** **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S0-G → S8 →
> S9 → S9b → launch.** S0-G (publication scrub, §3) is an agent session added 2026-09-30 between
> Session 7 and Session 8; Session 9 (pre-launch content update, §4) was added 2026-10-06 after
> Session 8, and Session 9b (pre-seed fixes, §4) 2026-10-07 after Session 9; the launch steps (§6)
> follow Session 9b's merge. The run-order notes below are the record of how the order got here.

> **Session 9 amendment — 2026-10-06 (requested by Paige).** This file was amended in place for
> Session 9: the run order above, §4 Session 9, §6 (the launch steps now follow Session 9's merge)
> and its row in §7.

> **Session 9b amendment — 2026-10-07 (requested by Paige).** Amended in place again: the run
> order above, §4 Session 9b, §6 (the launch steps now follow Session 9b's merge) and its row in §7.

> **Edited for publication — 2026-10-01 (S0-G).** Passages were removed from this file's
> amendments, as-built notes and acceptance lists, and the amended passages reworded to stand
> alone; every decision still stands, with its credit and date (redacted for publication,
> 2026-10-01).


> **Session 3 split amendment — 2026-09-13 (requested by Paige).** S0-D (StimMap3D deployed and
> public) is still in progress, and Session 4 builds on Session 3's MDX pipeline, so Session 3 is split
> in two and the run order becomes **S1 → S2 → S3a → S4 → S3b → S5 → S6 → S7 → S8** (the position of
> 3b in that order is superseded by the 2026-09-15 run-order amendment below; everything else here stands).
>
> - **Session 3a — Projects index + MDX pipeline** (branch `s3a-projects-mdx`, log
>   `docs/build-log/s3a-projects-mdx.md`, screenshots `s3a-*`). Everything in the original Session 3
>   that does not need the live app or the public repo: the MDX pipeline, the extended
>   `ProjectSchema`, folding `content/projects.ts` into MDX frontmatter, every project card, the
>   `/projects` index and its URL-synced filter, a reusable click-to-load `EmbedFrame`, and the
>   StimMap3D page body with its disclaimer. No S0-D prerequisite.
> - **Session 4** runs next, on top of 3a, and reuses `EmbedFrame` for the valedictorian video.
> - **Session 3b — StimMap3D live embed** (branch `s3b-stimmap3d-embed`, log
>   `docs/build-log/s3b-stimmap3d-embed.md`, screenshots `s3b-*`). Everything that needs S0-D: the live
>   URL and DLPFC deep-link, the embed on the page, the public repo and session-pack links, the
>   StimMap3D screenshots with repository provenance pinned to a public commit, the `cover`/poster, the
>   embed checks and the Lighthouse score. Prerequisites: S0-D done, 3a and 4 merged.
> - **Why the screenshots wait for 3b:** repository provenance records a full commit SHA, and S0-D's
>   secret check may rewrite StimMap3D's history before the repo goes public, which would change it.
> - Where `DESIGN.md`, `AGENTS.md` or an older note below says "Session 3", read **3a** for the MDX,
>   content, card, index and page-body work and **3b** for anything that depends on S0-D (the live
>   app, the public repo, the StimMap3D screenshot and its provenance, the embed Lighthouse score).


> **S0-D closed — 2026-09-20.** StimMap3D is live at https://stimmap3d.pages.dev and public at
> https://github.com/PaigeRattenberry/stimmap3d (MIT). The run order above is unchanged, but nothing
> waits on Paige any more: **Session 3b is ready to run.** `_source/INVENTORY.md` holds the live URL,
> the hero deep-link, the repo clearance and Paige's binding honest-framing brief;
> `docs/build-log/s0d-stimmap3d.md` holds the verification and the findings the 2026-09-20
> amendment to Session 3b turns into decisions (stale test counts, a block quote whose public source
> no longer carries it, one public screenshot rather than four to six, no `SESSION_PROMPTS.md` to
> link).

> **Run-order amendment — 2026-09-15 (requested by Paige).** S0-D is still in progress, so Session 3b
> is deferred again and the run order becomes **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S7 → S8**.
> Sessions 5 and 6 need nothing from S0-D: Session 5 derives the explorer from `content/experience.ts`,
> `content/projects/*.mdx` and `content/research.ts`, all of which are on `main`, and Session 6
> generates the resume PDF from `content/` and adds SEO over routes that already exist. Session 3b runs
> whenever S0-D is done, any time after Session 4; it is placed after Session 6 only because that is
> where it is expected to land, and moving it earlier needs no further amendment.
>
> - **Sessions 7 and 8 stay last and stay blocked.** Session 7 must run axe with the StimMap3D embed
>   loaded and Lighthouse on `/projects/stimmap3d`, so it needs 3b as well as Session 5's explorer.
>   Session 8 needs everything merged.
> - **Session 3b now lands after Session 6, so it must re-check Session 6's output.** Setting the
>   StimMap3D `cover` changes what `/projects/stimmap3d/opengraph-image` renders, and its screenshots
>   are new entries for the `assets.json` reconciliation. See Session 3b's 2026-09-15 run-order note.
> - **Session 5's open question is answered** (Stryker is one entry) and **Session 6's approved
>   fallback resume is named**; both are recorded in their sections below.

> **Small review follow-up amendment — 2026-09-13.** Read AGENTS.md for shared rules and DESIGN
> §§1, 3.5, 4.3 and 5.2 for the implemented homepage, asset, motion and rendering decisions.
> This note supersedes older conflicting tasks below. Sessions 1–2 are merged; later sessions remain.
> Session 1–2 tasks below keep their original wording as the historical record of what was requested.
>
> - Home now leads with concise current work, Explore projects, Get in touch and a secondary Resume
>   link. ContourField is a static server component; do not reintroduce drift or its client island.
> - Assets use media-specific image/document records with staged or repository provenance,
>   source file/revision, rights, permission and transformations. Session 3b validates the real approved
>   StimMap3D screenshot. Session 4 validates the actual thesis derivative with original page 2
>   removed and recorded. Reconcile public/images, public/docs and root PDFs against the manifest.
> - Replot only recorded numeric results, citing the original figure/page. Never invent measurements
>   or saliency maps. Conceptual diagrams are labelled illustrations; prose is an accepted fallback.
> - Filesystem/MDX loaders stay server-only. Header passes plain data to Nav. Future filtered URLs
>   keep core content prerendered; isolate useSearchParams in Suspense if used, and test direct URLs,
>   clear, back/forward and invalid values against a production build.
> - Before generators land, add a deterministic generation step before artifact-dependent tests in CI;
>   verify on a clean checkout and deploy with npm run build. For Session 6, split HTML routes from
>   redirects/documents in axe/screenshots/sitemap and give Resume dedicated redirect/PDF checks.
> - Scan the actual public text corpus (including build logs) and extracted shipped PDF text, plus
>   visual/asset/history review. Declared-metric checks do not establish complete factual accuracy.
> - Future logs record task, constraints, tools/model when known, confirmed human decisions,
>   generated work, rejected suggestions, verification command/result and PR/commit. Use
>   “What the AI got wrong and how it was caught”; preserve historical attribution. Shared agent
>   rules live in AGENTS.md, with CLAUDE.md referencing them. Use available capabilities rather than
>   requiring a particular model's slash commands or PDF tools.
>
> The proposed decision replay, revised explorer scope and personal About edits remain later-session
> decisions; this small follow-up does not implement or approve those larger proposals.

---

## 0. Conventions and "done" bar for the whole project

- **Definition of Done (global):** `npm run build` clean; zero console errors; the three CI jobs (build
  + tests, axe, Lighthouse) green; Vercel preview URL works in an incognito window (previews are
  login-gated, so sign in to Vercel inside that window — see S0-E); claims gate and
  privacy gate pass (DESIGN §3.3–3.4); a build-log entry exists for the session.
- **Branch and PR discipline:** one branch per session (`s1-scaffold`, `s2-content-core`, …), small
  commits, PR against `main` via `gh pr create`, body maps work to the session's acceptance list and
  gives PowerShell verify steps. **Never merge in-session**; Paige merges.
- **Plan-first:** every session reads `DESIGN.md` and its own section here, writes a short plan (plan
  mode), then invokes any helpful skills (`frontend-design`, an available code-review capability, Playwright, repository instruction setup,
  `security-review`) before coding.
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
  The log's page leaves out the review-notes heading while it is empty (Session 9b).
- **Screenshots:** capture with Playwright at 1280 px and 390 px widths into `docs/screenshots/`.
- **Gates that never regress:** (a) claims gate: every metric has a source; (b) privacy gate: no
  `_source/` file committed, no phone number, `assets.json` provenance for every asset; (c) StimMap3D
  disclaimer wherever StimMap3D is shown or embedded (its card, deep page, embed, timeline entry,
  Open Graph card and resume entry; a passing mention in narrative prose such as About does not
  carry it, amended 2026-09-21 at Paige's request); (d) both themes, keyboard operable, reduced-motion honored;
  (e) no facts hard-coded in components.

---

## 1. Repository structure

```
./
├─ app/                              # Next.js App Router
│  ├─ layout.tsx  globals.css  page.tsx  not-found.tsx
│  ├─ opengraph-image.tsx  sitemap.ts  robots.ts  favicon.ico  icon.svg
│  ├─ about/page.tsx
│  ├─ experience/page.tsx
│  ├─ projects/page.tsx
│  ├─ projects/[slug]/page.tsx  projects/[slug]/opengraph-image.tsx
│  ├─ research/page.tsx
│  ├─ leadership/page.tsx
│  ├─ how-this-was-built/page.tsx
│  └─ contact/page.tsx
│                                    # /resume is a redirects() entry in next.config.ts, not a route
├─ components/
│  ├─ layout/   Header.tsx Footer.tsx Nav.tsx ThemeToggle.tsx
│  ├─ ui/       PageHeader.tsx Card.tsx Tag.tsx MetricStat.tsx Figure.tsx Callout.tsx Prose.tsx
│  ├─ hero/     ContourField.tsx (client) contour.ts (build-time path generation)
│  ├─ explorer/ Timeline.tsx SkillsConstellation.tsx FilterChips.tsx (client)
│  └─ embed/    EmbedFrame.tsx (client)
├─ content/                          # single source of truth (DESIGN §3.1)
│  ├─ profile.ts experience.ts education.ts certifications.ts skills.ts research.ts leadership.ts
│  ├─ projects/*.mdx
│  ├─ assets.json
│  └─ generated/ build-stats.json explorer-layout.json
├─ lib/
│  ├─ content/  schema.ts (zod) load.ts (loaders) explorer.ts (derive graph)
│  ├─ seo.ts    (metadata helpers, JSON-LD)
│  └─ utils.ts
├─ scripts/
│  ├─ build-resume.tsx               # @react-pdf/renderer -> public/Paige-Rattenberry-Resume.pdf
│  ├─ fetch-build-stats.ts           # GitHub API -> content/generated/build-stats.json (by hand, D6)
│  └─ layout-explorer.ts             # d3-force -> content/generated/explorer-layout.json
├─ public/
│  ├─ images/<slug>/ ...             # only assets listed in content/assets.json
│  ├─ Paige-Rattenberry-Resume.pdf   # generated at build, git-ignored (DESIGN §5.4)
│  └─ docs/ ...                      # shipped PDFs, each a document in content/assets.json
├─ tests/
│  ├─ unit/      content.test.ts resume.test.ts components/*.test.tsx   (Vitest)
│  └─ e2e/       a11y.spec.ts screenshots.spec.ts                        (Playwright)
├─ docs/
│  ├─ build-log/ s1-scaffold.md ... s8-launch.md
│  └─ screenshots/
├─ _source/                          # UNTRACKED (.gitignore). Paige's PDFs, docs, photos, INVENTORY.md
├─ .github/workflows/ci.yml
├─ lighthouserc.json  playwright.config.ts  vitest.config.ts
├─ next.config.ts  postcss.config.mjs  tsconfig.json  eslint.config.mjs  .prettierrc
├─ .nvmrc (24)  .gitignore  .env.example (NEXT_PUBLIC_SITE_URL)
├─ package.json  README.md  CLAUDE.md  LICENSE (MIT for code; content © Paige Rattenberry)
├─ DESIGN.md  IMPLEMENTATION_PLAN.md  SESSION_PROMPTS.md
```

---

## 2. Dependencies (majors checked against npm on 2026-09-07)

| Package | Version | Role |
|---|---|---|
| `next` | 16.3.x | framework (App Router, static generation, `next/og`, `next/font`) |
| `react` / `react-dom` | 19.2 | UI |
| `typescript` | whatever `create-next-app` installs (6.x or 7.x); strict | types |
| `tailwindcss` + `@tailwindcss/postcss` | 4.3.x | styling, CSS-first `@theme` tokens |
| `next-themes` | 0.4.x | dark/light toggle honoring system preference |
| `next-mdx-remote` | 6.x (RSC API) | MDX rendering for project pages |
| `gray-matter`, `zod` 4 | latest | frontmatter parsing + schema validation |
| `remark-gfm`, `rehype-slug`, `rehype-autolink-headings` | latest | MDX plugins |
| `d3-force`, `d3-scale` (+ `@types/*`) | 3.x / 4.x | explorer layout (build script) and scales |
| `@react-pdf/renderer` | 4.9.x | resume PDF generation (build script) |
| `@fontsource/source-serif-4`, `@fontsource/inter`, `@fontsource/jetbrains-mono` | latest | woff files (v5 ships no TTF) registered with `@react-pdf/renderer` and read by `next/og` (Session 6) |
| `pdf-lib`, `pdf-parse` | latest | resume PDF tests |
| dev: `eslint` 9 + `eslint-config-next`, `prettier` | latest | lint/format |
| dev: `vitest` 5, `@testing-library/react` 16, `happy-dom` | latest | unit/component tests |
| dev: `@playwright/test`, `@axe-core/playwright` | latest | a11y e2e + screenshots |
| dev: `@lhci/cli` | 0.15.x | Lighthouse CI |
| dev: `tsx` | latest | run TypeScript build scripts |

Rules: pin majors to what is current **at session time** (run `npm view <pkg> version` before
installing; this table is a snapshot and TypeScript in particular moved from 6 to 7 within weeks) and
record the installed versions in the build log; never force-upgrade TypeScript past the range
`create-next-app` ships; `npm install` from the repo root; no `pages/` router; no CSS-in-JS; no
component libraries (shadcn is acceptable only for primitives like dialog/menu if a session needs
them, and must be restyled to the design tokens). Fonts through `next/font` only for the site, never
a third-party stylesheet or a raw `@font-face`. **Amended 2026-09-23 for what Session 7 shipped:**
Sessions 1–6 used `next/font/google`; the site now uses `next/font/local` over the committed files in
`app/fonts/`, which `scripts/build-fonts.mjs` cuts from the exactly pinned `@fontsource-variable`
packages (`npm run fonts` rewrites them, `prebuild` checks them). The plain `@fontsource` packages
feed the PDF renderer and the Open Graph cards, which read font files directly.

Tools on this machine (verified 2026-09-07): `rg` 14 is installed; `pdftoppm` (poppler) is **not**.
Use available PDF text extraction and page-rendering tools. The earlier Claude sessions used
their native PDF reader; do not assume every agent has it. Check installed capabilities before
choosing a tool, and visually inspect image-only or undecodable pages.

`pdftotext` **is** installed (verified 2026-09-12), at `/mingw64/bin/pdftotext` — it ships with Git
Bash, so it is reachable from the Bash tool but not from PowerShell. `pdftotext -layout -f N -l N
"<file>" -` prints a single page of text, which is how Sessions 4 and 5 should confirm a claim's page
number before citing it in a PR body (amended 2026-09-30: by the source's reader-facing label and
page, never by file name). Two limits: it returns nothing for image-only
pages (the thesis approval page, both certificates, the transcript), and the capstone proposal's
subset font still decodes to mojibake — read those visually with an available PDF renderer instead.

---

## 3. One-time setup that Paige does (not the agent)

Do **S0-A, S0-B, S0-C before Session 1**. **S0-D before Session 3b** (Sessions 3a, 4, 5 and 6 do not
need it; split amendment 2026-09-13 and run-order amendment 2026-09-15). S0-E right after Session 1
merges. **S0-D was completed and verified on 2026-09-20** (`docs/build-log/s0d-stimmap3d.md`), and
Session 3b has since run and merged. S0-F (2026-09-20) is superseded by **S0-G**, the one item in
this section an agent runs: it follows Session 7 and must merge before Session 8 starts.

- **S0-A. Stage source materials.** Create `_source\` at the repository root with subfolders
  `resume\`, `capstone\`, `thesis\`, `photos\`, `leadership\`, `misc\`. Copy in: the current resume
  PDF; capstone report/poster/slides/competition photos; thesis PDF and key figures; headshot; any
  photos from the AI Expert Panel, valedictorian ceremony, competition, podcast; MentalWell /
  Clinical CoPilot / ML-for-cyber write-ups or slides. Figures for the capstone and thesis pages were
  originally requested from Paige as PNG/SVG exports into `capstone\figures\` and `thesis\figures\`.
  **Closed 2026-09-12: no exports are coming and the inventory is final**, so Session 4 recreates the
  thesis figures and draws original diagrams rather than cropping PDF pages (see Session 4, task 1).
  Then write
  `_source\INVENTORY.md`: one line per file: what it is, **may it be published (yes/no)**, whether other
  people appear or are named, and any caveats. Sessions read this file first. (Amended 2026-09-30,
  S0-G, D1: Paige renamed every staged file in place to a lower-case slug.)
- **S0-B. Preferred wording.** In `_source\INVENTORY.md` add a short "Notes"
  section: the email to publish (resume uses `paigerattenberry@gmail.com`), the GitHub and LinkedIn
  URLs, whether "Burnaby, BC" may appear, which repos (if any) may be linked publicly, and 2–3
  sentences you want the About page to convey that the resume does not.
  **Amendment, approved 2026-09-10:** the phone-free `Paige-Rattenberry-Resume-web.pdf` export this
  step used to require is **cancelled**. The resume contains no phone number (verified by Paige and by
  a full text extract on 2026-09-08), so Session 6 may ship the hand-made PDF from `_source\resume\`
  directly. The privacy gate itself is unchanged: the DESIGN §3.4 phone check still runs every session.
- **S0-C. Nothing to install.** Node 24.16, npm 11, git 2.54, and `gh` 2.94 (logged in as
  PaigeRattenberry) are already present (verified 2026-09-07). The private GitHub repo
  `PaigeRattenberry/paigewebsite` was created and `main` pushed during the planning session.
- **S0-D. Deploy StimMap3D and make it public — DONE 2026-09-20 (prerequisite for Session 3b).**
  Live at `https://stimmap3d.pages.dev` (Cloudflare Pages from `main`); `PaigeRattenberry/stimmap3d`
  is `PUBLIC` and MIT with its homepage set. Public commit pinned at S0-D:
  `0a20e810e48dca8aac1780c6478c3d1f51663989`. Hero deep-link:
  `https://stimmap3d.pages.dev/?preset=F3&proto=10hz-hf-l&elec=1#/` (state in the query, route in
  the hash; `elec=1` shows the 10-20 sites and the DLPFC→sgACC cue). Framing is not blocked: no
  `X-Frame-Options`, no CSP `frame-ancestors`, verified by loading the deep link in a cross-origin
  iframe. `_source/INVENTORY.md` holds the full record including Paige's binding honest-framing
  brief; `docs/build-log/s0d-stimmap3d.md` holds the evidence and the findings Session 3b acts on.
  The steps as originally specified, all completed:
  1. Secret/privacy check: `git ls-files .claude` must return nothing sensitive (settings.local.json
     must not be tracked); `git log --all -p | rg -i "api[_-]?key|secret|token|password"` should only
     hit documentation. Fix history before flipping public if anything appears.
  2. Connect Cloudflare Pages exactly as its `README.md` "Deployment (Cloudflare Pages)" section
     documents (build `npm run build`, output `web/dist`). Wait for the first deploy; open the link in
     an incognito window; confirm the disclaimer banner and a preset drag work.
  3. `gh repo edit PaigeRattenberry/StimMap3D --visibility public --accept-visibility-change-consequences --homepage <live-url>`
  4. Paste the live URL and a deep-link `?query` for the DLPFC hero view into `_source\INVENTORY.md`
     under "StimMap3D". Session 3b reads it from there.
- **S0-E. Connect Vercel — DONE 2026-09-09, configured so no production deployment exists until
  launch (§6, L7).** The site must not be publicly reachable or indexable while it is being built.
  Vercel's Hobby plan cannot protect a production domain (Vercel Authentication's free scope,
  *Standard Protection*, covers previews and generated URLs but explicitly not production; the "All
  Deployments" scope is Pro plus a $150/month add-on). The site is therefore kept private by never
  producing a production deployment at all. As built:
  - Vercel account: Hobby team `paige-rattenberry`; project **`paigerattenberry`** (so the production
    domain is `paigerattenberry.vercel.app`, which currently returns `404 DEPLOYMENT_NOT_FOUND`).
  - **The project was created as an "empty project", with Git attached afterwards — not imported.**
    Importing at vercel.com/new always deploys the default branch to production, and Vercel refuses
    to delete the deployment currently serving production, so importing leaves a public deployment
    that cannot be removed. The trade-off: framework detection never runs, so **Framework Preset had
    to be set to Next.js by hand** (it defaults to "Other", and the first build failed because of it).
    Node.js Version 24.x.
  - **Production branch is `launch`, not `main`** (Settings → Environments → Production → Branch
    Tracking). `origin/launch` exists and sits at the Session 1 merge commit; nothing is ever pushed
    to it, and launch step L7 (§6) moves production tracking to `main`.
  - **Ignored Build Step = "Only build pre-production"** (Settings → Build and Deployment), a second
    lock on the same door. It silently reset itself to "Automatic" once when the Framework Preset was
    changed, so re-check it after any build-settings edit.
  - **Vercel Authentication on, Standard Protection** (Settings → Deployment Protection). This one
    stays on after launch.
  - Net effect, verified end to end: every branch including `main` deploys as a **preview** that is
    login-gated (302 to `vercel.com/sso-api`) and carries `X-Robots-Tag: noindex`. Launch step L7
    reverses the production branch and the Ignored Build Step; see §6.
  - Note for later sessions: Vercel skips a build when the commit SHA has already been deployed, and
    GitHub commit statuses are per-SHA rather than per-branch, so a stale "Vercel: success" can show
    on a branch that never built.
  Still to do in GitHub repo settings: enable branch protection on `main` requiring the three CI
  checks (after Session 7 adds them). **Blocked until launch, found 2026-09-23 when Session 7's
  checks existed and the agent tried to set it:** GitHub answers both the branch-protection API and
  the newer rulesets API with `403 Upgrade to GitHub Pro or make this repository public to enable
  this feature`, because `paigewebsite` is private on a free personal account. Both are free on a
  public repository, so **this moves into the launch steps** (§6, L7), on the public repository
  right after it goes public — the only alternative being GitHub Pro, which Paige declined on
  2026-09-23. Until then the three checks run on every PR but nothing enforces them, and
  `main` takes merge commits only.
- **S0-F. Decide what the published build logs may say.** *Added 2026-09-20 at Paige's request.*
  Session 8 renders `docs/build-log/*.md` on `/how-this-was-built`, and gate (b) forbids an
  `_source/` path in a served page. Paige's decision on 2026-09-20 set three steps: scrub the
  entries, then render them, then decide about history. **Steps 1 (scrub) and 3 (history) are
  superseded by S0-G and the seed (2026-09-30):** S0-G scrubs the entries, and the public
  repository starts from one seed commit of the scrubbed tree (§6), so no history is rewritten.
  **Step 2 stays with Session 8:** it renders the scrubbed entries, after which
  `projects.spec.ts`'s per-route `_source/` check covers `/how-this-was-built` too. The
  engineering, the decisions and the "What the AI got wrong and how it was caught" record stay in
  every entry.
- **S0-G. Publication scrub — agent session.** *Added 2026-09-30 at Paige's request.* Branch
  `s0g-publication-scrub`, log `docs/build-log/s0g-publication-scrub.md`, one PR, no screenshots
  (no UI change); after Session 7, before Session 8. It prepares this repository's tree to become
  the first commit of the public repository: it adds the publication gate
  (`tests/unit/publication.test.ts`, run by `npm test`), scrubs the specs, `AGENTS.md`, `README.md`
  and the build logs to the publication rules in `AGENTS.md`, and re-specifies Session 8 and the
  launch (§4 Session 8, §6). Its prompt is in Paige's private notes. Paige's decisions,
  2026-09-30:
  - **D1 — staged provenance paths.** Paige renamed the staged files in place to lower-case slugs,
    bytes unchanged, so every recorded digest still matches. Content records, their tests and the
    derive scripts carry the slug paths; the publication gate rejects any other staged file name.
  - **D2 — which cleared About and certification details stay, and which unrendered source notes
    are reduced to labels.** About's paragraphs and the GMLE metric note stay as published;
    About's unrendered source list becomes labels and dates.
  - **D3 — the public repository** is `PaigeRattenberry/paige-rattenberry-site`, created at launch
    from one seed commit. `PaigeRattenberry/paigewebsite` stays private as the pre-launch archive:
    never change its visibility, and never add the public repository as one of its remotes.
  - **D4 — private notes directory:** `private/` at the repository root, git-ignored under
    "# Local notes. Never committed."
  - **D5 — screenshots:** all of `docs/screenshots/` goes into the seed.
  - **D6 — build stats:** a committed snapshot of this repository's history, counts and dates
    only, taken during Session 8; no token in Vercel.
  - **D7 — the gate's private term list:** an Actions secret `PUBLICATION_TERMS` in both
    repositories, written to a file before `npm test` in CI job 1; locally
    `private/publication-terms.txt`. A pull request from a fork, which gets no secrets, warns
    and skips the private half; any other run without the secret fails (narrowed from "a pull
    request" at Paige's request, 2026-10-01, after a review found that a same-repository pull
    request could pass with the private half skipped).
  - **D8 — the `Claude-Session` commit trailer** stays in future public commits.
  - **D9 — a GitHub Support request about the pre-launch repository**, Paige's, filed after the
    public repository goes public and before the archive is archived (§6, L8).

  Acceptance: every finding of Paige's pre-launch review is fixed at the tip or kept by a recorded
  decision (D2, D5); the publication gate is green with the private terms present; the three CI
  jobs are green; the Session 8 spec and prompt describe the two-repository launch; no command in
  the tree changes `PaigeRattenberry/paigewebsite`'s visibility. Paige sets the
  `PUBLICATION_TERMS` secret on this repository before merging (§6, L1 has the command).

---

## 4. Sessions (each independently reviewable; each ends in a PR)

Estimated Claude-session time in parentheses; Paige's review time is extra.

### Session 1 — Scaffold, design system, shell  *(3–4 h)*
**Tasks**
1. `git checkout main && git pull` (the private repo and `main` already exist), then branch `s1-scaffold`.
2. Scaffold Next.js 16 + TS + Tailwind 4 + ESLint/Prettier at repo root (§2 versions). Node 24 `.nvmrc`
   and `engines`. `.gitignore` includes `_source/`, `.env*`, `test-results/`, `playwright-report/`.
3. Design tokens in `app/globals.css` (`@theme`): light palette on `:root`, dark tokens under
   `[data-theme="dark"]` only (DESIGN §4.2), teal accent, font variables from `next/font/google`
   (Source Serif 4, Inter, JetBrains Mono). `next-themes` toggle with `attribute="data-theme"` and
   `enableSystem`.
4. Shell: `Header` (name, nav for all §2 routes, theme toggle, mobile menu), `Footer`, `PageHeader`,
   `Prose`, `Card`, `Tag`, `Callout`, `Figure`, `not-found`. Placeholder pages for every route with
   a title and one sentence so nav never 404s.
5. Hero motif: `contour.ts` generates deterministic iso-line SVG paths at build time; `ContourField`
   client island drifts them slowly, static under reduced motion.
6. Vitest + Testing Library set up with one component test; Playwright set up with (a) a screenshot
   spec that visits every route at 1280/390 px and writes `docs/screenshots/s1-*.png`, and (b)
   `tests/e2e/a11y.spec.ts`: `@axe-core/playwright` over every route in both themes against
   `next start`, failing on serious/critical. The route list lives in one shared module both specs
   import, so later sessions add a route once.
7. CI in `.github/workflows/ci.yml` on Node 24: job 1 (`lint`, `typecheck`, `test`, `build`) and
   job 2 (`a11y`: build, `next start`, Playwright axe spec). Lighthouse (job 3) waits for Session 7.
8. `README.md` (run locally, PowerShell), `LICENSE`, `docs/build-log/s1-scaffold.md`, and `CLAUDE.md`
   via `/init`, then edited so it carries the §0 conventions verbatim: branch/PR discipline, the
   never-regress gates, `_source/` is read-only and untracked, build-log + screenshots per session,
   "facts only from `content/`". Later sessions read CLAUDE.md automatically, so this is the cheapest
   way to keep them on the rails.

**Acceptance:** `npm run build` clean; every route renders the shell in both themes; contour motif
visible and static under reduced motion; nav keyboard operable; CI jobs 1 and 2 green on the PR;
screenshots committed; build-log entry present; CLAUDE.md carries the §0 conventions; nothing from
`_source/` committed.

### Session 2 — Content model, Home, About, Experience  *(3–4 h)*
**Tasks**
1. Read `_source/INVENTORY.md`, the resume of record it names, the LinkedIn snapshot in
   `_source/linkedin/`, and DESIGN §3.2. Where they disagree, INVENTORY's settled facts win, then the
   resume. Build `content/` per DESIGN §3.1:
   `profile`, `experience`, `education`, `certifications`, `skills` vocabulary, `research`, `leadership`
   (data only; pages for research/leadership come in Session 4), `assets.json`.
2. zod schemas + loaders in `lib/content/`; `tests/unit/content.test.ts` enforcing the claims gate
   (every metric has a `source`), skills-in-vocabulary, and assets provenance.
3. Home page: hero (name, positioning line, three CTAs), "Selected work" with three placeholder-linked
   cards, "Currently", skills strip. Copy from resume wording; the positioning line is DESIGN §3.2's
   draft unless `INVENTORY.md` overrides it.
4. About page: 3–5 paragraphs drafted from the resume, LinkedIn seed, and `INVENTORY.md` notes; headshot
   from `_source/photos` if cleared (copy to `public/images/about/`, record in `assets.json`).
5. Experience page: each role in resume wording with bullets and skill tags (explorer comes in
   Session 5; leave a clearly marked slot).
6. `MetricStat` component with source tooltip; use it for every number.
7. Build-log entry, screenshots.

**Acceptance:** content tests green; no phone number anywhere (the DESIGN §3.4 phone pattern finds
nothing in the **text** files under `app/ components/ content/ public/`, and the same check is a unit
test so it never regresses — §3.4 says why the check skips binaries); Home passes the DESIGN §1
30-second test at 1280 px without scrolling; About and Experience render from `content/` only;
`assets.json` lists every file under `public/images`.

### Session 3a — Projects index + MDX pipeline + StimMap3D page body  *(3 h)*
**Prerequisite:** Session 2 and the 2026-09-13 review follow-up merged. S0-D is **not** required.

> **Split 2026-09-13 (requested by Paige).** Session 3 is now Session 3a (this section) and
> Session 3b (after Session 4). 3a builds everything that does not depend on StimMap3D being deployed
> and public; 3b wires in the live app, the public repo and the StimMap3D screenshots. Session 4 runs
> between them, on top of 3a.

> **Amended 2026-09-12 (approved by Paige) for what Session 2 shipped.** Session 2 built parts of
> the content layer this session extends; read `lib/content/schema.ts`, `lib/content/load.ts`,
> `content/projects.ts`, `content/research.ts` and `docs/build-log/s2-content-core.md` first.
> - **Fold `content/projects.ts` into MDX frontmatter; do not keep both.** Its three entries become
>   the frontmatter of `stimmap3d.mdx`, `spinal-curvature-capstone.mdx` and
>   `interpretable-medical-imaging-thesis.mdx` (the last two frontmatter-only now; Session 4 writes
>   their bodies), and `content/projects.ts` is deleted. **Extend Session 2's `ProjectSchema`**
>   rather than defining a second project schema: add `cover` and the `resume` block from DESIGN
>   §3.1. `links` is an array of `{ label, url }` today (the capstone's SFU article has no key in
>   DESIGN's `{ live, repo, pdf }` object); keep the array with a typed `kind`, or migrate, and
>   update every reader. `proof`, `bullets`, `dates`, `periods`, `metrics`, `disclaimer` and
>   `source` stay.
> - **`lib/content/load.ts` stays the only import path.** The MDX loader lives in `lib/content/`
>   and still exports `projects` and `featuredProjects`, which the home cards and the About page's
>   StimMap3D disclaimer callout already read. Add MDX projects to `allMetrics()`,
>   `allSourceIds()` and `allSkillRefs()`, and extend the "every metric is rendered" test to
>   frontmatter metrics and to `MetricStat` values used in MDX bodies.
> - **One list of project slugs.** `lib/routes.ts` hard-codes the three deep-page routes as
>   `projectSlugs`; `generateStaticParams` must read slugs from content, and `routes.ts` must not
>   become a second, divergent list.
> - **No retyped facts across files.** Clinical CoPilot, the capnography/EEG research item and the
>   GenAI literature review already live in `content/research.ts`. Their project cards either take
>   title, dates, summary and metrics from that item (e.g. a `researchId` in frontmatter resolved by
>   the loader) or a test asserts the two copies match. The Google 5-Day GenAI Intensive is a
>   certification (`content/certifications.ts`), not a card; MentalWell is its capstone and gets the
>   card.
**Tasks**
1. MDX pipeline (`next-mdx-remote` RSC, gray-matter, zod frontmatter, remark/rehype plugins);
   `app/projects/[slug]` with `generateStaticParams`; `Prose` styling for MDX. The MDX loader stays
   server-only. `cover` is optional and must resolve to an image in `assets.json`; StimMap3D's cover
   arrives in Session 3b.
2. Frontmatter-only MDX cards for every non-deep project in DESIGN §3.2 (MentalWell, Clinical CoPilot,
   CMPT 412 vision, ML for cybersecurity, EEGTMS app, capnography/EEG research, GenAI literature
   review). `links.repo` only where `INVENTORY.md` says the repo may be linked; today that is none,
   because StimMap3D's repo stays private until S0-D.
3. Projects index: featured deep-page cards on top, filterable grid beneath (client island for
   tag filter, URL-synced). Core content prerenders; if `useSearchParams` is used, isolate it in a
   small Suspense boundary; test direct URLs, clear, back/forward and invalid values against a
   production build.
4. `EmbedFrame` (client island, DESIGN §7.1) as a **reusable** click-to-load frame: takes the iframe
   `src`, an accessible `title`, an "open in a new tab" link and an optional poster image from
   `assets.json`, renders a 16:9 poster with a "Load" button, mounts the iframe only on click, and
   shows a fallback link if the frame fails. Unit/component tests use a fixture URL. Session 4 reuses
   it for the valedictorian video; Session 3b mounts it on the StimMap3D page. Do **not** put a
   placeholder StimMap3D URL into `content/`.
5. `content/projects/stimmap3d.mdx` deep page written from the StimMap3D README, DESIGN.md §6, and
   CLAUDE.md in the StimMap3D repository (read-only): what it is, features, physics and
   limitations (quoted, with attribution), engineering rigor with sourced metrics (test count, axe
   gate, honesty gates), and a "Built with Claude Code" sidebar linking to `/how-this-was-built`.
   Record in the build log the StimMap3D commit SHA the quotes and metrics were read from, so 3b can
   re-check them against the public revision. Leave out, for 3b: the embed, the live-app and repo
   links, the link to StimMap3D's `SESSION_PROMPTS.md`, the screenshots and `cover`.
6. `Callout` with StimMap3D's non-clinical wording ("Illustrative model — not for clinical use") near
   the top of the page, where 3b will place the embed; a test asserts it renders on the page.
7. Build-log entry `docs/build-log/s3a-projects-mdx.md`, screenshots (`$env:SESSION = "3a"`).

**Acceptance:** `/projects` and all `/projects/<slug>` routes build statically; `content/projects.ts`
is deleted and `lib/content/load.ts` is still the only import path; cards for every DESIGN §3.2
project; the claims gate covers frontmatter metrics and `MetricStat` values in MDX bodies; the URL
filter passes direct-URL, clear, back/forward and invalid-value checks against `next start`;
`EmbedFrame` mounts no iframe before the click (tested with a fixture URL); StimMap3D disclaimer test
green; every metric on the page has a source; no StimMap3D repo link, live URL or StimMap3D screenshot
committed; build log and screenshots present.

### Session 4 — Capstone + thesis deep pages, Research, Leadership  *(4 h; depends on `_source` quality)*
**Prerequisite (split amendment 2026-09-13):** Session 3a merged — `content/projects/*.mdx` exists,
`content/projects.ts` is gone, and `EmbedFrame` is in `components/embed/`. Read
`docs/build-log/s3a-projects-mdx.md` first. S0-D is not required. The StimMap3D page is unfinished
until Session 3b; leave it alone.

> **Amended 2026-09-13 (requested by Paige) for what Session 3a shipped.** Read `lib/mdx.tsx`,
> `lib/content/projects.ts`, `app/projects/[slug]/page.tsx`, `components/projects/ProjectFacts.tsx`,
> `components/embed/EmbedFrame.tsx` and the claims-gate tests in `tests/unit/content.test.ts` first.
> - **A body replaces the frontmatter fallback.** A deep page with a body renders the body only; its
>   proof and bullets no longer appear on it. Every number the body shows is written as
>   `<MetricStat value="…" />` (one line, double quotes, `value` only; any other form fails the gate)
>   pointing at a frontmatter metric, including spelled-out counts such as the capstone's
>   "six-person" and the thesis's "five". New numbers (IoU values, t-test results) go into
>   frontmatter `metrics` first, with their `_source/` file and a label in `content/sources.ts`.
>   Taglines stay free of metrics (the page header prints them as plain text; a test enforces it).
>   Once both bodies exist no deep page is frontmatter-only: remove `FrontmatterOnly` from the page
>   (and its "written in Session 4" line), add a content test that every `deepPage` project has a
>   body, and replace the capstone frontmatter-only test in
>   `tests/unit/components/ProjectPage.test.tsx` with body tests for both pages (every metric renders
>   with its source label; the SFU article link is present).
> - **MDX bodies can use only `Figure`, `Callout` and `MetricStat`.** A recreated figure or original
>   diagram is a server component registered in the `components` map in `lib/mdx.tsx`. Plotted
>   values are facts: keep them in `content/` with the source figure and page, validate them with
>   zod, reach them through `lib/content/load.ts`, and add the new host to `allMetrics()` /
>   `allSourceIds()` and the claims-gate test if it carries metrics. Number figures in the body.
>   Leave `cover` unset (no capstone or thesis image is cleared); the page would render it as Fig. 1.
> - **Links must be absolute URLs.** `LinkSchema.url` is `z.url()`, so a site path such as
>   `/docs/<thesis>.pdf` fails validation. To link the page-2-removed thesis PDF from project
>   frontmatter or `content/research.ts`, add a site-path form that must resolve to a `document` in
>   `assets.json` (as `cover` resolves to an image), with a test; do not type a production URL.
> - **`content/research.ts` overlaps the two deep pages unchecked.** The thesis and capstone items
>   repeat their project's title, dates and periods, and nothing verifies `projectSlug`. Add tests
>   that every `projectSlug` names a project in `deepPageProjects` and that the shared fields match
>   (or derive them). The thesis item's summary says "five CAM methods" with `metrics: []`; declare
>   the same metric as the project's before /research renders it.
> - **`aside` is StimMap3D-shaped.** `ProjectFacts` appends a "How this site was built" link to any
>   `aside`. Put capstone and thesis provenance and team credit in the body, or make that link
>   opt-in first.
> - **`EmbedFrame` needs small, tested extensions for the video, not a second component.** It uses
>   `src` for both the iframe and the new-tab link, allows only `fullscreen`, and its fallback text
>   says "demo". YouTube does not frame `/watch` URLs, so the iframe needs the embed form (for
>   example `https://www.youtube-nocookie.com/embed/RKIO5EvDJ5Y?start=2727`) while the new-tab link
>   keeps INVENTORY's watch URL with `t=2727s`. Add an optional `href` for the link (default `src`),
>   an optional `allow`, and fallback wording that fits any embed; keep the existing tests green.
>   Derive the embed URL from the watch link in `content/leadership.ts` with a tested helper (or
>   store both in content), label the frame as the graduand address within SFU's full ceremony
>   (INVENTORY), and use no poster (a YouTube thumbnail is not an `assets.json` asset).
> - **Task 6 is already done.** Since 3a, the Home and `/projects` case-study cards link to all three
>   deep pages; check it, do not rebuild it.

**Tasks**
1. Inventory `_source/capstone/` and `_source/thesis/`; read PDFs with available text/page-image tools
   and `pdftotext` (§2) for page-accurate citations. **There are no figure exports
   and none are coming** — S0-A asked Paige for figure exports, and `INVENTORY.md` now records
   that the folder is empty and the inventory is closed. **Do not crop figures out of PDF pages.** The
   capstone decks are marked "do not post the file" and the SFU article's photographs are SFU's
   copyright and link-only, so cropping either would republish material the inventory forbids.
   Instead: the thesis's figures 3.1–4.7 are Paige's own experiment output and may be **recreated** as
   original SVG/React figures; everything else is carried by an original diagram or by prose. Only
   files marked publishable in `INVENTORY.md`.
2. `spinal-curvature-capstone.mdx`: problem, system as built (sensor garment, noise-filtering
   firmware, real-time pressure heatmap), results, Best Overall Project at ICAMES 2022, team credit per
   `INVENTORY.md` consent. Figures: no capstone source figure may be republished, so draw 1–3 original
   diagrams of the sensor-garment / firmware / heatmap pipeline from the architecture the decks
   describe, or carry that section in prose. The ML prediction model is the team's envisioned next
   phase (ICAMES deck p16, final deck p58) and must never be described as built.
3. `interpretable-medical-imaging-thesis.mdx`: question, method (ground truth induced by watermarking
   chest X-rays, not expert annotations), metrics (IoU, paired t-tests), findings, why it matters, and
   2–4 figures **recreated** from the thesis's own figures 3.1–4.7 (Paige's experiment output) —
   recreated, not cropped. The thesis PDF may go to `public/docs/`, but only as a copy with **page 2
   removed**: p2 is the scanned approval page and carries four people's signatures. Use `pdf-lib`
   (already a Session 6 dependency; this machine has no `qpdf` or `pdftk`), and record the derived
   copy in `assets.json` noting the removal.
4. Research & Publications page from `content/research.ts` (items link to project pages or PDFs).
5. Volunteer & Leadership page from `content/leadership.ts`, photos where cleared; valedictorian
   video embed (YouTube, click-to-load through Session 3a's `EmbedFrame`, not a second component) if
   the link is in `INVENTORY.md`.
6. Home "Selected work" cards link to all three deep pages (done in 3a; verify).
7. Build-log entry, screenshots.

**Acceptance:** both deep pages render with provenance, each carrying either a recreated or original
figure or a deliberate prose treatment, and **no figure cropped out of a `_source` PDF**; any shipped
thesis PDF has page 2 removed; Research and Leadership pages render from content; every asset in
`assets.json`; no names of third parties without `consent: true` recorded; content tests green,
including the claims gate over both bodies' `<MetricStat>` references, a body for every deep page,
and research items' `projectSlug`s resolving to deep pages.

### Session 3b — StimMap3D live embed, public links and screenshots  *(1.5 h)*
**Shipped and merged 2026-09-20 — PR #12, `dc0a8af`** (`docs/build-log/s3b-stimmap3d-embed.md`). Everything
below is the record of what was asked for; what was built, what changed against 3a's reading, and
the two review rounds are in the build log. One item missed its target:
Lighthouse mobile performance on `/projects/stimmap3d` came in at **88, 89, 89** rather than ≥ 90,
which the session traced to the site-wide baseline rather than the embed — see Session 7's
2026-09-20 amendment.

**Prerequisite — all met as of 2026-09-20.** S0-D is closed: the live URL and the DLPFC deep-link are
in `_source/INVENTORY.md`, `gh repo view PaigeRattenberry/stimmap3d --json visibility` reports
`PUBLIC`, and Sessions 3a and 4 are merged. Re-run the `INVENTORY.md` and `gh repo view` checks at
the start of the session anyway and stop if either has changed. Sessions 5 and 6 are merged too
(PR #9, 2026-09-16; PR #10, 2026-09-18), exactly where the 2026-09-15 run-order amendment expected
them, so the run-order note below and the 2026-09-16, 2026-09-17 and 2026-09-20 amendments all apply.

> **Run-order note — 2026-09-15 (requested by Paige).** 3b now runs after Sessions 5 and 6, so it
> lands on top of their work. If Session 6 is merged when this session starts:
> - **The cover changes the OG image.** Session 6 adds `app/projects/[slug]/opengraph-image.tsx`.
>   Setting StimMap3D's `cover` may change what `/projects/stimmap3d/opengraph-image` renders, so open
>   it after the change and put the result in the PR the way Session 6 did.
> - **The screenshots are new `assets.json` entries** after Session 6's reconciliation of
>   `public/images`, `public/docs` and the root PDFs. Re-run that check rather than assuming it holds.
> - **Session 6 may have added `/projects/stimmap3d` to the sitemap and metadata**; the embed changes
>   the page's weight, not its route, so no sitemap change is expected. Confirm rather than assume.
> - Session 5's explorer reads project frontmatter. Adding `live` and `repo` links and a `cover` must
>   not change the explorer's entries or edges; its derivation tests should stay green untouched.

> **Split 2026-09-13 (requested by Paige).** This is the deployment-dependent half of the original
> Session 3. Session 3a's tasks and its 2026-09-12 amendment are already on `main`; this session only
> finishes the StimMap3D page.

> **Amended 2026-09-15 (requested by Paige) for what Session 4 shipped.** Read
> `docs/build-log/s4-research-leadership.md` first.
> - **A cover renumbers the body.** The page renders `cover` as Fig. 1, and a content test requires
>   body figure numbers to run consecutively from 2 when a project has a cover (from 1 otherwise).
>   The StimMap3D body has no numbered figures today; any added after the cover start at 2.
> - **MDX drops JSX expression attributes.** `number={2}` reaches a component as nothing while
>   `number="2"` works (`lib/mdx.tsx` notes it). Write string attributes, coerce in the component and
>   throw at build on a missing or malformed value, as `DiagramFigure` and `IouChartFigure` do.
> - **`EmbedFrame` gained `href` and `allow`.** `href` is the always-visible link's target (default
>   `src`), so the frame can open the DLPFC deep link while "Open full app" opens whichever URL
>   DESIGN §7.1 intends; `allow` defaults to `fullscreen`. The fallback sentence is embed-neutral, and
>   the figure's `my-8` margin wins over a margin passed in `className`.

> **Amended 2026-09-16 (requested by Paige) for what Session 5 shipped.** Read
> `docs/build-log/s5-explorer.md` first.
> - **StimMap3D is a timeline entry on `/experience`**, and it carries the project's `disclaimer`
>   (gate c, pinned by unit, component and e2e tests). Keep the frontmatter `disclaimer` as it is.
> - **`npm run build` checks the committed explorer layout.** `prebuild` runs
>   `scripts/layout-explorer.ts --check`. Links and a cover leave it unchanged. If this session changes
>   StimMap3D's `skills`, run `npm run layout:explorer` and commit
>   `content/generated/explorer-layout.json` with the change.

> **Amended 2026-09-17 (requested by Paige) for what Session 6 shipped.** Read
> `docs/build-log/s6-resume-seo.md` first. This settles the "may" items in the run-order note above.
> - **The cover does not change the OG image.** `app/projects/[slug]/opengraph-image.tsx` draws the
>   kicker, title, tagline and disclaimer, not `cover`. Open `/projects/stimmap3d/opengraph-image`
>   after the change and confirm it is unchanged. Putting the cover on the card is a design change for
>   Paige to decide, not part of this session. `screenshots.spec.ts` saves the OG images only when
>   `SESSION=6`; extend that condition if the PR needs a fresh capture.
> - **The sitemap and metadata already cover `/projects/stimmap3d`.** Deep pages reach
>   `lib/routes.ts` from `deepPageProjects`, the page calls `canonical()`, and `seo.spec.ts` checks
>   both. The embed changes neither.
> - **The assets reconciliation is a unit test** ("managed public images, documents and root PDFs
>   match assets.json exactly" in `tests/unit/content.test.ts`). `npm test` runs it, so the new
>   screenshots fail it until each one is recorded.
> - **StimMap3D is on the generated resume.** Its heading links to the deep page when
>   `NEXT_PUBLIC_SITE_URL` is set, and to the project's first absolute link otherwise, so a `live`
>   link changes the locally built PDF. `npm test` regenerates the PDF first (`pretest`), and
>   `tests/unit/resume.test.ts` must stay green: at most two pages, with the disclaimer present.
>   Longer StimMap3D bullets can push the resume to three pages, which fails the build.
> - **The resume's `assets.json` record pins a `revision`**: the commit whose generator and content
>   the PDF reflects. If this session changes anything the resume prints, set `revision` to that
>   commit's full SHA in a follow-up commit.

> **Amended 2026-09-20 (requested by Paige) for what S0-D found.** Read
> `docs/build-log/s0d-stimmap3d.md` first; it carries the evidence behind each decision here.
> - **The facts S0-D recorded**, so this session does not have to rediscover them: live URL
>   `https://stimmap3d.pages.dev`; public repo `https://github.com/PaigeRattenberry/stimmap3d` (MIT),
>   cleared for linking by `INVENTORY.md`; public commit `0a20e810e48dca8aac1780c6478c3d1f51663989`;
>   hero deep-link `https://stimmap3d.pages.dev/?preset=F3&proto=10hz-hf-l&elec=1#/`. Pin a current
>   commit at session time and say in the PR whether it is still that one.
> - **Framing is already known not to be blocked** (no `X-Frame-Options`, no CSP `frame-ancestors`,
>   confirmed in a real cross-origin iframe on 2026-09-20). Task 2 is now a re-check, not a gate to
>   discover. In a 900x600 frame the app's onboarding card sits above the 3D canvas, so size the
>   embed with that in mind or the first thing a reader sees inside the frame is text.
> - **Paige's honest-framing brief is binding on every StimMap3D mention** (`INVENTORY.md`,
>   "Paige's honest-framing brief"): an illustrative model, not a medical device and not for clinical
>   use; a simplified analytical spherical-head approximation, **not** FEM, in clearly-labelled
>   relative units, never V/m; all per-patient outcome trajectories synthetic and badged; never
>   described as predicting treatment response or as anatomically faithful. StimMap3D's own tests
>   enforce these claims, so any copy implying clinical validity contradicts the app one click away.
> - **The test-count metrics on the card are stale and must be replaced.**
>   `content/projects/stimmap3d.mdx` carries "436" Vitest tests and "32" test files, read on
>   2026-09-13, before StimMap3D's public release. The public repo states **447 app tests across 35
>   files**, plus four toolchain-policy tests and 24 production Chromium checks, in
>   `docs/validation.md` — the public README no longer states any count, so the `source` stays
>   `stimmap3d-repo` but each `note` must cite `docs/validation.md` at the pinned commit instead of
>   the README. Update the values, the labels if the wording changes, the notes, and any body text
>   that repeats them (the claims gate requires each value to occur in its associated text). The
>   "~4–10%" field-error *value* is a verbatim match in the public `DESIGN.md` §3.2 and stands; its
>   `note` does not — see the next bullet.
> - **The page's two block quotes need re-sourcing, and one of them is no longer public.** The
>   method statement quoted in the body is verbatim in the public `DESIGN.md` §3.2 and stands. The
>   limitations passage after it is introduced as "From the README's 'How the physics works (and what
>   it gets wrong)'" — at the pinned SHA the public README is a 38-line overview with no such section
>   and none of that text, and the public `DESIGN.md` states the same limitations in different words
>   ("vs. real spiral windings, per PLOS ONE 2017", with parenthetical expansions). Re-quote it
>   verbatim from `DESIGN.md` §3.2 at the pinned commit, or paraphrase it outside the block quote.
>   Both attributions also name sections the public repo does not have — the body's closing line says
>   "StimMap3D's README and DESIGN.md §6" and the `~4–10%` `note` says "StimMap3D's README and
>   DESIGN §6.2", while the public `DESIGN.md` runs §1–§4. Repoint both at §3.2 and drop the README
>   claim. (S0-D checked the metric values, not the quotes; this came out of the review of PR #11.)
> - **Screenshots: one from the repo, the rest captured live (Paige's decision, 2026-09-20).** The
>   public repo ships exactly one image, `docs/screenshots/visualizer.png`; the earlier task 4 wording
>   assumed four to six were there. Ship that one with **repository** provenance, and capture the
>   remaining three to five from the live app with Playwright, recording those with **staged**
>   provenance. Each capture is written to `_source/stimmap3d/` first — an approved exception to
>   `_source/` being read-only (AGENTS.md) — so the staged original exists outside git, and the
>   optimized copy ships under `public/images/stimmap3d/`. A staged record's `source` is that
>   `_source/stimmap3d/<file>.png` path and its `revision` names what was captured: the deployed
>   commit SHA, the origin and the capture date. Capture the disclaimer banner in frame wherever it
>   is on screen, and inspect every image before committing it.
> - **StimMap3D has no `SESSION_PROMPTS.md`, so link a public equivalent (Paige's decision,
>   2026-09-20).** The "Built with Claude Code" aside links
>   `https://github.com/PaigeRattenberry/stimmap3d/blob/<pinned SHA>/docs/agentic-development.md`
>   ("AI-assisted workflow and review briefs"), pinned at the same commit as the screenshots so the
>   link cannot rot into a 404. `CLAUDE.md` and `AGENTS.md` in that repo are the alternates if the
>   aside's wording turns out to fit them better; do not link a path that does not exist.
> - **`ProjectLinkSchema`'s comment in `lib/content/schema.ts`** still says a `repo` link is cleared
>   for no repository ("today: none"). Update it with the StimMap3D clearance when the link lands.

**Tasks**
1. Record `live` and `repo` links in `content/projects/stimmap3d.mdx` frontmatter, in whichever link
   shape 3a settled on. `INVENTORY.md` clears the StimMap3D repo for linking now that it is public.
2. Re-check the live app's response headers for `X-Frame-Options` or a CSP `frame-ancestors` that
   would block the frame (DESIGN §7.1); S0-D found none on 2026-09-20. If the frame is blocked, stop
   and ask Paige rather than working around it.
3. Mount Session 3a's `EmbedFrame` on the StimMap3D page with the live URL plus the DLPFC deep-link
   (DESIGN §7.1): the disclaimer stays visible around the frame, with an "Open full app" link and the
   fallback link.
4. Ship four to six images under `public/images/stimmap3d/`, per the 2026-09-20 amendment:
   `docs/screenshots/visualizer.png` copied from the **public** repo at one pinned commit, recorded
   with repository provenance (`source: stimmap3d-repo`, repository URL, `sourceFile`, the full
   commit SHA); plus three to five captured from the live app with Playwright, staged into
   `_source/stimmap3d/` and recorded with staged provenance (`source: _source/stimmap3d/<file>.png`,
   `revision` naming the deployed commit, the origin and the capture date). Every record carries
   rights, permission, transformations, alt text and dimensions. Validate the real approved
   screenshot and inspect every image before committing it. Set the project's `cover` and the embed
   poster from these assets.
5. Re-check every StimMap3D quote and metric 3a placed (its build log records the SHA it read) against
   the same public commit; update anything that changed and say so in the build log. The test counts
   are already known to have changed — 436 → **447** and 32 → **35 files**, cited to
   `docs/validation.md` rather than the README — and so is the limitations block quote, whose public
   source is now `DESIGN.md` §3.2 rather than a README section that no longer exists (2026-09-20
   amendment).
6. Add the "Built with Claude Code" sidebar's link to `docs/agentic-development.md` in the public
   StimMap3D repo, pinned at the same commit (that repo has no `SESSION_PROMPTS.md`; 2026-09-20
   amendment), and the live-app and repo links in the page body.
7. Build-log entry `docs/build-log/s3b-stimmap3d-embed.md`, screenshots (`$env:SESSION = "3b"`),
   including one with the embed loaded.

**Acceptance:** StimMap3D embed loads only after click and shows the live app (checked with
Playwright against `next start`); disclaimer test still green; live-app and public repo links present;
every StimMap3D screenshot in `assets.json` — the repo image with a full public commit SHA, each live
capture with staged provenance naming the deployed commit, origin and capture date; quotes and
metrics re-checked against that commit, with the test counts updated to 447 across 35 files; every metric on the page has a source; Lighthouse performance on
`/projects/stimmap3d` ≥ 90 (run locally with `npx lhci autorun` against `next start`) and reported in
the PR.

### Session 5 — Career timeline + skills explorer  *(4 h)*
**Prerequisite (run-order amendment 2026-09-15):** Session 4 merged. S0-D and Session 3b are **not**
required — the explorer derives from `content/` only. The StimMap3D project has no `live` or `repo`
link and no `cover` until 3b; that must not matter to the explorer, and a missing link field must not
be treated as an error.

> **Amended 2026-09-15 (requested by Paige) for what Session 4 shipped.**
> - **Stryker is one entry, taken from the `experience` role** (Paige's decision, 2026-09-15; this
>   answers the question the next bullet used to ask). The `content/research.ts` Stryker item
>   describes the same work and must not produce a second entry. There is no link field between the
>   two, so match them deliberately — for example by a constant in `lib/content/explorer.ts` naming
>   the pair — and cover it with the same de-duplication test as the `researchId` and `projectSlug`
>   pairs. Keep the research item's skills on the single entry so no skill co-occurrence is lost.
> - **Some work is recorded twice.** Three projects take their facts from a research item through
>   `researchId` (Clinical CoPilot, the capnography/EEG research, the GenAI literature review), and
>   the thesis and capstone research items point at their deep pages through `projectSlug` (a
>   content test holds their title, dates and periods equal). Derive one explorer entry per piece of
>   work from each such pair, or those five appear twice and their skill co-occurrences count double;
>   test it. Stryker is an `experience` role and a separate research item with no link field between
>   them; it is **one entry** (answered above, 2026-09-15).
> - **Order by `periods`, not `dates`.** `dates` is display text in several shapes ("Sept 2021 – May
>   2022", "Apr – Aug 2022"); `newestFirst()` in `lib/content/load.ts` sorts on `periods[0].start`.
> - **Conference reviewing lives in `content/leadership.ts`** (`alsoResearch: true`, which /research
>   lists under "Reviewing"). DESIGN §7.2 derives the explorer from experience, projects and research,
>   so it is not an entry unless Paige decides otherwise.
> - `/experience` renders its roles with `DatedEntry` as h2s. If the explorer adds a section heading
>   above them, keep heading order valid: an entry under a section h2 takes `headingLevel={3}`.

**Tasks**
1. `lib/content/explorer.ts`: derive entries and skill edges from `experience`, `projects`, `research`.
2. `scripts/layout-explorer.ts`: d3-force layout made deterministic with
   `simulation.randomSource(seededPrng)` (d3-force already defaults to a fixed-seed generator; keep input order, tick count and versions fixed), writes `content/generated/explorer-layout.json`; wired
   into `prebuild` and committed. A test asserts the committed file equals a fresh run.
3. `Timeline`, `FilterChips`, `SkillsConstellation` client islands per DESIGN §7.2, URL-synced filter,
   `aria-live` result count, "View as list" toggle, keyboard support, reduced-motion.
4. Place the explorer at the top of `/experience`; static constellation teaser beside the Home hero
   at ≥ 1024 px.
5. Unit tests for derivation (every entry appears, edges symmetric) and a component test for filtering.
6. Build-log entry, screenshots (default, filtered by one skill, list view, mobile).

**Acceptance:** filter by a skill highlights the right entries and updates the URL; explorer is fully
keyboard operable; axe reports zero serious/critical issues on `/experience`; initial JS for `/` stays
≤ 120 KB gzipped (report the number in the PR).

### Session 6 — Resume PDF single source of truth + SEO/OG/sitemap  *(3 h)*
**Prerequisite (run-order amendment 2026-09-15):** Session 4 merged; Session 5 merged if it ran first.
S0-D and Session 3b are **not** required. `/projects/stimmap3d` exists and its OG image renders from
frontmatter, so the acceptance check on it can be done now; the page has no `cover` until 3b, which
re-checks that image afterwards.

> **Resume fallback file — 2026-09-15 (Paige's decision).** The approved hand-made resume is
> the resume of record, revised 2026-09-11 (the newest export under `_source/resume/`; the folder
> also holds 2026-09-09 and original versions — do not use those). This answers the "confirm with Paige
> which one is approved" step in task 3.
>
> **It cannot ship as-is.** A `pdftotext` extract on 2026-09-15 found both placeholders still in it:
> `[ADD PORTFOLIO URL]` in the contact line on page 1, and `[ADD LIVE URL]` on the StimMap3D entry.
> DESIGN §5.4 and the Session 6 resume test both forbid a shipped `[ADD ` string, so if the §5.4
> fallback rule is triggered, that file fails the gate. The generated PDF is unaffected: it renders
> from `content/`, which has no placeholders. Therefore:
> - Build the generator first and give it a real chance; the fallback is the contingency, not the plan.
> - If the fallback is needed, **stop and ask Paige for a corrected export** rather than editing the
>   PDF or weakening the test. Both placeholders need her input: the portfolio URL commits to the
>   production site URL (`paigerattenberry.vercel.app`, which serves nothing until launch), and the
>   StimMap3D live URL comes from S0-D. If S0-D is still unfinished, the StimMap3D line may have to
>   drop the URL instead of carrying a placeholder.
> - Either way, keep the resume test's `[ADD ` assertion exactly as specified; it is what caught this.

> **Amended 2026-09-15 (requested by Paige) for what Session 4 shipped.**
> - **pdf-lib is already a devDependency** (1.17.1, for `scripts/derive-thesis-pdf.mjs` and
>   `tests/unit/documents.test.ts`); do not add it again.
> - **Every `document` in `assets.json` is checked by `tests/unit/documents.test.ts`:** the file
>   exists with its recorded `pageCount` and a non-empty PDF title, and holds no object outside its
>   page tree, catalog and info (page objects equal the page count). The resume PDF, generated or
>   fallback, needs a document record, a title set in the PDF, and must pass those checks.
> - **No test extracts PDF text yet.** Session 4 ran `pdftotext` on the thesis copy by hand and
>   recorded it in the asset's transformations. When `pdf-parse` lands, run the DESIGN §3.4 phone
>   pattern and the `[ADD ` check over every listed document, not only the resume. The thesis copy's
>   text matches the phone pattern in IoU table rows and DOI strings (reviewed in Session 4): give
>   each reviewed match a narrow, page-specific exception rather than weakening the pattern.
> - `/docs/paige-rattenberry-honours-thesis-2022.pdf` is a document, not an HTML route: keep it out of
>   the axe and screenshot sets, and decide deliberately whether the sitemap lists it.
> - **Ship the GenAI literature review PDF** (Paige's decision, 2026-09-15; Session 4 left it open).
>   The literature review of 21 April 2024 (staged under `_source/research/`) is
>   10 pages, cleared in `INVENTORY.md` as Paige's own work with no other people in it and nothing to
>   remove, so it ships as a copy, not a derivative. Record it in `assets.json` (title, `mediaType`,
>   `pageCount`, staged provenance with the original's hash, rights, permission, transformations,
>   `people: []`, consent), extract its text first and check it for the DESIGN §3.4 phone pattern,
>   `[ADD ` placeholders and anything else private, then link it from the `genai-literature-review`
>   item in `content/research.ts` as a `/docs/<file>.pdf` link, the way the thesis item does. Its
>   figures are reproduced from cited sources (the DARPA XAI chart on p. 2): the PDF may ship whole,
>   as the thesis does, but no figure may be lifted out as a site image. No deep page — Paige decided
>   on 2026-09-15 that a review without a method or results does not earn a fourth case study.

> **Amended 2026-09-16 (requested by Paige) for what Session 5 shipped.**
> - **`prebuild` already exists**: `tsx scripts/layout-explorer.ts --check`, which fails the build if
>   the committed explorer layout is stale. Chain the resume script onto it with `&&`; do not replace
>   it. `tsx` (4.23.13) is already a devDependency and can run `scripts/build-resume.tsx`.
> - **`/experience?skill=<id>` is a filtered view, not a route.** The sitemap lists `/experience` only,
>   and its canonical URL and metadata ignore the query. `/projects?tag=<id>` works the same way.

**Tasks**
1. `scripts/build-resume.tsx` with `@react-pdf/renderer` rendering `content/` into a two-page PDF
   mirroring the current resume's section order, fonts registered from `@fontsource/*` TTFs;
   `prebuild` hook; output `public/Paige-Rattenberry-Resume.pdf`.
2. `tests/unit/resume.test.ts`: page count ≤ 2 (pdf-lib), key strings present (pdf-parse), DESIGN §3.4
   phone pattern absent, and no unfilled `[ADD ` placeholder.
3. `/resume` as a `redirects()` entry in `next.config.ts` (a route handler would become a serverless
   function); "Download resume" CTAs point at it. Apply the DESIGN §5.4 fallback rule if layout
   quality is not acceptable: ship the hand-made PDF from `_source/resume/` (it carries no phone
   number — S0-B's `-web.pdf` was cancelled by the 2026-09-10 amendment), and say so in the build log.
   The approved file is named in the 2026-09-15 resume-fallback note above — do not ask again — and it
   still carries both `[ADD ` placeholders, so read that note before taking this path.
4. `metadataBase`, per-page metadata, `sitemap.ts`, `robots.ts`, root + per-project
   `opengraph-image.tsx` via `next/og` in site typography, JSON-LD `Person` on Home, favicon/icon.
5. `.env.example` with `NEXT_PUBLIC_SITE_URL`; README notes to set it in Vercel.
6. Build-log entry; attach the generated PDF's two pages as PNGs in `docs/screenshots/`.

**Acceptance:** PDF generated at build and downloadable; resume test green; `/sitemap.xml` lists all
routes; each route has a unique title/description; OG image renders for `/` and each project (verify by
opening `/opengraph-image` and `/projects/stimmap3d/opengraph-image` in the preview).

### Session 6b — Positioning and the interpretability thread  *(4–6 h)*
**Added 2026-09-20 at Paige's request.** An editorial pass, not a structural one: it changes
emphasis, ordering and vocabulary over facts that are already in `content/`, and adds one deep page
built from a document Paige wrote. **It introduces no new fact and no new claim.** The rationale is
DESIGN §0 ("Editorial pass") and §1 answer 1.

> **As built — 2026-09-20; merged 2026-09-21 as PR #14** (`docs/build-log/s6b-positioning.md`). All
> eleven tasks shipped. About's present-tense paragraph was added after the first review, from
> options Paige chose, and the Egypt passage was
> condensed into the closing paragraph to keep five. Three things the task list did not foresee, recorded for whoever touches these next:
> (1) skill labels also print in the resume's "Technical skills" lines, so a relabel changes the
> PDF as well as the site; (2) `explorer.spec.ts` and `Explorer.test.tsx` name the `xai` label;
> (3) three unit tests assumed the featured projects and the deep pages are the same set, and now
> assert three featured inside four deep pages. `/research` reaches the literature review's page
> through the card's `researchId` (`deepPageForResearch()`), not a second `projectSlug`.
> `AboutSchema` caps About at five paragraphs, so a sixth from Paige needs that cap raised.
> Home's initial JS was 137.1 KB gzipped before and after.

**Prerequisite:** Sessions 5, 6 and 3b merged (3b merged 2026-09-20 as PR #12, `dc0a8af`). Runs
**before** Session 7, so the new route is covered by Session 7's axe, responsive and Lighthouse
sweeps, and before Session 8, so the build story, the launch snapshot and the `assets.json`
reconciliation include it. Branch `s6b-positioning`; one PR; Paige merges.

**Decided before the session (Paige, 2026-09-20).** These are settled; the session implements them
rather than re-opening them.

| Decision | Value |
|---|---|
| Positioning line | *"I build the instruments that check what AI systems claim — evaluation harnesses that run as merge gates, retrieval that traces every claim back to its source, and research on whether a model's explanation points at the evidence. Mostly where being wrong has a real cost."* (267 characters; the cap is ~280, see DESIGN §1) |
| Featured order | StimMap3D, Honours thesis, Adolescent Spinal Curvature capstone. **No fourth featured card** — both grids are `md:grid-cols-3` and a fourth wraps onto a row alone |
| Resume PDF | The rewritten literature-review summary **may** change the generated resume line. Let it; keep the PDF at two pages and update the `revision` pin on its `assets.json` record in a follow-up commit |
| Agent-oversight wording | **Cleared by Paige 2026-09-20**: the multi-agent infrastructure-automation work may be described as involving guardrails, permissioning and oversight of what agents were allowed to do |
| About's present-tense paragraph | Paige supplies the text and approves the exact wording. **If it is not approved when the session runs, ship without it** — the agent must not draft an opinion for her |

**Tasks**
1. **Profile** (`content/profile.ts`): the positioning line above; a rewritten `currently.text` that
   carries what the positioning line does not (the MCP server and agent loop behind access-control
   filters and citation guardrails, and the scheduled audit job that opens its own remediation pull
   requests), **keeping the `220+` token** the claims gate requires; `skillsStrip` set to
   `["eval-harness", "grounding", "agent-loops", "mcp", "rag", "xai"]` — a reorder **and** a
   membership change: `grounding` joins the strip and `python` leaves it, deliberately, because the
   strip names what the work is rather than what it is written in. The strip is display only; it is
   not part of the skill graph, so this does not move the constellation. Update `profile.sources`.
   **Do not touch** `experience.ts` bullets (verbatim resume of record) or `profile.summary` (the
   resume's opening paragraph; changing it changes the PDF).
2. **About** (`content/about.ts`): promote *"making a system's claims checkable instead of merely
   fluent"* to the start of ¶2; add the groundedness/hallucination framing and the
   agent-oversight sentence; add one sentence connecting the SHIELD anomaly-detection work and the
   GMLE to the same thread **without** inflating it into "AI security research"; add Paige's
   present-tense paragraph if approved. Keep the page numeral-free so it needs no metric host.
3. **Skill labels** (`content/skills.ts`): `xai` → `"Interpretability (XAI)"`, optionally
   `grounding` → `"Grounding & claim verification"`. **Label text only, and keep them short.**
   Labels decide label placement (`lib/explorer/layout.ts` → `labelWidth(n.label)`), so a long label
   invalidates `content/generated/explorer-layout.json`; both labels were measured on 2026-09-20,
   separately and together, and each leaves the committed layout byte-identical; longer labels for
   `xai` (39 and 45 characters) make `--check` exit 1. Prove it with
   `npx tsx scripts/layout-explorer.ts --check` and say so in the PR.
4. **`/research` themes**: add a `theme` field to `ResearchItemSchema` and the group headings to
   `lib/content/labels.ts` (a theme is a fact about the work, so it does not get typed into the
   page); render the three groups in DESIGN §2's order with "Reviewing" below; update the page lede
   and description.
5. **The literature review's summary** (`content/research.ts`): rewrite
   `genai-literature-review.summary` to state what the review actually covers and concludes, and
   declare `14` as a metric on **the research item** (`{ value: "14", label: …, source: LIT_REVIEW }`).
   It must be on the research item and not in the MDX frontmatter: `mergeResearch` in
   `lib/content/projects.ts` replaces a `researchId` card's `metrics` with the item's, so a metric
   declared in the MDX is discarded. The summary must then contain the literal token `14`, because
   the claims gate checks the value against the item's `summary` (and, for the card, against its
   `proof`, which is that same summary). Say **"14 papers"** or "14 references", not "14 studies" —
   14 is the reference count, verified against the shipped PDF's reference list, and three of them
   are surveys cited for context.
6. **The deep page** (`content/projects/genai-literature-review.mdx`): `deepPage: true` plus an MDX
   body to DESIGN §2's outline. Do not retype any research-derived field. Render `14` as
   `<MetricStat value="14" />` and avoid every other bare numeral except dates. No figures.
7. **Its tests** (`tests/unit/components/ProjectPage.test.tsx`): add a body test for the new page
   **and** add its slug to the "every deep page is covered by a body test above" array. That test
   exists to force this; the suite fails without both.
8. **Featured reorder**: thesis `order: 2`, capstone `order: 3`, and update the expected array in
   `tests/unit/content.test.ts` → "the featured projects keep the DESIGN §0 order".
9. **Thesis page** (`content/projects/interpretable-medical-imaging-thesis.mdx`): change the tagline
   to the method question, and add one closing paragraph on what the approach carries and what it
   does not. **Change no measured claim**; write the paragraph with no numeral. The new tagline must
   contain no declared metric and must stay unique across the site — it is the page's
   `<meta description>`.
10. **Metadata** (`app/layout.tsx`, `app/about/page.tsx`, `app/research/page.tsx`): descriptions that
    name the subject rather than the structure, all mutually unique (`seo.spec.ts` compares every
    route's against every other). `/projects`' description is built from the featured card titles, so
    task 8 changes it already, and the Open Graph **image** renders `profile.positioning`, so task 1
    changes that already.
11. **Build log** `docs/build-log/s6b-positioning.md` from the AGENTS.md template, written to S0-F's
    standard: no `_source/` paths where a public label will do. Screenshots with `SESSION=6b`.

**Latitude (added 2026-09-20 at Paige's request).** The session may make **additional changes beyond
this list** when they serve the same goal, provided every one of the following holds. Anything that
fails one of them is written up as a recommendation in the PR body instead of being done.
- Every new or changed statement traces to a fact already in `content/`, or to a source already
  labelled in `content/sources.ts` or already cleared in `_source/INVENTORY.md`. No fact from the
  model's own knowledge, and no new metric without a source.
- It does not touch: the verbatim resume bullets in `content/experience.ts`; `profile.summary`;
  anything in `_source/` except reading it; the decisions above; StimMap3D's disclaimer.
- It does not change the skill **graph** (adding or removing a skill on an entry re-lays out the
  whole constellation and invalidates the Session 5 screenshots), the featured set beyond task 8,
  or any of the three spec files. Those are proposals, not changes.
- It is verifiable by a check that runs in this repo, and the check is added or named.
- It is listed under its own heading in the PR body and in the build log's "Generated work and
  rejected suggestions", with what was verified and how.

**Verification** (PowerShell, in this order): `npm run lint`; `npm run typecheck`;
`npx tsx scripts/layout-explorer.ts --check` (must pass **without** regenerating);
`npm run resume` (if the resume line changed; must stay two pages); `npm test`; `npm run build`;
`npm run e2e:a11y`; `npm run e2e:features`; `$env:SESSION = "6b"; npm run e2e:screenshots`;
`node scripts/js-budget.mjs /` (record the number before and after, so Session 7 is not handed a
moving baseline — it was 137.1 KB gzipped after Session 6).

**Acceptance**
1. Home's first sentence names verification, evaluation or interpretability; every clause maps to a
   bullet already in `content/`; it renders inside the Open Graph card without overflowing.
2. `/projects/genai-literature-review` prerenders, has its own OG card, is in the sitemap, has a body
   test, and renders every numeral through `MetricStat` or not at all.
3. `/research` reads as three themed groups with interpretability and evaluation first, the theme
   comes from `content/`, and no item was dropped.
4. Home and `/projects` show three case studies — StimMap3D, thesis, capstone — on one row.
5. The thesis page's measured claims are byte-identical; only the tagline and one added paragraph
   differ.
6. `layout-explorer.ts --check` passes with no change to the committed layout, or the regenerated
   file is committed and the constellation and Home teaser were reviewed.
7. Claims gate and privacy gate pass; `git status` shows no `_source/` file.
8. If the resume PDF changed it is two pages and its `assets.json` `revision` is updated in a
   follow-up commit; if it did not change, the PR says why.
9. The session adds no fact and no organisation that is not already in `content/`; the existing
   employers, institutions and venues stay.
10. Zero console errors; CI green; the Vercel preview works in an incognito window.

### Session 7 — Accessibility + performance gates, cross-device polish  *(3 h)*
> **Built 2026-09-21; merged as PR #15** (`docs/build-log/s7-quality-gates.md`). Lighthouse is CI job 3 and
> all three jobs are green on the PR; the mobile baseline moved from 85–92 to 93–96 on `/` and
> `/experience` and 90–93 on `/projects/stimmap3d` by cutting font bytes and deferring far-off layout
> on `/experience`, not by touching the targets. The original JS target could not be met: Home ships 137.1 KB of initial
> JavaScript against 120 KB, of which 127.3 KB is the App Router's own floor (see the build log).
> **Decided by Paige on 2026-09-21:** DESIGN §8 now budgets the site's own client JS on `/` at
> ≤ 15 KB gzipped (9.8 KB today), enforced by `npm run budget` in CI job 1.

**Prerequisite (run-order amendment 2026-09-15):** Sessions 5, 6 **and 3b** merged. This is the first
session that genuinely needs S0-D: task 1 runs axe with the StimMap3D embed loaded and with an
explorer filter active, and task 2 runs Lighthouse on `/projects/stimmap3d`. Do not start it while 3b
is outstanding; there is no useful partial version. 3b shipped and **merged on 2026-09-20 as PR #12**
(`dc0a8af`).

> **Amended 2026-09-20 (requested by Paige).** **Session 6b now runs before this one**, so start
> Session 7 once 6b is merged. 6b adds one HTML route (`/projects/genai-literature-review`), so the
> axe sweep, the responsive sweep, the screenshots and Lighthouse all cover one more page; it adds no
> client JavaScript, so the JS budget baseline below is unchanged — 6b records the number before and
> after so this session is not handed a moving target. 6b also leaves one note for this session's
> polish pass: in the constellation, `agent-loops`, `eval-harness`, `ci-gated-validation` and
> `openai-agents-sdk` are four of the eight labels that do not fit and so are never drawn
> (`gemini-vertex-ai`, `bm25f`, `access-control` and `embedded` are the others; `grounding` does
> fit and is drawn). It is a
> label-fitting and hub-threshold question (`lib/explorer/layout.ts`), not a content question. Do not
> "fix" it by re-tagging content.

> **Amended 2026-09-15 (requested by Paige) for what Session 4 shipped.**
> - **Chart markup weight.** Each `IouChartFigure` carries per-node utility classes worth about
>   1.5–2 KB raw per chart per serialisation (HTML and RSC payload), and the thesis page has two.
>   Session 4's review left this for this budget pass: measure it, and move repeated classes into a
>   component rule if it matters.
> - **Sweep the Session 4 pages too:** `/projects/interpretable-medical-imaging-thesis` (SVG charts
>   with HTML labels, disclosure tables), `/projects/spinal-curvature-capstone` (flow diagrams that
>   stack below `md`), `/research` and `/leadership` (a posterless 16:9 video frame) at
>   360/768/1280/1920 px in both themes.
> - **A possibly flaky e2e test.** In Session 4, "/projects/stimmap3d metric tooltips stay on screen at
>   360px" failed once under parallel workers and passed alone. If it flakes in CI, fix its wait
>   rather than adding retries.

> **Amended 2026-09-16 (requested by Paige) for what Session 5 shipped.** Read
> `docs/build-log/s5-explorer.md` first.
> - **The Home JS budget is not met.** `node scripts/js-budget.mjs /` (after `npm run build`; prefix
>   `MSYS_NO_PATHCONV=1` in Git Bash) reported **136.6 KB** gzipped for modern browsers against
>   DESIGN §8's 120 KB. A build of `main` before Session 5 shipped the same chunks byte for byte, so
>   the overage is framework weight from Session 1 (React DOM 69.7 KB, App Router client 42.6 KB),
>   not the explorer. `/experience` ships 140.6 KB. Task 3's "JS budget" means this number: measure
>   it again, try to reduce it, and report the result against 120 KB in the PR. If it cannot be
>   reached without dropping the App Router, say so and let Paige decide; do not relax the target.
> - **Axe with an explorer filter already runs.** `tests/e2e/explorer.spec.ts` checks
>   `/experience?skill=xai` in both themes, and CI job 2 runs it (`npm run e2e:features`). Task 1
>   can point at that check instead of duplicating it. It still needs to add the StimMap3D embed case.
> - **Static SVG weight.** The Home teaser is 15.6 KB raw (about 1.5 KB gzipped), sent twice (HTML
>   and RSC payload) and capped at 16 KB by a unit test. The full constellation adds 36.4 KB raw
>   (2.9 KB gzipped) to `/experience`'s HTML. Include both in the Lighthouse review.
> - **Sweep the explorer too**: constellation labels, the chips and the timeline at 360/768/1280/1920
>   px in both themes, "View as list", and the teaser-to-contour switch at 1024 px.
> - **Smooth scrolling slows hover tests.** `html` has `scroll-behavior: smooth`. Session 5 fixed the
>   metric-tooltip hover test by scrolling its target into view in one instant step first. Use the
>   same fix if the StimMap3D 360 px tooltip test flakes. One unexplained failure is on record:
>   "/contact has no serious or critical violations" (light) failed once on 2026-09-16, then passed
>   six of six runs alone and the next full run.

> **Amended 2026-09-17 (requested by Paige) for what Session 6 shipped.** Read
> `docs/build-log/s6-resume-seo.md` first.
> - **The JS numbers moved slightly.** After Session 6, `node scripts/js-budget.mjs /` reports
>   **137.1 KB** gzipped (136.6 KB before) and `/experience` reports 141.4 KB (140.6 KB before). The
>   2026-09-16 note above still applies.
> - **`/resume` is a redirect, not a page.** The axe sweep and the screenshots cover `htmlRoutes` only
>   (95 axe tests after Session 6). Do not point Lighthouse at `/resume`. `seo.spec.ts` checks the
>   redirect and the PDF.
> - **CI job 2 already runs `seo.spec.ts`** through `npm run e2e:features`.
> - **Lighthouse's SEO category reads absolute URLs.** Canonical, Open Graph and sitemap URLs come
>   from `lib/site.ts`. With `NEXT_PUBLIC_SITE_URL` unset, CI uses `http://localhost:3000`, while
>   `next start` serves port 3100. Confirm that the canonical audit passes against that server. If it
>   does not, give the Lighthouse job an origin that matches the server; do not relax `seo = 1`. Run
>   Lighthouse against `next start`, not a Vercel preview: previews send `X-Robots-Tag: noindex`,
>   which fails the crawlability audit.
> - **Home now carries an inline JSON-LD script** (`jsonLdHtml()` in `lib/seo.ts`), and every page
>   carries Open Graph and Twitter tags. Count both in the HTML weight review.

> **Amended 2026-09-20 (requested by Paige) for what Session 3b shipped.** Read
> `docs/build-log/s3b-stimmap3d-embed.md` first. The last prerequisite is now met.
> - **Lighthouse on `/projects/stimmap3d` is the open item of this session.** Session 3b measured
>   **88, 89, 89** mobile over three runs (accessibility 100; desktop 100) against the ≥ 90 target,
>   and showed the embed is not the cause: `/projects/spinal-curvature-capstone`, which has no image
>   at all, scores 88 in the same run with the same simulated 3.8 s LCP, while the observed LCP on
>   both pages is about 0.24 s (FCP 1.1 s, TBT 30–70 ms, CLS 0). Treat it as the site-wide baseline
>   under simulated mobile throttling — that is this session's task 3 — not as an embed regression.
>   Session 3b used plain `npx lighthouse` (13.5) because no Lighthouse CI config exists until now.
> - **Axe with the embed loaded already runs.** `tests/e2e/projects.spec.ts` clicks "Load interactive
>   demo" against a stubbed `stimmap3d.pages.dev` and then calls `expectNoBlockingViolations`, and CI
>   job 2 runs it. Task 1 can point at that check the way the 2026-09-16 note points at the explorer's,
>   rather than duplicating either. What is left for task 1 is confirming route coverage.
> - **The embed's poster is the page's LCP element** and the only image above the fold: 16:9,
>   `loading="eager"` with `fetchPriority="high"`, inside a container with a fixed aspect ratio, so
>   CLS is 0 before the click. The frame grows to 16:10 after the click, which is a visitor-initiated
>   change. Task 3's "CLS from the embed poster" is therefore a re-check, not a known defect.
> - **The 360 px tooltip flake has a second data point, on a different page.** "/experience metric
>   tooltips stay on screen at 360px" failed once under four parallel workers during Session 3b's
>   review round — `boundingBox()` returned null on a tooltip that had just passed `toBeVisible()` —
>   and passed on every re-run. With the Session 4 sighting on `/projects/stimmap3d`, that is twice,
>   on two routes, always under parallelism. Fix the wait (a null box is the symptom to guard), do
>   not add retries.
> - **The page is heavier than it was.** `/projects/stimmap3d` now ships six images (one 366 KB PNG
>   copied byte-identical from the public repository, five WebP captures) plus the click-to-load
>   frame, which adds no request and no script to the initial page. Include the PNG in the image
>   sizing review; it is byte-identical on purpose, so anyone can verify it against the upstream blob
>   id, and re-encoding it would trade that away.
> - **The privacy e2e is now per route.** `projects.spec.ts` asserts no `_source/` path reaches any
>   entry in `htmlRoutes` (Session 3b shipped a client-island prop that serialized one into
>   `/projects/stimmap3d`'s payload; the review round caught it). Keep it per route when adding pages.

**Tasks**
1. Confirm `tests/e2e/a11y.spec.ts` (from Session 1) still covers every route added since, in both
   themes, and now also runs axe with the StimMap3D embed loaded and with one explorer filter active.
2. `lighthouserc.json` + CI job 3 (`@lhci/cli`, mobile preset, assertions from DESIGN §5.7) on `/`,
   `/projects/stimmap3d`, `/experience` against `next start`; all three jobs run on PRs. While editing
   the workflow, bump `actions/checkout` and `actions/setup-node` to v5: v4 targets Node 20, which
   GitHub deprecated, so every run currently logs a deprecation annotation.
3. Fix everything Lighthouse surfaces (fonts, image sizing, JS budget, CLS from the embed poster).
4. Sweep 360/768/1280/1920 px and both themes; check focus rings, skip link, heading order, image alt
   text, reduced-motion, no horizontal scroll.
5. Build-log entry, screenshots (mobile set).

**Acceptance:** all three CI jobs green on the PR; Lighthouse numbers reported in the PR body; Paige
then enables branch protection (S0-E) requiring the three checks — which turned out to need a public
repository, so it moved into the launch steps (§6, L7; S0-E, amended 2026-09-23).

### Session 8 — "How This Site Was Built" page + launch preparation  *(3 h)*
> **Built 2026-10-01 and 2026-10-02 as PR #18** (`docs/build-log/s8-launch.md`). As built: one page
> per build log under `/how-this-was-built/`, derived in `lib/routes.ts`; the synthesis's counts are
> the lengths of item lists in `content/build-story.ts`, each item tied to its log, drafted by
> Claude Code and published as drafted at Paige's request (2026-10-02); the gallery is six crops of committed screenshots, each an `assets.json` image with
> repository provenance in this repository (so L10 re-pins them with the resume record); the page
> is the fourth Lighthouse route; a mono extras face covers the logs' code-span characters.
> **Amended 2026-09-30 (S0-G; Paige's decisions D3, D6, D9).** Read IMPLEMENTATION_PLAN §3 S0-G
> and `docs/build-log/s0g-publication-scrub.md` first.
> - **Two repositories.** Session 8 runs here, in `PaigeRattenberry/paigewebsite`, so the
>   build-story page is reviewed privately. After its PR merges, the launch steps (§6) seed the
>   public repository `PaigeRattenberry/paige-rattenberry-site` with one commit of this tree, and
>   nothing more is committed here. **Never change `PaigeRattenberry/paigewebsite`'s visibility; it
>   is the private pre-launch archive.** The launch steps replace this section's old visibility
>   flip.
> - **The publication gate runs under `npm test`** (`tests/unit/publication.test.ts`): keep it green
>   with Paige's private term list present. The page, the `s8-launch.md` log, the PR body and the
>   commit messages follow AGENTS.md's publication rules.
> - **Build stats are a committed snapshot (D6)**, counts and dates only, of this repository's
>   history (DESIGN §5.6). `scripts/fetch-build-stats.ts` runs by hand with `gh auth token`; it is
>   **not** chained onto `prebuild`, so a Vercel build of the public repository never calls the
>   GitHub API, and there is no `GITHUB_TOKEN` in Vercel or `.env.example`.
> - **One repository URL constant.** The planning-doc links and the transparency statement read one
>   URL constant from `content/`, `https://github.com/PaigeRattenberry/paige-rattenberry-site`. It
>   is not a project link, so `assertPublishableLinks` and `CLEARED_REPOSITORIES`
>   (`lib/content/projects.ts`, project frontmatter only) do not see it; if a project ever links
>   the public repository, add it to `CLEARED_REPOSITORIES` then, with Paige's inventory row. Its
>   links return 404 until launch step L7 and are re-checked at L10; there is no automated
>   external-link check.
> - **PR numbers render as plain text.** The pre-launch repository is private, so the page links
>   no PR, commit or branch page there.
> - **A GitHub Support request about the pre-launch repository** is Paige's (D9; §6, L8), drafted in
>   her private notes, never in a PR body or a committed file.

> **Amended 2026-09-15 (requested by Paige) for what Session 4 left.**
> - The `assets.json` reconciliation covers `public/docs/` as well as `public/images/`.
> - **(Added 2026-09-16 for what Session 5 shipped.)** `prebuild` already checks the explorer layout
>   (and, after Session 6, builds the resume). `content/generated/explorer-layout.json` is
>   generated, committed output holding only skill ids and coordinates. It is not an asset, so it
>   stays out of the `assets.json` reconciliation. (Its instruction to chain `fetch-build-stats` onto
>   `prebuild` is superseded by D6, 2026-09-30.)
> - **(Added 2026-09-17 for what Session 6 shipped; read `docs/build-log/s6-resume-seo.md`.)**
>   `prebuild` also renders the resume (and, since Session 7, checks the font files). (Its
>   instruction to append `fetch-build-stats` is superseded by D6, 2026-09-30.)
> - `/how-this-was-built` is already in `lib/routes.ts`, so the sitemap, the axe sweep, the
>   screenshots and `seo.spec.ts` cover it. The page must wrap its metadata in
>   `canonical("/how-this-was-built", …)` with a unique title and description, or the SEO spec fails.
>   If the timeline gets one page per build-log entry, derive those routes in `lib/routes.ts` the
>   way deep projects are derived, so the sitemap follows.
> - **Setting `NEXT_PUBLIC_SITE_URL` changes the resume.** Once it is set, the next deploy prints the
>   site host on the generated PDF and links deep-page projects to the site. Check the production PDF
>   after the redeploy. The value must be an origin (a trailing slash is accepted; a path fails the
>   build). The site serves only the generated PDF.
> - The reconciliation includes root PDFs. The generated resume is git-ignored and exists only after
>   a build or `npm run resume`. If this session changes anything the resume prints, update its
>   record's `revision` as Session 3b's 2026-09-17 note describes.

> **Amended 2026-09-21 for what Session 7 shipped.** Read `docs/build-log/s7-quality-gates.md` first.
> - **Three CI jobs now.** Job 3 is `lhci autorun` from `lighthouserc.json` (five mobile runs each of
>   `/`, `/projects/stimmap3d`, `/experience` against `next start`; performance on the median, the
>   other categories on the worst run). To have the build-story page audited too, add its URL there.
>   On Windows `lhci` cannot finish (chrome-launcher's temp-profile cleanup); use
>   `node scripts/lighthouse-local.mjs`. Branch protection (S0-E, now launch step L7) names them
>   exactly: "Lint, typecheck, test, build", "Accessibility (axe, both themes)", "Lighthouse
>   (mobile)".
> - **Fonts are self-hosted and cover the latin subset plus three characters.** The build-story page
>   renders every build-log entry, and the logs use characters outside Google's latin range ("→",
>   "≥", "≤", "✓"; "×" is inside it). `tests/e2e/fonts.spec.ts` fails on any the fonts lack. For each
>   one decide: add it to `INTER_EXTRAS` in `scripts/build-fonts.mjs` if Inter has the glyph in one
>   of its `@fontsource-variable` subsets (then `npm run fonts` and the literal `unicode-range` in
>   `app/layout.tsx`), or list it beside "∂∇" as a known system-font symbol. Extras exist for the body
>   stack only; mono and heading text have none. A weight outside serif 400–500 or Inter/mono
>   400–700 clamps until the range in that script is widened.
> - **Lighthouse margin.** Simulated LCP counts every byte that finished before the first paint, and
>   against localhost that is all of them: about 18 KB costs 0.1 s. The page must not add preloaded
>   fonts, above-the-fold images without `sizes`, or a client island it can do without.
> - **Home's JS budget was restated (Paige, 2026-09-21).** DESIGN §8 budgets the site's *own* client
>   JS on `/` at ≤ 15 KB gzipped: 9.8 KB today, above a 127.3 KB framework floor that no change to
>   the site can remove. `npm run budget` (CI job 1, after the build) fails over 15 KB. The shell's
>   islands count toward it on every page, so a new client component in the layout or on Home
>   spends from a 5 KB margin.
> - **Two sweep conventions.** A 16:9 posterless `EmbedFrame` has about 160 px of height on a phone,
>   so keep its title short; chart axis labels thin out below `sm`. Both have e2e checks at 360 px.

**Tasks**
1. `scripts/fetch-build-stats.ts` (D6): run by hand against `PaigeRattenberry/paigewebsite` with
   `gh auth token`; writes `content/generated/build-stats.json` with counts and dates only (merged
   PRs, commits, first and last merge dates; no titles, branch names or messages); committed; not
   chained onto `prebuild`.
2. `/how-this-was-built`: transparency statement; links to the three planning docs in the public
   repository (the URL constant above); build-log entries rendered as a timeline (MDX loader for
   `docs/build-log/*.md`); the build stats under the sentence "The public history begins at launch;
   the counts below are a snapshot of the pre-launch history, and the build logs are the record of
   the build."; screenshot gallery; "what worked / what did not" synthesis drafted from the build
   logs for Paige to edit; StimMap3D as case study #1 linking to its public repository's
   `docs/agentic-development.md` at the pinned commit (it has no session pack; Session 3b).
   > **Amended 2026-09-20 (requested by Paige), two parts; the first updated 2026-09-30.**
   > - **S0-G must be merged first.** It scrubbed the entries (S0-F's step 1), and gate (b) forbids
   >   an `_source/` path in a served page, so `projects.spec.ts`'s per-route check covers this page
   >   the moment it exists.
   > - **Write the synthesis as a taxonomy, not a list of anecdotes.** Every session entry carries a
   >   "What the AI got wrong and how it was caught" section, and together they are the most current
   >   engineering evidence on the site: what the agent got wrong, and which mechanism caught it —
   >   the privacy gate, the claims gate, the type checker, a lint rule, an axe check, an e2e test,
   >   a review pass, Paige. Group them that way, give the counts, quote two or three verbatim, and
   >   say plainly which gates were **added because of** a failure. Accuracy bound: this is an
   >   honest record of one site's build. It is **not** research, a benchmark, an evaluation or a
   >   dataset, it does not generalise to agents at large, and the gates were engineering, not an
   >   experiment. Say so on the page.
3. Launch checklist executed in-session: `rg` for the DESIGN §3.4 phone pattern and secret patterns
   across the working tree (the tree only: history is handled by the seed, since the public
   repository starts from one commit of this tree, and the PR body says so); the publication gate
   green; `assets.json` vs `public/images` and `public/docs` reconciliation; all external links
   checked by hand (the public repository's links are expected to 404 until L7); README polished
   with a screenshot; `LICENSE` verified. The repository description and homepage are set at L1 and
   the social preview image at L7, both on the public repository.
4. Final build-log entry `s8-launch.md`; PR.
5. **After Paige merges:** the launch steps L1–L9 (§6) are Paige's, and L10 is the first agent
   session in the public repository; the PR body lists them.

**Acceptance:** build-story page renders every build-log entry and the snapshot stats; launch
checklist items all checked in the PR body; the publication gate and all three CI jobs green; the
tree is ready to seed `PaigeRattenberry/paige-rattenberry-site` (§6). After the launch steps: the
S0-E locks are lifted, so `paigerattenberry.vercel.app` serves a real production deployment built
from the public repository; the site loads in incognito with no Vercel login; the public
repository is public with branch protection; `PaigeRattenberry/paigewebsite` is private and
archived.

### Session 9 — Pre-launch content update  *(3 h)*
> **Added 2026-10-06 at Paige's request.** Runs after Session 8 merges and before launch step L1,
> in `PaigeRattenberry/paigewebsite`, on branch `s9-content-update`, as one PR that Paige merges.
> The detailed session plan, with Paige's decisions of 2026-10-06, is kept with Paige's private
> notes. Content changes plus two small code steps: no new feature and no new skill id.

Tasks:
1. **Code steps, first.** An optional `resumeDetail` on certifications, which the resume prints in
   place of `detail`, with a claims-gate test that a resume line prints no number its site detail
   does not source; three new source ids in `SourceIdSchema` (`site-build-record`,
   `giac-gmle-objectives`, `sans-sec595-course`), each with a label in `content/sources.ts`.
2. **Hammerspace pull requests:** 220+ becomes 300+ (Paige's dated entry in the source inventory),
   and the platform is "internal", not "production", in the Experience bullet, the Home
   "Currently" line and the resume's opening paragraph.
3. **Experience wording** from the LinkedIn snapshot of 2026-09-11 and Paige's dated entries in the
   inventory: four Hammerspace bullets, led by evaluation; SHIELD's incident triage; Stryker
   softened ("toward", "applied and evaluated"). Hammerspace gains the `pytorch` tag its fourth
   bullet names (Paige, 2026-10-06, after the PR's code review), with the Home teaser's edges drawn
   as one path per stroke width so it stays under its size cap.
4. **Thesis:** credit the induced-ground-truth design to Zhou, Booth, Ribeiro and Shah (AAAI 2022)
   in the page body, the second resume bullet and the `/research` summary; state the failed
   ResNet-34 run exactly, with a sourced metric.
5. **About:** correct the fourth paragraph's incident facts against the lab's technical report and
   the affected company's technical timeline (no organisation named, no digits, Paige's closing
   sentences unchanged); name the LLM judge, and the human review after it, in the second.
6. **GMLE and SEC595:** what the exam and the course cover, on `/experience`, from the official GIAC
   and SANS pages and the grade report; shorter resume lines through `resumeDetail`.
7. **This site as a card-only project** (`paige-rattenberry-site`): not featured, no deep page, no
   link, on the resume; regenerate the explorer layout.
8. **Resume at two pages**, with and without `NEXT_PUBLIC_SITE_URL`, by Paige's ordered cuts,
   stopping once it fits: MentalWell off the resume; CMPT 412 to one bullet; a shorter
   literature-review bullet; FAISAL Lab off the resume. Samsung stays. If it still overflows,
   stop and ask Paige.
9. **Home's build-story pointer** and the `/research` heading "Research".
10. This file, `SESSION_PROMPTS.md`, AGENTS.md and the README brought up to date; build log and
    screenshots; the resume record pinned to the last commit that changes what it prints, in a
    follow-up commit; the pre-launch history snapshot refreshed as the PR's last commit.

**Acceptance:** lint, typecheck, `npm test` with the private term list present (claims, privacy,
publication, resume and documents gates; the Home teaser's size cap), `npm run build`,
`npm run budget`, `npm run e2e:a11y` and `npm run e2e:features` green; the resume two pages in both
renders; no "220+" or "production knowledge platform" left in page text; the explorer layout
regenerated; the history snapshot refreshed last; all three CI jobs green.

### Session 9b — Pre-seed fixes  *(1 h)*
> **Added 2026-10-07 at Paige's request**, after a review of the repository's state before launch
> step L1. Runs in `PaigeRattenberry/paigewebsite`, on branch `s9b-pre-seed`, as one PR that Paige
> merges; the launch steps follow its merge. Three small fixes that the seed would otherwise carry
> into the public repository until L10.

Tasks:
1. **Empty review notes:** a build log's page leaves out the `## Paige's review notes` heading when
   nothing follows it; the files keep the heading, and a log with notes renders them. A unit test
   covers both cases.
2. **README:** how to run `npm test` in a clone without the private term list
   (`PUBLICATION_TERMS_OPTIONAL=1`), checked in a worktree with neither git-ignored folder.
3. **Thesis bullet 1:** "Built" in place of "Designed" (Paige, 2026-10-07), since bullet 2
   credits the evaluation design to Zhou et al.
4. This file, `SESSION_PROMPTS.md`, AGENTS.md, DESIGN.md and the README; build log and
   screenshots; the resume record pinned to the commit that changes what it prints, in a follow-up
   commit; the pre-launch history snapshot refreshed as the PR's last commit.

**Acceptance:** lint, typecheck, `npm test` with the private term list present, `npm run build`,
`npm run budget`, `npm run e2e:a11y` and `npm run e2e:features` green; the resume two pages in both
renders; no empty review-notes heading on any log page, and Session 1's notes still rendered; the
history snapshot refreshed last; all three CI jobs green.

### Stretch (only after launch) — see DESIGN §9
Custom domain · analytics · XAI mini-demo · contact form · build-story video · blog.

---

## 5. Timeline (suggested)

| Week | Sessions | Paige's prerequisites |
|---|---|---|
| 1 | S1, S2 | S0-A, S0-B before S1; S0-E after S1 merges |
| 2 | S3a, S4 | `_source` complete before S4 |
| 3 | S5, S6 | S0-D any time in this week (closed 2026-09-20); review PDF layout carefully after S6 |
| 4 | S3b, **S6b**, S7, **S0-G**, S8 | S0-D **done** (2026-09-20); S3b merged 2026-09-20; S6b's decisions settled 2026-09-20; **S0-G's decisions (D1–D9) before S0-G**, the `PUBLICATION_TERMS` secret before S0-G merges; the launch steps (§6) after S8, branch protection among them |

Updated by the 2026-09-15 run-order amendment: S3b moved out of week 2 into week 4, so the two
sessions that need nothing from S0-D (S5, S6) run while the StimMap3D deployment finishes. If S0-D
lands sooner, S3b can be run as soon as it does — which is what happened: S0-D closed 2026-09-20,
during week 3, so S3b is ready to run.

Roughly 27.5 hours of Claude-session time plus review (splitting Session 3 adds about 1.5 hours; the
2026-09-20 Session 6b adds 4–6 more, for roughly 32). Sessions 2 and 4 are the ones most likely to
need a second pass, because they depend on the quality and clearance of `_source/` materials.

---

## 6. Deployment and launch

- **Vercel** builds every push; PR previews are the review surface (URL appears in the PR checks).
  Previews are login-gated and `noindex` (S0-E), so reviewing one means signing in to Vercel.
- **Production = `launch` until launch step L7, then `main`.** During the build there is
  deliberately no production deployment at all, because the Hobby plan cannot protect a production
  domain (S0-E); `paigerattenberry.vercel.app` returns `404 DEPLOYMENT_NOT_FOUND` until launch. L7
  restores Branch Tracking to `main` and the Ignored Build Step to "Automatic". Environment:
  `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`. No `GITHUB_TOKEN` (build stats are a
  committed snapshot, D6).
- Build command `npm run build` (direct `next build` skips npm lifecycle hooks); `prebuild` checks
  the committed explorer layout and the font files and renders the resume. Output is fully static;
  no serverless functions are required.
- Rollback: redeploy a previous Vercel deployment from the dashboard.

### Launch steps (after Session 9b merges)

Added 2026-09-30 (S0-G). **Two repositories:** `PaigeRattenberry/paigewebsite` (private, the
pre-launch archive; never change its visibility, never add another repository as its remote) and
`PaigeRattenberry/paige-rattenberry-site` (public from L7; decision D3). L1–L9 are Paige's; L10 is
the first agent session in the public repository. Nothing is committed to `paigewebsite` after
Session 9b's merge. The seed is `git archive` of `main` (tracked files only), never a copy of this
working copy's `.git` directory and never a mirror push. Paths are built from this checkout's own
location: `$Old` is the checkout, `$New` a new folder beside it, `$Zip` a file in the temporary
folder. They exist only in the PowerShell window that set them, so re-run L1's first line, from
inside the `paigewebsite` checkout (never from `$New`, where L3 leaves the window), in any new
window before a later step; L1's verify line confirms `$Old` is the archive.

L1. **Create the public repository, private first, and give it the secret.**
    ```powershell
    $Old = (git rev-parse --show-toplevel) -replace '/', '\'; $New = Join-Path (Split-Path $Old) "paige-rattenberry-site"; $Zip = Join-Path $env:TEMP "seed.zip"
    gh repo create PaigeRattenberry/paige-rattenberry-site --private --description "Personal portfolio site for Paige Rattenberry, built with Claude Code" --homepage https://paigerattenberry.vercel.app
    cmd /c "gh secret set PUBLICATION_TERMS -R PaigeRattenberry/paige-rattenberry-site < `"$Old\private\publication-terms.txt`""
    ```
    Set the secret by redirect, never through a PowerShell pipe (Windows PowerShell 5.1 pipes to
    native programs as ASCII and can prepend a BOM). The same command with `paigewebsite` sets it on
    the archive, before S0-G merges; re-run it after every change to the term file. Verify:
    `git -C $Old remote get-url origin` ends in `paigewebsite.git` (after every re-run of the first
    line); `gh repo view PaigeRattenberry/paige-rattenberry-site --json visibility` → PRIVATE;
    `gh secret list -R PaigeRattenberry/paige-rattenberry-site` lists `PUBLICATION_TERMS`. Confirm
    GitHub's "Keep my email addresses private" setting is on (web merges then use the noreply
    address).
L2. **Seed from the tracked tree of `main`.**
    ```powershell
    git -C $Old switch main; git -C $Old pull --ff-only
    git -C $Old archive --format=zip -o $Zip main
    Expand-Archive $Zip $New
    git -C $New init -b main
    git -C $New config user.name "Paige Rattenberry"
    git -C $New config user.email "42778026+PaigeRattenberry@users.noreply.github.com"
    git -C $New add -A
    git -C $New commit -m "Seed the public repository from the reviewed tree (<YYYY-MM-DD>)"
    git -C $New remote add origin https://github.com/PaigeRattenberry/paige-rattenberry-site.git
    Remove-Item $Zip
    ```
    Verify before pushing:
    `(git -C $New rev-parse 'HEAD^{tree}') -eq (git -C $Old rev-parse 'main^{tree}')` → True;
    `git -C $New log --format='%an <%ae> | %cn <%ce>'` → one line, noreply both sides;
    `Test-Path "$New\_source"`, `Test-Path "$New\private"` → False.
L3. **Bring the git-ignored material to the new working copy, then test there.**
    ```powershell
    Copy-Item -Recurse "$Old\_source" "$New\_source"; Copy-Item -Recurse "$Old\private" "$New\private"
    git -C $New status --porcelain        # prints nothing: both are git-ignored
    cd $New; npm ci; npm test; npm run build
    ```
    Verify: all green, with the publication test's private half and the staged-digest test running
    (not skipped).
L4. **Push and let CI run.** `git -C $New push -u origin main`. Verify:
    `gh run list -R PaigeRattenberry/paige-rattenberry-site` shows a completed run, and
    `gh run view <id> -R PaigeRattenberry/paige-rattenberry-site --json jobs` shows the three jobs
    green.
L5. **Re-point Vercel** (the existing project, so its environment variables, domain and protection
    carry over). GitHub → Settings → Applications → Vercel → Configure → add
    `paige-rattenberry-site` to repository access. Before disconnecting, confirm Ignored Build Step
    reads "Only build pre-production". Vercel → project `paigerattenberry` → Settings → Git →
    Disconnect → Connect → `PaigeRattenberry/paige-rattenberry-site`. Right after Connect, open
    Deployments and delete any deployment the connection started. **Immediately set both S0-E
    locks again** (Environments → Production → Branch Tracking = `launch`; Build and Deployment →
    Ignored Build Step = "Only build pre-production") before any push: the production branch lives
    in the Git link, so a new connection most likely resets it to `main`. Then trigger the first
    build explicitly:
    `git -C $New commit --allow-empty -m "Check the Vercel connection"; git -C $New push`.
    If Vercel will not accept `launch` because the new repository has no such branch, the Ignored
    Build Step lock alone keeps production empty, but then a push to `main` builds nothing, so
    trigger the check from a throwaway branch instead:
    `git -C $New push origin HEAD:refs/heads/vercel-check`, verify the preview, then
    `git -C $New push origin --delete vercel-check`. Never push a `launch` branch. Verify: a
    login-gated preview (302 to `vercel.com/sso-api`, `X-Robots-Tag: noindex`) built from the new
    repository; Settings → Git shows the new repository; `paigerattenberry.vercel.app` still returns
    `404 DEPLOYMENT_NOT_FOUND`. Then delete every deployment dated before the switch (Deployments,
    filtered by date; both repositories use `main`, so a branch filter cannot tell them apart), and
    remove `paigewebsite` from the Vercel GitHub App's repository access.
L6. **Go/no-go (all must hold):**
    - L3's `npm test` passed in `$New` with the private terms present, and Paige has read the new
      repository's `DESIGN.md`, `AGENTS.md`, `README.md` and two build logs in GitHub's UI;
    - `git -C $New log --format='%ae%n%ce' | Sort-Object -Unique` prints only noreply addresses;
    - `gh repo view PaigeRattenberry/paigewebsite --json visibility` → PRIVATE (the archive);
    - Vercel serves the preview from the new repository, and both S0-E locks are still set;
    - `git -C $Old remote -v` shows only `paigewebsite`.
L7. **Make the public repository public, then the launch settings.**
    ```powershell
    gh repo edit PaigeRattenberry/paige-rattenberry-site --visibility public --accept-visibility-change-consequences
    $Protection = '{"required_status_checks":{"strict":false,"checks":[{"context":"Lint, typecheck, test, build","app_id":15368},{"context":"Accessibility (axe, both themes)","app_id":15368},{"context":"Lighthouse (mobile)","app_id":15368}]},"enforce_admins":false,"required_pull_request_reviews":null,"restrictions":null}'
    [IO.File]::WriteAllText("$env:TEMP\protection.json", $Protection)   # UTF-8 without BOM
    gh api -X PUT repos/PaigeRattenberry/paige-rattenberry-site/branches/main/protection --input "$env:TEMP\protection.json"
    Remove-Item "$env:TEMP\protection.json"
    ```
    (No here-string and no pipe: pasted from an indented block, a here-string's closing `'@` is
    not at column 0, and a pipe can add a BOM. `checks` pins each required check to GitHub Actions,
    app id 15368; the three names are the CI job names. `enforce_admins: false` lets Paige still
    push to `main`.) Then in Vercel: confirm (or set) `NEXT_PUBLIC_SITE_URL` for Production; undo
    the two S0-E locks (Ignored Build Step → "Automatic"; Branch Tracking → `main`); then start a
    **fresh** production build, because changing the settings rebuilds nothing: Deployments →
    Create Deployment → branch `main`, or
    `git -C $New commit --allow-empty -m "Build production"; git -C $New push`. Verify: the new
    deployment shows Environment = Production; the production URL loads in incognito with no
    Vercel login; `/sitemap.xml`, `/robots.txt` and the canonical link on `/` carry the production
    origin, not `localhost:3000`; `/resume` serves the generated PDF, now printing the site host;
    `gh api repos/PaigeRattenberry/paige-rattenberry-site/branches/main/protection --jq '.required_status_checks.checks[].context'`
    lists the three checks. Set the repository's social preview image by hand (Settings → Social
    preview; `gh` cannot).
L8. **Paige's GitHub Support request about the pre-launch repository (D9), before the archive.**
    Drafted and tracked in her private notes, never in a PR body or a committed file. An archived
    repository accepts no edits, so leave `paigewebsite` unarchived until Support has acted or
    declined.
L9. **Freeze the archive.** Anything to change in `paigewebsite` (deleting stale branches,
    artifacts or runs, if wanted) happens now, because an archived repository is read-only. Then:
    ```powershell
    git -C $Old bundle create (Join-Path (Split-Path $Old) "paigewebsite-archive.bundle") --all
    gh repo archive PaigeRattenberry/paigewebsite --yes
    ```
    Verify: `gh repo view PaigeRattenberry/paigewebsite --json isArchived,visibility` →
    `{"isArchived":true,"visibility":"PRIVATE"}`; `git bundle verify` on the bundle passes. Keep
    the bundle offline (it holds the full history). Archiving does not lock visibility; the rule
    above does.
L10. **First agent session in the public repository (`$New`).** Re-pin the resume record in
    `content/assets.json` to the seed commit: `repository` → the public repository's URL,
    `revision` → the seed's full SHA, `source` → `paige-rattenberry-site-repo` (the id must end in
    `-repo`; it needs no label in `content/sources.ts`); a follow-up commit, as AGENTS requires.
    The six `images/build-story/` records (Session 8) point at this repository the same way and
    are re-pinned with it. A full SHA can hold a phone-shaped digit run, which the privacy gate
    rejects (Session 8 met two); if the seed's does, pin a later commit that holds the same files.
    Confirm the build-story page's repository links resolve. Add a build-trace check (Paige's
    choice, 2026-10-03, after Session 8's trace fix): a script run after `npm run build`, and as a
    CI job 1 step, that fails if the build prints Turbopack's "Dynamic filesystem access causes
    tracing of the whole project" warning, or if any `.next/**/*.nft.json` lists a project file
    outside the folders the pages read (dependencies, `.next/`, `content/`, `docs/build-log/`);
    make it fail first on a reintroduced dynamic `readdirSync`. It must not look for the
    git-ignored folders by name, since CI's checkout has neither. Document it in AGENTS and the
    README. PR; Paige merges. Verify: `npm test` green; the publication test's noreply check runs
    (it is active only in the public repository) and passes; the trace check passes on the build
    and fails on the reintroduced call.

---

## 7. Acceptance summary (quick reference)

| Session | Branch | Must be true at PR |
|---|---|---|
| 1 | `s1-scaffold` | Shell on every route, both themes, contour motif, CI jobs 1 + 2 (build/test, axe), screenshots, build log, CLAUDE.md conventions |
| 2 | `s2-content-core` | `content/` + claims-gate tests, Home 30-second test, About, Experience, no phone number |
| 3a | `s3a-projects-mdx` | MDX pipeline, `projects.ts` folded into MDX, project cards, URL-synced index filter, reusable `EmbedFrame`, StimMap3D page body + disclaimer |
| 4 | `s4-research-leadership` | Capstone + thesis pages with figures, Research, Leadership, assets provenance (runs after 3a) |
| 5 | `s5-explorer` | Timeline + constellation, URL-synced filter, keyboard/a11y, JS budget (Stryker is one entry) |
| 6 | `s6-resume-seo` | Generated resume PDF + tests, sitemap/robots/OG images/JSON-LD |
| 3b | `s3b-stimmap3d-embed` | S0-D done; click-to-load live embed, live/repo links, screenshots with public-commit provenance, Lighthouse on `/projects/stimmap3d`; re-check the OG image and assets reconciliation |
| 6b | `s6b-positioning` | Positioning line, About, `/research` themes, the literature-review deep page + its body test, featured reorder, thesis tagline and closing paragraph, metadata; explorer layout unchanged and proven so |
| 7 | `s7-quality-gates` | Lighthouse CI job added, all three jobs green, responsive sweep |
| S0-G | `s0g-publication-scrub` | Publication gate (committed shape bans + private term list from a secret), scrubbed specs, AGENTS, README and build logs, Session 8 and the launch re-specified for the two repositories |
| 8 | `s8-launch` | Build-story page, launch checklist, the tree ready to seed the public repository `PaigeRattenberry/paige-rattenberry-site` (§6) |
| 9 | `s9-content-update` | Content update with the resume at two pages, the claims, privacy and publication gates green, the explorer layout regenerated, and the history snapshot refreshed last |
| 9b | `s9b-pre-seed` | Empty review-notes headings left off the log pages, the README's clone line, "Built" in the thesis's first bullet, the resume at two pages, and the history snapshot refreshed last |
