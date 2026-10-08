# Session 0-D — Deploy StimMap3D and make it public

- Date: 2026-09-20 · Branch: s0d-stimmap3d · PR: #11

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

Close prerequisite S0-D (IMPLEMENTATION_PLAN §3), the last outstanding item before Session 3b:
StimMap3D deployed, its repository public, and the live URL plus a DLPFC hero deep-link recorded
where Session 3b reads them, plus the spec amendments that turn what S0-D found into decisions
Session 3b can act on the moment this merges. Session 3b itself is explicitly **not** started here —
no project content, component or asset was touched.

## What shipped

Not a build session; a prerequisite Paige completed, verified and recorded here so Session 3b starts
from evidence rather than from a paste.

- **Live:** https://stimmap3d.pages.dev — Cloudflare Pages, deployed from `main`, HTTP 200.
- **Public repository:** https://github.com/PaigeRattenberry/stimmap3d — `visibility: PUBLIC`, MIT,
  homepage set to the live URL, 14 commits.
- **Pinned public commit:** `0a20e810e48dca8aac1780c6478c3d1f51663989` (2026-09-20T08:56Z). Session
  3b re-verifies it before writing repository provenance.
- **Hero deep-link:** `https://stimmap3d.pages.dev/?preset=F3&proto=10hz-hf-l&elec=1#/` — the app
  keeps state in the query and the route in the hash, so a shareable link is `/?<state>#/`.
- **The private source inventory** (untracked, as always) recorded these values, Paige's
  honest-framing brief and the four things Session 3b had to resolve (findings 1–4
  below; finding 5 came out of the review of this PR and is recorded here, not in `INVENTORY.md`).
- **Spec amendments, requested by Paige 2026-09-20**, so that Session 3b can start the moment this
  merges instead of rediscovering all of it:
  - `IMPLEMENTATION_PLAN.md` — §3 S0-D marked done with the recorded values; the Session 3b
    prerequisite rewritten as met; a new 2026-09-20 amendment block carrying the facts, the binding
    honest-framing brief, the metric drift, the stale block quote, the screenshot decision and the
    link decision; tasks 1, 2, 4, 5 and 6 and the acceptance list rewritten to match; timeline table
    and status notes.
  - `SESSION_PROMPTS.md` — the Session 0 block, the minimal inventory shape, and the Session 3b
    prompt's prerequisite check, reading list, header check, screenshot step, metric step and
    acceptance.
  - `DESIGN.md` — §2's site-map row (where the test count is cited from), §3.5 (live captures are
    staged provenance), §5.3 (one repo screenshot, the rest captured) and §7.1 (what S0-D verified
    about framing, plus the deep-link and the in-frame layout note).
  - `AGENTS.md` — the two approved exceptions to the private source folder being read-only, and the S0-D status in
    the review follow-up rules.

## Decisions and why

- **The hero link pins the defaults rather than changing them.** `preset=F3` (Beam-F3 left DLPFC)
  and `proto=10hz-hf-l` are already the app's initial state, so the link is self-describing if those
  defaults ever move. The parameter that earns its place is `elec=1`, which turns on the labelled
  F3/F4/Fz/Cz scalp dots and the DLPFC→sgACC cue, so a first-time viewer can see what is being
  targeted. The app rewrites its own URL on load — dropping defaults, writing the snapped coil pose
  — which is the deep-link codec working as designed, not the link failing.
- **The social card is not hotlinked.** `https://stimmap3d.pages.dev/og-image.png` is served live,
  but any image the site shows is copied into `public/` and recorded in `assets.json` with
  repository provenance. Paige's brief describes that card as cached immutably for a year; the
  actual response is `Cache-Control: public, max-age=0, must-revalidate`, which is another reason
  not to depend on it remotely.
- **The honest-framing block is recorded as binding, not as background.** StimMap3D's own tests
  enforce those claims, so any site copy saying it simulates a field, models patient response or is
  anatomically faithful would contradict the app one click away. The wording is Paige's.
- **The findings were settled as decisions, not left as questions.** Paige chose: use the
  updated test counts (447 across 35 files, cited to `docs/validation.md`); capture the missing
  screenshots from the live app as **staged** provenance rather than pretending they came from the
  repository; and link `docs/agentic-development.md`, the public equivalent of the
  `SESSION_PROMPTS.md` the plan assumed. Each is written into the plan and the prompt so Session 3b
  follows a decision instead of stopping to ask.
- **Live captures are staged provenance, and that needed saying in the schema's terms.** A capture
  is not a file in a repository at a commit, so `repository` provenance would be a false claim; it
  is a staged original whose `revision` names the deployed commit, the origin and the capture date.
  That means Session 3b writes captures into the private source folder first, so AGENTS.md now
  records the two approved exceptions to that folder being read-only (this, and `INVENTORY.md`
  itself, which a prerequisite step exists to fill in). Nothing from the folder is committed either
  way.

## Tools and model

Claude Code (Opus 5, 1M context) for the verification and this entry; `gh` for repository metadata,
`curl` for response headers, Playwright for the live-app and cross-origin frame checks. Paige
deployed the app, flipped the repository public and wrote the project brief.

## Constraints, human decisions and implementation direction

Paige's decisions: to deploy on Cloudflare Pages and publish the repository under MIT; the
honest-framing rules quoted in `INVENTORY.md`; the one-liner and stack description; and that the
brief is to be used for S0-D only, with Session 3b left unbuilt. The agent chose the deep-link
parameters and ran the verification.

## Generated work and rejected suggestions

- Rejected: hotlinking `og-image.png` from the live deployment (the brief offers it). It would put
  an asset on the site with no `assets.json` record, against the standing provenance rule.
- Rejected: updating StimMap3D's drifted test-count metrics in `content/` now. Changing a metric
  value also changes the text it has to occur in, the resume PDF it prints into and the tests that
  gate both — that is Session 3b task 5. The *decision* to use 447 across 35 files is recorded in
  the plan and the prompt; only the content edit waits.

## Verification (command, result, PR/commit)

All run 2026-09-20 against the live deployment and the public repository.

| check | command | result |
|---|---|---|
| repository public | `gh repo view PaigeRattenberry/stimmap3d --json visibility,licenseInfo,homepageUrl` | `PUBLIC`, MIT, homepage `https://stimmap3d.pages.dev` |
| pinned revision | `gh api repos/PaigeRattenberry/stimmap3d/commits/main` | `0a20e810e48dca8aac1780c6478c3d1f51663989`, 2026-09-20T08:56Z |
| S0-D step 1, agent config | `git ls-files .claude` in a clone of the public repo | nothing tracked |
| S0-D step 1, secret scan | `git log --all -p` piped through `grep -inE "api[_-]?key\|secret\|token\|password"` over all 14 commits | only prose (release controls) and `js-tokens`/`css-tokenizer` lockfile entries; no credential |
| live app | `curl -D - https://stimmap3d.pages.dev/` | HTTP 200 |
| framing headers (DESIGN §7.1) | same response, plus a search of the served HTML | no `X-Frame-Options`, no CSP `frame-ancestors`, no CSP `<meta>` |
| cross-origin embed | deep link in an `<iframe>` served from `http://127.0.0.1:4599`, loaded in Chromium | app rendered; disclaimer banner visible inside the frame |
| deep link applies | Playwright on `?preset=F3&proto=10hz-hf-l&elec=1#/` | "Show 10-20 sites & DLPFC→sgACC cue" checked; status line reads the F3 — Beam-F3 left DLPFC preset |
| disclaimer on the live app | same page | "Illustrative model — not for clinical use." in the page's alert region |

Not checked, and left for Session 3b: Lighthouse on `/projects/stimmap3d`, axe with the embed
loaded, and any screenshot capture — all of those need the embed, which is 3b's build.

## What the AI got wrong and how it was caught

Nothing was written from the brief unverified, which is how three drifts in it were caught: the
og-image cache header is not immutable (checked with `curl`); the repository's public README does
not state a test count, so the brief's "447 unit tests" is citable from `docs/validation.md`
instead; and the brief's screenshot line describes the only screenshot the public repo has, while
Session 3b's task 4 asks for four to six. A first draft of the hero link used `preset=F3` alone,
before reading `web/src/store.ts` showed `F3` is already the default and the link would have pinned
nothing visible.

Two things in this entry were wrong until the review of PR #11 caught them, both by checking rather
than re-reading. The public history is **14 commits**, not the count first recorded here — one branch,
no tags, `gh api .../commits` returns 14 — so the secret scan covered 14. And the checks stopped at
metric *values*: re-running them over the page's quotations found that the limitations block quote
is attributed to a README section the public repo does not have, which is now finding 5. Verifying
the number in a claim is not the same as verifying the sentence around it.

## Findings, and the decision taken on each (1–4 decided by Paige, 2026-09-20)

1. **Test-count metrics have drifted.** `content/projects/stimmap3d.mdx` carries "436 Vitest tests"
   and "32 test files", as Session 3a recorded them. The public repo at
   the pinned SHA says "447 app tests across 35 files", plus four toolchain-policy tests and 24
   production Chromium checks (`docs/validation.md`). The citable public source is that file, not
   the README, so both values and both `note`s change together. The "~4–10% field error vs. real
   spiral windings, per PLOS ONE 2017" *value* is a verbatim match in the public `DESIGN.md` §3.2
   and stands; its `note` does not (finding 5).
   **Decision:** use the updated counts. Session 3b replaces both values and cites
   `docs/validation.md` at its pinned commit, changing any body text that repeats a value so the
   claims gate still passes.
2. **Only one screenshot exists in the public repo** (`docs/screenshots/visualizer.png`). Task 4
   asks for four to six with repository provenance.
   **Decision:** ship that one image with repository provenance and capture the other three to five
   from the live app as **staged** provenance — a capture is not a file in a repository at a commit,
   so the staged record names the deployed commit, the origin and the capture date instead. The
   captures are written to the private source folder first, which is why AGENTS.md now names that
   as an approved exception to the folder being read-only.
3. **There is no `SESSION_PROMPTS.md` in the public repo**, so task 6's link has no target.
   **Decision:** the "Built with Claude Code" aside links `docs/agentic-development.md` ("AI-assisted
   workflow and review briefs") in the public repo, pinned at the same commit as the screenshots, with
   `CLAUDE.md` and `AGENTS.md` as alternates if the aside's wording fits them better.
4. **`ProjectLinkSchema`'s comment says a repo link is cleared for no repository "(today: none)"**;
   `INVENTORY.md` now clears StimMap3D, so that comment goes stale the moment the link lands.
   **Decision:** Session 3b updates the comment with the link; it is in the plan and the prompt.
5. **One of the page's two block quotes is not in the public repo** (found reviewing this
   PR, not during the checks above, which covered metric values rather than quotations).
   `content/projects/stimmap3d.mdx` introduces its limitations quote with "From the README's 'How
   the physics works (and what it gets wrong)'". At the pinned SHA the public README is a 38-line
   overview whose only sections are Run locally, Engineering and validation and Credits; that text
   is not in it. The public `DESIGN.md` §3.2 states the same limitations in different words ("vs.
   real spiral windings, per PLOS ONE 2017", with parenthetical expansions), so the quote has to be
   re-taken from there. The first block quote, the method statement, *is* verbatim in `DESIGN.md`
   §3.2. Both attributions need the same fix: the body's closing line and the `~4–10%` metric's
   `note` cite the README and a `DESIGN.md` section the public file does not have.
   **No new decision needed** — Session 3b task 5 already re-checks every quote against the pinned
   commit. It is written into the plan and the prompt so the drift is named rather than rediscovered:
   re-quote the limitations passage verbatim from `DESIGN.md` §3.2 or paraphrase it outside the block
   quote, and repoint both attributions at §3.2 with no README claim.

## Paige's review notes

## Screenshots

None. The one capture taken here was a throwaway cross-origin frame check; Session 3b takes the
`s3b-*` screenshots, including one with the embed loaded.
