import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { readFilter } from "@/components/projects/ProjectGrid";
import { CardList, FilterChips } from "@/components/projects/ProjectGridParts";
import { otherProjects } from "@/lib/content/load";
import { filterGroups, toCard } from "@/lib/project-cards";

const cards = otherProjects.map(toCard);
const groups = filterGroups(cards);
const known = new Set(groups.flatMap((g) => g.tags.map((t) => t.id)));

describe("/projects filter", () => {
  it("reads a known tag from the query and ignores anything else", () => {
    expect(readFilter("?tag=rag", known)).toBe("rag");
    expect(readFilter("tag=rag&x=1", known)).toBe("rag");
    expect(readFilter("?tag=not-a-skill", known)).toBeNull();
    expect(readFilter("?tag=", known)).toBeNull();
    expect(readFilter("", known)).toBeNull();
  });

  it("offers a chip for every skill used by a grid card and nothing else", () => {
    const used = new Set(cards.flatMap((c) => c.tags.map((t) => t.id)));
    expect([...known].sort()).toEqual([...used].sort());
    render(<FilterChips groups={groups} active="rag" />);
    expect(screen.getByRole("button", { name: "All projects" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "RAG" })).toHaveAttribute("aria-pressed", "true");
  });

  it("hands the island public source labels only, never source ids", () => {
    for (const card of cards) {
      for (const metric of card.metrics) {
        expect(metric).not.toHaveProperty("source");
        expect(metric.sourceLabel).not.toMatch(/_source\//);
      }
    }
    expect(JSON.stringify(cards)).not.toContain("_source/");
  });

  it("renders every grid card without a deep-page link, with its metrics, tags and links", () => {
    render(<CardList projects={cards} />);
    const list = screen.getByRole("list", { name: "Projects" });
    expect(list.children).toHaveLength(cards.length);
    // Cards without a deep page are not links to themselves.
    expect(screen.queryByRole("link", { name: "MentalWell" })).toBeNull();
    expect(screen.getByRole("link", { name: "MentalWell notebook on Kaggle" })).toHaveAttribute(
      "href",
      "https://www.kaggle.com/code/paiger/mentalwell",
    );
    // Every declared metric on every card renders through MetricStat, tagline included.
    for (const card of cards) {
      for (const metric of card.metrics) {
        expect(
          screen.getByRole("button", { name: `Source for ${metric.value}: ${metric.label}` }),
        ).toBeInTheDocument();
      }
    }
  });
});
