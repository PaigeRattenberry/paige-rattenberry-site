import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Explorer, readSkill, statusText } from "@/components/explorer/Explorer";
import { ExplorerView } from "@/components/explorer/ExplorerView";
import { skills } from "@/lib/content/load";
import { explorerData } from "@/lib/explorer/view";

const data = explorerData();
const known = new Set(data.nodes.map((n) => n.id));

// The island reads the URL through useSearchParams; the mock reads a fixed query when a test
// sets one, otherwise the document's location, which history.pushState updates.
let query = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query || window.location.search),
}));

const ragEntries = data.entries.filter((e) => e.tags.some((t) => t.id === "rag"));

function entryItems() {
  return screen.getByRole("list", { name: "Career timeline" }).querySelectorAll("[data-entry]");
}

describe("/experience explorer", () => {
  beforeEach(() => {
    query = "";
    window.history.replaceState(null, "", "/experience");
  });

  it("reads a known skill from the query and ignores anything else", () => {
    expect(readSkill("?skill=rag", known)).toBe("rag");
    expect(readSkill("skill=rag&x=1", known)).toBe("rag");
    expect(readSkill("?skill=not-a-skill", known)).toBeNull();
    // A skill in the vocabulary that no entry carries: the known set is the graph's nodes, not
    // the vocabulary. A fixture set without RAG keeps the case exercised whatever content tags.
    expect(skills.some((s) => s.id === "rag")).toBe(true);
    const withoutRag = new Set([...known].filter((id) => id !== "rag"));
    expect(readSkill("?skill=rag", withoutRag)).toBeNull();
    expect(readSkill("?skill=", known)).toBeNull();
    expect(readSkill("", known)).toBeNull();
  });

  it("highlights the entries that carry the skill in the URL and dims the rest", () => {
    query = "?skill=rag";
    render(<Explorer data={data} />);
    expect(screen.getByRole("button", { name: "RAG" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All work" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    const items = entryItems();
    expect(items).toHaveLength(data.entries.length);
    const matched = [...items].filter((li) => li.getAttribute("data-match") === "true");
    expect(matched.map((li) => li.getAttribute("data-entry")).sort()).toEqual(
      ragEntries.map((e) => e.id).sort(),
    );
    expect(matched.length).toBeGreaterThan(0);
    expect(matched.length).toBeLessThan(items.length);
    for (const li of items) {
      if (!matched.includes(li)) expect(li).toHaveAttribute("data-match", "false");
    }
    // The constellation node for the skill is pressed too.
    expect(screen.getByRole("button", { name: /^RAG, \d+ entries$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Nothing is announced until the visitor changes the filter.
    expect(screen.getByTestId("explorer-status")).toHaveTextContent("");
  });

  it("chips push the skill into the URL and announce the result count", () => {
    const push = vi.spyOn(window.history, "pushState");
    render(<Explorer data={data} />);
    for (const li of entryItems()) expect(li).toHaveAttribute("data-match", "none");

    fireEvent.click(screen.getByRole("button", { name: "PyTorch" }));
    expect(push).toHaveBeenLastCalledWith(null, "", "?skill=pytorch");
    expect(screen.getByTestId("explorer-status")).toHaveTextContent(statusText(data, "pytorch"));
    expect(statusText(data, "pytorch")).toMatch(
      new RegExp(`^\\d+ of ${data.entries.length} entries use PyTorch$`),
    );

    // A constellation node applies the same filter; the active node clears it.
    fireEvent.click(screen.getByRole("button", { name: /^RAG, / }));
    expect(push).toHaveBeenLastCalledWith(null, "", "?skill=rag");
    fireEvent.click(screen.getByRole("button", { name: "All work" }));
    expect(push).toHaveBeenLastCalledWith(null, "", "/experience");
    expect(statusText(data, null)).toBe(`All ${data.entries.length} entries`);
    push.mockRestore();
  });

  it("offers the list view as an equivalent of the graph, with the same pressed state", () => {
    query = "?skill=xai";
    render(<Explorer data={data} />);
    expect(screen.getByTestId("constellation")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View as list" }));
    expect(screen.queryByTestId("constellation")).toBeNull();
    const list = screen.getByTestId("skill-list");
    expect(list.querySelectorAll("button")).toHaveLength(data.nodes.length);
    const xai = within(list).getByRole("button", { name: "Interpretability (XAI)" });
    expect(xai).toHaveAttribute("aria-pressed", "true");
    // Every category with a used skill is a heading in the list.
    for (const group of data.groups) {
      expect(within(list).getByRole("heading", { name: group.label })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "Constellation" }));
    expect(screen.getByTestId("constellation")).toBeInTheDocument();
  });

  it("walks the constellation's nodes with the arrow keys from one tab stop", () => {
    render(<Explorer data={data} />);
    const svg = screen.getByRole("group", { name: /Skills constellation/ });
    const nodes = [...svg.querySelectorAll<SVGGElement>("[data-skill]")];
    expect(nodes).toHaveLength(data.nodes.length);
    const stops = nodes.filter((n) => n.getAttribute("tabindex") === "0");
    expect(stops).toHaveLength(1);
    // The initial stop is the most-used skill.
    const top = data.nodes.reduce((a, b) => (b.count > a.count ? b : a), data.nodes[0]);
    expect(stops[0]).toHaveAttribute("data-skill", top.id);
    const index = data.nodes.findIndex((n) => n.id === top.id);

    fireEvent.keyDown(stops[0], { key: "ArrowRight" });
    const next = data.nodes[(index + 1) % data.nodes.length].id;
    expect(svg.querySelector(`[data-skill="${next}"]`)).toHaveAttribute("tabindex", "0");
    expect(stops[0]).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(svg.querySelector(`[data-skill="${next}"]`)!, { key: "Home" });
    expect(svg.querySelector(`[data-skill="${data.nodes[0].id}"]`)).toHaveAttribute(
      "tabindex",
      "0",
    );

    const push = vi.spyOn(window.history, "pushState");
    fireEvent.keyDown(svg.querySelector(`[data-skill="${data.nodes[0].id}"]`)!, { key: "Enter" });
    expect(push).toHaveBeenLastCalledWith(null, "", `?skill=${data.nodes[0].id}`);
    push.mockRestore();
  });

  it("renders every entry with its tags and link in the server fallback, nothing pressed", () => {
    render(<ExplorerView data={data} active={null} view="graph" />);
    expect(screen.queryByTestId("explorer-status")).toBeNull();
    expect(screen.getByRole("button", { name: "All work" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    for (const e of data.entries) {
      const item = screen
        .getByRole("list", { name: "Career timeline" })
        .querySelector(`[data-entry="${e.id}"]`)!;
      expect(item).toHaveAttribute("data-match", "none");
      expect(within(item as HTMLElement).getByRole("link", { name: e.title })).toHaveAttribute(
        "href",
        e.href,
      );
      for (const t of e.tags) {
        expect(within(item as HTMLElement).getByText(t.label)).toBeInTheDocument();
      }
      // StimMap3D's disclaimer travels with it (gate c); no other entry shows one.
      const disclaimers = within(item as HTMLElement).queryAllByTestId("entry-disclaimer");
      expect(disclaimers.map((d) => d.textContent)).toEqual(e.disclaimer ? [e.disclaimer] : []);
      // Numbers in an entry's line render through MetricStat with a public source label.
      for (const m of e.lineMetrics) {
        expect(
          within(item as HTMLElement).getByRole("button", {
            name: `Source for ${m.value}: ${m.label}`,
          }),
        ).toBeInTheDocument();
      }
    }
    expect(screen.getAllByTestId("entry-disclaimer")).toHaveLength(1);
    expect(screen.getByTestId("entry-disclaimer")).toHaveTextContent(
      data.entries.find((e) => e.id === "stimmap3d")!.disclaimer!,
    );
    // Years head the groups, newest first.
    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent)
      .filter((t) => /^\d{4}$/.test(t ?? ""));
    expect(headings).toEqual([...headings].sort().reverse());
  });
});
