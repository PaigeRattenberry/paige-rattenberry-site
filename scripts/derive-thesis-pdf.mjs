/**
 * Derive the shippable thesis PDF from the staged original (IMPLEMENTATION_PLAN §4 Session 4,
 * task 3; DESIGN §3.5): a copy with original page 2 removed. Page 2 is the scanned approval
 * page and carries four people's signatures, so it never ships. Run once from the repo root
 * and commit only the output; content/assets.json records the removal as removedPages: [2].
 *
 *   node scripts/derive-thesis-pdf.mjs
 *
 * pdf-lib's removePage() only unlinks a page from the page tree; save() still writes every
 * object in the file, so the page, its scanned images and anything pointing at it would ship.
 * After removing the pages this script drops named destinations that target them, renumbers
 * the page labels so the viewer's numbers still match the printed ones, and deletes every
 * object no longer reachable from the trailer. tests/unit/documents.test.ts checks all three.
 *
 * The staged original is untracked (`_source/`), so this cannot run in CI; the unit tests
 * check the shipped file against assets.json instead.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFRef } from "pdf-lib";

import { collectGarbage, referencesTo } from "./pdf-graph.mjs";

const SOURCE = "_source/thesis/honours-thesis-2022.pdf";
const OUTPUT = "public/docs/paige-rattenberry-honours-thesis-2022.pdf";
const REMOVED_PAGES = [2];
// Fixed so re-running the derivation reproduces the committed bytes.
const MODIFIED = new Date("2026-09-14T00:00:00Z");

const doc = await PDFDocument.load(readFileSync(SOURCE));
const ctx = doc.context;
const before = doc.getPageCount();

const labels = pageLabels(doc);
const removedRefs = new Set(REMOVED_PAGES.map((p) => doc.getPage(p - 1).ref.toString()));
for (const page of [...REMOVED_PAGES].sort((a, b) => b - a)) doc.removePage(page - 1);

dropDestinations(doc, removedRefs);
setPageLabels(
  doc,
  labels.filter((_, i) => !REMOVED_PAGES.includes(i + 1)),
);
const dropped = collectGarbage(doc);
const leftover = referencesTo(doc, removedRefs);
if (leftover.length) throw new Error(`Still pointing at a removed page: ${leftover.join(", ")}`);

doc.setModificationDate(MODIFIED);
mkdirSync("public/docs", { recursive: true });
writeFileSync(OUTPUT, await doc.save());

console.log(`${OUTPUT}: ${before} pages -> ${doc.getPageCount()} (removed ${REMOVED_PAGES})`);
console.log(`dropped ${dropped.length} unreachable objects`);
console.log("metadata:", {
  title: doc.getTitle(),
  author: doc.getAuthor(),
  subject: doc.getSubject(),
  keywords: doc.getKeywords(),
  creator: doc.getCreator(),
  producer: doc.getProducer(),
});

/** Resolve a reference (or pass a direct object through). */
function lookup(obj) {
  return obj instanceof PDFRef ? ctx.lookup(obj) : obj;
}

/** The label parts of every page from the catalog's /PageLabels number tree (flat /Nums). */
function pageLabels(pdf) {
  const tree = lookup(pdf.catalog.get(PDFName.of("PageLabels")));
  const count = pdf.getPageCount();
  if (!tree) return Array.from({ length: count }, (_, i) => ({ n: i + 1 }));
  if (tree.get(PDFName.of("Kids"))) throw new Error("Nested /PageLabels trees are not handled");
  const nums = lookup(tree.get(PDFName.of("Nums"))).asArray();
  const ranges = [];
  for (let i = 0; i < nums.length; i += 2) {
    const dict = lookup(nums[i + 1]);
    ranges.push({
      start: lookup(nums[i]).asNumber(),
      style: dict.get(PDFName.of("S")),
      prefix: dict.get(PDFName.of("P")),
      first: dict.get(PDFName.of("St")) ? lookup(dict.get(PDFName.of("St"))).asNumber() : 1,
    });
  }
  return Array.from({ length: count }, (_, i) => {
    const r = ranges.findLast((range) => range.start <= i);
    return { style: r.style, prefix: r.prefix, n: r.first + i - r.start };
  });
}

/** Write labels back as the fewest ranges that reproduce them. */
function setPageLabels(pdf, kept) {
  if (!pdf.catalog.get(PDFName.of("PageLabels"))) return;
  const nums = [];
  kept.forEach((label, i) => {
    const prev = kept[i - 1];
    const continues =
      prev &&
      String(prev.style) === String(label.style) &&
      String(prev.prefix) === String(label.prefix) &&
      prev.n + 1 === label.n;
    if (continues) return;
    const dict = new Map();
    if (label.style) dict.set(PDFName.of("S"), label.style);
    if (label.prefix) dict.set(PDFName.of("P"), label.prefix);
    if (label.n !== 1) dict.set(PDFName.of("St"), PDFNumber.of(label.n));
    nums.push(PDFNumber.of(i), PDFDict.fromMapWithContext(dict, ctx));
  });
  pdf.catalog.set(PDFName.of("PageLabels"), ctx.obj({ Nums: nums }));
}

/** Remove named destinations (name tree and legacy /Dests dict) that target a removed page. */
function dropDestinations(pdf, refs) {
  const targetsRemoved = (dest) => {
    let d = lookup(dest);
    if (d instanceof PDFDict) d = lookup(d.get(PDFName.of("D")));
    const page = d instanceof PDFArray ? d.get(0) : undefined;
    return page instanceof PDFRef && refs.has(page.toString());
  };
  const walk = (node) => {
    const kids = node.get(PDFName.of("Kids"));
    if (kids) for (const kid of lookup(kids).asArray()) walk(lookup(kid));
    const names = node.get(PDFName.of("Names"));
    if (!names) return;
    const arr = lookup(names);
    for (let i = arr.size() - 2; i >= 0; i -= 2) {
      if (!targetsRemoved(arr.get(i + 1))) continue;
      // An entry at either end would also need the leaf's /Limits updated.
      if (i === 0 || i === arr.size() - 2) throw new Error("Removed destination bounds a leaf");
      arr.remove(i + 1);
      arr.remove(i);
    }
  };
  const nameDict = lookup(pdf.catalog.get(PDFName.of("Names")));
  const destTree = nameDict && lookup(nameDict.get(PDFName.of("Dests")));
  if (destTree) walk(destTree);
  const legacy = lookup(pdf.catalog.get(PDFName.of("Dests")));
  if (legacy)
    for (const [key, value] of legacy.entries()) if (targetsRemoved(value)) legacy.delete(key);
}
