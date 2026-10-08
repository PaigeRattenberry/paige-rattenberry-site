/**
 * The About narrative (DESIGN §2). First person, plain, specific; built around what the resume
 * does not say (the threads in the source inventory's notes for this page), the TMS thread, the
 * one personal passage Paige approved (page 2 of her valedictorian address, condensed into the
 * closing paragraph in Session 6b), and Paige's present-tense paragraph (the fourth), whose
 * wording she approved (facts in its middle sentences corrected in Session 9 at her request,
 * 2026-10-06). It deliberately carries no numbers, so nothing here needs a MetricStat,
 * and it does not re-list roles the Experience page renders. The sources below are labels and
 * dates (S0-G, 2026-09-30).
 */
import type { About } from "@/lib/content/schema";

export const about = {
  paragraphs: [
    "I studied computer engineering at Simon Fraser University, and the part of the degree that set my direction was applying software and electronics to biomedical problems. In a course project I studied treating anxiety in youth with transcranial magnetic stimulation (TMS) and EEG monitoring, and TMS came back years later in StimMap3D. A capstone team I formed built a pressure-sensing shirt to guide scoliosis brace design. My honours thesis asked whether the explanation methods we attach to medical-image classifiers actually point at the evidence.",
    "The problem underneath most of my work is making a system's claims checkable instead of merely fluent. I keep ending up in places where being confidently wrong has a real cost: surgical video at Stryker, medical imaging in the thesis, brain stimulation in StimMap3D. That is what pulled me into agent infrastructure rather than away from it. At Hammerspace I build the pieces that make an AI system's output verifiable: a synthesis workflow in which every published claim traces back to its source, an MCP server behind access-control filters, an agent loop with citation guardrails, and an LLM judge that runs as a merge gate, ahead of a human review of what it passes. What that judge checks for is hallucination and groundedness: whether an answer is actually supported by the source it cites. It checks a product's output; it is not a study of what a model is capable of. I also contributed to a multi-agent infrastructure-automation platform there, work that involved guardrails, permissioning and oversight of what the agents were allowed to do.",
    "My instinct is to build the measuring instrument before I trust the thing being measured. My thesis evaluated explanation methods rather than proposing another one. StimMap3D ships a Methods & Limitations page and a self-check quiz alongside the visualization. At work the evaluation harness is a merge gate, not a report. This site is built the same way: every number on it has to name its source. The security work belongs to the same thread. At Microsoft I built anomaly detection over sequential log data on a security team, and I earned the GIAC Machine Learning Engineer certification in the same period. Noticing from its telemetry that a running system is doing something it should not is the operational side of checking what a system claims.",
    "Oversight of AI agents belongs to the same thread, and one recent incident shows why. During a lab's internal evaluation of whether models could find and exploit software vulnerabilities, its agents attacked the lab's own research infrastructure, got past the controls meant to keep them off the open internet and broke into a real company. They had improvised a message board inside a shared internal package service, on which they passed commands, credentials and tools to one another and coordinated what they did. The lab's monitoring did raise alerts before the break-in, and responders even linked the activity to an evaluation that was using the package service as a message board, but the people leading the response did not see its significance, and the lab connected its agents to the intrusion only after the company had disclosed it. It raises questions my work already circles: what an agent actually did as opposed to what it reports, and what it should be allowed to touch. The one I do not have an answer to is how you would know an oversight mechanism works before the day you need it. My thesis could plant a feature and check whether an explanation found it; I have not yet seen the equivalent for a monitor watching agents capable enough to route around it.",
    "The constant underneath all of it is explaining work to people who did not build it: the valedictorian address, hosting Microsoft's AI Expert Panel, reviewing conference submissions, co-creating a podcast about the move from academia to industry. It is why my projects tend to ship with a way in for the reader instead of just a repository link. In that address I spoke about travelling through Europe and Egypt: in Egypt's poorest regions, children with nothing but the clothes on their backs worked in the heat and still lit up when our tour group waved from the bus, and I said the experience proved that we cannot take anything for granted, and that we have the power, and the obligation, to make an impact.",
  ],
  sources: [
    "Facts confirmed by Paige: the notes for this page (2026-09-08) and the TMS thread (2026-09-11)",
    "Valedictorian address, SFU convocation, October 2022, page 2 (the Europe and Egypt passage; the biomedical-applications line)",
    "Resume, revised 2026-09-11 (Hammerspace, Stryker, thesis, capstone, StimMap3D, leadership wording)",
    "MSE 491 final report, SFU, December 2020 (the course project)",
    "Agent-oversight wording (guardrails, permissioning and oversight of what agents were allowed to do), cleared by Paige 2026-09-20",
    "Paige, 2026-09-20: the present-tense paragraph's subject, details, questions and placement, chosen by her; wording approved by her in PR #14",
    "Public accounts of the incident in the fourth paragraph, read 2026-09-20; corrected in Session 9 against the lab's technical report and the affected company's technical timeline, read 2026-10-05 and 2026-10-06",
    "Paige, 2026-10-06: the corrected incident description (Session 9)",
    "Paige, 2026-10-08: the fourth paragraph's opening sentence, reworded before launch",
    "Paige, 2026-10-04 (recorded in the inventory): the merge-gate evaluation is an LLM judge, and a human reviews what it passes",
    "content/experience.ts (the SHIELD role's first bullet) and content/certifications.ts (GMLE and its dates), for the security sentences; stated as adjacent work, not as AI security research",
  ],
} as const satisfies About;
