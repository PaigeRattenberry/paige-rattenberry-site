# Paige Rattenberry — Portfolio Site: Design Document

**Personal portfolio site for Paige Rattenberry.** Companion to
[`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) (sessions, dependencies, acceptance) and
[`SESSION_PROMPTS.md`](./SESSION_PROMPTS.md) (one paste-ready coding-agent prompt per session).

> Status (2026-10-01): **Sessions 1, 2, 3a, 4, 5, 6, 3b, 6b, 7 and S0-G merged** (S0-G as PR #17).
> **Session 8** (PR #18, `docs/build-log/s8-launch.md`): `/how-this-was-built` renders every build
> log, the pre-launch history snapshot (§5.6) and a synthesis of what the AI got wrong and what
> caught it. **The launch steps follow it** (IMPLEMENTATION_PLAN §6). The original design
> was approved 2026-09-07; the September 13 review follow-up is implemented.

> **Edited for publication — 2026-10-01 (S0-G).** Passages were removed from this file's decisions
> and records, and the amended passages reworded to stand alone; every decision still stands, with
> its credit and date (redacted for publication, 2026-10-01).

---

## 0. Decisions log (2026-09-07)

| Topic | Decision |
|---|---|
| Purpose | A portfolio of work, projects and methods; Experience and the resume stay easy to find. (Rows amended 2026-09-30, S0-G.) |
| Stack | **Next.js 16 (App Router) + React 19 + TypeScript (strict, the version `create-next-app` installs) + Tailwind CSS 4**, MDX for long-form project pages. |
| Hosting | **Vercel**, free hobby tier, free `*.vercel.app` subdomain for now. Custom domain is a stretch item. **No production deployment exists until launch (IMPLEMENTATION_PLAN §6, L7)** — the Hobby tier cannot protect a production domain, so the site stays private by deploying only login-gated, `noindex` previews (IMPLEMENTATION_PLAN §3 S0-E). |
| Repo | Built in `PaigeRattenberry/paigewebsite`, which is private and **stays private as the pre-launch archive**: never change its visibility. **Amended 2026-09-30 (S0-G, decision D3):** at launch its tree is seeded as one commit into the public repository `PaigeRattenberry/paige-rattenberry-site`, which every later session works in (IMPLEMENTATION_PLAN §6). |
| Workflow | Same as StimMap3D: one feature branch + one PR per session; Paige reviews and merges; next session starts from `main`. |
| Sections | Home, About, Experience, Projects (index + 4 deep pages; three until Session 6b), Research (amended 2026-10-06 at Paige's request: nothing listed is a publication), Volunteer & Leadership, Contact, **How This Site Was Built**. **No blog.** |
| Deep project pages | **Four (amended 2026-09-20, requested by Paige).** StimMap3D; Honours thesis (interpretable medical-image DNNs); Adolescent Spinal Curvature capstone; the GenAI interpretability literature review. Everything else is a card. |
| Featured order | **StimMap3D, Honours thesis, Adolescent Spinal Curvature capstone** (amended 2026-09-20, requested by Paige; the thesis and the capstone swapped places). These three are the "Selected work" row on Home and the "Case studies" row on `/projects`, both `md:grid-cols-3`, so the count stays at three and the literature review is a deep page without being featured. `tests/unit/content.test.ts` pins the featured order to this row. |
| Editorial pass (Session 6b) | **Added 2026-09-20 at Paige's request.** One thread runs through the work — a system's output can be checked, the checker is itself tested, and the check runs automatically or it does not count. Session 6b names it on Home, in About and on `/research`, and gives the literature review the deep page its material supports. It changes emphasis, ordering and vocabulary over facts already in `content/`; it introduces no new fact and no new claim. |
| Claude Code showcase | Both a transparent **build-story page** (plan, per-session build log, pre-launch history as counts, what worked and what did not) **and** interactive demos. |
| Demos | (1) Embedded live **StimMap3D** teaser on its project page. (2) Interactive **career timeline + skills explorer** on the Experience page. |
| Extras in scope | SEO + Open Graph link-preview images + sitemap; **resume PDF generated from the site's single source of truth**; accessibility (axe) + Lighthouse gates in CI. |
| Extras out of scope | Analytics, contact form, calendar link, blog, custom domain, new original mini-demos (post-launch stretch, §9). |
| Contact | Email, LinkedIn, GitHub only. City (Burnaby, BC, Canada) may appear. **No phone number.** |
| Visual direction | **Editorial-scientific hybrid** (§4). |
| Role titles | The **resume** is the source of truth (e.g. Hammerspace = "Software Engineer, Advanced Research Engineering"). |
| Source materials | Mostly PDFs and Word documents plus photos/video, staged by Paige in an untracked `_source/` folder before Session 2. Repo links are **optional per project**; most repos stay private for now. |
| StimMap3D prerequisite | StimMap3D was **not yet deployed and its repo was private** (verified 2026-09-07). Paige deploys it to Cloudflare Pages and flips it public **before Session 3b**, which the 2026-09-15 run-order amendment moved to after Session 6; Sessions 3a, 4, 5 and 6 do not need it (IMPLEMENTATION_PLAN §3 and its 2026-09-13 split and 2026-09-15 run-order notes). **Closed 2026-09-20 (S0-D):** live at `https://stimmap3d.pages.dev`, `PaigeRattenberry/stimmap3d` public under MIT, cleared for linking by `_source/INVENTORY.md`; Session 3b then shipped the embed, the links and the screenshots. |

---

## 1. Goals and the 30-second test

A visitor should quickly be able to answer:

1. **What does Paige build?** **Amended 2026-09-20 (requested by Paige).** The instruments that check
   what AI systems claim: evaluation harnesses that run as merge gates, retrieval that traces every
   claim back to its source, and research on whether a model's explanation points at the evidence —
   mostly where being wrong has a real cost. It replaces the earlier answer ("reliable agent
   infrastructure, production knowledge systems, evaluation gates, and medical-AI research"); the
   facts behind both are the same `content/` bullets.
   `content/profile.ts`'s `positioning` is where this is said in one sentence, and it feeds **three**
   surfaces — the Home hero, the site-wide Open Graph card's description and the JSON-LD `Person`
   description — so it must stay under about 280 characters or it overflows the 1200×630 card.
   A concise current-work summary links to Experience near the introduction, before Selected work,
   within the first screen at 390/1280 × 800.
2. **What can I explore?** Selected projects with short display titles and one result or engineering
   question; official titles remain on detail pages. The primary action is **Explore projects**.
3. **How do I get in touch?** **Get in touch** is a neutral action; Resume is a secondary text link
   and Experience remains prominent.

Hammerspace work appears at resume level, on Experience; anything more is a content change Paige
approves. Inspectable artifacts come from independent projects and the portfolio.

Non-goals: no newsletter, no comments, no client-side tracking of individuals, no marketing copy that
the resume cannot back up.

---

## 2. Site map and page specs

All routes are statically generated at build time. Every page shares the header (name, nav, theme
toggle) and footer (email, LinkedIn, GitHub, "How this site was built" link to the build-story page,
last-updated date: the commit date from git when `.git` is available, else `VERCEL_GIT_COMMIT_SHA` +
build time, since Vercel's build container may not ship history).

| Route | Page | Purpose | Key content |
|---|---|---|---|
| `/` | Home | Pass the 30-second test | Hero (name, short introduction, current work linked to Experience, Explore projects, Get in touch, secondary Resume link, static contour); Selected work (short card titles); six representative skills; links |
| `/about` | About | The narrative | 3–5 short paragraphs: origin (SFU, valedictorian), the medical-AI thread, the move to agent infrastructure, how she works (evaluation-first, honesty gates), outside work; headshot |
| `/experience` | Experience | Full work history + interactive explorer | Timeline/skills explorer (§7.2) on top; below, each role with dates, title (resume wording), bullets, skills tags |
| `/projects` | Projects | Index | Deep-page cards first, then card grid for the rest (MentalWell, Clinical CoPilot, CMPT 412 vision work, ML-for-cybersecurity, capnography/EEG research, EEGTMS app) with tag filters |
| `/projects/stimmap3d` | Deep page | Flagship | Hero screenshot; "What it is" in 3 sentences; click-to-load live embed (§7.1); features; the physics and what it gets wrong (quoted from StimMap3D docs); engineering rigor (the test count StimMap3D's public docs state at the commit read, recorded in the session's build log and re-checked in Session 3b; the seed said 418, and the public repo's `docs/validation.md` says 447 across 35 files plus 24 production Chromium checks as of 2026-09-20 — the README states no count, so cite `docs/validation.md`; axe gate; honesty gates); "Built with Claude Code" sidebar linking to build story; links to live app + repo (amended 2026-09-13, approved by Paige) |
| `/projects/spinal-curvature-capstone` | Deep page | Award-winning capstone | Problem, how Paige originated the project and formed the team, system as built (force-sensor garment, noise-filtering firmware, real-time pressure heatmap on a CAD torso model, brace design), results, Best Overall Project at ICAMES 2022, the ML model for curve-progression prediction **as the envisioned next phase, never as built**, figures, team credit (with consent) |
| `/projects/interpretable-medical-imaging-thesis` | Deep page | Honours thesis | Question, method (ResNet-34/VGG-16; five CAM methods scored against ground truth **induced by watermarking chest X-rays**, not expert annotations; IoU + paired t-tests), findings (FullGrad most robust and precise, improved by thresholding), why interpretability matters in safety-critical settings, figures, link to thesis PDF if cleared. **Amended 2026-09-20:** the tagline asks the method question rather than naming the domain, and one closing paragraph states what the approach carries to other systems **and what it does not** — these were convolutional image classifiers in 2022, not language models and not transformer internals. Every measured claim stays byte-identical |
| `/projects/genai-literature-review` | Deep page | The 2024 interpretability review | **Added 2026-09-20 (requested by Paige).** Why it was written (April 2024); the failure modes it covers (hallucination, misgeneralization, bias, prompt injection, deepfakes and disinformation, confidential data leakage); the interpretability-vs-explainability distinction it draws, **with the note that other literatures use those two words the other way round**; what the field was proposing, reported as other people's work and not cherry-picked; where it fell short; the conclusion on standardised interpretability metrics weighted by domain. Card facts come from the `genai-literature-review` item in `content/research.ts` through `researchId` and may not be retyped. **No figures** — every figure in the source PDF is reproduced from a cited paper. Deep page, not featured |
| `/research` | Research (amended 2026-10-06 at Paige's request: nothing listed is a publication) | Research trail | Thesis, capstone, Stryker XAI work, Rostrum/HealthTech Connex/SFU FAISAL research (capnography, EEG), literature review on GenAI failure modes, MLADS proposal reviewer & co-area chair, Clinical CoPilot hackathon; each item: year, venue/org, one paragraph, link/PDF if cleared. **Amended 2026-09-20 (requested by Paige):** grouped into three themes, in this order — **Interpretability and evaluation** (thesis, Stryker XAI, the literature review), **Medical and neural AI** (Rostrum/HealthTech Connex, FAISAL Lab, capstone), **Applied LLM systems** (Clinical CoPilot) — with "Reviewing" below as now. The theme is a field on the research item, not a list typed into the page (no facts in components); newest-first ordering survives inside each group and no item is dropped |
| `/leadership` | Volunteer & Leadership | Community and leadership | Microsoft AI Expert Panel host/co-organizer, Aspire Leadership Council, Azure Core Early-in-Career pillar lead, MLADS co-area chair and proposal reviewer, SFU "From Academia to Industry" podcast co-creator, valedictorian address; photos where cleared (the GIAC Advisory Board invitation is not a Leadership item: it stays in the GMLE certification line, as on the resume; amended 2026-09-12, approved by Paige) |
| `/how-this-was-built` | How This Site Was Built | The Claude Code showcase | Transparency statement; the plan (links to DESIGN/IMPLEMENTATION_PLAN/SESSION_PROMPTS in the repo); per-session build-log entries (§6); a committed snapshot of pre-launch PR and commit counts (§5.6); screenshots; "what worked / what did not"; StimMap3D as case study #1 |
| `/contact` | Contact | Reach out | Email (mailto), LinkedIn, GitHub, location; no form |
| `/resume` | Resume | PDF download | Redirect declared in `next.config.ts` `redirects()` (no route handler, so no serverless function) to `/Paige-Rattenberry-Resume.pdf` (generated, §5.4) |

Also: `/sitemap.xml`, `/robots.txt`, per-route Open Graph images, `404` page in the same visual system.

---

## 3. Content model and sourcing rules

### 3.1 Single source of truth

All facts live in `content/` as typed TypeScript/JSON plus MDX, validated with zod at build and in
tests. Pages, cards, the timeline explorer, Open Graph images, and the resume PDF all render from the
same data. Nothing factual is hard-coded in components.

```
content/
├─ profile.ts            # name, positioning line, location, email, links, headshot ref
├─ experience.ts         # roles: org, title (resume wording), dates, location, bullets, skills[], sources[]
├─ education.ts          # SFU degree, GPA, honours, valedictorian, competition win
├─ certifications.ts     # GMLE (99%), Coursera specializations, Google GenAI intensive
├─ skills.ts             # controlled vocabulary: id, label, category (used by tags + explorer)
├─ projects/             # one MDX per project; frontmatter = card data; body = deep page (only for deep-page projects)
│  ├─ stimmap3d.mdx
│  ├─ spinal-curvature-capstone.mdx
│  ├─ interpretable-medical-imaging-thesis.mdx
│  ├─ mentalwell.mdx  clinical-copilot.mdx  cmpt412-vision.mdx  ml-cybersecurity.mdx  ...
├─ research.ts           # publications / research items (some point at a project slug)
├─ leadership.ts         # volunteer & leadership items
├─ assets.json           # provenance for every image/video in public/: source file in _source, consent, alt text
└─ generated/            # committed generated data: explorer-layout.json, build-stats.json (a snapshot, §5.6)
```

Project frontmatter (zod-validated): `slug, title, tagline, year, kind ('project'|'research'|'coursework'),
featured (bool), deepPage (bool), cover, skills[], links { live?, repo?, pdf? }, resume { include, bullets[] }`.

> **Amended 2026-09-12 (approved by Paige).** Session 2 added `content/projects.ts` as interim card
> data for the three deep pages, validated by `ProjectSchema` in `lib/content/schema.ts`, which also
> carries `proof`, `dates`, `periods`, `bullets`, `metrics`, `disclaimer` and `source`, and stores
> `links` as an array of `{ label, url }`. Session 3a folds that file into this frontmatter, extending
> the same schema, and deletes it (IMPLEMENTATION_PLAN §4 Session 3a amendment).

### 3.2 Seed content (extracted 2026-09-07 from the resume and public LinkedIn)

Sessions should start from this and from the PDF Paige copies to `_source/resume/`. Use resume wording
for titles and bullets; LinkedIn adds the items marked (LI).

> **Amended 2026-09-11 (approved by Paige).** The resume of record is now
> the revision of 2026-09-11 (staged under `_source/resume/`), and a LinkedIn snapshot of 2026-09-11 is
> staged under `_source/linkedin/`. Where this seed and the resume of record disagree, the resume
> wins; `_source/INVENTORY.md` lists every settled fact and its source. Corrected below: the
> valedictorian timestamp (45:27), MLADS role (co-area chair), Aspire dates, podcast name and dates, the
> Clinical CoPilot award wording, and the two unsourced items (top 5% and the honourable mention now
> have LinkedIn sources).

- **Positioning line (drafted in the September 13 Codex review, approved by Paige 2026-09-13):** "I build infrastructure that makes AI agents reliable. My work spans production knowledge systems, evaluation gates, and medical-AI research." **Superseded 2026-09-20** by Paige's wording in §1 answer 1, which `content/profile.ts` carries (Session 6b).
- **Experience:** Hammerspace, Software Engineer, Advanced Research Engineering (May 2025–present,
  remote, Burnaby BC) · Microsoft, Software Engineer, M365 Core Substrate SHIELD Security (Sept 2024–Feb
  2025) · Microsoft, Software Engineer, Azure Cloud Storage Performance Infrastructure & Analytics (Nov
  2022–Sept 2024) · Stryker R&D, ML Engineering Co-op, Computer Vision (Sept 2021–May 2022) · Microsoft,
  SWE Intern & Explore Intern, Azure Cloud Storage (May–Jul 2021; May–Aug 2019) · Samsung R&D Canada,
  Product Management Co-op (Jan–Apr 2019; on the resume and the site).
- **Projects:** StimMap3D (Jun–Aug 2026) · Spinal curvature capstone (Best Overall Project, ICAMES 2022,
  Boğaziçi University, Istanbul; the ML prediction model was the envisioned next phase, not built) ·
  Honours thesis (Apr–Aug 2022) · CMPT 412 vision (2nd/84 Kaggle) · Clinical CoPilot RAG (16th/1,253,
  Microsoft Global AI Hackathon, Executive Challenge honourable mention (LI), Sep 2023) · MentalWell,
  GenAI mental-health copilot with Gemini, RAG, sentiment detection (LI) · ML for cybersecurity:
  malware/anomaly/fraud detection (LI) · EEGTMS app, MSE 491 (**no repo link**: `INVENTORY.md` clears
  StimMap3D as the only publicly linkable repo) · Google 5-Day GenAI
  Intensive (a certification in `content/certifications.ts`, not a project card; MentalWell is its
  capstone; amended 2026-09-12) · literature review on GenAI failure modes and interpretability ·
  This site (card only, Session 9; amended 2026-10-06 at Paige's request).
- **Research:** Rostrum Medical, HealthTech Connex researcher (Aug 2020–Apr 2021): capnography
  classification, EEG-based disease detection, interpretable multimodal ML · SFU FAISAL Lab medical
  imaging research assistant (May–Aug 2018, LI): CT scan segmentation correction.
- **Leadership (LI + resume):** Microsoft AI Expert Panel Q&A host and co-organizer (Jul 2024); MLADS
  proposal reviewer and co-area chair (Jun 2024); Aspire Leadership Council member and Azure Core
  Early-in-Career pillar lead (Jul 2023–Feb 2025); SFU "From Academia to Industry" podcast co-creator
  and speaker (Nov–Dec 2022); SFU Valedictorian (Oct 2022, address at 45:27 in the linked video). The
  GIAC Advisory Board invitation (Mar 2025) is not a Leadership item; it is mentioned in the GMLE
  certification line, as on the resume (amended 2026-09-12, approved by Paige).
- **Education:** SFU BASc Computer Engineering, Honours with Distinction, 2017–2022, GPA 3.89 (top 5% of
  the Faculty of Applied Sciences, LI), President's and Dean's Honour Rolls, Dr. Abe Unrau Memorial
  Co-op Award (LI), scholarships.
- **Certifications:** GIAC Machine Learning Engineer (GMLE), Dec 2024–Feb 2025, scored 99%; Coursera
  Deep Learning, AI for Medicine, Multi-Modal AI, NLP specializations.
- **Skills vocabulary (categories):** Agentic AI & LLM systems (MCP, agent loops, tool calling, RAG,
  BM25F, eval harnesses, grounding/citation verification, LoRA fine-tuning) · Full-stack & infra
  (Python, FastAPI, TypeScript, Next.js/React, C#, SQL, Docker, CI/CD, Azure, access control) · ML &
  CV (PyTorch, TensorFlow, OpenCV, CNNs, segmentation, XAI, anomaly detection, time series) · Tooling
  (Claude Code, Codex, Git, GitHub Actions).

### 3.3 Claims gate (every session)

- Quantitative results, rankings and substantive counts (including spelled-out counts) must exist in `content/`
  with a `source` field (`resume-2026`, `linkedin`, `_source/<file>`, `stimmap3d-repo`; `linkedin` means
  the LinkedIn snapshot of 2026-09-11 or, for sections that export omits, the verbatim LinkedIn
  quotes recorded in `_source/INVENTORY.md`). A Vitest test
  fails the build if a metric lacks a source. Inside MDX prose, numbers are rendered through
  `<MetricStat>` rather than typed as text, and each session's PR body lists every claim drawn from
  a staged source by its reader-facing label and page (amended 2026-09-30: never by file name), so the
  test's blind spot, free text, is covered at review.
  Dates, version/model/standard identifiers and figure numbers are ordinary context and do not need
  individual metric objects. Tests check declared metrics and text presence; they do not prove all
  claims were declared, sources support them, or pages render them. Editorial review covers those
  gaps. Deep-page sessions must migrate existing prose counts (such as the capstone team size and
  thesis method count) to explicit claim references and add targeted rendering checks. Keep private
  evidence paths out of public tooltips; add cleared public source links where available.
  **No invented metrics, adjectives, or outcomes.**
- Role titles and date ranges are copied verbatim from the resume.
- StimMap3D's non-clinical disclaimer is preserved wherever StimMap3D is shown or embedded. **Clarified
  2026-09-21 (requested by Paige):** "shown" means the project itself is presented — its card, deep
  page, embed, timeline entry, Open Graph card or resume entry. A passing mention in narrative prose
  (About) does not carry the callout.
- The build-story page states plainly which parts of the site were generated by Claude Code and which
  decisions were Paige's.

### 3.4 Privacy gate (every session)

- `_source/` is git-ignored and never committed. Assets are copied into `public/` only after being
  listed in `content/assets.json` with the image/document metadata and publication evidence below.
- No phone number, no home address, no third-party names without consent (capstone teammates,
  panelists, podcast co-host), no confidential employer details beyond what the resume already states.
  The hand-made resume PDF in `_source/resume/` contains **no** phone number (verified by Paige and by
  a full text extract on 2026-09-08; amendment approved 2026-09-10), so it may be shipped directly —
  see §5.4. Phone checks use a generic North-American pattern,
  `\(?\d{3}\)?[ .-]*\d{3}[ .-]*\d{4}`, never the real number, because these docs go public at launch.
  The check reads **text files only**. The pattern is clean against real content — verified 2026-09-12
  against every date and metric the resume carries (`Sept 2021 - May 2022`, `16th/1,253`, `IEC 62304`,
  `45:27`, `GPA 3.89`, `220+`): zero false positives. It also does catch the space-separated SFU-ID
  shape (`NNN NNN NNN`) that INVENTORY warns a naive digit-run regex misses. But it matches SVG path
  data (coordinate pairs of the form `NNN NNN.NNNN`), and over a binary it is a coin flip on the bytes,
  so the unit test must skip anything that does not decode as text (`rg` already skips binaries by
  default). No literal matching example is written into these documents, since they go public.
- Public text checks include `docs/build-log/`. Once PDFs ship, also extract their text for privacy
  and placeholder checks and visually inspect sensitive pages/metadata. The regex is not a complete
  privacy review.
- Before launch: a secret scan of the tree and a review of every `_source`-derived asset against
  `assets.json`. The public repository starts from one seed commit of the reviewed tree (§0, Repo),
  and `tests/unit/publication.test.ts` (S0-G) keeps local paths, staged file names and a private term
  list out of every tracked text file.

---

### 3.5 Asset provenance contract (amended 2026-09-13)

Implemented in AssetSchema and the manifest tests. Every record has kind, path, provenance, rights,
permission, transformations (nonempty; explicitly note no changes if applicable), people and consent.
Staged provenance: kind=staged, source=_source/<file>, revision (source hash or dated revision).
Amended 2026-09-20 (approved by Paige): a screenshot captured from a live deployment is staged
provenance — the capture is written to _source/ first (an approved exception to _source/ being read-only,
AGENTS.md) and its revision names the deployed commit, the origin and the capture date. Repository
provenance is for files that exist in a repository at a commit; a capture is not one of them.
Repository provenance: kind=repository, source id ending in -repo (e.g. stimmap3d-repo or paigewebsite-repo), repository URL, sourceFile and a full
immutable git commit SHA. Provenance and permission are separate: a repository origin grants no rights.

Images live under images/ and require alt, width and height. PDF documents live under docs/ or at
Paige-Rattenberry-Resume.pdf, and require title, mediaType=application/pdf, pageCount and removedPages
(original page numbers; empty when none). No image dimensions on documents. Paths cannot traverse
outside their directories; duplicate paths fail. Tests reconcile public/images/, public/docs/ and
root PDFs with the manifest, even when a new PDF has not yet been listed.

Schema fixtures exercise repository images, thesis derivatives and resume records; they are not real
publication approvals. Session 3b validated the actual approved StimMap3D screenshots and their
provenance (2026-09-20): the public repo ships one screenshot (docs/screenshots/visualizer.png,
copied byte-identical and recorded with repository provenance at a full commit SHA) and the other
five are live captures staged into _source/stimmap3d/ first and recorded with staged provenance —
digest, deployed commit, origin and capture date. Session 4 must validate the actual thesis PDF,
remove original page 2 (signed approval), inspect the derivative and record removedPages=[2] plus the
transformation. Session 6 must validate the shipped resume. These media deliveries remain in their sessions.

For figures, replot only actual recorded values and cite the original figure/page. Never fabricate
measurements or saliency maps. Label conceptual drawings as illustrations; use prose if exact outputs
cannot be reproduced.

---

## 4. Visual direction: editorial-scientific hybrid

**One-line brief:** a calm, typographically confident, magazine-like shell with restrained scientific
accents (a contour-field motif, monospace data labels, one accent color) so the interactive pieces feel
like figures in a well-edited paper rather than gadgets.

### 4.1 Typography
- **Display / headings:** Source Serif 4, tight tracking, generous leading. (Session 7, 2026-09-21:
  all three families load through `next/font/local` from axis-limited files in `app/fonts/` rather
  than `next/font/google`, for the §5.7 performance gate; the faces and their optical sizing are
  unchanged.)
- **Body / UI:** Inter. 16–18px body, max line length ~68ch.
- **Data / labels / code:** JetBrains Mono for dates, metrics, tags, figure captions.
- Scale: `text-5xl/6xl` hero name, `text-3xl` page titles, `text-xl` section heads. No all-caps except
  small mono labels.

### 4.2 Color and theme
- Tailwind 4 CSS-first tokens in `app/globals.css` under `@theme`. Light palette on `:root`; dark
  tokens under `[data-theme="dark"]` **only**. `next-themes` (`attribute="data-theme"`,
  `enableSystem`) owns the attribute and applies the OS preference itself, so no raw
  `prefers-color-scheme` media query for tokens: one would override a visitor's explicit light choice
  on a dark OS. Tailwind's `dark:` variant is remapped to `[data-theme="dark"]` via `@custom-variant`.
- Light: paper off-white background, near-black ink, warm-gray secondary text, hairline borders.
- Dark: deep slate background, off-white ink.
- **One accent:** deep teal (light) / bright teal (dark), used for links, focus rings, the active
  filter chip, and the contour motif. Never more than one accent on a screen. Data-viz in the explorer
  uses a neutral ramp plus the accent, validated for contrast in both themes.

### 4.3 Motif and motion
- **Hero motif:** an SVG contour-line field (iso-lines of a smooth 2D scalar field, a quiet nod to
  StimMap3D's E-field iso-contours) rendered once at build time as deterministic, static SVG paths. No perpetual decorative animation
  and no contour client island. The mobile band is its own composed 640×140 field (about 5rem high at 390 px), never a crop of a taller one. Budget: < 15 KB, no canvas, no WebGL in the shell.
- Motion elsewhere: 150–250 ms opacity/translate on hover and reveal only. No scroll-jacking, no
  parallax.
- Figures (screenshots, diagrams) get mono captions with a figure number, editorial style.

### 4.4 Layout and components
- 12-column grid, content width 72rem, prose width 42rem. Sticky top nav collapses to a menu on
  narrow widths and under text enlargement. Every navigation link appears inline once the header
  container reaches 60em (all eight need about 57em), and the menu button is hidden there; below
  that, the disclosure lists every navigation page. Header height
  grows with its contents. Footer with links and last-updated date.
- Reusable components: `PageHeader`, `Prose` (MDX wrapper), `Card` (project/research), `Tag`,
  `MetricStat` (number + source tooltip), `Figure`, `Callout` (used for StimMap3D's disclaimer),
  `EmbedFrame` (click-to-load iframe), `Timeline`, `SkillsConstellation`, `ThemeToggle`.
- Session 1 should invoke the `frontend-design` skill when establishing the design system, and must
  avoid template defaults (no purple gradients, no generic hero blobs, no emoji bullets).

---

## 5. Architecture

### 5.1 Framework and rendering
- Next.js 16 App Router, **fully static output** (`generateStaticParams` for MDX routes; no server
  runtime required at request time). "Static" means every route is prerendered by the default
  `next build`; do **not** set `output: 'export'`, which would break the `next/og` image routes and
  config redirects. Vercel builds on every push; previews per PR (and only previews until launch
  step L7, per §0's hosting row).
- Node 24 (`.nvmrc`, `engines`). TypeScript strict. ESLint (`eslint-config-next`) + Prettier.
- Interactive pieces are small **client islands** (`'use client'`): theme toggle, explorer, embed frame,
  navigation and metric tooltips. The contour is a server component.

### 5.2 Content pipeline
- Filesystem/MDX compilation imports stay server-only. Derive deep routes on the server and pass
  plain navigation/card data to client components, or generate a serializable route manifest.
- Prerender core content. If URL filters use useSearchParams, isolate the hook in a small Suspense
  boundary; test direct filtered URLs, clear, back/forward and invalid filters on a production build.
- In Session 6 distinguish HTML routes from redirects/documents in axe and screenshot loops; give
  Resume dedicated redirect/download/PDF checks. Sitemap includes canonical HTML pages only.
- MDX via `next-mdx-remote` (RSC) + `gray-matter`; frontmatter validated by zod schemas in
  `lib/content/schema.ts`. Remark/rehype: `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`.
- `lib/content/*.ts` loaders return typed data; tests assert every project has a cover image with
  provenance, every metric has a source, every skill tag is in the vocabulary.

### 5.3 Images and media
- `next/image` with static imports; sources under `public/images/<slug>/`, optimized (WebP/AVIF by
  Next). Videos as MP4 with poster and `preload="none"`. StimMap3D screenshots: its public repo's
  `docs/screenshots/` holds exactly one (MIT, same author); the rest are captured from the live app
  and staged (§3.5, amended 2026-09-20).

### 5.4 Resume PDF pipeline
- `scripts/build-resume.tsx` renders `content/` with `@react-pdf/renderer` to
  `public/Paige-Rattenberry-Resume.pdf` during `prebuild`. Layout mirrors the current resume (two
  pages, blue section bars replaced by the site's accent, same section order). Fonts are registered
  from the `@fontsource/*` files (Source Serif 4, Inter, JetBrains Mono), since `next/font` output is
  not reusable outside Next; v5 ships woff rather than TTF, so Session 6 uses the woff files. A
  test opens the PDF with `pdf-lib` and asserts page count ≤ 2, that key strings (name, email,
  Hammerspace) are present via `pdf-parse`, and that no phone pattern (§3.4) appears.
- Fallback rule: if the generated layout is not yet acceptable at the end of Session 6, ship the
  hand-made resume from `_source/resume/` at the same path, and keep the generator behind a flag; log
  this in the build log. It carries no phone number, so it passes the resume test as-is; no separate
  `-web.pdf` export exists or is needed (amendment approved 2026-09-10, superseding S0-B).
- Whichever PDF ships must contain **no unfilled placeholder**. The resume of record (as of 2026-09-11, the Word
  revision of that date) carries
  `[ADD PORTFOLIO URL]` and `[ADD LIVE URL]` until Paige fills them; the resume test asserts that no
  `[ADD ` string appears in the shipped file.
- **Amended 2026-09-15 (Paige's decision).** The approved hand-made PDF for the fallback rule is
  the resume of record, revised 2026-09-11. A `pdftotext` extract that day
  confirmed **both placeholders are still in it** (page-1 contact line and the StimMap3D entry), so the
  fallback cannot be taken without a corrected export from Paige — the generated PDF renders from
  `content/` and is unaffected. Session 6 asks rather than editing the PDF or relaxing the assertion.
- Session 6 (2026-09-16) shipped the generated PDF. The fallback was not needed, so no corrected
  export was requested.

Before adding generators in Sessions 5–6, define one deterministic generation command and run it
before artifact-dependent tests in CI and on a clean checkout. Use npm run build for deployment when
relying on prebuild; direct next build does not run npm lifecycle hooks.

### 5.5 SEO and sharing
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`; per-page `title`/`description`; `app/sitemap.ts`,
  `app/robots.ts`; Open Graph + Twitter cards via `opengraph-image.tsx` (root and per project/research
  page) using `next/og` `ImageResponse` in the site's typography; JSON-LD `Person` on the home page.

### 5.6 Build stats (a committed snapshot)
- **Amended 2026-09-30 (S0-G, decision D6).** The public repository begins at launch with one seed
  commit, so live counts from it would say nothing for months. Build stats are therefore a
  **committed snapshot of the pre-launch history**: `scripts/fetch-build-stats.ts`, run by hand
  during Session 8 against `PaigeRattenberry/paigewebsite` with `gh auth token`, writes
  `content/generated/build-stats.json` with **counts and dates only** (merged PRs, commits, first
  and last merge dates; no PR titles, branch names or commit messages). It is **not** chained onto
  `prebuild`, so no build calls the GitHub API, and no token is set in Vercel. The page says: "The
  public history begins at launch; the counts below are a snapshot of the pre-launch history, and
  the build logs are the record of the build."

### 5.7 Quality gates in CI (GitHub Actions, Node 24)
1. `lint` + `typecheck` + `test` (Vitest) + `build`. Added in Session 1.
2. `a11y`: Playwright + `@axe-core/playwright` against every route in both themes on the production
   build; zero serious/critical violations. Added in Session 1 too (Playwright is installed then
   anyway), so every content session is checked as it lands instead of in one late sweep.
3. `lighthouse`: `@lhci/cli` on `/`, `/projects/stimmap3d`, `/experience`; assertions: performance ≥ 90,
   accessibility = 100, best-practices ≥ 95, SEO = 100 (mobile preset). Added in Session 7.
All three are required checks for merge: Paige enables branch protection on the public repository at launch (IMPLEMENTATION_PLAN §6, L7), since GitHub's free plan offers it only on a public repository.

---

## 6. The "built with Claude Code" story

The showcase is only credible if it is **kept as the work happens**, so it is a convention every
session follows, not a page written at the end.

- **Build log:** each session appends `docs/build-log/sN-<name>.md` using the template in
  IMPLEMENTATION_PLAN §0: goal, what shipped, decisions and why, skills/tools invoked (plan mode,
  code review, Playwright, available design tools), **what the AI got wrong and how it was caught**,
  Paige's review notes (she fills these in at merge; a log's page leaves the heading out while it
  is empty, Session 9b), screenshots. Record the tool, model only when
  known, task, constraints, confirmed human decisions, generated work, rejected suggestions,
  verification command/result and PR/commit. Preserve historical Claude-only attribution. The
  September 13 Codex review examined the site; its separate follow-up implements changes. Logs
  follow the publication rules in AGENTS.md (S0-G): what was built, how, with which tools and what
  went wrong; a log that lost text carries one "(redacted for publication, <date>)" note under its
  header lines (amended 2026-10-02 at Paige's request).
- **Screenshots:** `docs/screenshots/sN-*.png`, captured in-session with Playwright.
- **Page:** `/how-this-was-built` renders: transparency statement; links to the three planning docs
  in the public repository (one URL constant in `content/`, D3); PR numbers as plain text, since the
  pre-launch repository is private; the build-log entries as a timeline; build stats (§5.6, a pre-launch snapshot); a "what worked / what did not"
  synthesis written in Session 8; StimMap3D as case study #1 with a link to its repository's
  `docs/agentic-development.md` (it has no session pack).
- **Tone:** factual and specific. No "AI wrote my whole site" hype and no false modesty; say what
  was generated, what was reviewed, and what was rejected.

---

## 7. Interactive demos

### 7.1 StimMap3D embed (`/projects/stimmap3d`)
- `EmbedFrame`: a 16:9 poster (hero screenshot) with a "Load interactive demo" button. On click,
  mounts `<iframe src={STIMMAP3D_URL + deepLink} title="StimMap3D interactive demo">` where
  `deepLink` is a shareable `?query` view from StimMap3D's deep-link feature (choose the DLPFC
  hero view). Click-to-load keeps WebGL off the initial page and protects the Lighthouse budget.
- Always visible around the frame: StimMap3D's own wording, "Illustrative model — not for clinical
  use", and an "Open full app" link. A fallback link is shown if the iframe fails to load.
- Prerequisite: StimMap3D live URL recorded in `content/projects/stimmap3d.mdx` (`links.live`). If
  StimMap3D ever ships a `_headers` `Content-Security-Policy: frame-ancestors`, it must allow the
  portfolio origin. Verified at S0-D (2026-09-20): the live responses carry no `X-Frame-Options` and
  no CSP `frame-ancestors`, and the deep link rendered inside a cross-origin iframe. The DLPFC hero
  deep-link is `/?preset=F3&proto=10hz-hf-l&elec=1#/` — StimMap3D keeps state in the query and its
  route in the hash, and rewrites its own URL on load, dropping parameters equal to defaults.
  In a 900×600 frame its onboarding card sits above the 3D canvas.
- **As built (Session 3b, 2026-09-20).** The frame is a full-width row above the two-column grid,
  under the disclaimer callout: at the prose column's width the app falls into its narrow layout and
  the 3D canvas starts about 515 px down. The poster is the project's `cover`, so the frame is the
  page's Fig. 1 and the cover is not drawn a second time, and the body's figures start at 2. The
  poster stays 16:9 and is eager with `fetchPriority="high"` (it is the page's LCP); the frame grows
  to 16:10 (4:3 from `sm`, 3:4 on phones) only after the click, because the app opens on its banner
  and getting-started card above the canvas. "Open full app" opens the live root — the URL a reader
  would share — while the frame opens the deep link, and the disclaimer is repeated in the caption so
  it stays beside the frame once the app has replaced the poster. The page passes the poster as a
  narrowed `{ path, alt, width, height }` literal: the frame is a client island, so a whole
  `assets.json` record handed to it would serialize its `_source/` staging path into the page
  payload (§3.4).

### 7.2 Career timeline + skills explorer (`/experience`, teaser on `/`)
- **Data:** derived at build from `experience.ts`, `projects/*.mdx`, `research.ts` and the skills
  vocabulary: entries (with date ranges) and skill-to-entry edges; co-occurrence weights. **One entry
  per piece of work**, even where two content files describe it: a project and its `researchId`
  research item, a research item and its `projectSlug` deep page, and the Stryker experience role and
  the Stryker research item (one entry, from the role — Paige's decision, 2026-09-15). Otherwise those
  entries appear twice and their skill co-occurrences count double.
- **Timeline:** vertical, 2017 to present, entries grouped by year, each with org, title, one line, and
  skill tags. Filter chips (by skill category and skill) highlight matching entries and dim the rest;
  URL query keeps the filter shareable (`/experience?skill=rag`).
- **Constellation:** an SVG graph of skills (node size = number of entries, edges = co-occurrence).
  Layout is precomputed with `d3-force` in a build script (deterministic via
  `simulation.randomSource()` with an explicit seeded PRNG (d3-force already defaults to a fixed-seed
  generator); use stable input order, a fixed tick count and controlled versions; no client
  layout jank). The client only handles hover/click. Clicking a node applies the same filter as a chip.
- **Accessibility:** chips are real buttons with `aria-pressed`; the graph has an equivalent list
  under a "View as list" toggle; keyboard navigation through nodes; `aria-live` announces the filter
  result count. `prefers-reduced-motion` disables transitions.
- **Home teaser:** the constellation, filter-less and static, sits beside the hero text on large
  screens as the page's "figure 1" (mobile: hidden, contour motif only).

---

## 8. Quality bar (definition of done, whole site)

- `npm run build` clean; zero console errors; all three CI jobs green.
- Lighthouse mobile: performance ≥ 90, accessibility 100, SEO 100, best-practices ≥ 95 on the audited
  routes. **Site-owned client JS for `/` ≤ 15 KB gzipped** (restated 2026-09-21, Paige's decision
  on Session 7's recommendation; enforced by `npm run budget` in CI job 1). The original target,
  initial JS for `/` ≤ 120 KB, cannot be met on the App Router: the chunks every page loads before
  any site code (`rootMainFiles`: React DOM, the router client, the bundler runtime) are 127.3 KB
  on Next 16.3.4, and the site adds 9.8 KB. The budget now covers the part the site controls; total
  weight stays policed by the Lighthouse performance gate.
- Fully keyboard operable; visible focus; color contrast AA in both themes; images have alt text.
- Works at 360px, 768px, 1280px, 1920px widths. Dark and light both designed, not derived.
- Claims gate (§3.3) and privacy gate (§3.4) pass. Build log entry exists for every merged session.
- Link previews render correctly when pasted into LinkedIn and Slack (checked via a preview tool).

---

## 9. Out of scope now; stretch after launch

1. Custom domain (`paigerattenberry.com` or `.dev`) via Cloudflare Registrar or Vercel; update
   `NEXT_PUBLIC_SITE_URL`, re-verify OG images.
2. Privacy-friendly analytics (Vercel Analytics is a two-line add).
3. An original in-browser XAI mini-demo (saliency map viewer on a sample image) as a fourth demo.
4. Contact form (Resend or Formspree) if email volume warrants it.
5. Short build-story video (60–90 s), recorded with the same Playwright harness
   StimMap3D used.
6. Blog / notes section if Paige starts writing regularly.

## 10. Remaining review proposals (not implemented by this small follow-up)

The September 13 review recommends an earlier build-story synthesis and decision replay, then a
compact skills-to-work filter with an optional constellation view. Those feature scope changes,
About-page personal editing and case-study writing remain proposals for later sessions. This follow-up
amends the homepage, motion, shared instructions and asset contract, and records the
engineering constraints above; it does not claim those larger features are approved or complete.
