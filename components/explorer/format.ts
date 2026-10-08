/** Plural-aware "3 entries" / "1 entry", for node labels, the list view and the caption. */
export function entriesText(count: number) {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}
