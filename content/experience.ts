/**
 * Work history (DESIGN §3.1). Titles, team names and dates verbatim from the resume of record
 * (`_source/resume/resume-2026-09-11.pdf`, "Technical Work Experience"); Session 9 (2026-10-06)
 * rewrote the Hammerspace bullets, extended SHIELD's second and softened Stryker's first two from
 * the LinkedIn snapshot of 2026-09-11 and Paige's dated entries in the inventory (each role's
 * `bulletSources` names which). The other bullets are verbatim too, including the em dashes the
 * docx carries inside bullets (pdftotext prints them as "--"). Where the resume heading reads "Title – Team", `title`
 * and `team` hold the two halves (DESIGN §0 gives the comma form for Hammerspace). Samsung
 * appears like every other role (INVENTORY.md settled facts). Skill tags are ids from
 * content/skills.ts, chosen from what each bullet names.
 */
import type { Role } from "@/lib/content/schema";

export const roles = [
  {
    id: "hammerspace",
    org: "Hammerspace",
    title: "Software Engineer",
    team: "Advanced Research Engineering",
    location: "Burnaby, BC (Remote)",
    dates: "May 2025 – Present",
    periods: [{ start: "2025-05", end: null }],
    bullets: [
      "Built grounding and evaluation infrastructure to make LLM output verifiable — deterministic checks and LLM-judge validation running as CI merge gates, a scheduled audit job opening its own remediation pull requests, and server-side access-control filtering with human review gating AI-authored content.",
      "Designed and built an internal knowledge platform end-to-end (Python/FastAPI, Next.js/TypeScript) — ingestion pipelines across multiple document and collaboration sources, an LLM synthesis workflow where every published claim traces back to an immutable source at fragment granularity, and a review, search & graph-exploration web app, front end included; demoed the platform to leadership; primary engineer across 300+ pull requests.",
      "Built the retrieval and conversational layer — an MCP server under access-control filters, BM25F search with query expansion, an offline retrieval evaluation harness over golden queries, and a streaming (SSE) chat service with an agent loop and citation guardrails on model output.",
      "Contributed to a multi-agent infrastructure-automation platform on the OpenAI Agents SDK (containerized agents, LLM-based routing between specialized agents, MCP tool integrations, guardrails and permissioning) and wrote concurrent LLM API workloads at volume; fine-tuned a 7B code-generation model (LoRA, CodeLlama-7B-Instruct, in PyTorch with Hugging Face PEFT), building its instruction dataset and a ~95-query evaluation suite with accuracy and latency logging, containerized for remote GPU inference.",
    ],
    skills: [
      "python",
      "fastapi",
      "typescript",
      "nextjs",
      "mcp",
      "agent-loops",
      "rag",
      "bm25f",
      "eval-harness",
      "ci-gated-validation",
      "grounding",
      "access-control",
      "lora",
      "pytorch",
      "docker",
      "openai-agents-sdk",
    ],
    metrics: [
      {
        value: "300+",
        label: "pull requests as primary engineer on the knowledge platform",
        source: "_source/INVENTORY.md",
        note: "Confirmed by Paige on 2026-10-06; updated from the resume of 2026-09-11.",
      },
      {
        value: "7B",
        label: "parameters in the fine-tuned code-generation model (CodeLlama-7B-Instruct, LoRA)",
        source: "resume-2026",
      },
      {
        value: "~95",
        label: "queries in the fine-tuned model's evaluation suite",
        source: "resume-2026",
      },
    ],
    source: "resume-2026",
    bulletSources: ["linkedin", "_source/INVENTORY.md"],
  },
  {
    id: "microsoft-shield",
    org: "Microsoft",
    title: "Software Engineer",
    team: "M365 Core Substrate SHIELD Security",
    location: "Redmond, WA, USA",
    dates: "Sept 2024 – Feb 2025",
    periods: [{ start: "2024-09", end: "2025-02" }],
    bullets: [
      "Engineered a security-focused anomaly detection & threat intelligence system using sequential log data, applying temporal pattern analysis to proactively detect & mitigate emerging cyber threats.",
      "Partnered with security & infrastructure teams to design and deploy automated, scalable models across live telemetry, translating asynchronous sequence data into actionable risk profiles; triaged and mitigated live security incidents on production services.",
    ],
    skills: ["anomaly-detection", "time-series", "mlops"],
    metrics: [],
    source: "resume-2026",
    bulletSources: ["linkedin"],
  },
  {
    id: "microsoft-azure-storage",
    org: "Microsoft",
    title: "Software Engineer",
    team: "Azure Cloud Storage Performance Infrastructure & Analytics",
    location: "Redmond, WA, USA",
    dates: "Nov 2022 – Sept 2024",
    periods: [{ start: "2022-11", end: "2024-09" }],
    bullets: [
      "Designed and developed AI-powered system diagnostics, optimizing large-scale, cloud-based retrieval and anomaly detection models for distributed AI systems.",
      "Built telemetry analytics pipelines in SQL & KQL and extended distributed C# monitoring across petabyte-scale Azure storage, using statistical analysis to find latency bottlenecks and cut storage access latency.",
    ],
    skills: ["anomaly-detection", "sql", "kql", "csharp", "azure"],
    metrics: [],
    source: "resume-2026",
  },
  {
    id: "stryker",
    org: "Stryker R&D",
    title: "Machine Learning Engineering Co-op",
    team: "Computer Vision",
    location: "Burnaby, BC",
    dates: "Sept 2021 – May 2022",
    periods: [{ start: "2021-09", end: "2022-05" }],
    bullets: [
      "Designed, trained, and evaluated CNN-based computer vision models in PyTorch for surgical video analysis, toward intra-operative complication prediction in complex, high-risk procedures.",
      "Applied and evaluated explainable AI (XAI) techniques in PyTorch — including saliency mapping, feature attribution, and counterfactual reasoning — to improve model transparency and support surgeon decision-making.",
      "Researched multimodal computer vision methods which integrate surgical video with structured clinical knowledge, to improve model robustness and interpretability in safety-critical, domain-specific settings.",
    ],
    skills: ["pytorch", "cnns", "computer-vision", "xai", "deep-learning"],
    metrics: [],
    source: "resume-2026",
    bulletSources: ["_source/INVENTORY.md"],
  },
  {
    id: "microsoft-intern",
    org: "Microsoft",
    title: "Software Engineering Intern & Explore Intern",
    team: "Microsoft Azure Cloud Storage",
    location: "Virtual & Redmond, WA",
    dates: "May – Jul 2021 & May – Aug 2019",
    periods: [
      { start: "2021-05", end: "2021-07" },
      { start: "2019-05", end: "2019-08" },
    ],
    bullets: [
      "Built low-overhead C++ latency-sampling tools and Python log-processing automation to tune Azure Cloud Storage performance (2021), and a modular performance-testing framework benchmarking the Azure .NET SDK (2019).",
    ],
    skills: ["cpp", "python", "azure"],
    metrics: [],
    source: "resume-2026",
  },
  {
    id: "samsung",
    org: "Samsung R&D Canada",
    title: "Product Management Co-op",
    location: "Vancouver, BC",
    dates: "Jan – Apr 2019",
    periods: [{ start: "2019-01", end: "2019-04" }],
    bullets: [
      "Researched AI/ML paradigms and emerging frameworks to inform Samsung's enterprise product strategy and roadmap planning.",
    ],
    skills: [],
    metrics: [],
    source: "resume-2026",
  },
] as const satisfies readonly Role[];
