/**
 * Copy the GenAI literature review from the staged original into public/docs/ (IMPLEMENTATION_PLAN
 * §4 Session 6, 2026-09-15 amendment): Paige's own work, no other people in it, nothing to
 * remove, so it ships whole. Run once from the repo root and commit only the output;
 * content/assets.json records it with the original's hash and removedPages: [].
 *
 *   node scripts/derive-literature-review-pdf.mjs
 *
 * The one change is metadata: the Word export carries no /Title, and every shipped document
 * needs one (tests/unit/documents.test.ts), so the title page's title is written into the info
 * dictionary. The modification date is fixed so re-running reproduces the committed bytes.
 * Pages, text and images are untouched; the test checks the page sizes and labels against the
 * staged original and that no object outside the page tree survives. The original carries one
 * such object, an empty /Names dictionary nothing points at (Word's export left it behind), so
 * the shared sweep in scripts/pdf-graph.mjs deletes anything unreachable from the trailer.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";

import { collectGarbage } from "./pdf-graph.mjs";

const SOURCE = "_source/research/genai-interpretability-review-2024.pdf";
const OUTPUT = "public/docs/paige-rattenberry-genai-interpretability-review-2024.pdf";
const TITLE =
  "Interpretability and Explainability in Generative Artificial Intelligence: Literature Review";
// Fixed so re-running the derivation reproduces the committed bytes.
const MODIFIED = new Date("2026-09-16T00:00:00Z");

const doc = await PDFDocument.load(readFileSync(SOURCE), { updateMetadata: false });
const before = { title: doc.getTitle(), author: doc.getAuthor(), pages: doc.getPageCount() };
doc.setTitle(TITLE);
doc.setModificationDate(MODIFIED);
const dropped = collectGarbage(doc);
mkdirSync("public/docs", { recursive: true });
writeFileSync(OUTPUT, await doc.save());

console.log(`${OUTPUT}: ${doc.getPageCount()} pages (was ${JSON.stringify(before)})`);
console.log(`dropped ${dropped.length} unreachable object(s): ${dropped.join(", ")}`);
console.log("metadata:", {
  title: doc.getTitle(),
  author: doc.getAuthor(),
  creator: doc.getCreator(),
  producer: doc.getProducer(),
});
