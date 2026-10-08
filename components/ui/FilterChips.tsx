import { tagColours } from "./Tag";

export type FilterGroup = {
  id: string;
  label: string;
  tags: readonly { id: string; label: string }[];
};

/** A chip is a Tag-coloured button with a larger hit target. */
export function chipClass(active: boolean) {
  return [
    "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 font-mono text-[0.75rem] leading-[1.4] motion-safe:transition-colors motion-safe:duration-150",
    tagColours(active),
    active ? "" : "hover:border-line-2 hover:text-ink",
  ].join(" ");
}

type FilterChipsProps = {
  groups: readonly FilterGroup[];
  /** The chosen tag id, or null for "everything". */
  active: string | null;
  /** Omitted in a server-rendered fallback, where no handler may be attached. */
  onChoose?: (tag: string | null) => void;
  /** The clear chip's text, e.g. "All projects". */
  allLabel: string;
  /** Accessible name of the whole control, e.g. "Filter projects by skill". */
  label: string;
};

/**
 * A single-select chip row: real buttons with aria-pressed, grouped by skill category, and
 * the one accent on the active chip (DESIGN §4.2). Shared by the /projects grid and the
 * /experience explorer. Without `onChoose` (the server-rendered Suspense fallback) no handler
 * is attached at all, which a server component requires; the chips are inert until the
 * island hydrates and replaces them.
 */
export function FilterChips({ groups, active, onChoose, allLabel, label }: FilterChipsProps) {
  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <div>
        <button
          type="button"
          className={chipClass(active === null)}
          aria-pressed={active === null}
          onClick={onChoose ? () => onChoose(null) : undefined}
        >
          {allLabel}
        </button>
      </div>
      {groups.map((group) => (
        <div key={group.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="mono-label w-full sm:w-auto sm:min-w-[11rem]">{group.label}</span>
          <ul className="flex flex-wrap gap-1.5" aria-label={group.label}>
            {group.tags.map((tag) => {
              const pressed = active === tag.id;
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    className={chipClass(pressed)}
                    aria-pressed={pressed}
                    onClick={onChoose ? () => onChoose(pressed ? null : tag.id) : undefined}
                  >
                    {tag.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
