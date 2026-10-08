import type { Metadata } from "next";

import type { Education, Profile, Role } from "./content/schema";
import { absoluteUrl } from "./site";

/**
 * Per-route metadata helpers (DESIGN §5.5). Each page owns its title and description; this
 * adds the canonical URL (the bare path: filtered views such as /projects?tag= are the same
 * page). It deliberately sets nothing under `openGraph`: a child segment's `openGraph` object
 * replaces the parent's whole, which would drop the Open Graph image the root
 * app/opengraph-image.tsx provides to every page below it.
 */
export function canonical(path: string, meta: Metadata = {}): Metadata {
  return { ...meta, alternates: { ...meta.alternates, canonical: path } };
}

type PersonInput = {
  profile: Profile;
  currentRole: Role;
  education: Education;
  headshot: { path: string };
};

/**
 * JSON-LD as inline script text. JSON-LD is data, not code; every "<" becomes the JSON escape
 * \u003c (six characters, still the same string to a JSON parser), so no content value can
 * close the script element.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** schema.org Person for the home page, from content only. */
export function personJsonLd({ profile, currentRole, education, headshot }: PersonInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.positioning,
    email: `mailto:${profile.email}`,
    url: absoluteUrl("/"),
    image: absoluteUrl(`/${headshot.path}`),
    sameAs: [profile.links.github, profile.links.linkedin],
    worksFor: { "@type": "Organization", name: currentRole.org },
    alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
    homeLocation: { "@type": "Place", name: profile.location },
  };
}
