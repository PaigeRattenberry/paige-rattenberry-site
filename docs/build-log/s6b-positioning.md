# Session 6b — The headline and the interpretability thread

- Date: 2026-09-20 · Branch: s6b-positioning · PR: #14

(redacted for publication, 2026-10-01 and 2026-10-02)

## Goal

An editorial pass, not a feature: emphasis, ordering and vocabulary over facts already in
`content/`. One thread runs through the work — a system's output can be checked, the checker is
itself tested, and the check runs automatically or it does not count. The session names that thread
on Home, in About and on `/research`, gives the 2024 literature review on interpretability in
generative AI a deep page in place of a one-line card, and moves the thesis to second of three case
studies. It changes no fact and adds no claim.

## What shipped

- **Home** (`content/profile.ts`): Paige's positioning line; a "Currently" line that carries what
  the positioning line does not (the MCP server under access-control filters, the agent loop with
  citation guardrails, the scheduled audit job that opens its own remediation pull requests) and
  keeps the `220+` metric; a skills strip that leads with evaluation and grounding, with `python`
  off it and `grounding` on it.
- **About** (`content/about.ts`): the second paragraph now opens on "making a system's claims
  checkable instead of merely fluent", says what the evaluation work targets (hallucination and
  groundedness, as a check on a product's output), and carries the agent-oversight sentence (wording
  cleared by Paige, 2026-09-20). The third paragraph ties the anomaly-detection work and the GMLE
  certification to the same thread in plain terms. A present-tense fourth paragraph, added after the
  first review at Paige's request, is on oversight of AI agents: Paige chose its content from
  options the agent offered, and the agent drafted the wording for her approval in the PR. To keep
  five paragraphs, the Egypt passage is condensed into one sentence of the closing
  paragraph, which already names the valedictorian address it comes from.
- **Skill labels** (`content/skills.ts`): `xai` is "Interpretability (XAI)" and `grounding` is
  "Grounding & claim verification". Label text only.
- **`/research`**: three themed groups in DESIGN §2's order — Interpretability and evaluation,
  Medical and neural AI, Applied LLM systems — then Reviewing. The theme is a field on each research
  item; the headings are in `lib/content/labels.ts` and the order in `RESEARCH_THEME_IDS`. Newest
  first inside each group; all seven items are still listed, each once.
- **The literature review's summary** (`content/research.ts`): rewritten from the review, with its
  reference count, 14, declared as a metric on the research item and sourced to the review
  ("Literature review, 21 April 2024").
- **`/projects/genai-literature-review`**: a fourth deep page, written from the review itself: why
  it was written, the failure modes it covers, the distinction it draws between interpretability and
  explainability with a note that other literatures use the two words the other way round, all
  eleven proposals it describes reported as their authors' work, where the field fell short, and its
  conclusion. No figure, and no numeral in the body except the date; the count renders through
  `MetricStat`.
- **Featured order**: StimMap3D, thesis, capstone. Three cards, one row, on Home and `/projects`.
- **Thesis page**: the tagline asks the method question, and one closing paragraph says what the
  approach carries and what it does not. No measured claim changed.
- **Metadata**: the root, About and `/research` descriptions name the subject. `/projects`' follows
  the featured order by construction, and the Open Graph card draws the new positioning line.
- **Tests**: see Verification.

## Decisions and why

- **`/research` finds a deep page through the pointer that already exists.** The literature
  review's card points at its research item with `researchId`. Adding a `projectSlug` on the item
  as well would have typed the pairing twice, and the explorer's pair count caught it (below).
  `deepPageForResearch()` in `lib/content/load.ts` resolves either pointer.
- **A review is not called a case study.** `/research` links the thesis and the capstone with "Read
  the case study" and the literature review with "Read the summary" (`deepPageLinkLabel` in
  `labels.ts`). The page is a survey of other people's work and says so in its second paragraph.
- **The deep page lists every proposal the review describes, in the review's order.** Listing only
  the ones closest to the site's thread would misrepresent the source.
- **The new page points at the review's sources rather than restating them.** It refers to the
  review's reproduced chart as "a chart in one of the surveys it cites" and links the PDF, where the
  reference list is.
- **About stays at five paragraphs.** `AboutSchema` caps the narrative at five, per DESIGN §2's
  "3–5 short paragraphs", so the new sentences went into the second and third, and the
  present-tense paragraph took the Egypt passage's place (Paige's choice over raising the cap).
- **About no longer carries StimMap3D's disclaimer callout** (Paige, 2026-09-21, after the first
  review). Session 2's code review had added it by reading gate (c) as "wherever StimMap3D
  appears", and About names the project in passing. DESIGN's wording is "shown or embedded"; the
  gate now says so in AGENTS.md, DESIGN.md and the plan, and lists where the disclaimer stays: the
  card, the deep page, the embed, the timeline entry, the Open Graph card and the resume.
- **Both relabels, not only `xai`.** The strip now shows `grounding` second on Home, and "claim
  verification" is what the role's first bullet describes. Both leave the explorer layout untouched.

## Tools and model

Claude Code with Claude Fable 5.1 (`claude-fable-5-1`). Text extraction from PDFs with `pdftotext`;
Playwright for the e2e suites and screenshots; a separate review agent
(`feature-dev:code-reviewer`) for the review pass.

The follow-up after the first PR review (the literature-review sentence fix, the doc status
updates and About's present-tense paragraph) used Claude Code with Claude Opus 5
(`claude-opus-5`), with web search.

## Constraints, human decisions and implementation direction

Decided by Paige on 2026-09-20 and implemented as given: the positioning line, word for word; the
featured order and the count of three; that the resume PDF may change; the wording for the
multi-agent work (guardrails, permissioning and oversight of what agents were allowed to do) and for
the evaluation work (hallucination and groundedness); and that the session ships without About's
present-tense paragraph unless she supplies it. After the first review Paige asked for it to be
folded in, with options to choose from; she chose its content from the options the agent offered,
and chose to condense the Egypt passage. The agent drafted the wording from those choices, for her
approval in the PR.

Untouched, as instructed: the resume bullets in `content/experience.ts`, `profile.summary`, every
entry's skill set, the staged source folder, StimMap3D's disclaimer.

## Generated work and rejected suggestions

Generated by the agent: every wording change above except the positioning line; the deep page's
body; the schema field, labels, loader helper and page grouping; the tests.

**Beyond the task list (the plan's latitude clause).** Each is sourced from `content/` or the
review, touches nothing the clause protects, and is checked in this repo:

| Change | Check |
| --- | --- |
| `/research` links the literature review to its new page, labelled "Read the summary" | `ResearchPage.test.tsx` |
| The new page's facts column links the review PDF (the link already shipped on `/research`) | `ProjectPage.test.tsx`; the loader's document check |
| The new page ends by linking the thesis page | renders in the body test; the claim restates the thesis page's own "the tool must itself be tested" |
| A unit test caps the positioning line at 280 characters | `content.test.ts` |
| A unit test checks content text against two word lists | `content.test.ts` |
| A unit test pins the three themes' membership and order, and "14 papers", never "14 studies" | `content.test.ts` |
| `SESSION=6b` screenshots also save the two Open Graph cards | `s6b-og-*.png` |

**Rejected or left as recommendations:**

- Adding `eval-harness` to the thesis so the constellation shows evaluation: a skill-set change,
  which this session may not make.
- Raising About's paragraph cap to six in advance: a DESIGN §2 decision, not an editorial one.
- Pinning the resume's literature-review line to its old wording with `resume.bullets`: Paige chose
  to let it change.
- A closing heading on the thesis page: the acceptance allows a tagline and one paragraph.

## Verification (command, result, PR/commit)

| Command | Result |
| --- | --- |
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npx tsx scripts/layout-explorer.ts --check` | up to date (42 nodes, 173 edges), **without regenerating**; `content/generated/explorer-layout.json` is not in the diff |
| `npm run resume` | 2 pages |
| `npm test` | 17 files, 142 tests passed (136 before the session) |
| `npm run build` | clean; `/projects/genai-literature-review` and its Open Graph image prerender |
| `npm run e2e:a11y` | 97 passed (one more route in every sweep) |
| `npm run e2e:features` | 42 passed, 1 skipped (the opt-in live-embed test, as before) |
| `SESSION=6b npm run e2e:screenshots` | 28 passed |
| `node scripts/js-budget.mjs /` | **137.1 KB gzipped before and after** (459.7 KB raw, 7 scripts) |

**The resume PDF changed in three places, not one.** The plan expected the literature-review
bullet to change. The skill labels also print in the resume's "Technical skills" lines, so
"Interpretability (XAI)" and "Grounding & claim verification" replace the resume of record's
"Explainable AI (XAI)" and "Grounding & Citation Verification" there. Still two pages; the
`revision` pin on its `assets.json` record is updated in a follow-up commit.

**Acceptance 5** was checked with `git diff main -- content/projects/interpretable-medical-imaging-thesis.mdx`:
the tagline, `order`, and one added paragraph; nothing else.

**Claims drawn from the literature review** (shipped PDF, "Literature review, 21 April 2024"):
the industries and the black-box framing, p. 1; governance and the two definitions, p. 2; the
chart and the survey's finding on evaluation procedures, p. 2; the eleven proposals, pp. 3–8; "no
method has been widely deployed", p. 8; the conclusion on standardized metrics, pp. 8–9; the
reference list, fourteen entries, pp. 9–10.

Not done here: the Vercel preview check in an incognito window needs Paige's login, and CI runs on
the PR.

## What the AI got wrong and how it was caught

- **Typed the research-to-page pairing twice.** To link `/research` to the new page the agent first
  set `projectSlug` on the research item, although the card already points back with `researchId`.
  `explorer.test.tsx` counts one pair per pointer and failed (seven, expected six). Replaced with a
  loader helper that resolves either pointer.
- **Missed two of three references to the old skill label.** The first replacement changed the
  quoted label in `explorer.spec.ts` and left two regular expressions. Caught by grepping for the
  old label before running anything.
- **Wrote three sentences the review does not support** in the deep page's first draft: a motive
  ("I wanted to know…"), a cause ("come from how the models learn") and an inference ("two of its
  findings explain part of why"). Caught on a re-read against the extracted text; each was cut or
  rewritten as something the review says.
- **The plan's task list was incomplete in three places, and the agent found them by running the
  suite rather than by reading.** Two tests named the old `xai` label; three tests assumed the
  featured projects and the deep pages are the same set; and the skill labels reach the resume PDF.
- **Left a module comment false.** `content/research.ts` still said every summary uses the resume's
  wording after one was rewritten from the review. The agent found it while checking for stale
  comments, and the review pass reported the same line independently.
- **"For a security team" was looser than the resume.** The role was on a security team; About now
  says "on". Caught on a second read of the new sentences against the role's bullets.
- **Attributed the review's definitions to its sources.** The page said the interpretability and
  explainability distinction followed "the explainable-AI sources the review cites"; the paragraph
  that defines them (page 2 of the PDF) cites nothing. Caught by a second review of PR #14 against
  the extracted text; the sentence now says the review states the distinction without a citation.
- **The review pass was narrower than asked.** The review agent had no shell, so it read the
  working tree and the review PDF rather than the diff, and could run nothing. It checked the new
  page against the PDF sentence by sentence and reported one finding, the comment above. The
  commands in Verification were run by the implementing agent, not by the reviewer.
- **A shell heredoc holding test code failed to parse**, and a first edit script assumed Python was
  installed. Both were rewritten as Node scripts in a scratch folder; no partial edit was left.

## Paige's review notes

## Screenshots

`docs/screenshots/s6b-*.png`: every route at 1280 px and 390 px (Home in both themes), plus
`s6b-og-home.png` (the positioning line inside the 1200×630 card) and
`s6b-og-projects-genai-literature-review.png`.
