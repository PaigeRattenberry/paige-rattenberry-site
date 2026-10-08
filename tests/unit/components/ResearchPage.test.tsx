import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ResearchPage from "@/app/research/page";
import { RESEARCH_THEME_LABELS } from "@/lib/content/labels";
import { leadership, research, researchByTheme } from "@/lib/content/load";

describe("/research", () => {
  it("renders every research item from content under its theme, newest first, with its kind", () => {
    render(<ResearchPage />);
    // DESIGN §2's three groups, in its order, then Reviewing.
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      ...researchByTheme.map((g) => RESEARCH_THEME_LABELS[g.theme]),
      "Reviewing",
    ]);
    expect(RESEARCH_THEME_LABELS[researchByTheme[0].theme]).toBe("Interpretability and evaluation");
    const rendered: string[] = [];
    for (const group of researchByTheme) {
      const list = screen.getByRole("list", { name: RESEARCH_THEME_LABELS[group.theme] });
      const titles = within(list)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent ?? "");
      expect(titles).toEqual(
        research
          .filter((r) => r.theme === group.theme)
          .sort((a, b) => b.periods[0].start.localeCompare(a.periods[0].start))
          .map((r) => r.title),
      );
      rendered.push(...titles);
    }
    // No item dropped, none listed twice.
    expect(rendered.sort()).toEqual(research.map((r) => r.title).sort());
    expect(screen.getByText("Honours thesis")).toBeInTheDocument();
    expect(screen.getByText("Capstone")).toBeInTheDocument();
  });

  it("links items with a deep page to it, and the thesis to its derived PDF", () => {
    render(<ResearchPage />);
    const thesis = research.find((r) => r.id === "honours-thesis")!;
    expect(screen.getByRole("link", { name: thesis.title })).toHaveAttribute(
      "href",
      `/projects/${thesis.projectSlug}`,
    );
    expect(screen.getAllByRole("link", { name: "Read the case study" })).toHaveLength(2);
    // The literature review has a page too, and a review is not called a case study.
    expect(screen.getByRole("link", { name: "Read the summary" })).toHaveAttribute(
      "href",
      "/projects/genai-literature-review",
    );
    expect(screen.getByRole("link", { name: /Thesis PDF/ })).toHaveAttribute(
      "href",
      "/docs/paige-rattenberry-honours-thesis-2022.pdf",
    );
  });

  it("renders every metric through MetricStat with a public source", () => {
    render(<ResearchPage />);
    for (const item of research) {
      for (const metric of item.metrics) {
        const button = screen.getByRole("button", {
          name: `Source for ${metric.value}: ${metric.label}`,
        });
        const tooltip = document.getElementById(button.getAttribute("aria-describedby")!)!;
        expect(tooltip).toHaveTextContent(/Source: /);
        expect(tooltip.textContent).not.toContain("_source/");
      }
    }
    expect(screen.getByRole("button", { name: /^Source for five:/ })).toBeInTheDocument();
  });

  it("lists conference reviewing from leadership.ts under its own heading, once", () => {
    render(<ResearchPage />);
    const mlads = leadership.find((l) => l.alsoResearch)!;
    const section = screen.getByRole("region", { name: "Reviewing" });
    expect(
      within(section).getByRole("heading", { level: 3, name: mlads.title }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(mlads.title)).toHaveLength(1);
  });
});
