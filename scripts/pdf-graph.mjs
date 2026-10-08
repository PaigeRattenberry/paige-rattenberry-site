/**
 * The one walk over a pdf-lib document's object graph, shared by the PDF generators
 * (scripts/build-resume.tsx, scripts/derive-thesis-pdf.mjs, scripts/derive-literature-review-pdf.mjs)
 * and by the gate that checks their output (tests/unit/documents.test.ts): what the generators
 * delete and what the test accepts are decided by the same code.
 *
 * pdf-lib's save() writes every object it parsed, reachable or not, so a page removed with
 * removePage(), the info dictionary a producer left behind or a stray string stays in the file
 * unless it is deleted; any PDF object tool can still read it.
 */
import { PDFArray, PDFDict, PDFRef, PDFStream } from "pdf-lib";

/**
 * Visit every object reachable from the trailer's /Root and /Info.
 * @param {import("pdf-lib").PDFDocument} pdf
 * @param {(ref: PDFRef, holder: PDFRef | "trailer") => void} [visit] called for every reference
 *   met, with the object that holds it
 * @returns {Set<string>} keys ("12 0 R") of the reachable indirect objects
 */
export function reachableRefs(pdf, visit = () => {}) {
  const seen = new Set();
  /** @param {import("pdf-lib").PDFObject | undefined} obj @param {PDFRef | "trailer"} holder */
  const walk = (obj, holder) => {
    if (obj instanceof PDFRef) {
      visit(obj, holder);
      if (seen.has(obj.toString())) return;
      seen.add(obj.toString());
      walk(pdf.context.lookup(obj), obj);
    } else if (obj instanceof PDFDict) {
      for (const [, value] of obj.entries()) walk(value, holder);
    } else if (obj instanceof PDFStream) {
      walk(obj.dict, holder);
    } else if (obj instanceof PDFArray) {
      for (const value of obj.asArray()) walk(value, holder);
    }
  };
  walk(pdf.context.trailerInfo.Root, "trailer");
  if (pdf.context.trailerInfo.Info) walk(pdf.context.trailerInfo.Info, "trailer");
  return seen;
}

/**
 * Keys of every indirect object that nothing reachable points at.
 * @param {import("pdf-lib").PDFDocument} pdf
 * @returns {string[]}
 */
export function orphanRefs(pdf) {
  const seen = reachableRefs(pdf);
  return pdf.context
    .enumerateIndirectObjects()
    .map(([ref]) => ref.toString())
    .filter((key) => !seen.has(key));
}

/**
 * Delete every unreachable indirect object.
 * @param {import("pdf-lib").PDFDocument} pdf
 * @returns {string[]} one line per dropped object: its key and the start of its text
 */
export function collectGarbage(pdf) {
  const dropped = [];
  for (const [ref, obj] of pdf.context.enumerateIndirectObjects()) {
    if (!orphanRefs(pdf).includes(ref.toString())) continue;
    dropped.push(`${ref} (${obj.toString().replace(/\s+/g, " ").slice(0, 40)})`);
    pdf.context.delete(ref);
  }
  return dropped;
}

/**
 * Which reachable objects still hold a reference to any of the given keys.
 * @param {import("pdf-lib").PDFDocument} pdf
 * @param {Set<string>} keys
 * @returns {string[]} the holders, as "12 0 R" or "trailer"
 */
export function referencesTo(pdf, keys) {
  /** @type {string[]} */
  const holders = [];
  reachableRefs(pdf, (ref, holder) => {
    if (keys.has(ref.toString())) holders.push(String(holder));
  });
  return holders;
}
