import type { Metadata } from "next";

import { EmbedFrame } from "@/components/embed/EmbedFrame";
import { DatedEntry } from "@/components/ui/DatedEntry";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import { leadershipNewestFirst } from "@/lib/content/load";
import { metricViews } from "@/lib/content/sources";
import { YOUTUBE_ALLOW, youtubeEmbed } from "@/lib/embeds";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = canonical("/leadership", {
  title: "Leadership",
  description:
    "Panels hosted, a leadership council, conference reviewing, a podcast and a valedictorian address, each with its dates and organisation.",
});

const items = leadershipNewestFirst;

/**
 * Volunteer & Leadership (DESIGN §2): every item in content/leadership.ts, newest first, with
 * its summary (numbers through MetricStat) and links. A YouTube watch link becomes a
 * click-to-load frame (Session 3a's EmbedFrame with the embed URL derived from the link), with
 * the watch URL, timestamp included, as the always-visible link; no poster, since a YouTube
 * thumbnail is not an assets.json asset. The page shows no photo.
 */
export default function LeadershipPage() {
  return (
    <>
      <PageHeader
        title="Volunteer and leadership"
        lede="Hosting, reviewing, mentoring and speaking, newest first. The constant underneath the engineering work is explaining it to people who did not build it."
      />

      <ol className="max-w-content mx-auto px-5 sm:px-8" aria-label="Leadership items">
        {items.map((item) => {
          const video = item.links
            ?.map((link) => ({ link, embed: youtubeEmbed(link.url) }))
            .find((x) => x.embed !== null);
          const otherLinks = item.links?.filter((link) => link !== video?.link) ?? [];
          return (
            <li key={item.id}>
              <DatedEntry id={item.id} dates={item.dates} org={item.org} heading={item.title}>
                <p className="text-ink mt-4 max-w-prose leading-relaxed">
                  <TextWithMetrics text={item.summary} metrics={metricViews(item.metrics)} />
                </p>
                {otherLinks.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
                    {otherLinks.map((link) => (
                      <li key={link.url}>
                        <a className="link-accent" href={link.url}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {video?.embed ? (
                  <EmbedFrame
                    src={video.embed.src}
                    href={video.link.url}
                    title={video.link.label}
                    loadLabel="Load the video"
                    openLabel="Watch on YouTube"
                    allow={YOUTUBE_ALLOW}
                    className="max-w-prose"
                  >
                    {video.link.note}
                  </EmbedFrame>
                ) : null}
              </DatedEntry>
            </li>
          );
        })}
      </ol>
    </>
  );
}
