import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConstellationSvg, neighbourhood } from "@/components/explorer/ConstellationSvg";
import { ConstellationTeaser } from "@/components/explorer/ConstellationTeaser";
import { groupByYear } from "@/components/explorer/Timeline";
import { deriveEntries, deriveGraph, explorer } from "@/lib/content/explorer";
import { explorerLayout } from "@/lib/content/explorer-layout";
import {
  education,
  leadership,
  newestFirst,
  projects,
  research,
  roles,
  skills,
} from "@/lib/content/load";
import { LAYOUT_BOX, nodeRadius } from "@/lib/explorer/geometry";
import { computeLayout, seededRandom } from "@/lib/explorer/layout";
import { explorerData } from "@/lib/explorer/view";

const ROOT = path.resolve(__dirname, "../..");

/** Every (kind, id) an entry was built from, flattened. */
const sourceKeys = explorer.entries.flatMap((e) => e.sources.map((s) => `${s.kind}:${s.id}`));

describe("explorer derivation (DESIGN §7.2, Session 5 amendment)", () => {
  it("makes one entry from every role, project and research item, plus the degree, and nothing else", () => {
    const expected = [
      "education:education",
      ...roles.map((r) => `role:${r.id}`),
      ...projects.map((p) => `project:${p.slug}`),
      ...research.map((r) => `research:${r.id}`),
    ].sort();
    expect([...sourceKeys].sort()).toEqual(expected);
    // No record is used twice, so no skill co-occurrence counts double.
    expect(new Set(sourceKeys).size).toBe(sourceKeys.length);
  });

  it("collapses each pair of records describing the same work into one entry", () => {
    const byId = new Map(explorer.entries.map((e) => [e.id, e]));
    // Two project slugs equal their research item's id, so check the kind, not just the id.
    const researchEntry = (id: string) =>
      explorer.entries.some((e) => e.kind === "research" && e.id === id);
    // A project with `researchId`: the research item folds into the project's entry.
    for (const p of projects.filter((p) => p.researchId)) {
      const entry = byId.get(p.slug)!;
      expect(entry.sources).toEqual([
        { kind: "project", id: p.slug },
        { kind: "research", id: p.researchId },
      ]);
      expect(researchEntry(p.researchId!)).toBe(false);
    }
    // A research item with `projectSlug`: it folds into the deep page's entry.
    for (const r of research.filter((r) => r.projectSlug)) {
      const entry = byId.get(r.projectSlug!)!;
      expect(entry.sources).toContainEqual({ kind: "research", id: r.id });
      expect(researchEntry(r.id)).toBe(false);
    }
    // Stryker: the research item names the role through `roleId`; one entry, from the role.
    const strykerItem = research.find((r) => r.id === "stryker-xai")!;
    expect(strykerItem.roleId).toBe("stryker");
    const stryker = byId.get("stryker")!;
    expect(stryker.kind).toBe("role");
    expect(stryker.title).toBe(roles.find((r) => r.id === "stryker")!.title);
    expect(stryker.sources).toEqual([
      { kind: "role", id: "stryker" },
      { kind: "research", id: "stryker-xai" },
    ]);
    expect(researchEntry("stryker-xai")).toBe(false);
    // The research item's skills stay on the single entry, so no co-occurrence is lost.
    for (const id of strykerItem.skills) expect(stryker.skills).toContain(id);
    // Every record once, minus one per pair (researchId, projectSlug, roleId).
    const pairs =
      projects.filter((p) => p.researchId).length +
      research.filter((r) => r.projectSlug).length +
      research.filter((r) => r.roleId).length;
    expect(pairs).toBe(6);
    // Every record once, plus the degree, minus one per pair.
    expect(explorer.entries).toHaveLength(
      roles.length + projects.length + research.length + 1 - pairs,
    );
    const degree = explorer.entries.find((e) => e.kind === "education")!;
    expect(degree.title).toBe(education.degree);
    expect(degree.org).toBe(education.institution);
    expect(degree.year).toBe(2017);
    expect(degree.skills).toEqual([]);
    expect(degree.href).toBe("/experience#education");
  });

  it("orders entries by periods, as newestFirst() does, not by the dates text", () => {
    const entries = deriveEntries();
    expect(entries.map((e) => e.id)).toEqual(newestFirst(entries).map((e) => e.id));
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].periods[0].start >= entries[i].periods[0].start).toBe(true);
    }
    // ml-cybersecurity's `dates` says "Dec 2024 – Feb 2025"; its period starts 2024-12.
    expect(entries.find((e) => e.id === "ml-cybersecurity")!.year).toBe(2024);
    for (const e of entries) expect(e.year).toBe(Number(e.periods[0].start.slice(0, 4)));
  });

  it("every research roleId and projectSlug names a real record, so a pair can never split", () => {
    for (const r of research) {
      if (r.roleId)
        expect(
          roles.some((x) => x.id === r.roleId),
          `research:${r.id}`,
        ).toBe(true);
      if (r.projectSlug) {
        expect(
          projects.some((p) => p.slug === r.projectSlug),
          `research:${r.id}`,
        ).toBe(true);
      }
    }
  });

  it("keeps conference reviewing (leadership data) out of the explorer", () => {
    for (const l of leadership) {
      expect(sourceKeys.some((k) => k.endsWith(`:${l.id}`))).toBe(false);
    }
  });

  it("takes each entry's title, line and skills from content, with skills in vocabulary order", () => {
    const order = new Map(skills.map((s, i) => [s.id, i]));
    for (const e of explorer.entries) {
      expect(new Set(e.skills).size).toBe(e.skills.length);
      for (let i = 1; i < e.skills.length; i++) {
        expect(order.get(e.skills[i - 1])!).toBeLessThan(order.get(e.skills[i])!);
      }
      for (const id of e.skills) expect(order.has(id), `${e.id}: ${id}`).toBe(true);
      for (const m of e.lineMetrics) expect(e.line).toContain(m.value);
    }
    const stimmap = explorer.entries.find((e) => e.id === "stimmap3d")!;
    expect(stimmap.href).toBe("/projects/stimmap3d");
    // Gate (c): the disclaimer travels with StimMap3D wherever it appears.
    const stimmapProject = projects.find((p) => p.slug === "stimmap3d")!;
    expect(stimmapProject.disclaimer).toBeTruthy();
    expect(stimmap.disclaimer).toBe(stimmapProject.disclaimer);
    for (const e of explorer.entries) {
      const project = projects.find((p) => p.slug === e.id && e.kind === "project");
      expect(e.disclaimer, e.id).toBe(project?.disclaimer);
    }
    expect([...stimmap.skills].sort()).toEqual(
      [...projects.find((p) => p.slug === "stimmap3d")!.skills].sort(),
    );
    // A card-only project links into the grid; a role into its section; research into /research.
    expect(explorer.entries.find((e) => e.id === "mentalwell")!.href).toBe("/projects#mentalwell");
    expect(explorer.entries.find((e) => e.id === "hammerspace")!.href).toBe(
      "/experience#hammerspace",
    );
    expect(explorer.entries.find((e) => e.id === "sfu-faisal-lab")!.href).toBe(
      "/research#sfu-faisal-lab",
    );
  });

  it("counts nodes and weights edges from the entries, symmetrically and once per pair", () => {
    const { nodes, edges } = explorer;
    expect(nodes.length).toBeGreaterThan(0);
    for (const n of nodes) {
      expect(n.count).toBe(explorer.entries.filter((e) => e.skills.includes(n.id)).length);
      expect(n.count).toBeGreaterThan(0);
    }
    const ids = new Set(nodes.map((n) => n.id));
    const seen = new Set<string>();
    for (const e of edges) {
      expect(ids.has(e.source)).toBe(true);
      expect(ids.has(e.target)).toBe(true);
      expect(e.source).not.toBe(e.target);
      // Unordered: the reverse pair never appears.
      expect(seen.has(`${e.target}|${e.source}`)).toBe(false);
      seen.add(`${e.source}|${e.target}`);
      expect(e.weight).toBe(
        explorer.entries.filter((x) => x.skills.includes(e.source) && x.skills.includes(e.target))
          .length,
      );
    }
    // Neighbourhoods are symmetric: if a is near b, b is near a.
    for (const n of nodes) {
      for (const other of neighbourhood(n.id, edges)) {
        expect(neighbourhood(other, edges).has(n.id)).toBe(true);
      }
    }
    // Skills nobody used are not nodes; every used skill is.
    const used = new Set(explorer.entries.flatMap((e) => e.skills));
    expect([...ids].sort()).toEqual([...used].sort());
  });

  it("is a pure function of the entries", () => {
    expect(deriveGraph(deriveEntries())).toEqual(explorer);
  });
});

describe("explorer layout (scripts/layout-explorer.ts)", () => {
  it("the committed JSON equals a fresh deterministic run", () => {
    const committed = JSON.parse(
      readFileSync(path.join(ROOT, "content/generated/explorer-layout.json"), "utf8"),
    );
    const installed = JSON.parse(
      readFileSync(path.join(ROOT, "node_modules/d3-force/package.json"), "utf8"),
    ) as { version: string };
    const fresh = computeLayout(explorer, installed.version);
    expect(committed).toEqual(fresh);
    expect(computeLayout(explorer, installed.version)).toEqual(fresh);
  });

  it("positions exactly the vocabulary's used skills, inside the box", () => {
    expect(explorerLayout.nodes.map((n) => n.id).sort()).toEqual(
      explorer.nodes.map((n) => n.id).sort(),
    );
    for (const n of explorerLayout.nodes) {
      const r = nodeRadius(explorer.nodes.find((x) => x.id === n.id)!.count);
      expect(n.x - r).toBeGreaterThanOrEqual(LAYOUT_BOX.padding - 0.1);
      expect(n.x + r).toBeLessThanOrEqual(LAYOUT_BOX.width - LAYOUT_BOX.padding + 0.1);
      expect(n.y - r).toBeGreaterThanOrEqual(LAYOUT_BOX.padding - 0.1);
      expect(n.y + r).toBeLessThanOrEqual(LAYOUT_BOX.height - LAYOUT_BOX.padding + 0.1);
    }
    expect(explorerLayout.width).toBe(LAYOUT_BOX.width);
    expect(explorerLayout.height).toBe(LAYOUT_BOX.height);
    // Every always-shown label (multi-entry skills) found a clear spot, and every hub's
    // teaser-size label too; only hubs carry one.
    for (const n of explorer.nodes) {
      const laid = explorerLayout.nodes.find((x) => x.id === n.id)!;
      if (n.count > 1) expect(laid.labelAt.fit, n.id).toBe(true);
      expect(laid.hubLabelAt !== undefined, n.id).toBe(n.count > 2);
      if (laid.hubLabelAt) expect(laid.hubLabelAt.fit, n.id).toBe(true);
    }
  });

  it("uses a seeded generator that repeats", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe("explorer view data (lib/explorer/view.ts)", () => {
  const data = explorerData();

  it("the home teaser's markup stays small enough to ship twice (HTML and RSC)", () => {
    // The static SVG rides in the home HTML and again in its RSC payload, like the contour motif
    // (whose path data is capped at 6.5 KB). Compact markup keeps the teaser under 16 KB raw
    // (about 10 KB since Session 9 drew its edges as one path per stroke width); a content
    // change that adds skills shows up here first.
    const html = renderToStaticMarkup(<ConstellationTeaser data={data} />);
    expect(html.length).toBeLessThan(16 * 1024);
    expect(html).not.toContain("data-skill");
    expect(html).not.toContain("constellation-hit");
    // Every edge, as one move-and-line pair inside a path per stroke width.
    expect(html).not.toContain("<line ");
    expect([...html.matchAll(/M[\d.]+ [\d.]+L/g)]).toHaveLength(data.edges.length);
    // Hub labels only, at their own placement.
    const labels = [...html.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
    expect(labels.sort()).toEqual(
      data.nodes
        .filter((n) => n.count > 2)
        .map((n) => n.label)
        .sort(),
    );
  });

  it("hover or focus lights its own neighbourhood beside the filter's while a filter is on", () => {
    const html = renderToStaticMarkup(
      <ConstellationSvg
        nodes={data.nodes}
        edges={data.edges}
        width={data.width}
        height={data.height}
        active="rag"
        focus="pytorch"
      />,
    );
    const ofRag = neighbourhood("rag", data.edges);
    const ofPytorch = neighbourhood("pytorch", data.edges);
    // The case under test: the filter has neighbours the hovered node does not share.
    expect([...ofRag].some((id) => !ofPytorch.has(id))).toBe(true);
    for (const n of data.nodes) {
      const state =
        n.id === "rag" ? "active" : ofRag.has(n.id) || ofPytorch.has(n.id) ? "near" : "dim";
      expect(html, n.id).toMatch(new RegExp(`data-state="${state}"[^>]*data-skill="${n.id}"`));
    }
    // Edges touching the filter or the hovered node stay lit; the rest dim.
    const lines = [...html.matchAll(/<line data-state="(\w+)"/g)].map((m) => m[1]);
    expect(lines).toEqual(
      data.edges.map((e) =>
        [e.source, e.target].some((id) => id === "rag" || id === "pytorch") ? "lit" : "dim",
      ),
    );
  });

  it("hands the island every entry, used skill and edge with labels resolved", () => {
    expect(data.entries.map((e) => e.id)).toEqual(explorer.entries.map((e) => e.id));
    expect(data.nodes.map((n) => n.id)).toEqual(explorer.nodes.map((n) => n.id));
    expect(data.edges).toEqual(explorer.edges);
    const chips = data.groups.flatMap((g) => g.tags.map((t) => t.id)).sort();
    expect(chips).toEqual(explorer.nodes.map((n) => n.id).sort());
    for (const e of data.entries) {
      for (const t of e.tags) expect(t.label).toBe(skills.find((s) => s.id === t.id)!.label);
    }
  });

  it("carries public source labels only, never source ids", () => {
    for (const e of data.entries) {
      for (const m of e.lineMetrics) {
        expect(m).not.toHaveProperty("source");
        expect(m.sourceLabel).not.toMatch(/_source\//);
      }
    }
    expect(JSON.stringify(data)).not.toContain("_source/");
  });

  it("groups the timeline by year, newest first, covering every entry once", () => {
    const groups = groupByYear(data.entries);
    const years = groups.map(([y]) => y);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    expect(groups.flatMap(([, g]) => g.map((e) => e.id))).toEqual(data.entries.map((e) => e.id));
    // DESIGN §7.2: 2017 (the degree) to the present.
    expect(years[0]).toBeGreaterThanOrEqual(2025);
    expect(years[years.length - 1]).toBe(2017);
  });
});
