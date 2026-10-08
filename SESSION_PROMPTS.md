# Paige Rattenberry — Portfolio Site: Session Prompt Pack

This file contains **one ready-to-paste prompt per session**, in the order they should be run. Each
session is built in its own fresh coding-agent session, sequentially, and ends with a Pull Request on a
feature branch off `main` for you to review and merge yourself.

> Companion to [`DESIGN.md`](./DESIGN.md) and [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
> This file is a launcher, not a build artifact. It stays in the repo because the
> "How This Site Was Built" page links to it as part of the transparency story.

> **Run order as of 2026-10-07:** **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S0-G → S8 →
> S9 → S9b → launch.** S0-G (publication scrub) is an agent session between Session 7 and Session 8;
> see IMPLEMENTATION_PLAN §3 S0-G and its entry below. Session 9 (pre-launch content update) was
> added 2026-10-06 after Session 8, and Session 9b (pre-seed fixes) 2026-10-07 after Session 9; see
> IMPLEMENTATION_PLAN §4 and their entries below. The launch steps are IMPLEMENTATION_PLAN §6.


> **Session 3 split amendment — 2026-09-13 (requested by Paige).** S0-D (StimMap3D deployed and
> public) is still in progress, and Session 4 builds on Session 3's MDX pipeline, so the single
> Session 3 prompt is replaced by two, and the run order is **S1 → S2 → S3a → S4 → S3b → S5 → S6 → S7 → S8**
> (3b's position is superseded by the 2026-09-15 run-order amendment below; the split itself stands).
>
> - **SESSION 3a** (branch `s3a-projects-mdx`, log `docs/build-log/s3a-projects-mdx.md`): MDX pipeline,
>   `projects.ts` folded into MDX, every card, the `/projects` index and filter, a reusable
>   click-to-load `EmbedFrame`, and the StimMap3D page body with its disclaimer. No S0-D prerequisite.
> - **SESSION 4** runs after 3a merges and reuses `EmbedFrame` for the valedictorian video.
> - **SESSION 3b** (branch `s3b-stimmap3d-embed`, log `docs/build-log/s3b-stimmap3d-embed.md`): the live
>   embed, the live-app/public-repo links, the StimMap3D screenshots with public-commit provenance and
>   the Lighthouse score. Needs S0-D done and 3a and 4 merged. Its prompt follows Session 4's below.
> - Where `DESIGN.md`, `AGENTS.md` or an older note says "Session 3", read 3a for the MDX/content/page
>   work and 3b for anything that depends on S0-D. IMPLEMENTATION_PLAN §4 has both task lists.


> **Session 6b added — 2026-09-20 (requested by Paige).** A new editorial session runs between 3b and
> 7, so the run order is now **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S8**. It names the
> thread that runs through the work — output that can be checked, a checker that is itself tested, a
> check that runs automatically or does not count — and gives the GenAI interpretability literature
> review a deep page. It changes no fact and adds no claim. Its
> prompt is below, after Session 3b's; its task list, its settled decisions and its latitude clause
> are IMPLEMENTATION_PLAN §4 Session 6b, and DESIGN §0 and §1 carry the decisions.

> **Session 3b ran and merged — 2026-09-20**, as PR #12 (`dc0a8af`,
> `docs/build-log/s3b-stimmap3d-embed.md`). **Session 6b ran on 2026-09-20 as
> PR #14** (`docs/build-log/s6b-positioning.md`, merged 2026-09-21); **Session 7 followed it**, from a
> Home JS baseline that 6b left at 137.1 KB gzipped. Session 7's
> prompt below carries what 3b shipped, including the Lighthouse number it missed.

> **Session 6b merged on 2026-09-21 as PR #14; Session 7 ran the same day and merged as PR #15**
> (`docs/build-log/s7-quality-gates.md`): Lighthouse is CI job 3 and green, the fonts are
> self-hosted, and Home's JS target was restated by Paige the same day (site-owned client JS on `/`
> ≤ 15 KB, enforced in CI; the App Router's floor alone is 127.3 KB). **S0-G runs next, then
> Session 8**; branch protection waits for the public repository (IMPLEMENTATION_PLAN §6, L7). The
> Session 8 prompt below carries what Session 7 shipped and S0-G's re-specification.
>
> **S0-G merged on 2026-10-01 as PR #17; Session 8 ran the same day as PR #18**
> (`docs/build-log/s8-launch.md`). The launch steps (IMPLEMENTATION_PLAN §6) follow its merge; L10
> is the first agent session in the public repository.

> **S0-F opened — 2026-09-20 (Paige's decision); superseded by S0-G on 2026-09-30.** The build logs
> are rendered publicly by Session 8, so before Session 8 they get a scrub pass, then rendering. S0-G
> does the scrub and the seed replaces the history step (IMPLEMENTATION_PLAN §3 S0-F and S0-G).

> **S0-D closed — 2026-09-20.** StimMap3D is live at https://stimmap3d.pages.dev and public at
> https://github.com/PaigeRattenberry/stimmap3d (MIT). The run order above is unchanged, but nothing
> waits on Paige any more: **Session 3b was unblocked and has now run.** `_source/INVENTORY.md` holds the live URL,
> the hero deep-link, the repo clearance and Paige's binding honest-framing brief;
> `docs/build-log/s0d-stimmap3d.md` holds the verification and the findings the 2026-09-20
> amendment to Session 3b turns into decisions (stale test counts, a block quote whose public source
> no longer carries it, one public screenshot rather than four to six, no `SESSION_PROMPTS.md` to
> link).

> **Run-order amendment — 2026-09-15 (requested by Paige).** S0-D (StimMap3D deployed and public) is
> still in progress, so Session 3b is deferred again and the run order is
> **S1 → S2 → S3a → S4 → S5 → S6 → S3b → S7 → S8**. Sessions 5 and 6 need nothing from S0-D, so they
> run next; the SESSION 3b prompt has moved below Session 6 to match, and its prerequisite check now
> expects Sessions 5 and 6 on `main` as well. If S0-D finishes sooner, run 3b as soon as it does —
> nothing in 5 or 6 has to come first.
>
> - **Sessions 7 and 8 stay last.** Session 7 needs the StimMap3D embed (3b) and the explorer (5).
> - **Session 5's Stryker question is answered:** one entry, from the `experience` role. Its prompt no
>   longer asks.
> - **Session 6's approved fallback resume is named** — and it still carries both `[ADD ` placeholders,
>   so it cannot ship unchanged. See the Session 6 prompt and IMPLEMENTATION_PLAN §4 Session 6.

> **Small review follow-up amendment — 2026-09-13.** Read AGENTS.md for shared rules and DESIGN
> §§1, 3.5, 4.3 and 5.2 for the implemented homepage, asset, motion and rendering decisions.
> This note supersedes older conflicting tasks below. Sessions 1–2 are merged; later sessions remain.
> The Session 1–2 prompts below are kept verbatim as the historical record of what was pasted.
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

## How to use this pack

1. **Do your prerequisites first** (IMPLEMENTATION_PLAN §3): S0-A and S0-B before Session 1; S0-E right
   after Session 1 merges; S0-D before Session 3b — which now means any time before the end of
   Session 6.
2. **Run sessions in order** (S1 → S2 → S3a → S4 → S5 → S6 → S3b → S6b → S7 → S0-G → S8, then the
   launch steps; see the notes above). Each depends on the previous one being
   **merged into `main`**, except Session 3b, which depends on Sessions 3a and 4 plus S0-D and may be
   run as soon as S0-D is done.
3. For each session: open a **new coding-agent session** at the repository root and paste
   the prompt block verbatim. Plan mode for the first turn is recommended (the prompt asks for a plan
   regardless).
4. When the session opens its PR, **review the Vercel preview and the PR, fill in the "Paige's review
   notes" heading of that session's build-log entry (you can do this in the PR or after merge), and
   merge.** Only then start the next session. Previews are login-gated (S0-E), so opening one in an
   incognito window means signing in to Vercel there; a Shareable Link is how you show someone
   without a Vercel account, and a Hobby account gets exactly one at a time.
5. The next session's first action is `git checkout main && git pull`, so it always builds on merged work.

### Conventions every session follows
- **Branch:** one feature branch per session (`s1-scaffold`, `s2-content-core`, …); never commit to `main`.
- **PR:** `gh pr create` against `main`; body = what shipped, mapping to the session's acceptance list,
  PowerShell run/verify steps, and any numbers the acceptance list asks for. **Do not merge.**
- **Plan-first, skills-second:** read the docs, write a session plan, invoke helpful skills
  (`frontend-design`, an available code-review capability, Playwright, repository instruction setup, `security-review`), then code.
- **Build log + screenshots every session** (IMPLEMENTATION_PLAN §0 template).
- **Gates that never regress** (IMPLEMENTATION_PLAN §0): claims gate, privacy gate, StimMap3D
  disclaimer, both themes + keyboard + reduced motion, no facts hard-coded in components.
- **`_source/` is read-only input and is never committed.** Only assets recorded in
  `content/assets.json` are copied into `public/`.
- **Publication rules (S0-G, 2026-09-30):** every committed file, PR body and commit message
  follows AGENTS.md's publication rules, and `npm test` runs the publication gate.

> **Edited for publication — 2026-10-01 (S0-G).** The prompts below are the record of what was
> pasted, except where a local path, a staged file name or a reference to private material was
> replaced, removed or (in the Session 6b prompt, which says where) reworded; a prompt with a
> removal is marked "(redacted for publication, 2026-10-01)".

---

## Shared preamble (embedded in each prompt; here for reference)

> You are building Paige Rattenberry's portfolio site, session by session. Authoritative specs are
> `DESIGN.md` and `IMPLEMENTATION_PLAN.md` in the repo root; read the relevant sections before doing
> anything. Build ONLY this session's scope.
>
> **Workflow for this session (in order):**
> 1. `git checkout main && git pull`, then create the session branch.
> 2. Read `DESIGN.md` and this session's section of `IMPLEMENTATION_PLAN.md` (plus §0, §1, §2). Read
>    `_source/INVENTORY.md` if it exists. Write a concise plan for this session only (plan mode).
> 3. Review available skills/plugins and invoke the ones that help (suggestions are listed per session).
> 4. Implement the session's tasks.
> 5. Verify against the session's **Acceptance** list: `npm run build` clean, `npm test`, Playwright
>    screenshots at 1280 px and 390 px into `docs/screenshots/sN-*.png`, and the never-regress gates.
> 6. Write `docs/build-log/sN-<name>.md` using the IMPLEMENTATION_PLAN §0 template, including the
>    "What the AI got wrong and how it was caught" section honestly.
> 7. Run an available code-review capability and address findings.
> 8. Commit in small logical chunks, push the branch, open a PR against `main` with `gh pr create`.
>    **Do not merge.**
> 9. Stop and report the PR link and anything I must do before the next session.

---

# SESSION 0 — Your prerequisites (no Claude Code session)

Complete IMPLEMENTATION_PLAN §3 items **S0-A** (stage `_source/` with `INVENTORY.md`; export capstone
and thesis figures as PNG/SVG yourself) and **S0-B** (wording notes) now. S0-B's phone-free
`-web.pdf` export was **cancelled by the 2026-09-10 amendment** — the resume has no phone number, so
no separate export is needed (Session 6 then generated the resume from content/ and did not need
the hand-made PDF). **S0-D** (deploy StimMap3D to
Cloudflare Pages, make its repo public, paste the live URL and a DLPFC deep-link into
`_source/INVENTORY.md`) was **done 2026-09-20** and verified the same day — live at
https://stimmap3d.pages.dev, `PaigeRattenberry/stimmap3d` public under MIT, the deep-link and Paige's
honest-framing brief recorded in `_source/INVENTORY.md`, the evidence and the findings for
Session 3b in `docs/build-log/s0d-stimmap3d.md`. Session 3b, which the 2026-09-15 run-order
amendment moved after Session 6, is therefore unblocked. **S0-E** (connect Vercel) was **done
2026-09-09**, deliberately configured so that no production deployment exists until launch — every
branch deploys as a login-gated, `noindex` preview and `paigerattenberry.vercel.app` returns 404. See
IMPLEMENTATION_PLAN §3 S0-E for the three settings, and §6 (L7) for the two that launch reverses.

Minimal `_source/INVENTORY.md` shape, without its example values (redacted for publication, 2026-10-01):

```markdown
# Source inventory
## Notes
- The public email, GitHub and LinkedIn URLs; whether the city may appear; which repositories may
  be linked publicly; what the About page should also convey
## StimMap3D
- Live URL and hero deep-link; the public repository, pinned commit and honest-framing brief
## Files
| file | what it is | publishable? | people named/shown | caveats |
|---|---|---|---|---|
| <folder>/<slug>.pdf | ... | ... | ... | ... |
```

---

# SESSION 1 — Scaffold, design system, shell

```
You are building Paige Rattenberry's portfolio site. This is SESSION 1 (Scaffold, design system,
shell). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root; read them
before doing anything. Build ONLY Session 1; do not start later sessions.

Workflow for this session, in order:
1. The private GitHub repo https://github.com/PaigeRattenberry/paigewebsite already exists with the
   planning docs on `main`. Run `git checkout main && git pull`, then `git checkout -b s1-scaffold`.
2. Read DESIGN.md (all of it; especially §2 site map, §4 visual direction, §5 architecture, §8 quality
   bar) and IMPLEMENTATION_PLAN.md §0, §1, §2, and §4 Session 1. Read `_source/INVENTORY.md` if present
   (do not copy anything from `_source/` this session). Write a concise plan for Session 1 only.
3. Invoke helpful skills: the `frontend-design` skill when establishing tokens, typography, and the
   shell (the direction is DESIGN §4 "editorial-scientific hybrid"; avoid template defaults); `/init`
   for CLAUDE.md once the scaffold exists; `/code-review` before the PR.
4. Implement Session 1 per IMPLEMENTATION_PLAN §4 Session 1:
   - Scaffold Next.js 16 + React 19 + TypeScript (strict; keep the version create-next-app installs,
     do not force-upgrade it) + Tailwind 4 (@tailwindcss/postcss) + ESLint 9 (eslint-config-next) +
     Prettier at the repo ROOT. Check current majors with `npm view <pkg> version` before installing
     anything else (IMPLEMENTATION_PLAN §2 is a snapshot) and record installed versions in the build
     log. Node 24 via .nvmrc and engines. .gitignore must include `_source/`, `.env*` (keep
     `.env.example`), `test-results/`, `playwright-report/`.
   - Design tokens in app/globals.css with Tailwind 4 `@theme`: light palette on :root, dark tokens
     under [data-theme="dark"] ONLY (no prefers-color-scheme media query for tokens; next-themes with
     attribute="data-theme" and enableSystem applies the OS preference, and a media query would
     override an explicit light choice); remap Tailwind's `dark:` variant to that attribute with
     @custom-variant; one teal accent; fonts Source Serif 4 (display), Inter (body), JetBrains Mono
     (data) via next/font/google.
   - Shell components: Header (name, nav to every route in DESIGN §2, theme toggle, mobile menu),
     Footer (email/LinkedIn/GitHub placeholders from DESIGN §3.2, "Built with Claude Code" link to
     /how-this-was-built, last-updated date from git at build with a VERCEL_GIT_COMMIT_SHA + build-time
     fallback when .git is absent), PageHeader, Prose, Card, Tag, Callout, Figure, not-found page.
     Placeholder pages for every DESIGN §2 route (title + one sentence) so nothing 404s. A
     skip-to-content link and visible focus rings.
   - Hero motif: components/hero/contour.ts generates deterministic iso-line SVG paths from a smooth
     2D scalar field at build time; ContourField client island applies a slow drift, disabled under
     prefers-reduced-motion (static SVG). Keep it under 15 KB; no canvas or WebGL.
   - Vitest 5 + @testing-library/react + happy-dom with one shell component test; Playwright with
     tests/e2e/screenshots.spec.ts visiting every route at 1280 px and 390 px and saving
     docs/screenshots/s1-*.png (light and dark for the home page), and tests/e2e/a11y.spec.ts running
     @axe-core/playwright over every route in both themes against `next start`, failing on
     serious/critical. Both specs import one shared route list so later sessions add a route once.
   - .github/workflows/ci.yml on Node 24: job 1 (npm ci, lint, typecheck, test, build) and job 2
     (build, next start, Playwright a11y spec). Lighthouse comes in Session 7.
   - README.md (what it is, run locally in PowerShell, links to the three planning docs), LICENSE
     (MIT for code; note content is copyright Paige Rattenberry), docs/build-log/s1-scaffold.md per
     the IMPLEMENTATION_PLAN §0 template, and CLAUDE.md via /init, then edited so it states the
     IMPLEMENTATION_PLAN §0 conventions verbatim (branch/PR discipline, never-regress gates, `_source/`
     read-only and untracked, build log + screenshots per session, facts only from content/). Later
     sessions load CLAUDE.md automatically, so this is how they inherit the rules.
5. Verify: `npm run build` clean; every route renders the shell in both themes; contour motif visible
   and static under reduced motion (emulate in Playwright); nav keyboard operable; a11y spec green
   locally; screenshots committed; nothing from `_source/` staged (`git status` must not show it).
6. Run /code-review and fix findings.
7. Commit in small chunks, push `s1-scaffold`, open a PR vs main with `gh pr create`. PR body: what
   shipped, mapping to Session 1 acceptance, PowerShell run/verify steps. DO NOT MERGE.
8. Stop and report the PR URL. Remind me to (a) merge, (b) do S0-E (connect Vercel), and (c) make sure
   `_source/INVENTORY.md` is complete before Session 2.

Acceptance (Session 1): npm run build clean; all routes render the shell in light and dark; contour
motif works and respects reduced motion; keyboard nav + skip link; CI jobs 1 and 2 green on the PR;
CLAUDE.md carries the §0 conventions; docs/screenshots/s1-*.png and docs/build-log/s1-scaffold.md
committed; PR opened on s1-scaffold.
```

---

# SESSION 2 — Content model, Home, About, Experience

```
You are building Paige Rattenberry's portfolio site. This is SESSION 2 (Content model, Home, About,
Experience). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root; read them
before doing anything. Build ONLY Session 2.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s2-content-core`.
2. Read DESIGN.md §1 (30-second test), §2, §3 (content model, seed content, claims gate, privacy
   gate), §4; IMPLEMENTATION_PLAN.md §0, §1, §4 Session 2; CLAUDE.md. Read `_source/INVENTORY.md`
   (especially "Settled facts"), the resume of record it points at, and the LinkedIn snapshot in
   `_source/linkedin/` (all read-only; the Read tool reads PDFs directly, no conversion needed). When
   sources disagree, INVENTORY's settled facts win, then the resume. The resume contains no phone
   number, but the DESIGN §3.4 phone check still runs every session. Write a concise plan for
   Session 2 only.
3. Invoke helpful skills: `frontend-design` for the Home hero composition and About/Experience
   layouts; `/code-review` before the PR.
4. Implement Session 2 per IMPLEMENTATION_PLAN §4 Session 2:
   - content/ per DESIGN §3.1: profile.ts, experience.ts, education.ts, certifications.ts,
     skills.ts (controlled vocabulary with categories), research.ts, leadership.ts (data only),
     assets.json. Titles, dates, and bullets copied verbatim from the resume; LinkedIn-only items from
     DESIGN §3.2 and INVENTORY.md marked (LI). Every metric object has a `source` field. Samsung
     appears on the Experience page like every other role.
   - lib/content/schema.ts (zod) and lib/content/load.ts loaders; tests/unit/content.test.ts enforcing:
     every metric has a source, every skill tag is in the vocabulary, every file in public/images is in
     assets.json and vice versa, and no string anywhere in content/ matches the DESIGN §3.4 phone
     pattern `\(?\d{3}\)?[ .-]*\d{3}[ .-]*\d{4}`.
   - Home: hero with name, positioning line (DESIGN §3.2 draft unless INVENTORY.md overrides), three
     CTAs (View projects, Download resume -> /resume, Email), the contour motif; "Selected work" with
     three cards linking to the three deep-page slugs (pages may still be placeholders); "Currently"
     one-liner; compact skills strip. Must pass the DESIGN §1 30-second test at 1280 px with no scroll.
   - About: 3–5 paragraphs from the resume, DESIGN §3.2, and INVENTORY.md notes; headshot only if
     INVENTORY.md marks it publishable (copy to public/images/about/, add to assets.json with alt text).
   - Experience: every role in resume wording with bullets and skill tags; leave a clearly marked slot
     at the top for the Session 5 explorer.
   - MetricStat component (number + source tooltip) used for every number on these pages.
   - docs/build-log/s2-content-core.md; screenshots docs/screenshots/s2-*.png.
5. Verify: npm run build clean; npm test green; `rg -e "\(?\d{3}\)?[ .-]*\d{3}[ .-]*\d{4}" app components content public`
   returns nothing (no phone number — rg skips binaries by default, and the unit test must skip them
   the same way; see DESIGN §3.4); Home 30-second test; About and Experience contain no hard-coded
   facts (all from content/); `git status` shows nothing from `_source/`.
6. Run /code-review and fix findings.
7. Commit in small chunks, push `s2-content-core`, open a PR vs main with `gh pr create`. PR body: what
   shipped, mapping to Session 2 acceptance, PowerShell run/verify steps, and a list of any facts you
   were unsure about and how you resolved them (so I can correct them at review). DO NOT MERGE.
8. Stop and report the PR URL. Remind me to merge and to complete S0-D (StimMap3D deploy + public +
   URL in INVENTORY.md) before Session 3.

Acceptance (Session 2): content tests green; claims gate enforced by test; no phone number; Home
passes the 30-second test; About + Experience render from content/ only; assets.json complete;
build log + screenshots committed; PR opened on s2-content-core.
```

---

# SESSION 3a — Projects index + MDX pipeline + StimMap3D page body

```
You are building Paige Rattenberry's portfolio site. This is SESSION 3a (Projects index, MDX
pipeline, reusable click-to-load EmbedFrame, and the StimMap3D page body). Authoritative specs are
DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root; read them before doing anything. Build ONLY
Session 3a.

Session 3 was split on 2026-09-13 (see the note at the top of IMPLEMENTATION_PLAN.md). StimMap3D is
not yet deployed or public, so this session does NOT need the live URL, the deep-link or a public
repo, and must not wait for them. Everything that depends on them (the embed on the StimMap3D page,
live-app and repo links, StimMap3D screenshots and cover, the Lighthouse score) belongs to Session
3b. Session 4 runs next, on top of this session.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s3a-projects-mdx`.
2. Read DESIGN.md §2, §3, §5.2–5.3, §7.1; IMPLEMENTATION_PLAN.md §0, §1, the split note at the top,
   §4 Session 3a (including its 2026-09-12 amendment); AGENTS.md. Read what Session 2 built:
   lib/content/schema.ts, lib/content/load.ts, content/projects.ts, content/research.ts,
   lib/routes.ts, tests/unit/content.test.ts and docs/build-log/s2-content-core.md.
   Read, read-only, from the StimMap3D repository: README.md, DESIGN.md §6 (physics and
   limitations) and CLAUDE.md, and note that repo's current commit SHA. Write a concise plan for
   Session 3a only.
3. Invoke helpful skills: `frontend-design` for the case-study page layout and card grid; Playwright
   (browser tools) for the filter and click-to-load checks; an available code-review capability
   before the PR.
4. Implement Session 3a per IMPLEMENTATION_PLAN §4 Session 3a:
   - MDX pipeline: next-mdx-remote (RSC API), gray-matter, remark-gfm, rehype-slug,
     rehype-autolink-headings; app/projects/[slug]/page.tsx with generateStaticParams reading slugs
     from content (not a second list in lib/routes.ts); Prose styling for MDX;
     Figure/Callout/MetricStat available inside MDX. Frontmatter is validated by Session 2's
     ProjectSchema, extended with DESIGN §3.1's `cover` and `resume` fields; do not define a second
     project schema. Make `cover` optional and resolve it against assets.json: StimMap3D's cover is a
     screenshot that arrives in Session 3b.
   - Fold content/projects.ts into the frontmatter of the three deep-page MDX files (capstone and
     thesis frontmatter-only; Session 4 writes their bodies) and delete content/projects.ts. The MDX
     loader lives in lib/content/, and lib/content/load.ts stays the only import path: it keeps
     exporting `projects` and `featuredProjects` (home cards and the About disclaimer callout read
     them). Add MDX projects to allMetrics/allSourceIds/allSkillRefs, and extend the "every metric is
     rendered" test to frontmatter metrics and MetricStat values in MDX bodies.
   - Frontmatter-only MDX for every non-deep project in DESIGN §3.2. `links.repo` ONLY where
     INVENTORY.md says the repo may be linked; otherwise omit the link (do not link private repos).
     StimMap3D's repo is still private, so no project gets a repo link in this session.
     Items already in content/research.ts (Clinical CoPilot, the capnography/EEG research, the GenAI
     literature review) must not have their facts retyped: resolve them from the research item, or
     add a test that the two copies match. The Google 5-Day GenAI Intensive is a certification, not a
     card; MentalWell (its capstone) gets the card.
   - /projects: featured deep-page cards on top; filterable grid beneath (client island, URL-synced).
     Core content prerenders; if you use useSearchParams, isolate it in a small Suspense boundary.
   - components/embed/EmbedFrame.tsx: a reusable click-to-load client island per DESIGN §7.1. It takes
     the iframe src, an accessible title, an "open in a new tab" link and an optional poster image from
     assets.json; renders a 16:9 poster with a "Load" button; mounts the iframe only after the click;
     shows a fallback link if the frame fails. Test it with a fixture URL. Session 4 reuses it for the
     valedictorian video and Session 3b mounts it on the StimMap3D page, so do not tie it to
     StimMap3D and do not put a placeholder StimMap3D URL into content/.
   - content/projects/stimmap3d.mdx deep page: what it is (3 sentences), features, "how the physics
     works and what it gets wrong" quoted from StimMap3D's README/DESIGN with attribution, engineering
     rigor with sourced metrics (test count from its README, axe CI gate, honesty gates), and a "Built
     with Claude Code" sidebar linking to /how-this-was-built. Record in the build log the StimMap3D
     commit SHA you read these from. Leave out, for Session 3b: the embed, the live-app and repo links,
     the link to StimMap3D's SESSION_PROMPTS.md, the screenshots and the cover. Do not copy anything
     from stimmap3d/docs/screenshots.
   - Callout with StimMap3D's own wording "Illustrative model — not for clinical use" near the top of
     the page, where Session 3b will place the embed; a unit test asserts it renders on the StimMap3D
     page.
   - docs/build-log/s3a-projects-mdx.md; screenshots with `$env:SESSION = "3a"`.
5. Verify: npm run build clean; npm test green; every /projects/<slug> is statically generated;
   content/projects.ts is gone and nothing imports @/content/* outside lib/content/; the /projects
   filter works for direct URLs, clear, back/forward and invalid values against `next start` (check
   with Playwright); EmbedFrame mounts no iframe before the click; no StimMap3D repo link, live URL or
   StimMap3D screenshot is in the diff.
6. Review the diff and fix findings.
7. Commit in small chunks, push `s3a-projects-mdx`, open a PR vs main with `gh pr create`. PR body:
   what shipped, mapping to Session 3a acceptance, verify steps, and the list of work deferred to
   Session 3b. DO NOT MERGE.
8. Stop and report the PR URL and remind me to merge before Session 4. (`_source/capstone/` and
   `_source/thesis/` are already final: INVENTORY.md closed the folder on 2026-09-12.)

Acceptance (Session 3a): MDX pipeline + all project routes static; content/projects.ts folded into
MDX and deleted; cards for every DESIGN §3.2 project; claims gate covers MDX metrics; URL-synced
filter checked in production; reusable EmbedFrame tested with a fixture URL; StimMap3D page body with
disclaimer test; every metric sourced; nothing that depends on S0-D committed; build log +
screenshots; PR opened on s3a-projects-mdx.
```

---

# SESSION 4 — Capstone + thesis deep pages, Research, Leadership

```
You are building Paige Rattenberry's portfolio site. This is SESSION 4 (Capstone + thesis deep
pages, Research & Publications, Volunteer & Leadership). Authoritative specs are DESIGN.md and
IMPLEMENTATION_PLAN.md in the repo root; read them before doing anything. Build ONLY Session 4.

Session 3 was split on 2026-09-13: this session runs after Session 3a and before Session 3b.
Prerequisite check first, after pulling main: content/projects/*.mdx exists, content/projects.ts is
gone, and components/embed/EmbedFrame.tsx exists (Session 3a merged). If not, stop and tell me.
S0-D (StimMap3D deployed and public) is NOT required. The StimMap3D page is unfinished until
Session 3b; do not touch it.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s4-research-leadership`.
2. Read DESIGN.md §2, §3 (especially the privacy gate §3.4), §4.4 (Figure captions);
   IMPLEMENTATION_PLAN.md §0, §1, the split note at the top, §4 Session 4; AGENTS.md; and
   docs/build-log/s3a-projects-mdx.md for the MDX pipeline, project schema and EmbedFrame that
   Session 3a built. Read `_source/INVENTORY.md` and inventory
   `_source/capstone/`, `_source/thesis/`, `_source/leadership/`, `_source/photos/`. Use ONLY files marked
   publishable. Write a concise plan for Session 4 only, listing which source files you will draw on.
3. Invoke helpful skills: `frontend-design` for the long-form page rhythm and figure treatment;
   an available code-review capability before the PR.
4. Implement Session 4 per IMPLEMENTATION_PLAN §4 Session 4:
   - Read the PDFs with available text extraction and page-rendering tools. Visually inspect
     image-only pages or broken extraction; do not guess at unreadable content. `pdftotext -layout -f N -l N "<file>" -` from the
     Bash tool gives one page of text at a time: use it to confirm a page number before citing it.
     There are no figure exports and none are coming, and you must NOT crop figures out of PDF pages:
     the capstone decks are "do not post the file" and the SFU article's photos are SFU's copyright.
     Recreate the thesis's own figures 3.1–4.7 (Paige's experiment output) as original SVG/React
     figures, draw original diagrams for the capstone pipeline, and otherwise carry the section in
     prose. Record every image you do place in public/images/<slug>/ in assets.json with everything
     the asset schema requires (provenance with revision, rights, permission, transformations,
     people, consent, alt text and dimensions).
   - Work within what Session 3a built (IMPLEMENTATION_PLAN §4 Session 4, 2026-09-13 amendment for
     what Session 3a shipped; read it in full):
     a body replaces the proof/bullets fallback, so every number in a body is a one-line
     `<MetricStat value="…" />` for a frontmatter metric (spelled-out counts like "six-person" and
     "five" included; new IoU/t-test numbers go into frontmatter metrics first), and taglines stay
     metric-free; remove the page's FrontmatterOnly fallback, test that every deep page has a body,
     and replace the capstone frontmatter-only test in ProjectPage.test.tsx. Figures are server
     components registered in lib/mdx.tsx, with plotted values kept in content/ and loaded through
     lib/content/load.ts; no `cover`. Link URLs must be absolute (`z.url()`), so linking the thesis
     PDF needs a site-path link form that resolves to an assets.json document. Test that research
     items' projectSlug values name deep pages and that their title/dates match the project's, and
     give the thesis research item its "five" metric. Don't use frontmatter `aside` for these pages
     (it always adds the How-this-site-was-built link). For the video, extend EmbedFrame with an
     optional `href` (the watch URL with t=2727s) and `allow`, plus embed-neutral fallback text,
     and frame the YouTube embed URL (start=2727) derived from content/leadership.ts, with no poster.
   - content/projects/spinal-curvature-capstone.mdx: problem, how Paige originated the project and
     formed the team (SFU article p1–2), system as built (force-sensor garment, noise-filtering
     firmware, real-time pressure heatmap on a CAD torso model, brace design), results, Best Overall
     Project at ICAMES 2022 (Boğaziçi University, Istanbul), team credit exactly as INVENTORY.md
     permits (no teammate names without consent). The ML curve-progression model was the envisioned
     next phase (ICAMES deck p16, final deck p58): present it as proposed, never as built.
   - content/projects/interpretable-medical-imaging-thesis.mdx: research question, method (ResNet-34,
     VGG-16, five CAM methods scored against ground truth induced by watermarking chest X-rays — not
     expert annotations — with IoU + paired t-tests), findings, why interpretability matters in
     safety-critical settings, 2–4 figures recreated (not cropped) from thesis figures 3.1–4.7. The
     thesis PDF may go under public/docs/ ONLY as a copy with page 2 removed — it is the scanned
     approval page and carries four signatures; use pdf-lib, and note the removal in assets.json.
   - /research from content/research.ts (items link to project pages or PDFs); /leadership from
     content/leadership.ts with cleared photos; valedictorian video as a click-to-load embed through
     Session 3a's EmbedFrame (not a second component) if the link is in INVENTORY.md.
   - Home "Selected work" cards link to all three deep pages (done in Session 3a; verify only).
   - docs/build-log/s4-research-leadership.md; screenshots.
5. Verify: npm run build clean; npm test green (assets provenance test covers new images); every
   third-party name appearing on these pages has consent recorded in assets.json or INVENTORY.md; both
   deep pages carry recreated or original figures with numbered mono captions and nothing cropped from
   a `_source` PDF; any shipped thesis PDF has page 2 removed; no `_source/` files staged.
6. Review the diff and fix findings.
7. Commit in small chunks, push `s4-research-leadership`, open a PR vs main with `gh pr create`. PR
   body: what shipped, mapping to acceptance, verify steps, and an explicit list of claims drawn from
   staged documents (by reader-facing source label and page; amended 2026-09-30, never by file
   name) so I can spot-check them. DO NOT MERGE.
8. Stop and report the PR URL and any materials that were missing or unclear, and remind me that
   Session 3b needs S0-D done before it starts.

Acceptance (Session 4): capstone + thesis deep pages with recreated/original figures, nothing cropped
from a `_source` PDF, and any shipped thesis PDF missing page 2; Research and Leadership
pages render from content; assets.json complete with consent flags; no unconsented names; claims gate
green over both bodies' MetricStat references, every deep page has a body, research projectSlugs
resolve to deep pages; build log + screenshots; PR opened on s4-research-leadership.
```

---

# SESSION 5 — Career timeline + skills explorer

```
You are building Paige Rattenberry's portfolio site. This is SESSION 5 (Career timeline + skills
explorer). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root; read them
before doing anything. Build ONLY Session 5.

Session 3b was deferred on 2026-09-15 and now runs after Session 6, so this session follows Session 4.
S0-D (StimMap3D deployed and public) is NOT required: the explorer derives from content/ only. The
StimMap3D project has no live/repo link and no cover until Session 3b — that must not matter to the
explorer, and a missing link field is not an error. Do not touch the StimMap3D page.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s5-explorer`.
2. Read DESIGN.md §4 (color/motion rules), §7.2 (explorer spec), §8 (JS budget);
   IMPLEMENTATION_PLAN.md §0, §1, §4 Session 5; CLAUDE.md. Write a concise plan for Session 5 only.
3. Invoke helpful skills: `dataviz` before writing any chart/graph code (palette, marks, interaction
   rules); `frontend-design` for the layout; Playwright for keyboard and reduced-motion checks;
   an available code-review capability before the PR.
4. Implement Session 5 per IMPLEMENTATION_PLAN §4 Session 5:
   - lib/content/explorer.ts derives timeline entries and skill<->entry edges with co-occurrence
     weights from experience, projects, and research content. Per the 2026-09-15 amendment (read it
     in full): a project with `researchId` and a research item with `projectSlug` describe the same
     work, so derive one entry per pair (test it). The Stryker role and the Stryker research item are
     ONE entry, taken from the experience role (my decision, 2026-09-15) — there is no link field
     between them, so match them deliberately and keep the research item's skills on that single entry
     so no co-occurrence is lost, covered by the same de-duplication test. Order by `periods`, as
     `newestFirst()` does, not by the `dates` display text; conference reviewing is leadership data and stays out unless I say
     otherwise; keep /experience's heading order valid (DatedEntry takes `headingLevel={3}` under a
     section h2).
   - scripts/layout-explorer.ts runs d3-force made deterministic with
     simulation.randomSource(seededPrng) (d3-force already defaults to a fixed-seed generator; keep input order, tick count and versions fixed); wire
     into the `prebuild` npm script; a test asserts the committed file equals a fresh run.
   - Client islands: Timeline (vertical, 2017 to present, grouped by year), FilterChips (real buttons,
     aria-pressed, URL-synced `?skill=`), SkillsConstellation (SVG, node size by entry count, edges by
     co-occurrence, click = filter), "View as list" equivalent, aria-live result count, keyboard
     navigation, prefers-reduced-motion disables transitions. One accent color only.
   - Explorer at the top of /experience; static constellation teaser beside the Home hero at >= 1024 px.
   - Tests: derivation (every entry appears, edges symmetric, layout JSON matches vocabulary) and a
     component test for filtering.
   - docs/build-log/s5-explorer.md; screenshots (default, filtered, list view, mobile).
5. Verify: npm run build clean; npm test green; filtering by a skill highlights the correct entries and
   updates the URL; full keyboard operation; axe (via Playwright) reports zero serious/critical on
   /experience; measure initial gzipped JS for `/` from the build output and report it (target <= 120 KB).
6. Review the diff and fix findings.
7. Commit in small chunks, push `s5-explorer`, open a PR vs main with `gh pr create`. PR body: what
   shipped, mapping to acceptance, verify steps, the JS size number. DO NOT MERGE.
8. Stop and report the PR URL.

Acceptance (Session 5): explorer works with URL-synced filters, list equivalent, keyboard, reduced
motion; zero serious/critical axe issues on /experience; Home JS budget reported; tests green; build
log + screenshots; PR opened on s5-explorer.
```

---

# SESSION 6 — Resume PDF single source of truth + SEO / link previews / sitemap

```
You are building Paige Rattenberry's portfolio site. This is SESSION 6 (Resume PDF from the single
source of truth + SEO, Open Graph images, sitemap). Authoritative specs are DESIGN.md and
IMPLEMENTATION_PLAN.md in the repo root; read them before doing anything. Build ONLY Session 6.

Session 3b was deferred on 2026-09-15 and now runs after this session. S0-D is NOT required:
/projects/stimmap3d already exists and its OG image renders from frontmatter, so its acceptance check
can be done now. The page has no `cover` until Session 3b, which re-checks that OG image afterwards.
Do not touch the StimMap3D page.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s6-resume-seo`.
2. Read DESIGN.md §3.1, §5.4 (PDF pipeline + fallback rule), §5.5 (SEO); IMPLEMENTATION_PLAN.md §0,
   §1, §4 Session 6; CLAUDE.md. Look at the current resume PDF in `_source/resume/` (read-only) to
   mirror its section order and density. Write a concise plan for Session 6 only.
3. Invoke helpful skills: an available code-review capability before the PR; Playwright to render the OG image routes.
4. Implement Session 6 per IMPLEMENTATION_PLAN §4 Session 6:
   - scripts/build-resume.tsx with @react-pdf/renderer 4.x rendering content/ (profile, experience,
     projects with resume.include, education, certifications, skills) into a two-page PDF that mirrors
     the current resume's section order; site accent instead of the blue bars; fonts registered from
     the @fontsource/source-serif-4, @fontsource/inter, @fontsource/jetbrains-mono TTFs; no phone
     number. Run in `prebuild`; output public/Paige-Rattenberry-Resume.pdf.
   - tests/unit/resume.test.ts: page count <= 2 (pdf-lib), key strings present (pdf-parse: name,
     email, Hammerspace, StimMap3D), DESIGN §3.4 phone pattern absent, and no unfilled `[ADD `
     placeholder.
   - Per the 2026-09-15 amendment (read it in full): pdf-lib is already a devDependency; the resume
     PDF needs a `document` record in assets.json and must pass tests/unit/documents.test.ts (page
     count, PDF title, no objects outside the page tree); run the phone-pattern and `[ADD ` text
     checks over every listed document, giving the thesis PDF's reviewed IoU-row and DOI matches
     narrow page-specific exceptions; keep /docs/ PDFs out of the axe and screenshot sets and decide
     deliberately whether the sitemap lists them.
   - Ship the GenAI literature review PDF (my decision, 2026-09-15): the literature review of
     21 April 2024 (staged under `_source/research/`) is cleared in INVENTORY as my own work
     with no other people in it and nothing to remove, so copy it to public/docs/ as-is, record it in
     assets.json with the same rigour as the thesis, extract and check its text before shipping, and
     link it from the genai-literature-review item in content/research.ts as a /docs/ link. Its figures
     are reproduced from cited sources, so never lift one out as a site image. No deep page for it.
   - Per the 2026-09-16 amendment (Session 5 shipped): `prebuild` already runs
     `tsx scripts/layout-explorer.ts --check`, so chain the resume script onto it with `&&` rather than
     replacing it (tsx is already a devDependency). `/experience?skill=` and `/projects?tag=` are
     filtered views, not routes: the sitemap and canonical URLs use the bare paths.
   - /resume as a redirects() entry in next.config.ts (not a route handler, which would become a
     serverless function); all "Download resume" CTAs point at /resume.
   - If the generated layout is not acceptable after reasonable effort, apply the DESIGN §5.4 fallback:
     ship the hand-made PDF from `_source/resume/` at the same path, keep the generator behind an env
     flag, and say so in the build log and PR. It contains no phone number (2026-09-10 amendment
     cancelled the `-web.pdf` export, which never existed). The approved file is the resume of
     record, revised 2026-09-11 (my decision, 2026-09-15; ignore the 2026-09-09 and original
     versions in that folder).
     BUT a pdftotext extract on 2026-09-15 found that it still contains BOTH placeholders —
     `[ADD PORTFOLIO URL]` in the page-1 contact line and `[ADD LIVE URL]` on the StimMap3D entry — so
     it cannot ship as-is and would fail the resume test. The generated PDF is unaffected (it renders
     from content/). So: build the generator properly first, and if you do need the fallback, STOP and
     ask me for a corrected export rather than editing the PDF or weakening the `[ADD ` assertion.
     Never ship a PDF still containing `[ADD PORTFOLIO URL]` or `[ADD LIVE URL]`.
   - SEO: metadataBase from NEXT_PUBLIC_SITE_URL (.env.example), unique title/description per route,
     app/sitemap.ts, app/robots.ts, root and per-project opengraph-image.tsx via next/og in the site's
     typography (name, page title, accent rule), Twitter card metadata, JSON-LD Person on Home,
     favicon + icon.svg.
   - docs/build-log/s6-resume-seo.md; screenshots including the two PDF pages rendered to PNG and the
     OG images for / and /projects/stimmap3d.
5. Verify: npm run build clean (prebuild generates the PDF); npm test green; /resume downloads the PDF;
   /sitemap.xml lists every route; /opengraph-image and /projects/stimmap3d/opengraph-image render.
6. Review the diff and fix findings.
7. Commit in small chunks, push `s6-resume-seo`, open a PR vs main with `gh pr create`. PR body: what
   shipped, mapping to acceptance, verify steps, whether the fallback rule was applied, and a note that I
   must set NEXT_PUBLIC_SITE_URL in Vercel. DO NOT MERGE.
8. Stop and report the PR URL. Ask me to review the generated PDF carefully before merging.

Acceptance (Session 6): PDF generated at build with passing tests (or fallback documented); sitemap,
robots, OG images, JSON-LD, unique metadata per route; build log + screenshots; PR opened on s6-resume-seo.
```

---

# SESSION 3b — StimMap3D live embed, public links and screenshots

**Run and merged 2026-09-20 as PR #12** (`dc0a8af`, `docs/build-log/s3b-stimmap3d-embed.md`). Kept as
the prompt that was pasted, less one private reference (redacted for publication, 2026-10-01).

```
You are building Paige Rattenberry's portfolio site. This is SESSION 3b (the StimMap3D live embed,
live-app and public repo links, and StimMap3D screenshots). Authoritative specs are DESIGN.md and
IMPLEMENTATION_PLAN.md in the repo root; read them before doing anything. Build ONLY Session 3b.

Session 3 was split on 2026-09-13 and 3b was deferred again on 2026-09-15, so it now runs after
Sessions 5 and 6. Session 3a (MDX pipeline, cards, /projects, EmbedFrame, StimMap3D page body) and
Session 4 are merged, and Sessions 5 (explorer) and 6 (resume PDF, SEO, OG images, sitemap) normally
are too. This session finishes the StimMap3D page with the parts that needed StimMap3D deployed and
public.

S0-D closed on 2026-09-20 and docs/build-log/s0d-stimmap3d.md records what it found, including three
things this session has to resolve. Read that log before planning; the IMPLEMENTATION_PLAN §4
Session 3b amendment of 2026-09-20 turns each of them into a decision you just follow.

Prerequisite check first, after pulling main. All of these passed on 2026-09-20; stop and tell me,
without proceeding, if any now fails:
- `_source/INVENTORY.md` has a filled StimMap3D section: live URL https://stimmap3d.pages.dev, hero
  deep-link `/?preset=F3&proto=10hz-hf-l&elec=1#/`, the public repo cleared for linking, and Paige's
  honest-framing brief (IMPLEMENTATION_PLAN §3 S0-D).
- `gh repo view PaigeRattenberry/stimmap3d --json visibility` reports PUBLIC.
- docs/build-log/s0d-stimmap3d.md, s3a-projects-mdx.md and s4-research-leadership.md exist on main.

Sessions 5 and 6 were merged before S0-D closed (PR #9 2026-09-16, PR #10 2026-09-18), so
docs/build-log/s5-explorer.md and docs/build-log/s6-resume-seo.md are on main and the extra tasks
below — Session 6's OG images and the assets reconciliation, Session 5's explorer derivation — all
apply. They were never required; if for any reason a log is missing, say so and carry on.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s3b-stimmap3d-embed`.
2. Read DESIGN.md §3.3–3.5, §5.2–5.3, §7.1; IMPLEMENTATION_PLAN.md §0, the split note at the top,
   §4 Session 3b; AGENTS.md; docs/build-log/s3a-projects-mdx.md (including the StimMap3D commit SHA
   its quotes and metrics were read from); content/projects/stimmap3d.mdx; components/embed/EmbedFrame.tsx.
   From the public StimMap3D repo, pick one commit to pin and read README.md, DESIGN.md §6, CLAUDE.md,
   docs/validation.md (the test counts live here now, not in the README), docs/agentic-development.md
   and the docs/screenshots listing at that commit. S0-D pinned
   0a20e810e48dca8aac1780c6478c3d1f51663989 on 2026-09-20; say in the PR whether yours is still that
   one. Write a concise plan for Session 3b only.
3. Invoke helpful skills: `frontend-design` for the embed placement; Playwright (browser tools) to
   verify the embed loads; an available code-review capability before the PR.
4. Implement Session 3b per IMPLEMENTATION_PLAN §4 Session 3b:
   - Work within what Session 4 shipped (IMPLEMENTATION_PLAN §4 Session 3b, 2026-09-15 amendment;
     read it in full): setting `cover` makes it Fig. 1, so any body figure numbers start at 2 (a
     content test enforces it); MDX drops JSX expression attributes, so write `number="2"`, not
     `number={2}`; EmbedFrame now takes `href` (the always-visible link's target, default `src`) and
     `allow` (default fullscreen), and its `my-8` margin is not overridable through className.
   - Add the live-app and public repo links to content/projects/stimmap3d.mdx frontmatter, in the link
     shape Session 3a settled on.
   - Re-check the live app's response headers for X-Frame-Options or a CSP frame-ancestors that would
     block the iframe (DESIGN §7.1). S0-D found none and loaded the deep link in a real cross-origin
     iframe on 2026-09-20, so this is confirmation, not discovery. If framing is now blocked, stop and
     ask me. Note that in a 900x600 frame the app's onboarding card sits above the 3D canvas.
   - Every word you write about StimMap3D obeys Paige's honest-framing brief in _source/INVENTORY.md:
     an illustrative model, not a medical device, not for clinical use; a simplified analytical
     spherical-head approximation, NOT FEM, in clearly-labelled relative units, never V/m; per-patient
     trajectories synthetic and badged; never "predicts treatment response" and never "anatomically
     faithful". StimMap3D's own tests enforce these claims.
   - Mount EmbedFrame on the StimMap3D page with the live URL + deep-link per DESIGN §7.1: the
     "Illustrative model — not for clinical use" callout stays visible around the frame, with an
     "Open full app" link and the fallback link.
   - Ship 4–6 images in public/images/stimmap3d/. The public repo has exactly ONE screenshot,
     docs/screenshots/visualizer.png — copy that at the pinned commit and record it in assets.json
     with repository provenance (source: stimmap3d-repo, repository URL, sourceFile, full commit
     SHA). Capture the other 3–5 from the live app with Playwright: write each capture to
     _source/stimmap3d/ first (my approved exception to _source/ being read-only), then ship the
     optimized copy and record it with STAGED provenance — source: _source/stimmap3d/<file>.png,
     revision naming the deployed commit, the origin and the capture date. Every record also carries
     rights, permission, transformations, alt text and dimensions. Keep the disclaimer banner in
     frame where it is on screen. Look at every image before committing it. Use them for the
     project's cover and the embed poster.
   - Re-check every quote and metric Session 3a placed on the page against the pinned commit; update
     anything that changed and record it in the build log. Two are already known stale: the card says
     436 Vitest tests across 32 test files, read on 2026-09-13; the public repo
     says 447 app tests across 35 files in docs/validation.md (the README no longer states a count),
     so update both values and point each note at docs/validation.md at the pinned commit. Any body
     text repeating a value has to change with it — the claims gate requires each metric value to
     occur in its associated text. The "~4–10%" field-error VALUE is a verbatim match in the public
     DESIGN.md §3.2 and stands, but its note does not: the note, and the body's closing attribution,
     both cite "StimMap3D's README and DESIGN §6/§6.2", and the public DESIGN.md runs §1–§4 with no
     such text in the README at all. Repoint both at DESIGN.md §3.2 at the pinned commit.
   - The body's second block quote is also stale. It is introduced as "From the README's 'How the
     physics works (and what it gets wrong)'", and the public README at the pinned SHA is a 38-line
     overview with no such section and none of that text; the public DESIGN.md §3.2 states the same
     limitations in different words. Re-quote it verbatim from DESIGN.md §3.2 or paraphrase it
     outside the block quote — do not leave a quotation attributed to text a reader cannot find. The
     first block quote (the method statement) IS verbatim in DESIGN.md §3.2 and stands.
   - "Built with Claude Code" sidebar: StimMap3D has no SESSION_PROMPTS.md, so link
     docs/agentic-development.md in the public repo, pinned at the same commit (CLAUDE.md and
     AGENTS.md there are the alternates). Never link a path that does not exist. Add links to the
     live app and the public repo in the page body.
   - Update the ProjectLinkSchema comment in lib/content/schema.ts: it still says a repo link is
     cleared for no repository ("today: none"), and INVENTORY.md now clears StimMap3D.
   - Session 6 is merged (2026-09-15 run-order amendment; read the run-order note in
     IMPLEMENTATION_PLAN §4 Session 3b), so: setting `cover` may change what
     /projects/stimmap3d/opengraph-image renders, so open it and report the result (the 2026-09-17
     amendment below settles that it should be unchanged); re-run Session 6's
     assets.json reconciliation of public/images, public/docs and the root PDFs now that the
     screenshots are added; and confirm Session 5's explorer derivation tests still pass untouched
     (adding links and a cover must not change its entries or edges).
   - Per the 2026-09-16 amendment (Session 5 shipped): StimMap3D is also a timeline entry on
     /experience and shows its disclaimer there; keep the frontmatter disclaimer as is. `npm run build`
     checks the committed explorer layout, so if you change StimMap3D's skills, run
     `npm run layout:explorer` and commit content/generated/explorer-layout.json with the change.
   - Per the 2026-09-17 amendment (Session 6 shipped; read it and docs/build-log/s6-resume-seo.md in
     full): the project OG card does not draw `cover`, so /projects/stimmap3d/opengraph-image should
     be unchanged; confirm it, and ask me before putting the cover on the card. The sitemap and
     metadata already cover the page. The assets reconciliation is a unit test in
     tests/unit/content.test.ts. StimMap3D is on the generated resume and a `live` link changes the PDF
     built without NEXT_PUBLIC_SITE_URL: keep tests/unit/resume.test.ts green (two pages at most,
     disclaimer present), and if anything the resume prints changed, set the resume's assets.json
     `revision` to that commit's full SHA in a follow-up commit.
   - docs/build-log/s3b-stimmap3d-embed.md; screenshots with `$env:SESSION = "3b"`, including one
     with the embed loaded.
5. Verify: npm run build clean; npm test green (disclaimer and asset-provenance tests included); the
   embed does not load until clicked, then shows the live app in the iframe (check with Playwright
   against `next start`); run `npx lhci autorun` (or Lighthouse in Playwright/Chrome) against
   `next start` for /projects/stimmap3d and report the performance score (target >= 90 mobile).
6. Review the diff and fix findings.
7. Commit in small chunks, push `s3b-stimmap3d-embed`, open a PR vs main with `gh pr create`. PR body:
   what shipped, mapping to Session 3b acceptance, verify steps, the pinned StimMap3D commit, any
   quote or metric that changed since 3a, and the Lighthouse score. DO NOT MERGE.
8. Stop and report the PR URL and remind me to merge before Session 7.

Acceptance (Session 3b): StimMap3D page with click-to-load live embed and disclaimer test; live-app
and public repo links; screenshots in assets.json — the repo image with public-commit provenance,
each live capture staged with the deployed commit, origin and capture date; quotes and metrics
re-checked against that commit, test counts now 447 across 35 files; every metric sourced; Lighthouse performance reported; build log +
screenshots; PR opened on s3b-stimmap3d-embed.
```

---

# SESSION 6b — Positioning and the interpretability thread

**Added 2026-09-20 at Paige's request.** Runs after Session 3b merged and before Session 7. Editorial
only: emphasis, ordering and vocabulary over facts already in `content/`, plus one deep page built
from a document Paige wrote. The task list, the settled decisions and the latitude clause live in
IMPLEMENTATION_PLAN §4 Session 6b; DESIGN §0 ("Deep project pages", "Featured order", "Editorial
pass"), §1 answer 1 and §2 carry the decisions. The prompt below is the one that was pasted, less
a pointer to private working notes; passages drawn from private material were removed, and four
were reworded rather than cut (redacted for publication, 2026-10-01).

```
You are building Paige Rattenberry's portfolio site. This is SESSION 6b (positioning and the
interpretability thread). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo
root; read them before doing anything — DESIGN §0, §1, §2, §3.3, §3.4 and IMPLEMENTATION_PLAN §0 and
§4 Session 6b. Read AGENTS.md for the shared rules. Build ONLY Session 6b.

Sessions 1, 2, 3a, 4, 5, 6 and 3b are merged. This session does not add a feature: it changes how the
site names work it already describes, and adds one deep page for a document Paige wrote in 2024.

WHAT THIS SESSION IS FOR
One thread runs through Paige's work — a system's output can be checked, the checker is itself
tested, and the check runs automatically or it does not count. Name it on Home, in About and on
/research; give the GenAI interpretability literature review a deep page; move the thesis to second
of the three case-study cards. Change no fact.

BEFORE YOU START
1. git checkout main && git pull, then: git checkout -b s6b-positioning
2. Read the specs above, plus _source/INVENTORY.md (read-only; never commit anything from it).
3. Write a concise plan for this session only.

DECISIONS ALREADY MADE BY PAIGE (2026-09-20) — implement, do not re-open
- Positioning line, exactly: "I build the instruments that check what AI systems claim — evaluation
  harnesses that run as merge gates, retrieval that traces every claim back to its source, and
  research on whether a model's explanation points at the evidence. Mostly where being wrong has a
  real cost."
- Featured order: StimMap3D, Honours thesis, Adolescent Spinal Curvature capstone. Exactly three
  featured; the literature review gets a deep page and is NOT featured. Both grids are md:grid-cols-3
  and a fourth card would wrap onto a row by itself.
- The resume PDF may change when the literature review's summary is rewritten. Let it change, keep
  it at two pages, and update the revision pin on its assets.json record in a follow-up commit.
- CLEARED by Paige 2026-09-20: the multi-agent infrastructure-automation work may be described as
  involving guardrails, permissioning and oversight of what agents were allowed to do.
- About's present-tense paragraph: Paige supplies the text and approves the exact wording. If it is
  not in your hands when you run, SHIP WITHOUT IT. Do not draft an opinion for her.

TASKS — IMPLEMENTATION_PLAN §4 Session 6b, tasks 1–11, in that order. Highlights that bite:
- Keep the "220+" token in profile.currently.text, and do not touch content/experience.ts bullets or
  profile.summary (both verbatim resume of record; profile.summary changes the PDF).
- Skill labels are label TEXT only, and short: "Interpretability (XAI)" and "Grounding & claim
  verification" were measured on 2026-09-20, separately and together, and each leaves
  content/generated/explorer-layout.json byte-identical; longer labels for xai do not, because label
  length decides label placement (lib/explorer/layout.ts calls labelWidth(n.label)). Prove it with
  `npx tsx scripts/layout-explorer.ts --check` and report that it passed without regenerating.
- Do NOT change any entry's skill SET. One added edge re-lays out all 42 nodes and invalidates the
  Session 5 screenshots and the Home teaser.
- The new deep page needs BOTH a body test in tests/unit/components/ProjectPage.test.tsx AND its slug
  in that file's "every deep page is covered by a body test above" array.
- The featured reorder needs the expected array in tests/unit/content.test.ts updated too.
- Every route's <meta description> must stay unique site-wide; seo.spec.ts compares them all.
- Declare 14 as a metric on the research ITEM in content/research.ts, not in the MDX frontmatter:
  mergeResearch (lib/content/projects.ts) replaces a researchId card's metrics with the item's, so a
  metric declared in the MDX is discarded. The rewritten research summary must then contain the
  literal token "14", and must say "14 papers" or "14 references" — not "14 studies". 14 is the
  reference count, checked against the shipped PDF's reference list; three of them are surveys cited
  for context, not frameworks the review evaluates.
- Thesis page: change the tagline and add one closing paragraph. Change NO measured claim, and put no
  numeral in the new paragraph.

YOU MAY GO BEYOND THE TASK LIST
Paige has asked that you make additional changes that serve the same goal when you find them, under
the latitude clause in IMPLEMENTATION_PLAN §4 Session 6b. In short: every statement traces to
content/ or an already-cleared source; you do not touch the verbatim resume bullets, profile.summary,
_source/, the decisions above or StimMap3D's disclaimer; you do not change the skill graph, the
featured set beyond task 8, or the three spec files; it is verifiable by a check that runs in this
repo; and you list it under its own heading in the PR body and the build log. Anything that fails one
of those is a recommendation in the PR body, not a change. Read the full clause before using it.

NEVER-REGRESS GATES (AGENTS.md): claims gate; privacy gate (no _source/ file committed, no _source/
path in a served page, no phone-shaped string, assets.json provenance); StimMap3D's disclaimer
travels with it; both themes, keyboard operable, reduced motion honoured; no facts hard-coded in
components. You add no fact and no organisation that is not already in content/ — the employers,
institutions and venues already there stay.

VERIFY (PowerShell), in this order:
  npm run lint
  npm run typecheck
  npx tsx scripts/layout-explorer.ts --check
  npm run resume            (only if the resume line changed; must stay two pages)
  npm test
  npm run build
  npm run e2e:a11y
  npm run e2e:features
  $env:SESSION = "6b"; npm run e2e:screenshots
  node scripts/js-budget.mjs /     (record the number before and after; it was 137.1 KB gzipped
                                    after Session 6, and this session should not move it)

THEN
- Write docs/build-log/s6b-positioning.md from the IMPLEMENTATION_PLAN §0 template, including the
  "What the AI got wrong and how it was caught" section honestly and the empty "Paige's review notes"
  heading. Record the model you actually are. Per S0-F, write it with no _source/ paths where a
  public label from content/sources.ts will do — this file is rendered publicly by Session 8.
- Run an available code-review capability and address the findings.
- Commit in small logical chunks, push, and open a PR against main with gh pr create. The body maps
  the work to the Acceptance list in IMPLEMENTATION_PLAN §4 Session 6b, gives the PowerShell verify
  steps, gives the JS numbers, and lists anything you did under the latitude clause and anything you
  are recommending instead of doing. DO NOT MERGE — Paige merges.
- Stop and report the PR link, plus anything Paige must do before Session 7.

Acceptance (Session 6b): IMPLEMENTATION_PLAN §4 Session 6b's ten acceptance items, all met.
```

---

# SESSION 7 — Accessibility + performance gates, cross-device polish

```
You are building Paige Rattenberry's portfolio site. This is SESSION 7 (Accessibility + performance
gates in CI, cross-device polish). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the
repo root; read them before doing anything. Build ONLY Session 7.

This is the first session that needs S0-D. Prerequisite check first, after pulling main: Sessions 5, 6,
3b and 6b must all be merged (docs/build-log/s5-explorer.md, s6-resume-seo.md, s3b-stimmap3d-embed.md
and s6b-positioning.md on main). Task 1 runs axe with the StimMap3D embed loaded and an explorer filter
active, and task 2 runs Lighthouse on /projects/stimmap3d, so stop and tell me if 3b or 6b is still
outstanding. 3b merged on 2026-09-20 as PR #12; 6b ran on 2026-09-20 as PR #14 (IMPLEMENTATION_PLAN §4
Session 7, 2026-09-20 amendment: it adds one route, /projects/genai-literature-review, and no client JS).

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s7-quality-gates`.
2. Read DESIGN.md §5.7 (CI gates), §8 (quality bar), §4.3 (motion); IMPLEMENTATION_PLAN.md §0, §4
   Session 7; CLAUDE.md. Write a concise plan for Session 7 only.
3. Invoke helpful skills: Playwright browser tools for the responsive sweep; an available code-review capability before the PR.
4. Implement Session 7 per IMPLEMENTATION_PLAN §4 Session 7:
   - tests/e2e/a11y.spec.ts already exists from Session 1: confirm it covers every route added since
     (both themes) and extend it to also run axe with the StimMap3D embed loaded and with one explorer
     filter active.
   - lighthouserc.json + CI job 3 with @lhci/cli (mobile preset) on /, /projects/stimmap3d, /experience
     against `next start`; assertions: performance >= 0.9, accessibility = 1, best-practices >= 0.95,
     seo = 1. All three jobs run on pull requests. While you are in ci.yml, bump actions/checkout and
     actions/setup-node from v4 to v5 (v4 targets the deprecated Node 20 and every run logs a warning).
   - Fix everything Lighthouse surfaces (fonts, image sizing, JS budget, CLS from the embed poster).
     Sweep 360/768/1280/1920 px in both themes: focus rings, skip link, heading order, alt text,
     contrast, reduced motion, no horizontal scroll, embed poster sizing.
   - Per the 2026-09-15 amendment (read it in full): measure the thesis charts' per-node utility
     classes (about 1.5–2 KB raw per chart per serialisation) and consolidate them if they matter;
     include both Session 4 deep pages, 6b's /projects/genai-literature-review, /research and
     /leadership (video frame) in the sweep; if the
     StimMap3D 360 px tooltip test flakes in CI, fix its wait rather than adding retries.
   - Per the 2026-09-16 amendment (Session 5 shipped; read it and docs/build-log/s5-explorer.md in
     full): Home's initial JS is 136.6 KB gzipped against the 120 KB target, unchanged since Session 1
     (framework weight, not the explorer); measure it with `node scripts/js-budget.mjs /` and
     `/experience` (prefix MSYS_NO_PATHCONV=1 in Git Bash), try to get it under 120 KB, and report
     the number. If it cannot be done without dropping the App Router, tell me; do not relax the
     target. tests/e2e/explorer.spec.ts already runs axe on a filtered /experience in both themes
     (CI job 2), so reuse it for the filter case. Include the teaser and constellation SVG weight in the
     Lighthouse review, sweep the explorer and the 1024 px teaser/contour switch, and remember
     `scroll-behavior: smooth` when a hover test far down a page flakes: scroll the target into
     view in one instant step first, as Session 5 did.
   - Per the 2026-09-17 amendment (Session 6 shipped; read it and docs/build-log/s6-resume-seo.md in
     full): Home now measures 137.1 KB and /experience 141.4 KB. /resume is a redirect, so keep it out
     of Lighthouse; axe and the screenshots cover htmlRoutes only. CI job 2 already runs seo.spec.ts.
     Canonical and Open Graph URLs are absolute and come from lib/site.ts (http://localhost:3000 when
     NEXT_PUBLIC_SITE_URL is unset, while next start serves port 3100): confirm Lighthouse's canonical
     audit passes, and if it does not, give the Lighthouse job a matching origin rather than relaxing
     seo = 1. Run Lighthouse against next start, never a noindex Vercel preview.
   - Per the 2026-09-20 amendment (Session 3b shipped; read it and docs/build-log/s3b-stimmap3d-embed.md
     in full): mobile performance on /projects/stimmap3d measured 88, 89, 89 against the >= 90 target,
     and the embed is not the cause — the untouched /projects/spinal-curvature-capstone, which has no
     image at all, scores 88 in the same run with the same simulated 3.8 s LCP while the observed LCP
     on both is about 0.24 s. That site-wide baseline under simulated mobile throttling is this
     session's task 3; do not relax the target. Axe with the embed loaded already runs in
     tests/e2e/projects.spec.ts against a stubbed live origin (CI job 2), so reuse it the way you
     reuse the explorer's filter case. The poster is the page's LCP element, 16:9, eager with
     fetchPriority high inside a fixed-ratio container, so CLS is 0 before the click; treat "CLS from
     the embed poster" as a re-check. The page now ships six images, one of them a 366 KB PNG copied
     byte-identical from the public repo so it can be verified against the upstream blob id — include
     it in the image-sizing review but do not re-encode it. The 360 px tooltip flake now has two
     sightings on two routes, both under parallel workers, both a null boundingBox after toBeVisible:
     fix the wait, do not add retries.
   - docs/build-log/s7-quality-gates.md; mobile screenshot set.
5. Verify: all three CI jobs green on the PR (push and watch with `gh run watch`); record the
   Lighthouse numbers.
6. Review the diff and fix findings.
7. Commit in small chunks, push `s7-quality-gates`, open a PR vs main with `gh pr create`. PR body:
   what shipped, mapping to acceptance, the Lighthouse scores per route, verify steps. DO NOT MERGE.
8. Stop and report the PR URL. Remind me to enable branch protection on main requiring the three
   checks (IMPLEMENTATION_PLAN §3 S0-E) after merging.

Acceptance (Session 7): three CI jobs green; Lighthouse scores reported and meeting DESIGN §5.7;
Home initial JS reported against 120 KB;
responsive sweep done; build log + screenshots; PR opened on s7-quality-gates.
```

---

# SESSION S0-G — Publication scrub

Added 2026-09-30 at Paige's request; runs after Session 7 merges and before Session 8 (branch
`s0g-publication-scrub`). Its task list and Paige's decisions D1–D9 are IMPLEMENTATION_PLAN §3
S0-G. The paste-ready prompt is kept in Paige's private notes rather than here.

---

# SESSION 8 — "How This Site Was Built" page + launch

Re-specified 2026-09-30 by S0-G for the two-repository launch (IMPLEMENTATION_PLAN §3 S0-G, §4
Session 8, §6).

```
You are building Paige Rattenberry's portfolio site. This is SESSION 8 (How This Site Was Built page
+ launch checklist). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root;
read them before doing anything. Build ONLY Session 8.

This session runs in PaigeRattenberry/paigewebsite, the private pre-launch repository. After its PR
merges, I seed the public repository PaigeRattenberry/paige-rattenberry-site from one commit of this
tree (IMPLEMENTATION_PLAN §6, launch steps L1–L10). PaigeRattenberry/paigewebsite stays private for
good: never change any repository's visibility or settings.

Workflow for this session, in order:
1. `git checkout main && git pull`, then `git checkout -b s8-launch`.
2. Read DESIGN.md §6 (the build story and its tone), §5.6 (build stats), §3.3–3.4 (gates);
   IMPLEMENTATION_PLAN.md §0, §3 S0-G, §4 Session 8, §6; AGENTS.md, including its publication
   rules; every file in docs/build-log/. Write a concise plan for Session 8 only.
3. Invoke helpful skills: `security-review` for the pre-launch check; `frontend-design` for the
   build-story page; an available code-review capability before the PR.
4. Implement Session 8 per IMPLEMENTATION_PLAN §4 Session 8:
   - scripts/fetch-build-stats.ts (decision D6): run it by hand against
     PaigeRattenberry/paigewebsite with `gh auth token`; it writes content/generated/build-stats.json
     with counts and dates only (merged PRs, commits, first and last merge dates; no PR titles,
     branch names or commit messages), and the file is committed. Do NOT chain it onto prebuild,
     and add no GITHUB_TOKEN to Vercel or .env.example: a Vercel build never calls the GitHub API.
   - /how-this-was-built: transparency statement (what Claude generated, what Paige decided/reviewed/
     rejected, factual tone per DESIGN §6); links to DESIGN.md, IMPLEMENTATION_PLAN.md and
     SESSION_PROMPTS.md in the public repository through one URL constant in content/
     (https://github.com/PaigeRattenberry/paige-rattenberry-site; it returns 404 until launch step
     L7); build-log entries rendered as a timeline (loader for docs/build-log/*.md), with PR
     numbers as plain text; the build stats under the sentence "The public history begins at
     launch; the counts below are a snapshot of the pre-launch history, and the build logs are the
     record of the build."; screenshot gallery; a "what worked / what did not" synthesis drafted
     from the build logs as a taxonomy of what the AI got wrong and which mechanism caught it (mark
     it clearly as a draft for Paige to edit); StimMap3D as case study #1 linking to its public
     repository's `docs/agentic-development.md` at the pinned commit (it has no session pack).
   - Launch checklist, executed and ticked in the PR body: `rg` for the DESIGN §3.4 phone pattern
     and secret patterns across the working tree (history is handled by the seed, since the public
     repository starts from one commit of this tree; say so); the publication gate green with my
     private term list present; assets.json vs public/images and public/docs reconciliation; every
     external link checked by hand (the public repository's links are expected to 404 until L7);
     README polished with a hero screenshot; LICENSE verified; confirm .gitignore still excludes
     _source/ and private/.
   - Per the 2026-09-17 amendment (Session 6 shipped; read it and docs/build-log/s6-resume-seo.md in
     full): /how-this-was-built is already in lib/routes.ts, so the sitemap, axe, screenshots and
     seo.spec.ts cover it. Give it `canonical("/how-this-was-built", …)` with a unique title and
     description. The assets reconciliation includes the generated root resume PDF (git-ignored, so
     build first). If anything the resume prints changes, update its assets.json `revision`.
   - Per the 2026-09-21 amendment (Session 7 shipped; read it and docs/build-log/s7-quality-gates.md
     in full): CI has three jobs, and job 3 is Lighthouse from lighthouserc.json (on Windows run
     `node scripts/lighthouse-local.mjs` instead of lhci); add /how-this-was-built to its URLs if it
     should be audited, and keep all three green. Fonts are self-hosted files in app/fonts/ covering
     Google's latin subset plus "ć", "ğ" and "φ": the build logs this page renders use other
     characters ("→", "≥", "≤", "✓"), and tests/e2e/fonts.spec.ts fails on each one until it is either
     added to INTER_EXTRAS in scripts/build-fonts.mjs (then `npm run fonts` and the literal
     unicode-range in app/layout.tsx) or listed as a known system-font symbol. Add no preloaded font,
     no unsized above-the-fold image and no avoidable client island: about 18 KB loaded before first
     paint costs 0.1 s of simulated LCP. DESIGN §8's JS budget is now the site's own
     client JS on / <= 15 KB gzipped (9.8 KB today; the framework floor is 127.3 KB), and
     `npm run budget` fails CI job 1 over it, so a new client island in the shell or on Home spends
     from a 5 KB margin.
   - docs/build-log/s8-launch.md, written to AGENTS.md's publication rules; screenshots.
5. Verify: npm run build clean; npm test green, the publication gate included; /how-this-was-built
   renders every build-log entry and the stats; all three CI jobs green on the PR.
6. Review the diff and fix findings.
7. Commit in small chunks, push `s8-launch`, open a PR vs main with `gh pr create`. PR body, written
   to AGENTS.md's publication rules: what shipped, mapping to acceptance, the ticked launch
   checklist, and a pointer to the launch steps in IMPLEMENTATION_PLAN §6: MY steps L1–L9 (seed,
   Vercel re-point, making the public repository public, branch protection on it, the production
   build, the archive) and L10, the first agent session in the public repository. Copy nothing from
   my private notes. DO NOT MERGE, and do NOT change any repository's visibility or settings
   yourself.
8. Stop and report the PR URL.

Acceptance (Session 8): build-story page complete, with the pre-launch build stats as a committed
snapshot (D6); launch checklist ticked; publication gate green; site verified on the Vercel
preview; the tree ready to seed PaigeRattenberry/paige-rattenberry-site; PR opened on s8-launch.
```

---

# SESSION 9 — Pre-launch content update

Added 2026-10-06 at Paige's request; runs after Session 8 merges and before launch step L1 (branch
`s9-content-update`). Its tasks and acceptance are IMPLEMENTATION_PLAN §4 Session 9 and §7. The
detailed session plan, with every decision, fact and source the session copies, is kept with
Paige's private notes, the way S0-G's prompt is; the prompt below points at it.

```
You are updating content on Paige Rattenberry's portfolio site. This is SESSION 9 (pre-launch
content update). Authoritative specs are DESIGN.md and IMPLEMENTATION_PLAN.md in the repo root;
read them, AGENTS.md (its publication rules included) and the session plan I give you before doing
anything. Build ONLY Session 9.

1. `git checkout main && git pull`, then `git checkout -b s9-content-update`.
2. Read the source inventory first and stop if the dated entries the plan names are missing.
3. Implement IMPLEMENTATION_PLAN §4 Session 9, in the plan's commit order, each commit green on
   `npm test`: the two code steps; the Hammerspace pull-request count and "internal"; the
   Hammerspace, SHIELD and Stryker wording; the thesis credit and its failed-run sentence; About's
   incident paragraph and LLM judge; the GMLE and SEC595 coverage; this site as a card-only
   project, then on the resume with the ordered cuts that keep it at two pages; Home's build-story
   pointer and the /research heading; this file, IMPLEMENTATION_PLAN.md, AGENTS.md and the README.
4. Verify per IMPLEMENTATION_PLAN §7 and the plan's acceptance list; read the resume PDF in both
   renders and every changed page in both themes at 1280 and 390 px.
5. Build log and screenshots; push; open a PR vs main with `gh pr create`, written to AGENTS.md's
   publication rules. Then pin the resume record and refresh the history snapshot, last.
   DO NOT MERGE.
```

---

# SESSION 9b — Pre-seed fixes

Added 2026-10-07 at Paige's request; runs after Session 9 merges and before launch step L1 (branch
`s9b-pre-seed`). It ran in the conversation that reviewed the repository's state before launch, so
it had no pasted prompt; its tasks and acceptance are IMPLEMENTATION_PLAN §4 Session 9b and §7. The
prompt below re-runs it.

```
You are making three small fixes to Paige Rattenberry's portfolio site before launch. This is
SESSION 9b (pre-seed fixes). Read DESIGN.md, IMPLEMENTATION_PLAN.md and AGENTS.md (its publication
rules included) first. Build ONLY Session 9b.

1. `git checkout main && git pull`, then `git checkout -b s9b-pre-seed`.
2. Implement IMPLEMENTATION_PLAN §4 Session 9b: a log page leaves out an empty "Paige's review
   notes" heading (unit test for both cases); the README's line for running npm test in a clone
   without the private term list; "Built" in the thesis's first bullet; this file, the plan,
   AGENTS.md, DESIGN.md and the README.
3. Verify per IMPLEMENTATION_PLAN §7; read the resume PDF in both renders.
4. Build log and screenshots; push; open a PR vs main with `gh pr create`, written to AGENTS.md's
   publication rules. Then pin the resume record and refresh the history snapshot, last.
   DO NOT MERGE.
```

---

# OPTIONAL SESSION 10+ — Stretch (only after launch)

Run in the public repository (IMPLEMENTATION_PLAN §6). Pick one item from DESIGN §9 per session and use the shared preamble with a new branch (`s10-domain`,
`s11-analytics`, `s12-xai-demo`, …). Each stretch session must still add a build-log entry, since the
build-story page renders them.

Custom-domain session outline: buy the domain (Cloudflare Registrar or Vercel; your step), add it in
Vercel, update `NEXT_PUBLIC_SITE_URL`, redeploy, re-verify sitemap and OG images, update the links
that point at the site.
