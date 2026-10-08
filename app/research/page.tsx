import type { Metadata } from "next";
import Link from "next/link";

import { DatedEntry } from "@/components/ui/DatedEntry";
import { PageHeader } from "@/components/ui/PageHeader";
import { TagList } from "@/components/ui/TagList";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import {
  deepPageLinkLabel,
  RESEARCH_KIND_LABELS,
  RESEARCH_THEME_LABELS,
} from "@/lib/content/labels";
import { documentPath } from "@/lib/content/links";
import { deepPageForResearch, researchByTheme, researchReviewing } from "@/lib/content/load";
import { metricViews } from "@/lib/content/sources";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = canonical("/research", {
  title: "Research",
  description:
    "Research on whether a model's explanations can be trusted (an honours thesis, interpretability for surgical video, a literature review on generative AI), then medical and neural AI, applied LLM systems and conference reviewing.",
});

/**
 * Research (DESIGN §2): every item in content/research.ts, grouped by its
 * `theme` in DESIGN §2's order (the theme is a field on the item, the heading a label) and
 * newest first inside each group, with its kind, organisation, summary (numbers through
 * MetricStat), skills and links. An item with
 * a deep page links to it from its title; a PDF link is a site path resolved against
 * assets.json by the loader. Conference reviewing lives in content/leadership.ts and is listed
 * here too, without a second copy.
 */
export default function ResearchPage() {
  return (
    <>
      <PageHeader
        title="Research"
        lede="The research trail, grouped by theme and newest first inside each group. It starts with the question most of it shares: how do you check what a model tells you?"
      />

      {researchByTheme.map((group, i) => (
        <section
          key={group.theme}
          className={`max-w-content mx-auto px-5 sm:px-8 ${i > 0 ? "mt-16" : ""}`}
          aria-labelledby={group.theme}
        >
          <h2 id={group.theme} className="text-2xl">
            {RESEARCH_THEME_LABELS[group.theme]}
          </h2>
          <ol className="mt-4" aria-label={RESEARCH_THEME_LABELS[group.theme]}>
            {group.items.map((item) => {
              const project = deepPageForResearch(item);
              const href = project ? `/projects/${project.slug}` : undefined;
              return (
                <li key={item.id}>
                  <DatedEntry
                    id={item.id}
                    dates={item.dates}
                    org={item.org}
                    meta={RESEARCH_KIND_LABELS[item.kind]}
                    headingLevel={3}
                    heading={
                      href ? (
                        <Link href={href} className="link-quiet">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )
                    }
                  >
                    <p className="text-ink mt-4 max-w-prose leading-relaxed">
                      <TextWithMetrics text={item.summary} metrics={metricViews(item.metrics)} />
                    </p>
                    <TagList skills={item.skills} className="mt-5" />
                    {href || item.links?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                        {href ? (
                          <li>
                            <Link href={href} className="link-accent">
                              {deepPageLinkLabel(item.kind)}
                            </Link>
                          </li>
                        ) : null}
                        {item.links?.map((link) => (
                          <li key={link.url}>
                            <a className="link-accent" href={link.url}>
                              {link.label}
                            </a>
                            {documentPath(link.url) ? (
                              <span className="mono-label ml-2 inline">PDF</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </DatedEntry>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {researchReviewing.length > 0 ? (
        <section className="max-w-content mx-auto mt-16 px-5 sm:px-8" aria-labelledby="reviewing">
          <h2 id="reviewing" className="text-2xl">
            Reviewing
          </h2>
          <p className="text-ink-2 mt-2 max-w-prose text-[0.95rem] leading-relaxed">
            Conference work, also listed under{" "}
            <Link className="link-accent" href="/leadership">
              leadership
            </Link>
            .
          </p>
          <ol className="mt-4" aria-label="Reviewing">
            {researchReviewing.map((item) => (
              <li key={item.id}>
                <DatedEntry dates={item.dates} org={item.org} heading={item.title} headingLevel={3}>
                  <p className="text-ink mt-4 max-w-prose leading-relaxed">
                    <TextWithMetrics text={item.summary} metrics={metricViews(item.metrics)} />
                  </p>
                </DatedEntry>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}
