import type { Metadata } from "next";
import Image from "next/image";

import { PageHeader } from "@/components/ui/PageHeader";
import { about, headshot } from "@/lib/content/load";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = canonical("/about", {
  title: "About",
  description:
    "Why the work keeps returning to making a system's claims checkable: from biomedical engineering and an interpretability thesis to evaluation and grounding for AI agents.",
});

/**
 * About (DESIGN §2): five first-person paragraphs from content/about.ts beside the headshot. The
 * narrative names StimMap3D in passing without presenting it, so it carries no disclaimer callout
 * (gate (c), narrowed 2026-09-21 at Paige's request).
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader title="About" />
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
          <div className="order-first col-span-12 md:order-last md:col-span-4 md:col-start-9">
            <Image
              src={`/${headshot.path}`}
              alt={headshot.alt}
              width={headshot.width}
              height={headshot.height}
              sizes="220px"
              loading="eager"
              className="border-line w-[180px] rounded-md border md:w-[220px]"
            />
          </div>
          <div className="text-ink col-span-12 max-w-prose space-y-5 text-[1.0625rem] leading-[1.7] md:col-span-8">
            {about.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
