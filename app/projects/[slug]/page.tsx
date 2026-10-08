import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { EmbedFrame } from "@/components/embed/EmbedFrame";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { Callout } from "@/components/ui/Callout";
import { Figure } from "@/components/ui/Figure";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";
import { projectMeta } from "@/lib/content/labels";
import { deepPageProjects, projectBySlug } from "@/lib/content/load";
import { renderMDX } from "@/lib/mdx";
import { canonical } from "@/lib/seo";

/** Only the deep-page slugs in content/projects/*.mdx exist; anything else is a build-time 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return deepPageProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return canonical(`/projects/${project.slug}`, {
    title: project.displayTitle ?? project.title,
    description: project.tagline,
  });
}

/**
 * A project deep page (DESIGN §2): official title and tagline, the disclaimer where one exists,
 * the MDX body in prose width, and a facts column. Every deep page has a body (the loader
 * refuses one without), and the body is all the page renders: its numbers are `<MetricStat>`
 * references into frontmatter.
 *
 * A project with an `embed` (StimMap3D, DESIGN §7.1) opens on a full-width row instead: the
 * disclaimer, then the click-to-load frame. The frame's poster is the cover, so the frame is
 * Fig. 1 and the cover is not drawn a second time; "Open full app" goes to the `live` link
 * (the loader guarantees both), and the disclaimer is repeated in the caption so it stays beside
 * the frame once the app has loaded over the poster. The prose column asks whether that row was
 * rendered, not whether an `embed` exists, so a project that somehow failed to render it still
 * gets its disclaimer and its cover rather than neither.
 */
export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project?.deepPage) notFound();
  const cover = project.coverAsset;
  const embed = project.embed;
  const live = project.links?.find((l) => l.kind === "live");
  const disclaimer = project.disclaimer ? (
    <Callout tone="caution" title={project.disclaimer} className="mt-0">
      This is {project.title}&apos;s own wording. It is shown wherever the project appears on this
      site.
    </Callout>
  ) : null;
  const body = await renderMDX(project.body, {
    where: `projects:${project.slug}`,
    metrics: project.metrics,
  });

  const embedRow =
    embed && cover && live ? (
      <div className="mb-2">
        {disclaimer}
        <EmbedFrame
          src={embed.src}
          href={live.url}
          title={embed.title}
          openLabel="Open full app"
          // Exactly the four fields the frame declares, never the whole manifest record: the
          // frame is a client island, so anything handed to it is serialized into the page
          // payload, and an asset carries its `_source/` staging path and its permission memo
          // (DESIGN §3.4 — the rule `metricViews()` keeps for source ids).
          poster={{ path: cover.path, alt: cover.alt, width: cover.width, height: cover.height }}
          posterSizes="(min-width: 1216px) 72rem, 100vw"
          number={1}
          loadedFrameClassName="aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/10]"
        >
          {project.disclaimer ? <strong>{project.disclaimer}. </strong> : null}
          {embed.note}
        </EmbedFrame>
      </div>
    ) : null;

  return (
    <>
      <PageHeader kicker={projectMeta(project)} title={project.title} lede={project.tagline} />
      <div className="max-w-content mx-auto px-5 pb-16 sm:px-8">
        {embedRow}
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-8">
          <div className="col-span-12 lg:col-span-8">
            {embedRow ? null : disclaimer}
            {cover && !embedRow ? (
              <Figure number={1} caption={cover.alt}>
                <Image
                  src={`/${cover.path}`}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  sizes="(min-width: 1024px) 48rem, 100vw"
                  loading="eager"
                />
              </Figure>
            ) : null}
            <Prose>{body}</Prose>
          </div>
          <aside
            aria-label="Project facts"
            className="col-span-12 lg:sticky lg:top-20 lg:col-span-4 lg:col-start-9 lg:self-start"
          >
            <ProjectFacts project={project} />
          </aside>
        </div>
      </div>
    </>
  );
}
