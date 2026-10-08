import { chipClass } from "@/components/ui/FilterChips";

import { entriesText } from "./format";
import type { ConstellationEdge, ConstellationNode } from "./types";

type SkillListProps = {
  nodes: readonly ConstellationNode[];
  edges: readonly ConstellationEdge[];
  groups: readonly { id: string; label: string }[];
  active: string | null;
  onChoose?: (id: string | null) => void;
};

/**
 * The constellation as a list (DESIGN §7.2 "View as list"): every skill by category with its
 * entry count and how many other skills it was used alongside, as the same aria-pressed
 * buttons the graph's nodes are. Nothing here needs the picture.
 */
export function SkillList({ nodes, edges, groups, active, onChoose }: SkillListProps) {
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  return (
    <div className="skill-list" data-testid="skill-list">
      {groups.map((group) => {
        const members = nodes.filter((n) => n.category === group.id);
        if (members.length === 0) return null;
        return (
          <section key={group.id} aria-labelledby={`skill-list-${group.id}`}>
            <h3 id={`skill-list-${group.id}`} className="mono-label">
              {group.label}
            </h3>
            <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {members.map((n) => {
                const pressed = active === n.id;
                return (
                  <li key={n.id} className="flex flex-wrap items-baseline gap-x-2">
                    <button
                      type="button"
                      className={chipClass(pressed)}
                      aria-pressed={pressed}
                      onClick={onChoose ? () => onChoose(pressed ? null : n.id) : undefined}
                    >
                      {n.label}
                    </button>
                    <span className="mono-label">
                      {entriesText(n.count)}, {degree.get(n.id) ?? 0} linked skills
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
