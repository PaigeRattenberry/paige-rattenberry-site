import Link from "next/link";

import { ConstellationTeaser } from "@/components/explorer/ConstellationTeaser";
import { ContourField } from "@/components/hero/ContourField";
import { HERO_FIELDS, generateContours } from "@/components/hero/contour";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TagList } from "@/components/ui/TagList";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import { currentRole, education, featuredProjects, headshot, profile } from "@/lib/content/load";
import { metricViews } from "@/lib/content/sources";
import { canonical, jsonLdHtml, personJsonLd } from "@/lib/seo";
import { explorerData } from "@/lib/explorer/view";
import { toCard } from "@/lib/project-cards";

export const metadata = canonical("/");

const selected = featuredProjects.map(toCard);
// JSON-LD Person (DESIGN §5.5), from content only: name, role, email, links, the current
// employer, the alma mater and the headshot.
const jsonLd = personJsonLd({ profile, currentRole, education, headshot });
const currentlyMetrics = metricViews(profile.currently.metrics);
// The Session 5 skills constellation: the page's Fig. 1 beside the hero text from lg up.
const constellation = explorerData();

// Generated once at build time; rendered as static SVG. One landscape
// field for md and up, one short band composed for small screens (Session 1 review call 3).
const landscape = generateContours(HERO_FIELDS.landscape);
const band = generateContours(HERO_FIELDS.band);

const cta =
  "inline-flex items-center rounded-md px-4 py-2 text-[0.95rem] font-medium transition-colors duration-150";
const ctaQuiet = `${cta} border-line-2 text-ink hover:border-accent hover:text-accent border`;

/** Home: current engineering work and ways to explore it lead the page (DESIGN §1). */
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <section className="border-line border-b">
        <div className="max-w-content mx-auto px-5 sm:px-8">
          {/* Small screens: the band field sits above the name, never behind it. */}
          <div
            className="relative -mx-5 aspect-[640/140] overflow-hidden sm:-mx-8 md:hidden"
            aria-hidden="true"
          >
            <ContourField
              levels={band}
              width={HERO_FIELDS.band.width}
              height={HERO_FIELDS.band.height}
              className="h-full w-full [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]"
            />
          </div>

          <div className="relative">
            {/* md only: the landscape field sits to the right of the text; from lg the
                constellation takes that place (DESIGN §7.2) and the motif stays on small screens. */}
            <div
              className="pointer-events-none absolute inset-y-0 -right-8 left-0 hidden md:block lg:hidden"
              aria-hidden="true"
            >
              <ContourField
                levels={landscape}
                width={HERO_FIELDS.landscape.width}
                height={HERO_FIELDS.landscape.height}
                className="h-full w-full [mask-image:linear-gradient(to_right,transparent_38%,black_68%)]"
              />
            </div>
            <div className="relative grid grid-cols-12 pt-4 pb-7 md:gap-x-8 md:pt-9 md:pb-8">
              <div className="col-span-12 md:col-span-8 lg:col-span-7 lg:pr-4">
                <h1 className="text-5xl sm:text-6xl">{profile.name}</h1>
                <p className="text-ink mt-4 max-w-[38rem] text-[1.0625rem] leading-relaxed sm:text-lg">
                  {profile.positioning}
                </p>
                <p
                  className="text-ink-2 mt-4 max-w-prose text-[0.95rem] leading-relaxed"
                  data-testid="current-work"
                >
                  <TextWithMetrics text={profile.currently.text} metrics={currentlyMetrics} />{" "}
                  <Link className="link-accent" href={`/experience#${currentRole.id}`}>
                    Experience
                  </Link>
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/projects"
                    className={`${cta} bg-accent text-on-accent hover:bg-accent-2`}
                  >
                    Explore projects
                  </Link>
                  <a href={`mailto:${profile.email}`} className={ctaQuiet}>
                    Get in touch
                  </a>
                  <a
                    href="/resume"
                    className="link-quiet inline-flex min-h-10 items-center text-[0.95rem] underline"
                  >
                    Resume
                  </a>
                </div>
                <p className="text-ink-2 mt-4 text-[0.95rem]">
                  {profile.builtWith}{" "}
                  <Link className="link-accent" href="/how-this-was-built">
                    How this site was built
                  </Link>
                </p>
              </div>
              <ConstellationTeaser
                data={constellation}
                className="hidden lg:col-span-5 lg:block lg:self-center"
              />
            </div>
            <p className="mono-label hidden md:block md:pt-2 md:text-right lg:hidden">
              <span className="text-ink">Fig. 1</span> Iso-lines of a fixed scalar field, traced at
              build time. Static by design.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-content mx-auto px-5 pt-6 pb-7 sm:px-8" aria-labelledby="selected">
        <h2 id="selected" className="text-xl">
          Selected work
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          {selected.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} className="flex-1" compact />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-line max-w-content mx-auto border-t px-5 pt-6 pb-4 sm:px-8">
        <h2 className="text-xl">Skills</h2>
        <TagList skills={profile.skillsStrip} className="mt-2" />
        <p className="mono-label mt-2">
          <Link className="link-quiet underline" href="/experience">
            Every skill, by role, on the Experience page
          </Link>
        </p>
      </section>
    </>
  );
}
