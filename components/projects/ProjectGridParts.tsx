import { FilterChips as ChipRow, type FilterGroup } from "@/components/ui/FilterChips";

import { ProjectCard, type ProjectCardData } from "./ProjectCard";

export const FILTER_PARAM = "tag";

export type { FilterGroup };

/** The /projects chip row: the shared single-select chips with this page's wording. */
export function FilterChips({
  groups,
  active,
  onChoose,
}: {
  groups: readonly FilterGroup[];
  active: string | null;
  onChoose?: (tag: string | null) => void;
}) {
  return (
    <ChipRow
      groups={groups}
      active={active}
      onChoose={onChoose}
      allLabel="All projects"
      label="Filter projects by skill"
    />
  );
}

/** The card grid; shared by the island and its server-rendered fallback. */
export function CardList({ projects }: { projects: readonly ProjectCardData[] }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Projects">
      {projects.map((project) => (
        <li key={project.slug} id={project.slug} className="flex scroll-mt-20">
          <ProjectCard project={project} className="flex-1" />
        </li>
      ))}
    </ul>
  );
}
