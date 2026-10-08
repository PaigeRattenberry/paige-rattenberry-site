/**
 * The DESIGN §3.4 phone check, in one place for every test that runs it: the generic
 * North-American shape, never the real number. It also matches SVG coordinate pairs, IoU
 * table rows and DOI fragments, which is why the text scan skips binaries and why the
 * document test carries reviewed, page-specific exceptions.
 */
export const PHONE_PATTERN = /\(?\d{3}\)?[ .-]*\d{3}[ .-]*\d{4}/;

/** Every match in a text, with the whitespace-delimited token the match starts in. */
export function phoneMatches(text: string): { match: string; token: string }[] {
  const pattern = new RegExp(PHONE_PATTERN.source, "g");
  const space = (ch: string | undefined) => ch === undefined || /\s/.test(ch);
  return [...text.matchAll(pattern)].map((m) => {
    const index = m.index ?? 0;
    let start = index;
    while (start > 0 && !space(text[start - 1])) start -= 1;
    let end = index + m[0].length;
    while (end < text.length && !space(text[end])) end += 1;
    return { match: m[0], token: text.slice(start, end) };
  });
}
