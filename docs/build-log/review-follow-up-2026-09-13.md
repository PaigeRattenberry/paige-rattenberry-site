# Small review follow-up — 2026-09-13

- Date: 2026-09-13 · Branch: review-small-follow-up · PR: #4
- Implementation commit: 24e62cd.
- Input: the September 13 Codex portfolio review, of Session 2 merge 6b29340.

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

Implement the requested small follow-up: tablet navigation, homepage hierarchy, a motion decision,
shared agent instructions, accurate README/DESIGN status and the asset schema amendments.

## What shipped

- Header uses a container query measured in ems: primary links appear with sufficient space, while
  all navigation pages remain in the disclosure. The header can grow with enlarged text. Experience
  and Resume are easy to find. Header supplies plain route data to the client Nav.
- Shorter introduction, current Hammerspace work and an Experience link above Selected work,
  Explore projects / Get in touch actions and a secondary Resume text link. Six representative
  skills and short academic card titles; official titles remain in content for detail pages.
- Static contour SVG rendered on the server, with an 85px mobile band at the default 17px root.
  Removed perpetual animation, motion subscription and drift properties.
- Image/document asset union with staged or repository origins, original file/revision,
  rights/permission, transformation notes and media-specific metadata. Migrated the existing
  headshot with its source checksum. Tests reconcile images, documents and root PDFs and reject
  invalid provenance, duplicate paths, traversal and media mismatches.
- Shared rules in AGENTS.md outside the generated Next.js block; CLAUDE.md references them.
  Session prompts refer to available capabilities. Updated status, provenance, claims-gate
  limitations and future rendering/generation/privacy constraints in the planning documents.
- Public-text phone checks now include build logs. The existing regex remains a partial privacy
  check, not proof that a PDF, binary asset or repository history is safe to publish.

## Decisions and why

The compact header preserves access to every page while avoiding the tablet clipping documented in
the review. Static contours fit the visual direction without requiring visitors to pause animation.
The homepage introduces ongoing engineering work before older academic projects.

Repository provenance also supports the portfolio repository so a future generated resume can cite
its content revision. Schema fixtures demonstrate supported shapes only. The actual approved
StimMap3D screenshot belongs to Session 3, the thesis derivative with original page 2 removed to
Session 4, and the shipped resume to Session 6. No new public media was copied in this follow-up.
The decision replay, revised explorer feature scope and personal About edits remain later proposals.

## Tools and model

Codex (GPT-6), PowerShell/Node, git/GitHub CLI, installed Next.js server/client and CSS guides,
Prettier, ESLint, TypeScript, Vitest, Playwright/axe and screenshot inspection. No sub-agents.
The earlier September 13 Codex contribution was a review; this entry records its separate
implementation follow-up. Historical Claude Code logs remain unchanged.

## Constraints, human decisions and implementation direction

Paige requested the small follow-up as a new PR. Codex chose the container query, static contour and schema
structure while implementing that scope. The introduction uses the review's suggested draft;
Paige's personal voice review remains hers. No human approval of the later interactive proposals is
inferred from this request.

## Generated work and rejected suggestions

Codex edited the components, centralized content, schema/tests and shared documentation. A fixed
viewport breakpoint alone was insufficient for enlarged text, so the implementation uses container
width relative to text size and allows header height to grow. No pause control was added because the
contour is static. No measurements, experimental figures or publication approvals were invented.

## Verification

- npm run format:check: passed.
- npm run lint: passed.
- npm run typecheck: passed.
- npm test: 29 passed, including migrated real headshot and illustrative schema fixtures.
- npm run build: passed; all application pages prerendered.
- npm run e2e:a11y -- --workers=4: 83 passed in the final standalone run.
- Eight homepage screenshots at 390, 768, 820 and 1280 px, both themes. Inspected desktop light,
  mobile light and tablet dark. Current work is inside the first 800px screen at 390 and 1280 px.
- Header bounds at 360, 390, 768, 820, 1024, 1280 and 1920 px, both themes, normal and doubled root
  text; menu links stay reachable and inside the viewport, keyboard navigation closes the panel,
  and the header sweep reports no page exceptions. Root text enlargement approximates text-only
  zoom; it is not a Safari/Firefox or native browser zoom audit.
- No new Lighthouse run, actual future PDF/media validation, full-history scan or authenticated
  Vercel preview inspection. CI/preview status is recorded on the PR.

## What the AI got wrong and how it was caught

The first source checksum used hex, and its digit sequence matched the generic phone regex. The unit
privacy check caught it; the same SHA-256 digest is now encoded in base64, retaining exact provenance
without weakening the pattern. PowerShell's default pipe encoding also prevented a few Unicode
wording replacements; inspecting the diff caught them and explicit UTF-8 preserved the source text.

Codex ran two Playwright commands concurrently on separate server ports but the same test-results
folder. One command cleaned trace files that the other still needed, producing two ENOENT teardown
failures. This was a verification orchestration error. The final accessibility run was repeated by
itself; future parallel runs need separate output directories as well as separate ports.

### PR review and fixes (Claude Code, Claude Opus 5)

Paige asked Claude Code to review PR #4 and fix the findings it recommended. It read the diff,
screenshots and installed Next.js agent-file generator, reran the checks, and changed:

- **Mobile contour was a crop again.** `h-20` showed the middle of the 640×300 band through a
  `slice` viewBox: the problem Paige's Session 1 verdict rejected and Session 2 fixed (see
  s2-content-core). The band is now its own composed 640×140 field in a matching aspect-ratio box
  (about 85 px tall at 390 px), which also removes path data nobody saw.
- **Session 1–2 history rewritten.** The Session 1–2 prompts and tasks had been edited to describe
  a static contour, AGENTS.md and generic review steps, which those sessions never received. The
  build-story page links these files as the record, so their original wording is restored; the
  top-of-file amendment already supersedes them for later sessions.
- **Two build-log templates.** IMPLEMENTATION_PLAN §0 now matches the AGENTS.md headings this log uses.
- **Resume link indent at 390 px.** Its horizontal padding indented it when it wrapped to its own
  row; it now aligns with the buttons and keeps a 2.5rem target height.
- **Unchecked source digest.** When the private source folder is present, the privacy test now recomputes a
  `sha256-base64:` revision against the staged original.
- The headshot loader error now says the asset must be an image.

Verification after these fixes: format:check, lint, typecheck passed; `npm test` 29 passed (the
digest check ran against the local copy of the staged sources); `npm run build` passed with every page
prerendered; `npm run e2e:a11y -- --workers=4` 83 passed; the eight review screenshots were
regenerated, and the 390 px light capture was inspected. No Lighthouse, Safari/Firefox or
authenticated preview check.

Claude Code raised three decisions for Paige: which links sit inline on desktop (About, Research
and Leadership were menu-only), the first-person introduction taken from the review draft, and card
copy that had dropped the capstone team size and thesis method count. It recommended options for
each. Paige's decisions, implemented by Claude Code:

- **All navigation inline on desktop.** Measured at 1x text, all eight links plus the theme toggle
  need 973 px; the header content box is 1020 px at the existing 60em switch and 1156 px at
  1280 px. Every nav link now shows inline from 60em and the menu button is hidden there. The
  unused `primary` route flag is gone. The header test asserts the inline links at 1280/1920 px
  (normal text) and the menu everywhere else.
- **Introduction kept as is.** Paige approved the current line; profile and DESIGN sources say so.
- **Counts restored with sources.** Capstone: "Originated the project and formed the six-person
  team"; thesis: "Scored five explanation methods". "six-person" and "five" are metric objects sourced to
  the 2026-09-11 resume, where both counts were confirmed with pdftotext. "Best Overall Project"
  stays an item-sourced award, like the other named awards and honours in content; only numeric
  rankings (16th/1,253) are metric objects. The first capture showed "six" as the value, which put
  the source button inside the hyphenated word; the value is now the whole word.

Verification after these decisions: format:check, lint, typecheck; `npm test` 29 passed;
`npm run build` passed; `npm run e2e:a11y -- --workers=4` 83 passed; the eight review screenshots were
regenerated and the 1280 px and 390 px light captures inspected.

## Paige's review notes

## Screenshots

- [Desktop light](../screenshots/s2-review-home-1280.png) / [dark](../screenshots/s2-review-home-1280-dark.png)
- [Mobile light](../screenshots/s2-review-home-390.png) / [dark](../screenshots/s2-review-home-390-dark.png)
- [768px light](../screenshots/s2-review-home-768.png) / [dark](../screenshots/s2-review-home-768-dark.png)
- [820px light](../screenshots/s2-review-home-820.png) / [dark](../screenshots/s2-review-home-820-dark.png)
