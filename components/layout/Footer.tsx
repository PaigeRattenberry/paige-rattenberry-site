import Link from "next/link";

import { profile } from "@/lib/content/load";
import { formatDate, lastUpdated } from "@/lib/last-updated";

/** Site footer: contact links, the build-story link, and a last-updated stamp from git. */
export function Footer() {
  const updated = lastUpdated;
  return (
    <footer className="border-line mt-24 border-t">
      <div className="max-w-content mx-auto flex flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-ink text-lg">{profile.name}</p>
          <ul className="text-ink-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
            <li>
              <a className="link-quiet" href={`mailto:${profile.email}`}>
                Email
              </a>
            </li>
            <li>
              <a className="link-quiet" href={profile.links.linkedin} rel="me noopener">
                LinkedIn
              </a>
            </li>
            <li>
              <a className="link-quiet" href={profile.links.github} rel="me noopener">
                GitHub
              </a>
            </li>
            <li>
              {/* /resume redirects to the PDF (DESIGN §5.4): a plain anchor, not a route link. */}
              <a className="link-quiet" href="/resume">
                Resume
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <p className="text-ink-2 text-[0.95rem]">
            <Link className="link-accent" href="/how-this-was-built">
              How this site was built
            </Link>
          </p>
          <p className="mono-label" data-testid="last-updated" data-source={updated.source}>
            Updated <time dateTime={updated.iso}>{formatDate(updated.iso)}</time>
            {updated.sha ? ` · ${updated.sha}` : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
