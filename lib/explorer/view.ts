/**
 * Server-side derivation of the plain data the explorer island renders (AGENTS.md: loaders
 * stay server-only, islands get serialisable data). Source ids become public labels here.
 */
import type { ExplorerData } from "@/components/explorer/types";
import { explorer } from "@/lib/content/explorer";
import { explorerLayout } from "@/lib/content/explorer-layout";
import { skill } from "@/lib/content/load";
import { metricViews } from "@/lib/content/sources";
import { skillGroups } from "@/lib/project-cards";

export function explorerData(): ExplorerData {
  const position = new Map(explorerLayout.nodes.map((n) => [n.id, n]));
  return {
    entries: explorer.entries.map((e) => ({
      id: e.id,
      kindLabel: e.kindLabel,
      title: e.title,
      ...(e.org ? { org: e.org } : {}),
      ...(e.team ? { team: e.team } : {}),
      dates: e.dates,
      year: e.year,
      line: e.line,
      lineMetrics: metricViews(e.lineMetrics),
      ...(e.disclaimer ? { disclaimer: e.disclaimer } : {}),
      tags: e.skills.map((id) => ({ id, label: skill(id).label })),
      href: e.href,
    })),
    groups: skillGroups(new Set(explorer.nodes.map((n) => n.id))),
    nodes: explorer.nodes.map((n) => {
      const p = position.get(n.id)!;
      return {
        id: n.id,
        label: n.label,
        category: n.category,
        count: n.count,
        x: p.x,
        y: p.y,
        labelAt: p.labelAt,
        ...(p.hubLabelAt ? { hubLabelAt: p.hubLabelAt } : {}),
      };
    }),
    edges: explorer.edges.map((e) => ({ ...e })),
    width: explorerLayout.width,
    height: explorerLayout.height,
  };
}
