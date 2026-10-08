import { skill } from "@/lib/content/load";

import { TagRow } from "./Tag";

type TagListProps = {
  /** Skill ids from the vocabulary; labels are looked up, never typed. */
  skills: readonly string[];
  label?: string;
  className?: string;
};

/** A row of skill chips resolved from the vocabulary (server only; islands use TagRow). */
export function TagList({ skills, label, className }: TagListProps) {
  return (
    <TagRow
      tags={skills.map((id) => ({ id, label: skill(id).label }))}
      label={label}
      className={className}
    />
  );
}
