import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CardList, FilterChips } from "@/components/projects/ProjectGridParts";
import { PageHeader } from "@/components/ui/PageHeader";
import { featuredProjects, otherProjects } from "@/lib/content/load";
import { filterGroups, toCard } from "@/lib/project-cards";
import { canonical } from "@/lib/seo";

const featured = featuredProjects.map(toCard);
const others = otherProjects.map(toCard);
const groups = filterGroups(others);

export const metadata: Metadata = canonical("/projects", {
  title: "Projects",
  description: `Case studies on ${featured.map((p) => p.title).join(", ")}, then every other project, filterable by skill.`,
});

/**
 * Projects index (DESIGN §2): the three featured case studies first, then the filterable grid.
 * The grid is a client island because the filter lives in the URL; its Suspense fallback is
 * the same chips and cards rendered on the server, so the content is in the HTML and a reader
 * without JavaScript still sees every project.
 */
export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        lede="Three case studies first. Below them, everything else I have built or researched, filterable by the skills it used."
      />
      <section className="max-w-content mx-auto px-5 sm:px-8" aria-labelledby="deep-pages">
        <h2 id="deep-pages" className="text-xl">
          Case studies
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Case studies">
          {featured.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} className="flex-1" compact />
            </li>
          ))}
        </ul>
      </section>

      <section
        className="border-line max-w-content mx-auto mt-14 border-t px-5 pt-8 pb-16 sm:px-8"
        aria-labelledby="everything-else"
      >
        <h2 id="everything-else" className="mb-5 text-xl">
          Everything else
        </h2>
        <Suspense
          fallback={
            <div>
              <FilterChips groups={groups} active={null} />
              <CardList projects={others} />
            </div>
          }
        >
          <ProjectGrid projects={others} groups={groups} />
        </Suspense>
      </section>
    </>
  );
}
