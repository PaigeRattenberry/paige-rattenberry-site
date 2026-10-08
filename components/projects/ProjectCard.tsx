import { Card, type CardTag } from "@/components/ui/Card";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import { assignMetrics } from "@/lib/content/metrics";
import type { ProjectLink } from "@/lib/content/schema";
import type { MetricView } from "@/lib/content/sources";

/**
 * Plain, serialisable card data: what the server derives from a project (skill labels and
 * source labels resolved, kind labelled) so the client-side filter island can render cards
 * without importing the content loaders or the source-label map.
 */
export type ProjectCardData = {
  slug: string;
  title: string;
  dates: string;
  kindLabel: string;
  /** One line under the title. */
  tagline: string;
  /** One sentence of substance. */
  proof: string;
  /** Every declared metric; each renders at its first occurrence in tagline, then proof. */
  metrics: readonly MetricView[];
  disclaimer?: string;
  tags: readonly CardTag[];
  /** Whether the card links to a deep page. */
  deepPage: boolean;
  /** External links, shown on cards that have no deep page to hold them. */
  links: readonly ProjectLink[];
};

type ProjectCardProps = {
  project: ProjectCardData;
  className?: string;
  /** Compact cards (home, case studies) show the proof only; grid cards add the tagline and tags. */
  compact?: boolean;
};

/** One project card; the whole card is the link when the project has a deep page. */
export function ProjectCard({ project, className = "", compact = false }: ProjectCardProps) {
  // Both lines go through MetricStat, so a number that only occurs in the tagline still
  // carries its source; compact cards search the proof alone.
  const [taglineMetrics, proofMetrics] = compact
    ? [[], assignMetrics([project.proof], project.metrics)[0]]
    : assignMetrics([project.tagline, project.proof], project.metrics);
  return (
    <Card
      href={project.deepPage ? `/projects/${project.slug}` : undefined}
      title={project.title}
      meta={compact ? project.dates : `${project.dates}, ${project.kindLabel.toLowerCase()}`}
      description={
        <>
          {compact ? null : (
            <span className="text-ink block">
              <TextWithMetrics text={project.tagline} metrics={taglineMetrics} />
            </span>
          )}
          <span className={compact ? "block" : "mt-2 block"}>
            <TextWithMetrics text={project.proof} metrics={proofMetrics} />
          </span>
          {project.disclaimer ? (
            <span className="mono-label mt-2 block">{project.disclaimer}</span>
          ) : null}
          {!project.deepPage && project.links.length > 0 ? (
            <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {project.links.map((link) => (
                <a key={link.url} className="link-accent text-[0.9rem]" href={link.url}>
                  {link.label}
                </a>
              ))}
            </span>
          ) : null}
        </>
      }
      tags={compact ? undefined : project.tags}
      className={className}
    />
  );
}
