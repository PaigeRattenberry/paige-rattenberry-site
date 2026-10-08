import Link from "next/link";
import type { ReactNode } from "react";

import { type TagItem, TagRow } from "./Tag";

export type CardTag = TagItem;

type CardProps = {
  title: string;
  /** Where the whole card links; omit for a card that is a summary with no page of its own. */
  href?: string;
  /** One line under the title. */
  description?: ReactNode;
  /** Mono line above the title, e.g. a year or a kind. */
  meta?: string;
  /** Skill tags, already resolved to labels so the card can render inside a client island. */
  tags?: readonly CardTag[];
  /** Optional cover slot (an <Image>), rendered above the text. */
  cover?: ReactNode;
  className?: string;
};

/**
 * Project / research card: hairline border, no shadow, whole card is the link. Hover moves
 * the border to the accent (150 ms), nothing else moves. Takes no content dependencies, so the
 * /projects filter island can render it with plain data.
 */
export function Card({ title, href, description, meta, tags, cover, className = "" }: CardProps) {
  return (
    <article
      className={[
        "group border-line bg-surface ease-editorial relative flex flex-col rounded-md border transition-colors duration-150",
        href ? "focus-within:border-accent hover:border-accent" : "",
        className,
      ].join(" ")}
    >
      {cover ? (
        <div className="border-line overflow-hidden rounded-t-[calc(var(--radius-md)-1px)] border-b">
          {cover}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-5">
        {meta ? <p className="mono-label">{meta}</p> : null}
        <h3 className="text-xl">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {description ? (
          <p className="text-ink-2 text-[0.95rem] leading-relaxed">{description}</p>
        ) : null}
        {tags ? <TagRow tags={tags} label="Tags" className="mt-auto pt-3" /> : null}
      </div>
    </article>
  );
}
