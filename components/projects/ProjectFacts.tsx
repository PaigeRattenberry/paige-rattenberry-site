import Link from "next/link";

import { TagList } from "@/components/ui/TagList";
import { KIND_LABELS, LINK_LABELS } from "@/lib/content/labels";
import type { Project } from "@/lib/content/schema";

/**
 * The facts column of a deep page: dates, kind, skills, links, and the optional aside from
 * frontmatter (StimMap3D's "Built with Claude Code"). Session 3b adds the live and repository
 * links here by adding them to frontmatter, and the aside's own links (StimMap3D's workflow
 * document, pinned to a commit); nothing in this component is project-specific.
 * The page wraps this in the one `<aside>` landmark; the inner box is a labelled section.
 */
export function ProjectFacts({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <dl className="border-line divide-line text-ink divide-y border-y text-[0.95rem]">
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2.5">
          <dt className="mono-label">When</dt>
          <dd>{project.dates}</dd>
        </div>
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2.5">
          <dt className="mono-label">What</dt>
          <dd>{KIND_LABELS[project.kind]}</dd>
        </div>
        {project.skills.length > 0 ? (
          <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2.5">
            <dt className="mono-label">Skills</dt>
            <dd>
              <TagList skills={project.skills} />
            </dd>
          </div>
        ) : null}
        {project.links && project.links.length > 0 ? (
          <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 py-2.5">
            <dt className="mono-label">Links</dt>
            <dd>
              <ul className="space-y-1">
                {project.links.map((link) => (
                  <li key={link.url}>
                    <a className="link-accent" href={link.url}>
                      {link.label}
                    </a>
                    <span className="mono-label ml-2 inline">{LINK_LABELS[link.kind]}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      {project.aside ? (
        <section
          aria-labelledby={`aside-${project.slug}`}
          className="border-line bg-surface rounded-md border px-5 py-4"
        >
          <h2 id={`aside-${project.slug}`} className="text-lg">
            {project.aside.title}
          </h2>
          <div className="text-ink-2 mt-2 space-y-3 text-[0.95rem] leading-relaxed">
            {project.aside.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {project.aside.links?.map((link) => (
              <p key={link.url}>
                <a className="link-accent" href={link.url}>
                  {link.label}
                </a>
              </p>
            ))}
            <p>
              <Link className="link-accent" href="/how-this-was-built">
                How this site was built
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
