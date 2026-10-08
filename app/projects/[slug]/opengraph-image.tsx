import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { projectMeta } from "@/lib/content/labels";
import { deepPageProjects, projectBySlug } from "@/lib/content/load";
import { OG_SIZE, OgCard } from "@/lib/og/card";
import { ogFonts } from "@/lib/og/fonts";

export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return deepPageProjects.map((p) => ({ slug: p.slug }));
}

/**
 * One card per deep page (DESIGN §5.5): the dates-and-kind kicker, the official title and
 * the tagline, with the disclaimer where the project has one (gate c). Session 3b sets
 * StimMap3D's `cover`, which this card does not use, so nothing changes for it then.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project?.deepPage) notFound();
  return new ImageResponse(
    <OgCard
      kicker={projectMeta(project)}
      title={project.title}
      description={project.tagline}
      footnote={project.disclaimer}
    />,
    { ...size, fonts: await ogFonts() },
  );
}
