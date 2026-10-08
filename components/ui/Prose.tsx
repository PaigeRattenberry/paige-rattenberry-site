import type { ReactNode } from "react";

/**
 * Long-form text container (DESIGN §4.4: prose width 42rem, ~68ch). Wraps MDX bodies and
 * styles their plain elements via descendant selectors in Tailwind arbitrary variants. Sits
 * inside whatever column the page gives it; the page owns the outer gutters.
 */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "text-ink max-w-prose text-[1.0625rem] leading-[1.7]",
        "[&_p]:my-5",
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h2]:text-2xl",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-20 [&_h3]:text-xl",
        "[&_a]:link-accent",
        "[&_a.heading-link]:text-ink [&_a.heading-link:hover]:text-accent [&_a.heading-link]:no-underline",
        "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6",
        "marker:text-ink-3 [&_li]:my-1.5 [&_li]:pl-1",
        "[&_blockquote]:border-accent [&_blockquote]:text-ink-2 [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-5",
        "[&_hr]:border-line [&_hr]:my-10",
        "[&_code]:bg-surface-2 [&_code]:rounded-sm [&_code]:px-1 [&_code]:py-0.5",
        "[&_pre]:border-line [&_pre]:bg-surface [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:p-4 [&_pre]:text-[0.875rem] [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_th]:border-line [&_td]:border-line [&_table]:my-6 [&_table]:w-full [&_table]:text-[0.95rem] [&_td]:border-b [&_td]:py-2 [&_td]:align-top [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_th]:font-medium",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
