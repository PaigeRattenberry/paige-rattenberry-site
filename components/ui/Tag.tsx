import type { ReactNode } from "react";

/** The two colour treatments: quiet, and the one accent reserved for an active filter (DESIGN §4.2). */
export function tagColours(active: boolean) {
  return active ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface-2 text-ink-2";
}

type TagProps = {
  children: ReactNode;
  /** The one accent, reserved for an active filter (DESIGN §4.2). */
  active?: boolean;
  className?: string;
};

/** Small mono label chip for skills, kinds and years. */
export function Tag({ children, active = false, className = "" }: TagProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.72rem] leading-[1.4] tabular-nums",
        tagColours(active),
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export type TagItem = { id: string; label: string };

/** A wrapped row of chips from resolved labels; pure, so client islands can use it. */
export function TagRow({
  tags,
  label = "Skills",
  className = "",
}: {
  tags: readonly TagItem[];
  label?: string;
  className?: string;
}) {
  if (tags.length === 0) return null;
  return (
    <ul className={["flex flex-wrap gap-1.5", className].join(" ")} aria-label={label}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <Tag>{tag.label}</Tag>
        </li>
      ))}
    </ul>
  );
}
