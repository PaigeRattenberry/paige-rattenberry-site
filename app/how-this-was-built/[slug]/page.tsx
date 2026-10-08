import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";
import { buildLogBySlug, buildLogs, buildStory } from "@/lib/content/load";
import { renderMarkdown } from "@/lib/mdx";
import { canonical } from "@/lib/seo";

/** Only the files in docs/build-log/ exist; anything else is a build-time 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return buildLogs.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/how-this-was-built/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = buildLogBySlug(slug);
  if (!entry) return {};
  return canonical(`/how-this-was-built/${entry.slug}`, {
    title: `Build log: ${entry.title}`,
    description: `The build log "${entry.title}" (${entry.date}): ${buildStory.copy.logDescription}.`,
  });
}

/**
 * One build log (DESIGN §6), rendered as written: the file in docs/build-log/ is the record, so
 * the page adds only its header (title, and above it the date and pull request as plain text,
 * since the pre-launch repository is private) and the way back to the timeline. The body keeps
 * the log's whole date line, with its branch and any further dates. The loader leaves out an
 * empty "Paige's review notes" heading (Session 9b).
 */
export default async function BuildLogPage({ params }: PageProps<"/how-this-was-built/[slug]">) {
  const { slug } = await params;
  const entry = buildLogBySlug(slug);
  if (!entry) notFound();
  const body = await renderMarkdown(entry.body, {
    from: "docs/build-log",
    repository: buildStory.repository.url,
  });
  const index = buildLogs.indexOf(entry);
  const previous = buildLogs[index - 1];
  const next = buildLogs[index + 1];

  return (
    <>
      <PageHeader
        kicker={[entry.date, entry.pr ? `PR #${entry.pr}` : null].filter(Boolean).join(", ")}
        title={entry.title}
      >
        <p className="text-ink-2 mt-4 leading-relaxed [overflow-wrap:anywhere]">
          One entry of the build log, as committed in{" "}
          <code className="font-mono text-[0.9em]">docs/build-log/{entry.slug}.md</code>.{" "}
          <Link className="link-accent" href="/how-this-was-built#build-log">
            All entries
          </Link>
        </p>
      </PageHeader>
      <div className="max-w-content mx-auto px-5 sm:px-8">
        {/* Logs carry long paths, commands and tables. They wrap instead of scrolling: a
            scrolling region with nothing focusable inside fails axe at 360 px. */}
        <Prose className="[&_a]:[overflow-wrap:anywhere] [&_code]:[overflow-wrap:anywhere] [&_li>p]:my-1 [&_pre]:whitespace-pre-wrap [&_td]:pr-3 [&_td]:[overflow-wrap:anywhere] [&_th]:pr-3">
          {body}
        </Prose>
        <nav
          aria-label="Other build log entries"
          className="border-line mt-16 grid max-w-prose gap-4 border-t pt-6 sm:grid-cols-2"
        >
          {previous ? (
            <p>
              <span className="mono-label block">Earlier</span>
              <Link className="link-accent" href={`/how-this-was-built/${previous.slug}`}>
                {previous.title}
              </Link>
            </p>
          ) : (
            <span />
          )}
          {next ? (
            <p className="sm:text-right">
              <span className="mono-label block">Later</span>
              <Link className="link-accent" href={`/how-this-was-built/${next.slug}`}>
                {next.title}
              </Link>
            </p>
          ) : null}
        </nav>
      </div>
    </>
  );
}
