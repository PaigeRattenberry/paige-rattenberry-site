import type { ReactNode } from "react";

type CalloutProps = {
  /** Short heading, e.g. "Not for clinical use". */
  title?: string;
  children: ReactNode;
  /** "note" is neutral; "caution" is for disclaimers such as StimMap3D's. */
  tone?: "note" | "caution";
  className?: string;
};

/** Bordered aside with a left rule. Used for StimMap3D's non-clinical disclaimer (DESIGN §3.3). */
export function Callout({ title, children, tone = "note", className = "" }: CalloutProps) {
  return (
    <aside
      role={tone === "caution" ? "note" : undefined}
      className={[
        "bg-surface my-6 rounded-r-md border border-l-2 px-5 py-4 text-[0.95rem] leading-relaxed",
        tone === "caution" ? "border-line border-l-accent" : "border-line border-l-line-2",
        className,
      ].join(" ")}
    >
      {title ? <p className="text-ink mb-1 font-medium">{title}</p> : null}
      <div className="text-ink-2 [&_a]:link-accent">{children}</div>
    </aside>
  );
}
