# Session 3b — StimMap3D live embed, public links and screenshots

- Date: 2026-09-20 · Branch: s3b-stimmap3d-embed · PR: #12

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

Finish the StimMap3D page with the parts that needed the app deployed and public (S0-D, closed
2026-09-20): the click-to-load live embed, the live-app and repository links, four to six
screenshots with provenance, and every quote and metric Session 3a placed re-checked against one
pinned commit of the **public** repository. Nothing else: no other page, no change to the Open
Graph card, no skills change.

## What shipped

- **Pinned commit: `0a20e810e48dca8aac1780c6478c3d1f51663989`**, still the head of the public
  `main` and still the one S0-D pinned (`gh api repos/PaigeRattenberry/stimmap3d/commits/main`,
  2026-09-20). Every GitHub file link on the page and the repository screenshot's provenance name
  it; a unit test fails if they ever disagree.
- **Prerequisites re-checked, all passing:** `INVENTORY.md`'s StimMap3D section;
  `gh repo view … --json visibility` → `PUBLIC`; the S0-D, 3a, 4, 5 and 6 build logs on `main`.
- **Framing re-checked (DESIGN §7.1):** `curl -D -` on the live origin shows no `X-Frame-Options`
  and no `Content-Security-Policy`; the served HTML has no CSP `<meta>`. Confirmed end to end by
  the e2e run below, which loads the deployment inside the page's iframe and reads the app's
  banner through the frame.
- **Content (`content/projects/stimmap3d.mdx`):** `live` and `repo` links in the 3a link shape;
  `cover`; a new `embed` block (the deep-link `src`, the frame's title, a caption note); `links`
  on the aside. The loader's blanket refusal of `repo` links is now an exact-URL allowlist
  (`CLEARED_REPOSITORIES` in `lib/content/projects.ts`) holding the one repository `INVENTORY.md`
  clears; the `ProjectLinkSchema` comment says so. An `embed` without a cover and a live link is
  a build error, because the poster is the cover and "Open full app" is the live link.
- **The embed.** `/projects/stimmap3d` opens on a full-width row: the disclaimer callout, then
  `EmbedFrame` with the hero capture as its poster. Nothing is requested from the live origin
  until "Load interactive demo" is clicked. The caption always carries "Fig. 1", the status line,
  "Open full app" (the live URL, new tab; it is also the fallback the timeout message points at)
  and the disclaimer in bold, so the disclaimer is beside the frame after the app has replaced the
  poster as well as above it. `EmbedFrame` gained `loadedFrameClassName`, `posterSizes` and
  `number`; its defaults leave the Leadership video as it was.
- **Six images under `public/images/stimmap3d/`**, each in `assets.json` with rights, permission,
  transformations, alt text and dimensions:
  - `visualizer.png` — the one screenshot the public repo ships, a byte-identical copy of
    `docs/screenshots/visualizer.png` at the pinned commit (git blob `03e0d1d…`, checked with
    `git hash-object`). **Repository** provenance.
  - `hero-dlpfc`, `focality-glyphs`, `methods-limitations`, `dose-response`,
    `synthetic-trajectory` (`.webp`) — captured from the live app by
    `scripts/capture-stimmap3d.mjs` (Playwright), each written to the private source folder as a
    PNG first and re-encoded at the same pixel size. **Staged** provenance: the staged PNG's SHA-256,
    then the capture date, the origin and the commit. The app's banner is in frame in all five.
  - A new `Screenshot` MDX component takes an `assets.json` path and a figure number; alt text and
    dimensions come from the manifest, so a body image cannot ship without its record.
- **Tests.** Unit 129 → 135: the embed mounts only after the click and keeps the disclaimer and
  "Open full app" beside it; the links in the facts column, the body and the aside; figures
  numbered 1–6 with a public source line; the honest-framing brief as assertions; the loader's
  allowlist (an unlisted and a look-alike URL refused, the cleared one accepted) and the embed
  precondition; StimMap3D asset provenance (one repository image; staged captures naming commit,
  origin and date); every GitHub URL on the page is the cleared repo and every file link pins the
  repository screenshot's commit. E2E: the old "no embed yet" test became a deterministic one with
  the live origin stubbed (no request before the click, iframe `src` and title after, caption and
  axe after load), plus an opt-in test against the real deployment (`LIVE_EMBED=1`).

## Quotes and metrics re-checked against the pinned commit

Several of the quotes and metrics Session 3a placed did not match the public documents at the
pinned commit, so more had drifted than the three items S0-D found. Everything below was checked
by reading the file at the pinned commit.

| on the page after 3a | public repo at `0a20e81` | now |
|---|---|---|
| metric "436" Vitest tests, note "repository README" | `docs/validation.md`: "447 app tests across 35 files"; the README states no count | value **447**, label "app tests passing in StimMap3D's release gate", note cites `docs/validation.md` at the commit |
| metric "32" test files | same sentence | value **35**, note as above |
| — | `docs/validation.md`: "All 24 production Chromium checks passed" | new metric **24**, same source |
| metric "~4–10%", note citing the README and a DESIGN section | verbatim in `DESIGN.md` §3.2; not in the README | value unchanged; note cites `DESIGN.md` §3.2 at the commit |
| method-statement block quote | verbatim in `DESIGN.md` §3.2 | unchanged |
| limitations block quote, "From the README's 'How the physics works (and what it gets wrong)'" | no such README section; §3.2 states the limitations in different words | **re-quoted verbatim from §3.2**, through "(Eaton 1992)"; the value stays a `<MetricStat>` |
| closing attribution to the README and a `DESIGN.md` section, read on 2026-09-13 | — | "DESIGN.md §3.2", linked at the commit, read on 2026-09-20; adds the section's last sentence, "No FEM comparison or clinical validation is shipped." |
| honesty gates "as StimMap3D's own instructions state them" (a numbered paraphrase) | the gates are (a)–(e) in `DESIGN.md` §1 | **quoted verbatim from §1**, linked at the commit |
| "Continuous integration runs the full suite on every pull request, so the honesty-gate tests are merge-blocking" | `docs/validation.md`: the same checks "on every push to main and every pull request"; `CONTRIBUTING.md`: "Release checks do not imply that repository branch rules are enabled" | says what `validation.md` says; "merge-blocking" dropped; adds its own caveat (automated checks, not independent human review or clinical validation) |
| aside: "one pull request per milestone, from a design document and an implementation plan kept in the repository. Most of its commits carry a Claude co-author line." | the process is described in `docs/agentic-development.md`, which calls itself "not … a measurement of code authorship" | rewritten from `docs/agentic-development.md` and `AGENTS.md`; links `docs/agentic-development.md` at the commit |
| aside: "Its CLAUDE.md states the honesty gates as non-negotiable conventions" | gates are in `DESIGN.md` §1; `AGENTS.md` repeats the disclaimer, synthetic-label and relative-unit rules | says that |
| "a dose–response panel beside the scene" | the panel is below the scene (live app) | "below the scene" |
| feature list | each item spot-checked in `web/src` (presets and Fox 2012, 5-cm card, Euclidean gap label, glyphs, residual map, tilt, d½/S½, separate axes, tour dispatching store actions, PNG export, quiz, print, Sources ledger, keyboard coil, live region, reduced motion, the Methods/DESIGN lockstep test) | unchanged |

The card text (`tagline`, `proof`, resume `bullets`) comes from the resume of record and did not
change.

## Decisions and why

- **The embed is the page's Fig. 1, and the poster is the cover.** A cover drawn as Fig. 1 right
  under a poster of the same view would have been the same picture twice. The loader requires an
  embed to have a cover, the page passes it to the frame as the poster, and the body's figures
  start at 2 as the Session 4 content test already demands.
- **Full-width row, 16:9 poster, taller frame only after the click.** At the prose column's width
  the app falls into its narrow layout and, as S0-D warned, the 3D canvas starts about 515 px down
  under the banner and the getting-started card. Across the content width the app gets its
  two-column layout; after the click the frame becomes 16:10 (4:3 from `sm`, 3:4 on phones), so
  the top of the scene is in view. The height change answers the visitor's click and the poster
  itself never crops: a first version used 16:10 for the poster too, which cut the banner's first
  word off at the left edge (caught in the first screenshot). The caption also says where the
  scene is.
- **"Open full app" opens the live root, the frame opens the deep link.** DESIGN §7.1 asks for
  both; the root is the URL a reader would share, and the deep link only pins the DLPFC view.
- **The repository image ships untouched, the captures as WebP.** A byte-identical copy can be
  verified against the commit by anyone (`git hash-object` gives the blob id); re-encoding it
  would have traded that for about 250 KB that `next/image` re-encodes on the way out anyway.
- **What "the deployed commit" means in a staged revision.** The deployment carries no commit
  marker (nothing in the HTML or the headers), so the record says what is known: Cloudflare Pages
  deploys from the public `main`, whose head at capture time was the pinned commit.
- **The getting-started card is dismissed for the captures** through the app's own
  `localStorage` flag, the one its close button sets, and each record's transformations say so.
  The in-frame app still shows the card to a first-time visitor.
- **The live-deployment e2e test is opt-in.** CI should not fail because a third-party origin is
  slow; the stubbed test covers the page's behaviour, and the live run is recorded below.
- **Five captures, not three.** The honest-framing brief is easiest to show: relative-units
  legends, the Methods page, separate axes and the synthetic badges are each in a figure next to
  the sentence that claims them.

## Tools and model

Claude Code, model Claude Fable 5.1 (`claude-fable-5-1`). Skills and tools: `frontend-design`
for the embed placement; Playwright for the captures, the embed check against `next start`, axe
and the screenshots; `gh` and `curl` for the repository and header checks; a clone of the public
repository at the pinned commit for the re-check; Lighthouse 13.5 through `npx lighthouse` with
Playwright's Chromium; a code-review agent on the working tree before the PR.

**Review round on the open PR, 2026-09-20.** Claude Code, model Claude Opus 5 (1M context)
(`claude-opus-5[1m]`), through the `code-review` skill against PR #12 plus a read of the diff by
hand. It re-ran lint, typecheck, `npm test`, `npm run build`, `npm run e2e:a11y` and
`npm run e2e:features`, re-fetched StimMap3D's `DESIGN.md`, `docs/validation.md`,
`docs/agentic-development.md`, `AGENTS.md`, `CONTRIBUTING.md` and `README.md` at the pinned commit
through `gh api` and re-checked every quote and number against them, and confirmed
`visualizer.png` against the upstream blob id and byte size. Five findings, all applied — see
"What the AI got wrong" below.

## Constraints, human decisions and implementation direction

- Task: IMPLEMENTATION_PLAN §4 Session 3b with its 2026-09-15, -16, -17 and -20 amendments.
- Paige's decisions, all recorded at S0-D and followed here: use 447 across 35 files cited to
  `docs/validation.md`; one repository screenshot plus live captures as staged provenance, written
  to the private source folder first; link `docs/agentic-development.md`; the honest-framing brief.
- Constraints honoured: only the public repository is linked; nothing from the private source
  folder is committed; the frontmatter disclaimer and skills are untouched (so the explorer
  layout is unchanged and `prebuild`'s `--check` passes); the OG card is untouched.
- Left for Paige: whether the cover should appear on the OG card (not done, as instructed).

## Generated work and rejected suggestions

- Generated by Claude Code: everything in this PR, including the rewritten body passages, the
  aside, the six alt texts and captions, the capture script and the tests.
- Rejected during the session: drawing the cover as its own Fig. 1 under a poster of the same view;
  a 16:10 poster; a target-compare capture, whose scene labels overlapped each other in the headless
  render; an element-level capture of the dose–response panel, which the app's sticky banner
  stitched itself into; `preload` on the poster (the bundled Next docs prefer `loading="eager"` with
  `fetchPriority="high"`, and Lighthouse measured no difference).

## Verification (command, result, PR/commit)

| check | command | result |
|---|---|---|
| lint, types | `npm run lint`; `npm run typecheck` | clean |
| unit | `npm test` | 17 files, 136 tests, green (claims, privacy, asset reconciliation, resume, explorer included) |
| build | `npm run build` | clean; 21 static pages; explorer layout `--check` passed |
| embed, stubbed | `npx playwright test tests/e2e/projects.spec.ts` | no request to the live origin before the click; iframe `src` is the deep link after; axe clean with the frame loaded |
| embed, live | `$env:LIVE_EMBED = "1"; npx playwright test tests/e2e/projects.spec.ts` | 8 passed: the frame reports loaded, the app's alert region reads "not for clinical use" inside the frame, a canvas is attached |
| axe, both themes | `npm run e2e:a11y` | 95 passed |
| features | `npm run e2e:features` | 41 passed, 1 skipped (the opt-in live test); the privacy scan is now one test per HTML route |
| explorer untouched | `tests/unit/explorer.test.tsx`, `prebuild --check` | green with no change to the tests or the layout file |
| OG image | `s3b-og-projects-stimmap3d.png` vs `s6-og-projects-stimmap3d.png` | byte-identical (`cmp`), as the 2026-09-17 amendment expected |
| resume | `tests/unit/resume.test.ts` | green: two pages, disclaimer present. Built without `NEXT_PUBLIC_SITE_URL`, StimMap3D's heading now links to the live app (it had no link before); with the site URL it links to the deep page as before. The record's `revision` is updated in a follow-up commit |
| Lighthouse, mobile | `npx lighthouse http://localhost:3100/projects/stimmap3d` ×3 against `next start` | performance **88, 89, 89**; accessibility 100; FCP 1.1 s, simulated LCP 3.8–3.9 s, TBT 30–70 ms, CLS 0 |
| Lighthouse, desktop | same with `--preset=desktop` | performance 100 |
| privacy, tree | `git status` | nothing from the private source folder |
| privacy, payload | `grep -rl` for the private source folder's path prefix over `.next/server/app/` after `npm run build` | no match; before the review round it named `projects/stimmap3d.html` |

**Lighthouse is one to two points under the 90 target, and the embed is not why.**
`/projects/spinal-curvature-capstone`, which this session did not touch and which has no image at
all, scores 88 in the same run with the same simulated 3.8 s LCP (its LCP element is a paragraph;
the observed LCP on both pages is about 0.24 s). The gap is the site-wide baseline under simulated
mobile throttling, which is Session 7's performance pass; the click-to-load frame adds no request
and no script to the initial page. Reported as missed rather than rounded up.

Not checked: the Vercel preview in an incognito window (needs the pushed PR); `lhci autorun`
(no Lighthouse CI config exists until Session 7, so plain Lighthouse was used).

## What the AI got wrong and how it was caught

- **Two tests used a real GitHub URL as their refusal case** ("never names…" and a fixture)
  instead of an invented one. Caught before the first commit; the
  content test now checks that every GitHub URL is exactly the cleared repository, and the fixture
  uses an invented look-alike.
- **A 16:10 poster cropped the app's banner mid-word.** Caught in the first viewport screenshot;
  the poster is 16:9 and only the loaded frame grows.
- **An element screenshot of the dose–response panel had the sticky banner stitched through the
  middle of it.** Caught by looking at the image; all captures are viewport shots now, which also
  keeps the banner where it really is.
- **Staged revisions that continue after the digest broke the privacy gate's digest check**, whose
  pattern took the whole string as the hash. Caught by `npm test`; the pattern reads the digest up
  to the separator and a new test pins the rest of the format.
- **Shell heredocs halved the backslashes in two test regexes**, producing patterns that could
  not compile. Caught by the first test run; rewritten with the editor.
- **Full-page screenshots showed blank boxes for the lazy images.** Caught by looking at the
  first `s3b` capture; the screenshot spec now asks for lazy images before capturing.
- The code-review agent reported no finding at its confidence bar. It fetched the public
  `DESIGN.md` and `docs/validation.md` at the pinned commit and confirmed the three block quotes
  word for word, checked the body's feature claims against `web/src`, matched the repository
  screenshot's blob id through GitHub's API, and found no other repository named in the
  tree. That is an automated review, not Paige's.

### Found by the review round on the open PR (2026-09-20)

The first code-review pass ran on the working tree and reported nothing. A second pass on the
pushed PR found five, the first of them a privacy-gate breach that had already been pushed.

- **The whole `assets.json` record was handed to the embed island, so `/projects/stimmap3d`
  carried the record's private provenance fields, its staging path among them.** `EmbedPoster`
  declares four fields, but TypeScript's structural typing accepts the wider `ImageAsset`, and React
  serializes every field of a client island's props into the flight payload the prerendered HTML
  carries inline — about 1.7 KB of it. Caught by a `grep -rl` for the private source folder's path
  prefix over `.next/server/app/`, which named `projects/stimmap3d.html` as the only page in the
  site containing the string. The page now passes an explicit `{ path, alt, width, height }`
  literal, and the privacy e2e that would have caught it — it fetched `/projects` alone — now runs
  over every entry in `htmlRoutes`. This is the same rule `metricViews()` exists to keep for source
  ids; the embed simply had no equivalent projection.
- **The two embed branches tested different conditions, so a partial `embed` record would have
  dropped the disclaimer.** The row rendered on `embed && cover && live`, the prose column
  withheld the disclaimer and the cover on `embed` alone, so a project with an embed but no cover
  or no live link would have rendered neither the frame nor the disclaimer — gate (c) failing
  open on the one page that needs it. `loadProject` makes that unreachable today, but the page
  was written as though it were reachable. The prose column now asks whether the row was actually
  rendered.
- **`aside.links` bypassed both link gates.** The new field is a plain `LinkSchema` array, and
  `loadProject` ran the `CLEARED_REPOSITORIES` check and `assertDocumentLinks` over `links` only.
  An aside could therefore link a repository outside `CLEARED_REPOSITORIES`, or a `/docs/*.pdf`
  with no provenance record, and the build would pass.
  The session's own aside link is a cleared-repository URL, so nothing shipped wrong; the gate
  was the defect. Both checks now run over `links` and `aside.links` together, in
  `assertPublishableLinks`, with a unit test for each refusal.
- **The relaxed digest pattern turned a malformed revision into a skipped check.** Reading the
  digest up to the separator (the fix listed above) meant a revision written with a space instead
  of a `;` yields `undefined`, and the `if (digest)` guard then skipped the comparison silently —
  the opposite of what the old pattern did. The test now asserts the digest was read before
  comparing it.
- **A dead fallback in the capture script.** `boundingBox()` auto-waits and throws when the
  locator never resolves, so `banner?.height ?? 0` could never fire; if the live app stopped
  exposing its banner as an `alert` the script would die on a 30 s timeout instead of capturing.
  It now catches to `null`, which is what the `??` was written for.

## Paige's review notes

## Screenshots

`docs/screenshots/s3b-*.png`: every route at 1280 px and 390 px (home in both themes);
`s3b-projects-stimmap3d-embed-loaded-1280.png` and `-390.png` with the live app running inside the
frame; `s3b-og-projects-stimmap3d.png`, identical to Session 6's.
