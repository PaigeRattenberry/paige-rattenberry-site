/**
 * Research data (DESIGN §2 /research; page arrives in Session 4). Summaries use
 * the resume of record's wording, except the literature review's, which Session 6b rewrote from
 * the review itself, the thesis's (credits the design's authors) and Stryker XAI's (softened
 * wording), the last two (Session 9, Paige 2026-10-06). The Rostrum / HealthTech
 * Connex work is one item with the combined range and the FAISAL Lab summer is its own item
 * (INVENTORY.md settled facts). `theme` is the /research group an item is listed under (DESIGN
 * §2, amended 2026-09-20).
 */
import type { ResearchItem } from "@/lib/content/schema";

const LIT_REVIEW = "_source/research/genai-interpretability-review-2024.pdf";

export const research = [
  {
    id: "honours-thesis",
    title: "Evaluation of Feature Attribution Methods in Interpretable Machine Learning",
    kind: "thesis",
    theme: "interpretability-evaluation",
    org: "SFU Engineering Science | Supervisor: Dr. Ivan V. Bajić (SFU Multimedia Lab)",
    dates: "Apr – Aug 2022",
    periods: [{ start: "2022-04", end: "2022-08" }],
    summary:
      "Applied Zhou et al.'s induced-ground-truth design (AAAI 2022) to chest X-rays: watermarked them, then used IoU and paired t-tests to measure how precisely five CAM methods localized the watermark; found FullGrad the most robust and precise, improved further by thresholding.",
    skills: ["pytorch", "xai", "medical-imaging", "cnns"],
    metrics: [
      {
        value: "five",
        label: "class activation map (CAM) explanation methods compared",
        source: "resume-2026",
      },
    ],
    projectSlug: "interpretable-medical-imaging-thesis",
    links: [
      {
        label: "Thesis PDF (approval page removed)",
        url: "/docs/paige-rattenberry-honours-thesis-2022.pdf",
      },
    ],
    resume: { include: false },
    source: "resume-2026",
  },
  {
    id: "spinal-curvature-capstone",
    title: "Adolescent Spinal Curvature Brace Optimization",
    kind: "capstone",
    theme: "medical-neural-ai",
    org: "SFU Engineering Capstone; Best Overall Project, ICAMES 2022",
    dates: "Jan – Aug 2022",
    periods: [{ start: "2022-01", end: "2022-08" }],
    summary:
      "A wearable pressure-sensing system (force-sensor array, noise-filtering firmware, real-time pressure heatmap on a CAD torso model) to guide orthopedic brace design, following medical-device software standards (IEC 62304).",
    skills: ["embedded"],
    metrics: [],
    projectSlug: "spinal-curvature-capstone",
    resume: { include: false },
    source: "resume-2026",
  },
  {
    id: "stryker-xai",
    title: "Explainable AI for surgical video analysis",
    kind: "industry",
    theme: "interpretability-evaluation",
    org: "Stryker R&D, Computer Vision",
    dates: "Sept 2021 – May 2022",
    periods: [{ start: "2021-09", end: "2022-05" }],
    summary:
      "Applied and evaluated explainable AI (XAI) techniques in PyTorch — including saliency mapping, feature attribution, and counterfactual reasoning — to improve model transparency and support surgeon decision-making.",
    skills: ["pytorch", "xai", "computer-vision"],
    metrics: [],
    roleId: "stryker",
    resume: { include: false },
    source: "resume-2026",
  },
  {
    id: "rostrum-healthtech-connex",
    title: "Researcher – Rostrum Medical Innovations & HealthTech Connex",
    kind: "research",
    theme: "medical-neural-ai",
    org: "Rostrum Medical Innovations Inc.; HealthTech Connex Inc. (BrainNet)",
    dates: "Aug 2020 – Apr 2021",
    periods: [{ start: "2020-08", end: "2021-04" }],
    summary:
      "Researched capnography classification and EEG-based disease detection with interpretable multimodal deep learning for explainable medical AI.",
    skills: ["signal-processing", "deep-learning", "xai"],
    metrics: [],
    resume: { include: true },
    source: "resume-2026",
  },
  {
    id: "sfu-faisal-lab",
    title: "Medical Imaging Research Assistant",
    kind: "research",
    theme: "medical-neural-ai",
    org: "SFU Functional & Anatomical Imaging & Shape Analysis (FAISAL) Lab",
    dates: "May – Aug 2018",
    periods: [{ start: "2018-05", end: "2018-08" }],
    summary:
      "Processed and analyzed CT scan data, applying segmentation correction techniques relevant to computer vision.",
    skills: ["medical-imaging", "segmentation"],
    metrics: [],
    resume: { include: true },
    source: "linkedin",
  },
  {
    id: "genai-literature-review",
    title: "Interpretability and Explainability in Generative AI",
    kind: "review",
    theme: "interpretability-evaluation",
    org: "Single-author literature review",
    dates: "Apr 2024",
    periods: [{ start: "2024-04", end: "2024-04" }],
    /**
     * Rewritten in Session 6b from the review itself (this string is also the card's proof and
     * the resume bullet). 14 is the length of its reference list, [1]–[14]; three of those are
     * surveys cited for context, so the text says "papers", never "studies" or "frameworks".
     */
    summary:
      "Reviewed what interpretability and explainability research offers against generative AI's failure modes (hallucination, misgeneralization, bias, prompt injection, deepfakes), drawing on 14 papers, from model-graded resilience scoring and causal-inference benchmarking to saliency-aware counterfactuals and rule extraction from reinforcement-learning agents. Concluded that no method was yet widely deployed, and that standardized interpretability metrics weighted by application domain are essential to deploying these systems with confidence.",
    skills: ["generative-ai", "xai"],
    metrics: [
      {
        value: "14",
        label: "papers in the literature review's reference list",
        source: LIT_REVIEW,
        note: "The reference list on the review's last two pages; some are surveys cited for context.",
      },
    ],
    /** Shipped whole in Session 6 (Paige, 2026-09-15); recorded in content/assets.json. */
    links: [
      {
        label: "Literature review PDF",
        url: "/docs/paige-rattenberry-genai-interpretability-review-2024.pdf",
      },
    ],
    resume: { include: false },
    source: LIT_REVIEW,
  },
  {
    id: "clinical-copilot",
    title: "Clinical CoPilot",
    kind: "hackathon",
    theme: "applied-llm-systems",
    org: "Microsoft Global AI Hackathon",
    dates: "Sep 2023",
    periods: [{ start: "2023-09", end: "2023-09" }],
    summary:
      "Built a retrieval-augmented generation (RAG) pipeline for a clinical LLM using Azure OpenAI and Semantic Kernel; ranked 16th/1,253 teams with an Executive Challenge honourable mention at Microsoft's Global AI Hackathon.",
    skills: ["rag", "azure-openai", "semantic-kernel"],
    metrics: [
      {
        value: "16th/1,253",
        label: "team ranking at Microsoft's Global AI Hackathon",
        source: "resume-2026",
        note: "Executive Challenge honourable mention (LinkedIn).",
      },
    ],
    resume: { include: false },
    source: "resume-2026",
  },
] as const satisfies readonly ResearchItem[];
