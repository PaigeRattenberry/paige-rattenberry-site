# Session 0 — spec amendments

- Date: 2026-09-10 / 2026-09-11 / 2026-09-12 · Branch: s0-spec-amendments · PR: #2

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

Correct the three planning documents before Session 2 builds `content/` from them. Three rounds of
amendments, all approved by Paige: the resume-PDF and Vercel facts (2026-09-10); the source review that
checked every seed fact in DESIGN §3.2 against the staged sources and LinkedIn (2026-09-11); and a review of the
specs’ own instructions, which found three Session 4 tasks that could not be carried out against the
sources that actually exist (2026-09-12).

## What shipped

Round 1 (commit 477d150, approved 2026-09-10):

- DESIGN §3.4 / §5.4: the claim that the resume contains a phone number was false; the
  `Paige-Rattenberry-Resume-web.pdf` export it depended on never existed. Session 6 now ships the
  hand-made PDF directly, and the resume test gains a "no unfilled `[ADD ` placeholder" rule.
- IMPLEMENTATION_PLAN S0-B and Session 6, and SESSION_PROMPTS, updated to match.
- IMPLEMENTATION_PLAN S0-E and §6 rewritten to describe the Vercel setup as built: production branch
  `launch`, "Only build pre-production", Vercel Authentication on, so no production deployment exists
  until Session 8 — plus `docs/build-log/s0e-vercel.md` and a README note.

Round 2 (this commit, approved 2026-09-11):

- DESIGN §2: the capstone deep page now describes the system as built and marks the ML
  curve-progression model as the envisioned next phase; the thesis deep page says ground truth was
  induced by watermarking chest X-rays, not taken from expert annotations.
- DESIGN §3.2: seed facts corrected — valedictorian timestamp 45:27, MLADS co-area chair, Aspire
  Jul 2023 – Feb 2025, the podcast named with its real dates, ICAMES venue, Clinical CoPilot's
  Executive Challenge honourable mention, Samsung explicitly in scope, the 2018 FAISAL research, and
  the top 5% and the honourable mention sourced to LinkedIn.
- DESIGN §3.3: `source: linkedin` now points at the LinkedIn profile, snapshot of 2026-09-11 (or the
  source inventory's verbatim quotes for the sections LinkedIn's PDF export omits). DESIGN §1 says 220+ PRs.
- DESIGN §5.4: names the current resume of record rather than a dated filename that keeps moving.
- IMPLEMENTATION_PLAN §2: the Read tool's `pages` parameter needs `pdftoppm`, which is not installed;
  whole-file reads work (verified on the 49-page thesis).
- IMPLEMENTATION_PLAN Sessions 2 and 4, SESSION_PROMPTS Sessions 2 and 4: read the LinkedIn snapshot,
  INVENTORY's settled facts win any conflict, and the corrected capstone/thesis framing.

Follow-up, same day, after Paige answered the last open questions:

- Stryker runs Sept 2021 – May 2022 (DESIGN §3.2 and the resume of record; the Apr 2022 end date came
  from the older resume). The Azure bullet's "cut storage access latency" wording is approved.
- Session 7 also bumps `actions/checkout` and `actions/setup-node` to v5. v4 targets Node 20, which
  GitHub deprecated, so every CI run logs a deprecation annotation; Session 7 is already editing
  `ci.yml` to add the Lighthouse job, so it is the cheapest place to fix it.

Round 3 (approved 2026-09-12) — a pre-Session-2 review of the specs themselves, rather than of the
facts in them. Round 2 made every fact true; round 3 makes every *instruction* achievable:

- **Session 4 could not have passed its own acceptance.** IMPLEMENTATION_PLAN and SESSION_PROMPTS still
  told it to prefer figure exports in the private source folder, to fall back to "render that page in Chromium via
  Playwright and crop", and to place 3–5 figures per deep page. `INVENTORY.md` says otherwise: no
  figure exports are coming, and a missing figure should be drawn or described rather than cropped
  out of a PDF. For the capstone it is also barred twice over — the decks are not cleared for
  posting and the SFU article's photographs are SFU's copyright, link-only. Session 4 now recreates the thesis's own figures 3.1–4.7 (Paige's experiment
  output), draws original diagrams for the capstone pipeline, and carries the rest in prose. S0-A's
  figure-export request is marked closed so no later session goes looking for it.
- **Shipping the thesis PDF whole would have published a page the inventory excludes.** Session 4
  said "link to thesis PDF if cleared (`public/docs/`)"; `INVENTORY.md` clears the thesis except p2,
  a scanned page with no extractable text. The shipped copy must now have p2 removed with `pdf-lib` (already a Session 6
  dependency — this machine has no `qpdf` or `pdftk`), recorded as such in `assets.json`.
- **The valedictorian video URL was nowhere in `INVENTORY.md`**, but Session 4 gates the click-to-load
  embed on finding it there, so the embed would have been silently skipped. Recovered from a link
  annotation inside the speech PDF and written into `INVENTORY.md`:
  `https://www.youtube.com/watch?v=RKIO5EvDJ5Y&t=2727s`. `t=2727s` is exactly 45:27, which independently
  confirms round 2's timestamp correction.
- **`pdftotext` is installed** at `/mingw64/bin/pdftotext` (it ships with Git Bash). §2 recorded only
  that `pdftoppm` is missing, which left whole-file reads as the apparent only option. `pdftotext
  -layout -f N -l N` gives page-accurate text, which is what Sessions 4 and 5 need to confirm a
  claim's page in its source document. Image-only pages and the capstone proposal's subset font still need the Read
  tool.
- **The phone gate is now specified as text-only.** The DESIGN §3.4 pattern was tested against every
  date and metric the resume carries (`Sept 2021 - May 2022`, `16th/1,253`, `IEC 62304`, `45:27`,
  `GPA 3.89`, `220+`): zero false positives, and it does catch a space-separated nine-digit ID
  shape (`NNN NNN NNN`) that a naive regex would miss. But it matches SVG path data, and
  over a binary it depends on the bytes — and Session 2's acceptance scans `public/`, which will hold
  a JPEG. The examples here are written with `N` placeholders so these public documents do not
  themselves trip the gate.
- **The headshot now has a verified command.** `INVENTORY.md` required baking the rotation in before
  stripping EXIF/XMP but named no tool, and neither ImageMagick nor exiftool is installed. `sharp` is
  already in `node_modules`; `.rotate()` applies EXIF `Orientation = 6` to the pixels and sharp writes
  no metadata, verified to give 433×577 with exif/xmp/icc all absent. ffmpeg is the trap: it applies
  EXIF orientation while decoding, so the intuitive `-vf transpose=1` rotates a second time and lands
  back on its side.
- **`content/research.ts` had a guess waiting for it.** The resume gives the combined range
  "Aug 2020 – Apr 2021" for Rostrum Medical and HealthTech Connex, while LinkedIn dates them separately
  (HealthTech Connex Aug 2020 – Apr 2021, Rostrum Medical Apr 2021). Settled in `INVENTORY.md` as one
  item with the resume's combined range.
- **DESIGN §3.2's EEGTMS app line** read as though there were a link to give; StimMap3D is the only
  project repository the site links. Reworded to say so.

## Decisions and why

- **The source inventory (`INVENTORY.md`) is the tie-breaker**, ahead of DESIGN §3.2 and the resume. The seed content
  in DESIGN was extracted once on 2026-09-07 and has already drifted twice; INVENTORY is the file Paige
  and each session actually maintain.
- **The capstone's ML model is described as proposed, never built.** Paige confirmed the team envisioned
  training it on the pressure data they collected; both decks list it under future work and the SFU
  article does not mention ML at all.
- **The thesis method is stated as the thesis states it:** ground truth induced by watermarking (not
  expert annotations), so the explanation methods could be scored at all.
- The resume was revised in the same pass (Resume, revised 2026-09-11), so `content/` and the shipped
  PDF will agree from the start. The private source folder stays untracked; nothing from it is
  committed.

- **A spec that cannot be satisfied is worse than a spec that is merely wrong**, because the session
  discovers it halfway through and improvises. Round 2 checked the facts in the documents; round 3
  checked whether the instructions could still be carried out against the sources that actually exist.
  Both Session 4 defects came from the same place: the specs were written when Paige was still expected
  to supply figure exports, and were never revisited after `INVENTORY.md` closed the inventory.
- **Verify tooling by running it, not by reading the last note about it.** §2 said `pdftoppm` is
  missing, which was true and had quietly been generalised into "PDF page extraction is unavailable".
  `pdftotext` was there the whole time, and the headshot instruction named a step with no installed
  tool to perform it. Both were settled in this session by running the commands and recording what
  actually came back.

## Skills / tools used

Read (PDFs: resume, thesis, capstone decks, SFU article, LinkedIn export), WebFetch (public LinkedIn
profile — the logged-out view hides Experience, which is why Paige exported the Save-to-PDF snapshot),
`pdfjs-dist` in the scratchpad for text extraction, Word COM for the resume PDF export, git/gh.

Round 3 added: `pdftotext` (per-page text, and the discovery that it is installed at all),
`sharp` and `ffmpeg`/`ffprobe` for the headshot rotation and metadata test, `grep` over the raw PDF for
the valedictorian link annotation, the DESIGN §3.4 regex run against both real resume strings and a
binary JPEG, `npm run lint`/`typecheck`/`test` to confirm the tree Session 2 starts from, and
`gh pr checks`/`git log main..HEAD` to catch the stale PR body.

## What Claude got wrong and how it was caught

- The 2026-09-09 resume revision introduced two claims the sources do not support — "expert-annotated
  ground truth" on the thesis and an ML prediction system on the capstone — by paraphrasing the older
  resume instead of checking the thesis abstract and the capstone decks. Caught in this session's review
  by reading both sources end to end; the two claims had been in the repo's specs for four days.
- The same revision put Aspire at Nov 2022; LinkedIn says Jul 2023, and Paige confirmed Jul 2023.
- Round 2's first draft of the resume ran to three pages. Caught by exporting the PDF and counting, not
  by assuming; the fix was tightening wording, not dropping facts.

- Rounds 1 and 2 reviewed the specs' *facts* and declared them ready for Session 2, without checking
  whether the specs' *instructions* still matched the sources. Two Session 4 tasks were unsatisfiable
  as written (figures that do not exist, a fallback the inventory forbids) and a third would have
  published a page the inventory excludes. Caught in round 3 by reading Session 4 against `INVENTORY.md`
  line by line instead of trusting round 2's sign-off.
- The PR #2 body still listed the Stryker dates and the Azure wording as "Still open" after commit
  `b1bcb2f` had closed both, and never mentioned that commit's third change. Caught by diffing the
  body against `git log main..HEAD` rather than against memory of what the PR was for.

## Paige's review notes

## Screenshots

None — documentation-only change.
