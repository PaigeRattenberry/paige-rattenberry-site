import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { Explorer } from "@/components/explorer/Explorer";
import { ExplorerView } from "@/components/explorer/ExplorerView";
import { DatedEntry } from "@/components/ui/DatedEntry";
import { PageHeader } from "@/components/ui/PageHeader";
import { TagList } from "@/components/ui/TagList";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import { certifications, education, roles } from "@/lib/content/load";
import { assignMetrics } from "@/lib/content/metrics";
import type { Metric } from "@/lib/content/schema";
import { metricViews } from "@/lib/content/sources";
import { explorerData } from "@/lib/explorer/view";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = canonical("/experience", {
  title: "Experience",
  description:
    "A career timeline and skills explorer, then every role in resume wording with dates, bullets and skill tags.",
});

const data = explorerData();

type EntryProps = {
  id?: string;
  dates: string;
  org: string;
  location: string;
  heading: ReactNode;
  bullets: readonly string[];
  metrics: readonly Metric[];
  skills?: readonly string[];
  children?: ReactNode;
};

/** One role or the degree: the shared dated layout, with verbatim bullets on the right. */
function Entry({
  id,
  dates,
  org,
  location,
  heading,
  bullets,
  metrics,
  skills,
  children,
}: EntryProps) {
  const metricsByBullet = assignMetrics(bullets, metricViews(metrics));
  return (
    <DatedEntry id={id} dates={dates} org={org} meta={location} heading={heading} headingLevel={3}>
      <ul className="text-ink marker:text-ink-3 mt-4 max-w-prose list-disc space-y-3 pl-5 leading-relaxed">
        {bullets.map((bullet, i) => (
          <li key={i} className="pl-1">
            <TextWithMetrics text={bullet} metrics={metricsByBullet[i]} />
          </li>
        ))}
      </ul>
      {skills ? <TagList skills={skills} className="mt-5" /> : null}
      {children}
    </DatedEntry>
  );
}

/**
 * Experience (DESIGN §2, §7.2). The career timeline + skills explorer leads the page as its
 * Fig. 1: a client island reading `?skill=` inside a Suspense boundary whose fallback is the
 * same markup, unfiltered, prerendered on the server. Below it every role renders from
 * content/experience.ts: dates, organisation and location in the left column, title,
 * verbatim bullets (numbers through MetricStat) and skill tags on the right; entries are h3s
 * under their section's h2.
 */
export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        title="Experience"
        lede="Every role in the words of my resume, most recent first, with the skills each one used. The explorer above the list draws the same roles, projects and research as one timeline and one map of skills."
      />

      <section
        id="explorer"
        aria-labelledby="explorer-title"
        className="max-w-content mx-auto scroll-mt-20 px-5 sm:px-8"
      >
        <p className="mono-label">Fig. 1</p>
        <h2 id="explorer-title" className="mt-1 text-xl">
          Career timeline and skills explorer
        </h2>
        <p className="text-ink-2 mt-2 max-w-prose text-[0.95rem] leading-relaxed">
          Pick a skill to see where it was used. Each piece of work appears once, whether the
          resume, a project page or the research list describes it.
        </p>
        <div className="mt-6">
          <Suspense fallback={<ExplorerView data={data} active={null} view="graph" />}>
            <Explorer data={data} />
          </Suspense>
        </div>
      </section>

      <section
        className="render-when-near max-w-content mx-auto mt-16 px-5 sm:px-8"
        aria-labelledby="roles"
      >
        <h2 id="roles" className="scroll-mt-20 text-xl">
          Roles
        </h2>
        <ol className="mt-4" aria-label="Roles">
          {roles.map((role) => (
            <li key={role.id}>
              <Entry
                id={role.id}
                dates={role.dates}
                org={role.org}
                location={role.location}
                heading={
                  <>
                    {role.title}
                    {role.team ? <span className="text-ink-2">, {role.team}</span> : null}
                  </>
                }
                bullets={role.bullets}
                metrics={role.metrics}
                skills={role.skills}
              />
            </li>
          ))}
        </ol>
      </section>

      <section
        className="render-when-near max-w-content mx-auto mt-12 px-5 sm:px-8"
        aria-labelledby="education"
      >
        <h2 id="education" className="scroll-mt-20 text-xl">
          Education
        </h2>
        <div className="mt-4">
          <Entry
            dates={education.dates}
            org={education.institution}
            location={education.location}
            heading={education.degree}
            bullets={education.bullets}
            metrics={education.metrics}
          >
            <h4 className="mt-8 text-lg">Certifications</h4>
            <ul className="text-ink mt-3 max-w-prose space-y-3 leading-relaxed">
              {certifications.map((cert) => (
                <li key={cert.id}>
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-ink-2">, {cert.issuer}</span>
                  <span className="mono-label ml-2 inline">{cert.dates}</span>
                  {cert.detail ? (
                    <span className="text-ink-2 mt-0.5 block text-[0.95rem]">
                      <TextWithMetrics text={cert.detail} metrics={metricViews(cert.metrics)} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Entry>
        </div>
      </section>
    </>
  );
}
