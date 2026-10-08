/**
 * Volunteer & leadership data (DESIGN §2 /leadership; page arrives in Session 4). Wording
 * from the resume of record's "AI Leadership & Research Contributions" and education bullets;
 * dates settled in _source/INVENTORY.md. The GIAC Advisory Board invitation is not an item
 * here: it stays in the GMLE line in certifications.ts, as on the resume (Paige, 2026-09-12).
 */
import type { LeadershipItem } from "@/lib/content/schema";

const SPEECH_PDF = "_source/leadership/valedictorian-speech-2022.pdf";

export const leadership = [
  {
    id: "ai-expert-panel",
    title: "Microsoft AI Expert Panel Q&A – Organizer & Host",
    org: "Microsoft",
    dates: "Jul 2024",
    periods: [{ start: "2024-07", end: "2024-07" }],
    summary:
      "Organized & hosted Microsoft's AI Expert Panel on LLM scaling, retrieval architectures, explainability, and responsible AI.",
    metrics: [],
    resume: { include: true },
    source: "resume-2026",
  },
  {
    id: "mlads",
    title: "MLADS Co-Area Chair & Proposal Reviewer",
    org: "Microsoft Machine Learning, AI & Data Science Conference",
    dates: "Jun 2024",
    periods: [{ start: "2024-06", end: "2024-06" }],
    summary:
      "As co-area chair & proposal reviewer for Microsoft's MLADS AI/ML conference, evaluated and selected talks and posters in forecasting, anomaly detection, and semi-supervised learning.",
    metrics: [],
    alsoResearch: true,
    resume: { include: true },
    source: "resume-2026",
  },
  {
    id: "aspire-leadership-council",
    title: "Microsoft Aspire Leadership Council Member | Azure Core Early-in-Career Pillar Lead",
    org: "Microsoft",
    dates: "Jul 2023 – Feb 2025",
    periods: [{ start: "2023-07", end: "2025-02" }],
    summary:
      "Served on Microsoft's Aspire Leadership Council, leading Azure Core's early-in-career pillar and mentoring early-career engineers.",
    metrics: [],
    resume: { include: true },
    source: "resume-2026",
  },
  {
    id: "academia-to-industry-podcast",
    title: "SFU “From Academia to Industry” podcast – Co-Creator & Speaker",
    org: "Simon Fraser University",
    dates: "Nov – Dec 2022",
    periods: [{ start: "2022-11", end: "2022-12" }],
    summary:
      "Co-creator and speaker, SFU's “From Academia to Industry” podcast on internship and career guidance.",
    metrics: [],
    resume: { include: false },
    source: "resume-2026",
  },
  {
    id: "valedictorian",
    title: "Valedictorian, SFU October 2022 convocation",
    org: "Simon Fraser University",
    dates: "Oct 2022",
    periods: [{ start: "2022-10", end: "2022-10" }],
    summary:
      "Selected to deliver the graduand address at the October 2022 convocation; the address starts at 45:27 in SFU's recording of the full ceremony.",
    metrics: [
      {
        value: "45:27",
        label: "where the graduand address starts in the convocation video",
        source: SPEECH_PDF,
      },
    ],
    links: [
      {
        label: "Watch the graduand address in SFU's convocation video",
        url: "https://www.youtube.com/watch?v=RKIO5EvDJ5Y&t=2727s",
        note: "SFU's recording of the full ceremony, opened at the address.",
      },
    ],
    resume: { include: false },
    source: "resume-2026",
  },
] as const satisfies readonly LeadershipItem[];
