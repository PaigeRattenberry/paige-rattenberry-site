/**
 * Education (DESIGN §3.1). Degree, dates and bullets verbatim from the resume of record;
 * honour-roll detail and the co-op award from the LinkedIn quotes in _source/INVENTORY.md.
 */
import type { Education } from "@/lib/content/schema";

export const education = {
  institution: "Simon Fraser University",
  degree: "Bachelor of Applied Science – Computer Engineering (Honours with Distinction)",
  location: "Burnaby, BC, Canada",
  dates: "Sept 2017 – Aug 2022",
  periods: [{ start: "2017-09", end: "2022-08" }],
  bullets: [
    "GPA: 3.89 (top 5%, Faculty of Applied Sciences) | President's & Dean's Honour Rolls | Dr. Abe Unrau Memorial Co-op Award",
    "Valedictorian (45:27) – selected to deliver the graduand address at the October 2022 convocation.",
    "Co-creator and speaker, SFU's “From Academia to Industry” podcast on internship and career guidance (Nov – Dec 2022).",
  ],
  honours: [
    {
      title: "President's Honour Roll",
      detail: "Fall 2019, Summer 2020, Fall 2020 (GPA 4.0+)",
      source: "linkedin",
    },
    { title: "Dean's Honour Roll", source: "linkedin" },
    { title: "Dr. Abe Unrau Memorial Co-op Award", source: "linkedin" },
    {
      title: "Valedictorian, October 2022 convocation",
      detail: "Selected to deliver the graduand address",
      source: "resume-2026",
    },
  ],
  metrics: [
    { value: "3.89", label: "cumulative GPA", source: "resume-2026" },
    {
      value: "5%",
      label: "top 5% of the SFU Faculty of Applied Sciences",
      source: "resume-2026",
      note: "Also on LinkedIn: “Ranked Top 5% in the SFU Faculty of Applied Sciences”.",
    },
    {
      value: "45:27",
      label: "where the graduand address starts in SFU's October 2022 convocation video",
      source: "_source/leadership/valedictorian-speech-2022.pdf",
    },
  ],
  source: "resume-2026",
} as const satisfies Education;
