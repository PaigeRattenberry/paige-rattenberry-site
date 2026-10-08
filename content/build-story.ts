/**
 * /how-this-was-built (DESIGN §6, Session 8): the page's own words. The build logs themselves
 * are docs/build-log/*.md, read by lib/content/build-log.ts; the history snapshot is
 * content/generated/build-stats.json. Validated by `BuildStorySchema` in lib/content/schema.ts.
 *
 * The synthesis was drafted by Claude Code and published as drafted at Paige's request
 * (2026-10-02); `draft: true` brings back the page's "Draft" callout. Each category lists the
 * items it counts, every item names the log it was read from (the log's "What the AI got wrong
 * and how it was caught" section, including its review subsections), and the page counts the
 * lists: no count is typed here. Read in Session 8 (2026-10-01) from every log written before it. Left out: notes that a reviewer
 * found nothing, failures a log records as unexplained, three drifts in the StimMap3D brief
 * (not errors of the agent), changes made at Paige's question that the log does not frame as an
 * error, and one idea dropped before it was tried. Where a log is ambiguous about what caught an
 * item, the item sits under the mechanism the log names first.
 */
import type { BuildStory } from "@/lib/content/schema";

type Item = BuildStory["synthesis"]["categories"][number]["items"][number];

const RF = "review-follow-up-2026-09-13";
const PR = "plan-reorder-2026-09-15";
const PS = "plan-split-session-3-2026-09-13";
const S0 = "s0-spec-amendments";
const S0D = "s0d-stimmap3d";
const S0E = "s0e-vercel";
const S0G = "s0g-publication-scrub";
const S1 = "s1-scaffold";
const S2 = "s2-content-core";
const S3A = "s3a-projects-mdx";
const S3B = "s3b-stimmap3d-embed";
const S4 = "s4-research-leadership";
const S5 = "s5-explorer";
const S6 = "s6-resume-seo";
const S6B = "s6b-positioning";
const SA = "s6b-spec-amendments";
const S7 = "s7-quality-gates";

/** One item; `added` names the gate, test or rule the log says this failure led to. */
const i = (log: string, what: string, added?: string): Item =>
  added ? { log, what, added } : { log, what };

export const buildStory: BuildStory = {
  repository: {
    url: "https://github.com/PaigeRattenberry/paige-rattenberry-site",
    planningDocs: [
      {
        file: "DESIGN.md",
        description:
          "The decisions, site map, content model, visual direction, architecture and quality bar, with every amendment dated and credited.",
      },
      {
        file: "IMPLEMENTATION_PLAN.md",
        description:
          "The sessions in order, each with its tasks and acceptance list, and the launch steps.",
      },
      {
        file: "SESSION_PROMPTS.md",
        description: "The prompt pasted into the coding agent at the start of each session.",
      },
    ],
  },

  copy: {
    description:
      "Who did what in building this site with Claude Code: the plan, a build log per session, a snapshot of the pre-launch history, what the AI got wrong and which check caught it, and StimMap3D as case study one.",
    lede: "Claude Code wrote this site's code, tests and build logs, one session and one reviewed pull request at a time; Codex implemented one review follow-up. Paige made the decisions and merged every pull request. This page is the record: who did what, the plan, what went wrong and what caught it, and a log for every session.",
    plan: "The planning documents set the work before any code was written, and every session amended them in place when a decision changed.",
    draft:
      "Claude Code drafted this section from the build logs in Session 8, for Paige to edit. The counts come from the item lists under each bar.",
    logs: "Every entry below links to its full log: goal, what shipped, decisions, tools, and what the AI got wrong; most also record how the work was verified. Pull request numbers refer to the private pre-launch repository.",
    logDescription:
      "goal, what shipped, decisions, tools, and what the AI got wrong and how it was caught",
    gallery:
      "Each session that changed the interface saved screenshots of its pages to docs/screenshots/. A few, cropped to the first screen, show how the site changed.",
  },

  transparency: {
    generated: [
      "The planning documents, drafted with Claude Code in a planning session on 2026-09-07, before any code; the design was approved that day, and later amendments are dated in place.",
      "The code, tests, CI workflow, build scripts and generators: one session and one pull request at a time, each session started from its prompt. The one exception is the September 13 review follow-up, which Codex implemented.",
      "The wording of the pages, drafted from Paige's resume and source materials, with every number held in content/ next to its source. The headline on Home is Paige's own wording.",
      "Every build log but that follow-up's, which Codex wrote, each with its record of what the AI got wrong; and this page, synthesis included.",
    ],
    paige: [
      "The decisions: the sections, the stack, the visual direction, which projects get deep pages and in what order, the headline on Home, and the changes of plan. DESIGN.md and the plan record each one with its date.",
      "What may be published: she staged the source materials and decided what could appear on the site.",
      "Choices among the options a session put to her, which meant turning the others down: the JavaScript budget in Session 7 (three ranked options), the footer screenshots in S0-G (four), and GitHub Pro, declined on 2026-09-23 in favour of branch protection on a public repository.",
      "The review of every pull request, and every merge: no session merged its own work.",
      "The setup outside the code: deploying StimMap3D and making its repository public, and connecting Vercel.",
    ],
    tools:
      "Claude Code throughout, with the models each log records: Claude Fable 5.1, Claude Opus 5 and Claude Opus 5.5, and Claude Sonnet 5.5 for read-only screenshot checks in S0-G. Codex (GPT-6) wrote the September 13 review and its follow-up. The logs of Sessions 1 and 2 name the tool but not the model.",
  },

  statsSentence:
    "The public history begins at launch; the counts below are a snapshot of the pre-launch history, and the build logs are the record of the build.",
  statsNote: "taken by hand during Session 9, before its own pull request merged.",

  synthesis: {
    draft: false,
    intro:
      'Every log has a section called "What the AI got wrong and how it was caught" ("What Claude got wrong" in the earliest ones). Read together (the logs written before this page) and grouped by what caught each item, they show which checks did the catching, and which checks exist because something got through.',
    bound:
      "This is an honest record of one site's build, written as the work happened. It is not research, a benchmark, an evaluation or a dataset. The counts are of items written in these logs, the grouping is one reading of them, and none of it says anything about coding agents in general. The gates were engineering, not an experiment.",
    added: "in each, the log says the gate was added because of that failure.",
    categories: [
      {
        id: "review",
        label: "A review pass",
        description:
          "A separate review of the branch or pull request before Paige's review: Claude Code's code review, a review agent, or a second Claude Code session, and once a Claude Code review of Codex's work. Automated review, not Paige's.",
        items: [
          i(RF, "The mobile contour was a crop of the desktop field again."),
          i(RF, "The Session 1 and 2 prompts and tasks were rewritten, altering the record."),
          i(RF, "Two build-log templates had diverged."),
          i(RF, "The Resume link was indented at 390 px."),
          i(
            RF,
            "A staged asset's digest was recorded but never checked.",
            "The privacy test recomputes every staged digest.",
          ),
          i(RF, "The headshot loader's error did not say the asset must be an image."),
          i(RF, "Card copy dropped the capstone team size and the thesis method count."),
          i(S0D, "StimMap3D's public commit count was recorded wrong."),
          i(
            S0D,
            "Checks stopped at the numbers: a block quote was attributed to a README section that does not exist.",
          ),
          i(
            S0G,
            "The first publication gate had gaps: a term wrapped across a line, staged names outside a folder, home-folder shapes, silent skips.",
            "Pattern, section and commit-message tests for the publication gate.",
          ),
          i(
            S0G,
            "The fixed gate still had gaps: long or bracketed old names, pattern terms across a line break, runs in a fork.",
            "A test per gap, and the old names moved into the private term list.",
          ),
          i(S0G, "The scrub went past removal in four places, dropping credits and decisions."),
          i(S0G, "Smaller scrub gaps: a dangling bullet, unmarked redactions, stale links."),
          i(S1, "The link-accent utility emitted no CSS."),
          i(S1, "The prose max-width token was never applied."),
          i(S1, "The mobile menu's open state was keyed to the pathname."),
          i(S1, "The contour's path data went over the wire twice."),
          i(S1, "The end-to-end specs could run against a development server."),
          i(S1, "outline-none removed the focus ring."),
          i(S1, "git log ran once per route."),
          i(S1, "Project names were typed into page copy."),
          i(S1, "The third ink colour failed AA contrast in both themes, and axe never saw it."),
          i(S1, "A fixed root font size overrode the reader's setting."),
          i(S1, "Nothing enforced Prettier.", "format:check as the first step of CI job 1."),
          i(S1, "A route count was off by one."),
          i(S1, "The stock favicon shipped."),
          i(S1, "A shell call through cmd.exe ate the git format string."),
          i(S1, "The footer date was a day ahead."),
          i(S1, "format:check would fail on a Windows clone with CRLF line endings."),
          i(
            S1,
            "The accessibility gate skipped the 404 page and the open mobile menu.",
            "Axe scans the 404 and the open menu.",
          ),
          i(S1, "A stale production server could be reused by the specs."),
          i(S1, 'Home\'s "Download resume" button led to a placeholder page.'),
          i(
            S2,
            "The page scrolled sideways at phone width.",
            "An end-to-end overflow check at 360, 390 and 1280 px.",
          ),
          i(S2, "A hidden tooltip widened the page.", "The same overflow check."),
          i(S2, "Bullets were not verbatim: dashes had changed."),
          i(
            S2,
            "Metric matching had no token boundary.",
            "The claims gate uses the renderer's matcher (in part).",
          ),
          i(S2, "The GMLE certification printed twice."),
          i(S2, "A deprecated image prop."),
          i(S2, "A source label fell back to the raw source id."),
          i(
            S2,
            "Pages imported raw content modules, skipping validation.",
            "The ESLint rule that forbids importing content/ outside the loaders.",
          ),
          i(S2, "StimMap3D appeared on About without its disclaimer."),
          i(S2, "A figure caption overprinted at 768 px."),
          i(S2, "A tooltip trigger was 11 px wide."),
          i(
            S2,
            "The contour weighed more than its budget.",
            "The path-data cap, lowered to 6.5 KB (in part).",
          ),
          i(S2, "Smaller cleanups from the review."),
          i(
            S2,
            "Tooltips ran off phone screens.",
            "An end-to-end check that every tooltip stays on screen at 360 px.",
          ),
          i(S2, "Tooltips failed WCAG 1.4.13 (dismissable, hoverable)."),
          i(
            S2,
            "Hero contour lines stopped short of the right edge.",
            "A contour test that a line reaches the edge.",
          ),
          i(S2, "Splitting text by metrics could drop a metric.", "A unit test for the split."),
          i(
            S3A,
            "A private staging path was served in the /projects page.",
            "Unit and end-to-end checks that no staging path reaches served HTML.",
          ),
          i(
            S3A,
            "Two metrics rendered without their source.",
            "The claims gate counts only rendered text; a test gives every metric its source button.",
          ),
          i(S3A, "The case studies were reordered.", "A test pins the featured order."),
          i(S3A, "Three different definitions of a deep page."),
          i(S3A, "Nested complementary landmarks."),
          i(S3A, "A proof line carried numbers without metrics."),
          i(S3A, "A fact typed as a page literal."),
          i(S3A, "The EEG-TMS card named StimMap3D without its disclaimer."),
          i(S3A, 'loading="lazy" on a click-mounted iframe could outlast the load timeout.'),
          i(
            S3A,
            "Filter chips could be clicked before hydration.",
            "A no-JavaScript test that the live region is absent (in part).",
          ),
          i(
            S3A,
            "A malformed MetricStat tag passed silently.",
            "A malformed tag fails the claims gate (in part).",
          ),
          i(
            S3A,
            "The claims gate over-counted a metric in a tagline.",
            "A test that no deep-page tagline holds a metric.",
          ),
          i(S3A, "The embed frame lost keyboard focus after loading.", "A focus test."),
          i(S3A, "The live region was inserted already filled.", "A status-region test."),
          i(
            S3B,
            "A whole asset record, staging path included, was serialized into a client island's props.",
            "The privacy check runs on every HTML page.",
          ),
          i(
            S3B,
            "The embed's two branches tested different conditions, so the disclaimer could fail open.",
          ),
          i(
            S3B,
            "The aside's links bypassed both link gates.",
            "The aside's links go through the publishable-link checks.",
          ),
          i(
            S3B,
            "A relaxed digest pattern turned a malformed revision into a skipped check.",
            "A test that the digest was read.",
          ),
          i(S3B, "A dead fallback in the capture script."),
          i(S4, "A cramped diagram at 390 px."),
          i(S4, "A caption fact typed in a component."),
          i(
            S4,
            "A figure could be numbered NaN or plot values out of scale.",
            "The figure components throw at build (in part).",
          ),
          i(S4, "Two figures were numbered 1.", "A content test on figure numbering."),
          i(S4, "Key collisions and long floats in the chart markup."),
          i(S4, "A test that could never fail."),
          i(
            S4,
            "A removed page was still inside the derived PDF.",
            "Orphan-object and page-count checks on every shipped PDF.",
          ),
          i(S4, "Page labels were off by one.", "A page-label assertion."),
          i(S4, "A diagram note was not indented."),
          i(S4, "The log named a commit that no longer existed."),
          i(S4, "A margin utility did nothing."),
          i(S4, "An h3 rendered larger than its h2."),
          i(
            S5,
            "The StimMap3D timeline entry lacked its disclaimer.",
            "Unit, component and end-to-end disclaimer tests.",
          ),
          i(
            S5,
            "The dimming rule recoloured hover and the tooltip.",
            "An end-to-end test that hovers a dimmed link.",
          ),
          i(S5, "The live region could announce a stale filter."),
          i(S5, "The Home teaser had no size cap.", "A 16 KB unit cap on the teaser."),
          i(
            S5,
            "CI never ran the explorer and projects specs.",
            "CI job 2 runs the feature specs.",
          ),
          i(S5, "Teaser labels were sized wrong.", "A label-fit test."),
          i(
            S5,
            "prebuild rewrote the layout, so its guard could never fire.",
            "prebuild only checks the committed layout.",
          ),
          i(
            S5,
            "Transitions ran under reduced motion.",
            "A reduced-motion test over every button.",
          ),
          i(
            S5,
            "Hovering under a filter dimmed the filter's own neighbourhood.",
            "A unit test over every node and edge.",
          ),
          i(S6, "Environment files loaded after the site URL was read."),
          i(S6, "A stale overflow PDF survived a good build."),
          i(S6, "No predev hook rendered the resume."),
          i(S6, "Some strings bypassed the resume's font-run splitter."),
          i(
            S6,
            "A document exception was itself phone-shaped.",
            "Excepted pages still reject four phone shapes.",
          ),
          i(S6, "A NUL byte in the build log."),
          i(S6, "The site URL was not validated."),
          i(S6, "The resume's include flags were untested.", "Resume test assertions on them."),
          i(S6, "Typos in regular expressions."),
          i(
            S6,
            "Section headings were typed in the generator while AGENTS.md said no fact is typed.",
          ),
          i(S6, "The JSON-LD escape did nothing.", "A unit test of the escape."),
          i(
            S6,
            "A trailing slash on the site URL failed the build.",
            "Unit tests for the site URL.",
          ),
          i(S6, "The resume generator ignored the production environment file."),
          i(S6B, "Definitions were attributed to the literature review's sources."),
          i(SA, "An entry count was wrong."),
          i(SA, "A metric was sent to the wrong file."),
          i(SA, "A label that fits was listed as one that does not."),
          i(SA, "A change to Home's skills strip was called a reorder."),
          i(SA, "An acceptance item was too broad."),
          i(SA, '"Measured" covered one label, not two.'),
          i(S7, "The font spec skipped the 404 page.", "The font spec covers the 404."),
          i(S7, "The local Lighthouse script could orphan its server."),
          i(
            S7,
            "The served font family took the loader's const name, a reserved font name.",
            "A font test that fails on such a const.",
          ),
          i(S7, "The JS budget subtracted framework files the page did not load."),
          i(S7, "A content-visibility rule contradicted what shipped."),
          i(S7, "The plan called Session 7 shipped while it was in review."),
        ],
      },
      {
        id: "own-check",
        label: "The agent's own check",
        description:
          "Something the working agent did before committing: looked at a screenshot, measured, re-read a source or its own diff, or ran a scratch script.",
        items: [
          i(PR, "A find-and-replace swapped two headings and orphaned a prompt's body."),
          i(PR, 'Two cross-references said "above" for a note below.'),
          i(PS, "A draft run order dropped Sessions 6 and 7."),
          i(RF, "A PowerShell pipe's encoding blocked Unicode replacements."),
          i(RF, "A spelled-out metric put its source button inside a hyphenated word."),
          i(S0, "A resume revision introduced claims the sources do not support."),
          i(S0, "The same revision gave a leadership role the wrong start date."),
          i(S0, "A resume draft ran to three pages."),
          i(
            S0,
            "Two Session 4 tasks could not be done, and a third would have published an excluded page.",
          ),
          i(S0, "The pull request's description was stale."),
          i(S0D, "The hero deep link pinned nothing: its preset was the default."),
          i(S0E, "Setup let an import create a production deployment that cannot be deleted."),
          i(
            S0E,
            "A smoke test pushed an already-deployed commit, and a stale status read as a pass.",
          ),
          i(S0E, "Changing the framework preset silently reset the Ignored Build Step."),
          i(S0G, "Backslashes broke two replacement scripts."),
          i(S0G, "A CI step lost its printf escape."),
          i(S0G, "Subagents dated their redaction notes with the session's start date."),
          i(S0G, "A rewritten log sentence read backwards."),
          i(
            S0G,
            "The commit-message check would have failed the first public commit.",
            "Trailer addresses are blanked before the term check, with a test.",
          ),
          i(S1, "A directory change persisted across shell calls, and a write failed."),
          i(S1, "Prettier rewrapped the planning documents."),
          i(S1, "Prettier broke a block that had to stay verbatim."),
          i(S1, "The Contact page showed list bullets."),
          i(S1, "The contour ran behind the heading on mobile."),
          i(S2, "A perl substitution mangled a test file."),
          i(S2, "The hero failed the 30-second test."),
          i(S2, "The small-screen field was a crop again."),
          i(S2, "A tooltip used the wrong font."),
          i(S2, "A certificate issuer had no source."),
          i(S3A, '"Independent project" headed the capstone page.'),
          i(S3A, "A spelled-out count sat in prose, outside the claims gate."),
          i(
            S3B,
            "Two tests used a real repository's URL as their refusal case.",
            "A content test that every GitHub URL is exactly the cleared repository.",
          ),
          i(S3B, "A 16:10 poster cropped the app's banner."),
          i(S3B, "An element screenshot had the banner stitched in."),
          i(S3B, "Lazy images were blank in screenshots."),
          i(S4, "PowerShell wrote a byte-order mark."),
          i(S4, "Prose styles leaked into a diagram's list."),
          i(S4, "A chart's peak label collided."),
          i(S4, "Two thesis claims were drafted too strongly."),
          i(S5, "Constellation labels piled up."),
          i(S5, "A drafted amendment said there was no link field; there was."),
          i(S5, "A literal NUL byte served as a key separator."),
          i(S5, "The fix for it wrote the wrong text, twice."),
          i(S5, "A header comment named the wrong path."),
          i(S6, "The resume's page number never rendered."),
          i(S6, "A tool decoded escapes into a NUL byte."),
          i(S6, "The favicon came out black."),
          i(S6, "Heredocs were rejected."),
          i(S6, "The resume's provenance revision was stale."),
          i(S6B, "Two of three old label references were missed."),
          i(S6B, "Three sentences the literature review does not support."),
          i(S6B, "A module comment was false."),
          i(S6B, "A phrase was looser than the resume's wording."),
          i(S6B, "The review pass was narrower than asked."),
          i(S6B, "A heredoc failed, and a script assumed Python."),
          i(SA, "A label change was said to need no layout regeneration."),
          i(SA, "The headline was said to appear nowhere else."),
          i(SA, "Grid classes that do not exist were named, and two tests missed."),
          i(SA, "The new deep page was said to register nothing."),
          i(SA, "A heredoc hit a file-name length limit."),
          i(SA, "An inline script broke on an apostrophe."),
          i(S7, "Thesis chart labels ran together at 360 px.", "An end-to-end check at 360 px."),
          i(
            S7,
            "A video's title ran under its button at 360 px.",
            "An end-to-end check at 360 px.",
          ),
          i(S7, "A Lighthouse aggregation called median-run was not the median."),
          i(S7, "CI kept no Lighthouse reports."),
          i(S7, "The extras fonts sat after Inter in the stack."),
          i(
            S7,
            "content-visibility on the timeline nearly shipped, and broke anchor links.",
            "An anchor test in the explorer spec.",
          ),
          i(S7, "The plan still named the old font loader."),
        ],
      },
      {
        id: "unit-test",
        label: "A unit or component test",
        description: "A Vitest test other than the claims and privacy gates.",
        items: [
          i(S1, "The contour grid overshot the view box."),
          i(S3A, "A fallback waited for an iframe error event that never fires."),
          i(S3A, "A test fixture retyped research fields."),
          i(
            S3A,
            "Grid cards rendered only the tagline, so a ranking went unrendered while the claims gate passed.",
          ),
          i(S3B, "Heredocs halved the backslashes in a regular expression."),
          i(S4, "MDX expression attributes were silently dropped."),
          i(S4, "A matcher was used where it cannot match."),
          i(S5, "A slug equal to a research id broke a test."),
          i(S6, "The literature review PDF had no title."),
          i(S6, "The resume failed the orphan-object check, twice."),
          i(S6B, "A pairing was typed twice."),
          i(S6B, "The plan's task list was incomplete in three places."),
          i(S7, "The font test expected a name record the subsetter drops."),
        ],
      },
      {
        id: "e2e-test",
        label: "An end-to-end test",
        description: "A Playwright test against the production build, other than axe.",
        items: [
          i(RF, "Two concurrent Playwright runs shared one results folder."),
          i(S2, "A test tried to focus a heading."),
          i(S3A, "A locator counted nested list items."),
          i(S5, "A live region sat in the server-rendered fallback."),
          i(S5, "A pattern lost its backslash, and the screenshots timed out."),
          i(S5, 'A "flaky" tooltip test was smooth scrolling.'),
          i(S6, "A metadata test over every page timed out."),
          i(S6, "A PDF check counted page objects in raw bytes."),
          i(S6, "Pages below the root lost their Open Graph image."),
          i(S7, "The tooltip test's wait raced smooth scrolling."),
          i(S7, "A Lighthouse flakiness estimate was wrong within the hour."),
        ],
      },
      {
        id: "build",
        label: "The type checker or the build",
        description: "tsc, next build, the resume generator's page guard, or a failed deployment.",
        items: [
          i(S0E, "The first Vercel build ran with no framework preset."),
          i(S1, "Typecheck failed on a clean tree."),
          i(S2, "Heredoc writes never landed."),
          i(S2, "A Required<> type broke."),
          i(S3A, "__dirname pointed elsewhere under the bundler."),
          i(S3A, "A click handler sat in a server-rendered fallback."),
          i(S5, "Git Bash's path rewriting broke the build."),
          i(S6, "The resume overflowed to three pages, then four."),
          i(S6, "The PDF renderer could not be required by the script runner."),
        ],
      },
      {
        id: "privacy-gate",
        label: "The privacy or publication gate",
        description:
          "The phone pattern over every text file and shipped PDF, the staged-asset checks, and since S0-G the publication gate.",
        items: [
          i(RF, "Hex checksum digits matched the phone pattern."),
          i(S0G, "Heredocs halved the backslashes in the new gate's own tests."),
          i(S3B, "A staged revision broke the digest check.", "A test pins the revision format."),
          i(S5, "A random-number divisor matched the phone pattern."),
          i(S6, "A document exception was too narrow."),
          i(S6, "A log draft quoted a document identifier fragment."),
          i(S7, "A log draft held a CI run id, which is phone-shaped."),
        ],
      },
      {
        id: "claims-gate",
        label: "The claims gate",
        description: "The tests that every number is a sourced metric, present in its own text.",
        items: [
          i(S2, "About's no-digits check tripped on real names."),
          i(S2, "Thesis metrics were declared but never rendered."),
        ],
      },
      {
        id: "lint",
        label: "A lint rule",
        description: "ESLint, including the React Compiler rules.",
        items: [
          i(S1, "Two state updates inside effects."),
          i(S5, "A state update inside an effect."),
        ],
      },
      {
        id: "axe",
        label: "The axe check",
        description: "Axe over every page in both themes.",
        items: [i(S5, "Dimming entries by opacity failed contrast.")],
      },
      {
        id: "paige",
        label: "Paige",
        description:
          "Something Paige asked or noticed. Her review at merge is not written into the logs: only Session 1's log records her verdicts, so this group counts what the logs say, not what she caught.",
        items: [i(S5, "The README's status had not changed since Session 2.")],
      },
    ],
    quotes: [
      {
        log: S0D,
        text: "Verifying the number in a claim is not the same as verifying the sentence around it.",
      },
      {
        log: S3B,
        text: "The session's own aside link is a cleared-repository URL, so nothing shipped wrong; the gate was the defect.",
      },
      {
        log: S7,
        text: "Neither defect widened the page, so no existing check could see them; each has an e2e check that fails on the old markup.",
      },
    ],
    worked: [
      {
        text: "A review pass before most merges. It caught more than any other check, and most of the gates added because of a failure came out of one.",
        logs: [S1, S2, S3A, S5],
      },
      {
        text: "Looking at screenshots in the session. Layout defects that no check could see were found in the captures, then pinned with a test.",
        logs: [S1, S2, S7],
      },
      {
        text: "Generated files committed, with a --check in prebuild: a deploy runs no generator, and CI proves the bytes reproduce.",
        logs: [S5, S7],
      },
      {
        text: "Open questions written as ranked options with the evidence, so Paige's answer is a choice, not a re-investigation.",
        logs: [S1, S7],
      },
    ],
    didNot: [
      {
        text: "Checks that read text rather than the rendered page: the claims gate passed while a ranking went unrendered.",
        logs: [S2, S3A],
      },
      {
        text: "Shell heredocs and escapes on Windows: backslashes and bytes went missing in session after session.",
        logs: [S2, S3B, S5, S6, S0G],
      },
      {
        text: "Estimates from too little data: a number put on the Lighthouse gate's flakiness was wrong within the hour.",
        logs: [S7],
      },
    ],
  },

  gallery: [
    {
      asset: "images/build-story/s1-home.webp",
      screenshot: "docs/screenshots/s1-home-1280.png",
      crop: { top: 0, height: 800 },
      log: S1,
      caption:
        "Home after Session 1: the shell, the type and colour tokens and the contour motif, with content still to come.",
    },
    {
      asset: "images/build-story/s2-home.webp",
      screenshot: "docs/screenshots/s2-home-1280.png",
      crop: { top: 0, height: 800 },
      log: S2,
      caption:
        "Home after Session 2: the content model behind the hero and the first selected work.",
    },
    {
      asset: "images/build-story/s3a-projects.webp",
      screenshot: "docs/screenshots/s3a-projects-1280.png",
      crop: { top: 0, height: 800 },
      log: S3A,
      caption: "The projects index after Session 3a: case studies first, then a filterable grid.",
    },
    {
      asset: "images/build-story/s3b-stimmap3d.webp",
      screenshot: "docs/screenshots/s3b-projects-stimmap3d-1280.png",
      crop: { top: 0, height: 800 },
      log: S3B,
      caption:
        "The StimMap3D page after Session 3b: its disclaimer, then the poster of the click-to-load demo.",
    },
    {
      asset: "images/build-story/s5-experience.webp",
      screenshot: "docs/screenshots/s5-experience-1280.png",
      crop: { top: 300, height: 800 },
      log: S5,
      caption:
        "The skills constellation on Experience after Session 5, laid out once at build time.",
    },
    {
      asset: "images/build-story/s6b-home.webp",
      screenshot: "docs/screenshots/s6b-home-1280.png",
      crop: { top: 0, height: 800 },
      log: S6B,
      caption: "Home after Session 6b: the headline beside the constellation teaser.",
    },
  ],

  caseStudy: {
    projectSlug: "stimmap3d",
    intro:
      "The first project built this way, and the pattern this site follows. It has no session pack of its own: its repository's notes on AI-assisted development are the record.",
    disclaimerNote:
      "The project's own wording, which its card, case study, live demo, timeline entry, link preview and resume entry also carry.",
  },
};
