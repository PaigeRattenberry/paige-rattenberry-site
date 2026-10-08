import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { profile } from "@/lib/content/load";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = canonical("/contact", {
  title: "Contact",
  description: "Email, LinkedIn and GitHub.",
});

const rows = [
  { term: "Email", href: `mailto:${profile.email}`, text: profile.email },
  {
    term: "LinkedIn",
    href: profile.links.linkedin,
    text: profile.links.linkedin.replace("https://www.", ""),
  },
  {
    term: "GitHub",
    href: profile.links.github,
    text: profile.links.github.replace("https://", ""),
  },
  { term: "Location", href: null, text: profile.location },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" lede="Email is the fastest way to reach me. No form, no phone." />
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <dl className="grid max-w-prose grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          {rows.map((row) => (
            <div key={row.term} className="contents">
              <dt className="mono-label self-center">{row.term}</dt>
              <dd className="text-ink">
                {row.href ? (
                  <a
                    className="link-accent"
                    href={row.href}
                    rel={row.href.startsWith("http") ? "me noopener" : undefined}
                  >
                    {row.text}
                  </a>
                ) : (
                  row.text
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
