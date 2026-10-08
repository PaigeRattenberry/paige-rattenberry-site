/**
 * Profile (DESIGN §3.1): name, positioning line, contact links, the "Currently" line and the
 * home-page skills strip. Facts are never hard-coded in components; they come from here,
 * each with a source. Validated by `ProfileSchema` in lib/content/schema.ts.
 */
import type { Profile } from "@/lib/content/schema";

export const profile = {
  name: "Paige Rattenberry",
  /** Short line used in the header and <title>. */
  role: "AI/ML systems engineer",
  /**
   * Paige's wording, decided 2026-09-20 (DESIGN §1 answer 1). Each clause restates a fact held
   * elsewhere in content/: the merge gates and the claim-to-source tracing are Hammerspace
   * bullets, the explanation question is the honours thesis, and the closing sentence is About's.
   * It also feeds the Open Graph card and the JSON-LD Person, so it stays under ~280 characters.
   */
  positioning:
    "I build the instruments that check what AI systems claim — evaluation harnesses that run as merge gates, retrieval that traces every claim back to its source, and research on whether a model's explanation points at the evidence. Mostly where being wrong has a real cost.",
  location: "Burnaby, BC, Canada",
  email: "paigerattenberry@gmail.com",
  links: {
    github: "https://github.com/PaigeRattenberry",
    linkedin: "https://www.linkedin.com/in/paige-rattenberry/",
  },
  headshot: "images/about/paige-rattenberry.jpg",
  currently: {
    text: "Currently at Hammerspace, on an internal knowledge platform: an MCP server under access-control filters, an agent loop with citation guardrails, and a scheduled audit job that opens its own remediation pull requests. Primary engineer across 300+ pull requests.",
    metrics: [
      {
        value: "300+",
        label: "pull requests as primary engineer on the Hammerspace knowledge platform",
        source: "_source/INVENTORY.md",
        note: "Confirmed by Paige on 2026-10-06; updated from the resume of 2026-09-11.",
      },
    ],
    source: "resume-2026",
  },
  /** Display only (not part of the skill graph): what the work is, not what it is written in. */
  skillsStrip: ["eval-harness", "grounding", "agent-loops", "mcp", "rag", "xai"],
  /**
   * The resume's opening paragraph: the resume of record's opening paragraph, with two Session 9
   * changes confirmed by Paige on 2026-10-06: 300+, and "internal" rather than "production".
   * Session 6 prints it at the top of the generated PDF; the site shows `positioning` instead.
   * Its one figure is a metric so the claims gate sees it.
   */
  summary: {
    text: "AI/ML Systems Engineer building the infrastructure that lets AI agents act reliably — MCP servers, agent loops with citation guardrails, LLM grounding and evaluation enforced as CI merge gates, and retrieval spanning BM25F search and retrieval-augmented generation (RAG). Full-stack across Python/FastAPI and TypeScript/Next.js; primary engineer across 300+ pull requests on an internal knowledge platform, with a background in safety-critical medical AI.",
    metrics: [
      {
        value: "300+",
        label: "pull requests as primary engineer on an internal knowledge platform",
        source: "_source/INVENTORY.md",
        note: "Confirmed by Paige on 2026-10-06; updated from the resume of 2026-09-11.",
      },
    ],
    source: "resume-2026",
  },
  builtWith: "Built with AI tools; what they got wrong, and which check caught it, is published.",
  sources: {
    role: "DESIGN.md §1",
    positioning:
      "DESIGN.md §1 answer 1 (Paige's wording, 2026-09-20); resume-2026 (Hammerspace bullets 1–2 and the thesis bullet); content/about.ts (the closing sentence)",
    email: "IMPLEMENTATION_PLAN.md §3 S0-B; _source/INVENTORY.md Notes",
    github: "DESIGN.md §0",
    linkedin: "_source/INVENTORY.md Notes",
    location: "_source/INVENTORY.md Notes",
    headshot: "_source/INVENTORY.md Files; content/assets.json",
    currently:
      "resume-2026 (the Hammerspace heading and the resume's three bullets, which name everything the line does); _source/INVENTORY.md (pull requests and 'internal', Paige, 2026-10-06)",
    skillsStrip:
      "resume-2026 Technical Skills; DESIGN.md §3.2 categories; order and membership from IMPLEMENTATION_PLAN.md §4 Session 6b task 1",
    summary:
      "resume-2026 (opening paragraph, page 1); _source/INVENTORY.md (pull requests and 'internal', Paige, 2026-10-06)",
    builtWith: "docs/build-log/ and content/build-story.ts (the synthesis)",
  },
} as const satisfies Profile;
