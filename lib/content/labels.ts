import type { Project, ProjectLink, ResearchItem } from "./schema";

/** Reader-facing names for the research `kind` enum (the /research kicker). */
export const RESEARCH_KIND_LABELS: Record<ResearchItem["kind"], string> = {
  thesis: "Honours thesis",
  capstone: "Capstone",
  research: "Research role",
  review: "Literature review",
  hackathon: "Hackathon",
  industry: "Industry research",
};

/**
 * Reader-facing headings for the research `theme` enum (the /research groups). Which theme an
 * item belongs to is a fact in content/research.ts; the display order is RESEARCH_THEME_IDS'.
 */
export const RESEARCH_THEME_LABELS: Record<ResearchItem["theme"], string> = {
  "interpretability-evaluation": "Interpretability and evaluation",
  "medical-neural-ai": "Medical and neural AI",
  "applied-llm-systems": "Applied LLM systems",
};

/** The link from a /research item to its page under /projects: a review is not a case study. */
export function deepPageLinkLabel(kind: ResearchItem["kind"]) {
  return kind === "review" ? "Read the summary" : "Read the case study";
}

/** Reader-facing names for the project `kind` enum. */
export const KIND_LABELS: Record<Project["kind"], string> = {
  project: "Project",
  research: "Research",
  coursework: "Coursework",
};

/** Reader-facing names for link kinds. */
export const LINK_LABELS: Record<ProjectLink["kind"], string> = {
  live: "Live app",
  repo: "Repository",
  pdf: "PDF",
  article: "Article",
  notebook: "Notebook",
};

/** The mono line above a project title: "Jun – Aug 2026, project". One definition for cards and pages. */
export function projectMeta(project: Pick<Project, "dates" | "kind">) {
  return `${project.dates}, ${KIND_LABELS[project.kind].toLowerCase()}`;
}
