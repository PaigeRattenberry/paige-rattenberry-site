import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { PDFParse } from "pdf-parse";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { assets } from "@/lib/content/load";
import { orphanRefs } from "@/scripts/pdf-graph.mjs";

import { PHONE_PATTERN, phoneMatches } from "./helpers/privacy";

const ROOT = path.resolve(__dirname, "../..");
const documents = assets.filter((a) => a.kind === "document");

/**
 * Where the DESIGN §3.4 pattern (`PHONE_PATTERN`, unchanged) is known to match something that
 * is not a phone number, reviewed page by page (IMPLEMENTATION_PLAN §4 Session 6 amendment):
 * each entry names one shipped document, one page and a test every match on that page must
 * pass. A match on any other page, or that fails its page's test, fails the gate.
 * - `iouRow`: three table cells such as "262 .257 .0125" on the thesis's results pages; the
 *   " ." between the cells is not a separator any phone number carries.
 * - `insideIdentifier`: a DOI or arXiv fragment in a references list, e.g. the "021.3089943"
 *   inside "10.1109/TMI.2021.3089943". The match must sit inside a longer whitespace-delimited
 *   token that starts with a letter or "10." (a DOI prefix, an arXiv or article id), so a phone
 *   number typed as its own token on one of these pages is still rejected.
 */
const iouRow = (match: string) => /^\d{3} \.\d{3} \.\d{4}$/.test(match);
const insideIdentifier = (match: string, token: string) =>
  token.length > match.length && /^(?:[A-Za-z]|10\.)/.test(token) && token.includes(match);
const REVIEWED_MATCHES: {
  path: string;
  page: number;
  allowed: (match: string, token: string) => boolean;
}[] = [
  { path: "docs/paige-rattenberry-honours-thesis-2022.pdf", page: 35, allowed: iouRow },
  { path: "docs/paige-rattenberry-honours-thesis-2022.pdf", page: 37, allowed: iouRow },
  { path: "docs/paige-rattenberry-honours-thesis-2022.pdf", page: 38, allowed: iouRow },
  { path: "docs/paige-rattenberry-honours-thesis-2022.pdf", page: 47, allowed: insideIdentifier },
  { path: "docs/paige-rattenberry-honours-thesis-2022.pdf", page: 48, allowed: insideIdentifier },
  {
    path: "docs/paige-rattenberry-genai-interpretability-review-2024.pdf",
    page: 9,
    allowed: insideIdentifier,
  },
  {
    path: "docs/paige-rattenberry-genai-interpretability-review-2024.pdf",
    page: 10,
    allowed: insideIdentifier,
  },
];

/** Text of every page of a shipped document, extracted once per file. */
const extracted = new Map<string, Promise<{ num: number; text: string }[]>>();
function pageTexts(file: string) {
  let pages = extracted.get(file);
  if (!pages) {
    pages = (async () => {
      const parser = new PDFParse({ data: readFileSync(file) });
      try {
        const result = await parser.getText();
        return result.pages.map((p) => ({ num: p.num, text: p.text }));
      } finally {
        await parser.destroy();
      }
    })();
    extracted.set(file, pages);
  }
  return pages;
}

// Parsing a 1.6 MB PDF costs ~80 ms; each file is parsed once and shared between the tests.
const parsed = new Map<string, Promise<PDFDocument>>();
function loadPdf(file: string) {
  let doc = parsed.get(file);
  if (!doc) {
    doc = PDFDocument.load(readFileSync(file));
    parsed.set(file, doc);
  }
  return doc;
}

/** Each page's label ("r3", "D1") from a flat /PageLabels number tree; plain numbers if none. */
function pageLabels(pdf: PDFDocument) {
  const count = pdf.getPageCount();
  const tree = pdf.catalog.lookupMaybe(PDFName.of("PageLabels"), PDFDict);
  if (!tree) return Array.from({ length: count }, (_, i) => `D${i + 1}`);
  const nums = tree.lookup(PDFName.of("Nums"), PDFArray);
  const ranges: { start: number; style: string; prefix: string; first: number }[] = [];
  for (let i = 0; i < nums.size(); i += 2) {
    const dict = nums.lookup(i + 1, PDFDict);
    ranges.push({
      start: nums.lookup(i, PDFNumber).asNumber(),
      style: dict.get(PDFName.of("S"))?.toString() ?? "",
      prefix: dict.get(PDFName.of("P"))?.toString() ?? "",
      first: dict.lookupMaybe(PDFName.of("St"), PDFNumber)?.asNumber() ?? 1,
    });
  }
  return Array.from({ length: count }, (_, i) => {
    const r = ranges.findLast((range) => range.start <= i)!;
    return `${r.prefix}${r.style.replace("/", "")}${r.first + i - r.start}`;
  });
}

/**
 * Shipped PDFs against their assets.json records (DESIGN §3.5). The text-level privacy check
 * of a derivative (pdftotext) is a session step recorded in the asset's transformations; this
 * checks what a test can: the page count, and, when the staged original is present, that the
 * copy is exactly the original minus the pages recorded as removed.
 */
describe("shipped documents", () => {
  it("every listed document exists with the recorded page count", async () => {
    expect(documents.length).toBeGreaterThan(0);
    for (const doc of documents) {
      const pdf = await loadPdf(path.join(ROOT, "public", doc.path));
      expect(pdf.getPageCount(), doc.path).toBe(doc.pageCount);
      expect(pdf.getTitle(), doc.path).toBeTruthy();
    }
  });

  it("a derivative has exactly the staged original's pages minus the removed ones", async () => {
    for (const doc of documents) {
      if (doc.provenance.kind !== "staged") continue;
      const source = path.join(ROOT, doc.provenance.source);
      // _source/ is untracked by design; CI skips this half.
      if (!statSync(source, { throwIfNoEntry: false })?.isFile()) continue;
      const original = await loadPdf(source);
      const derived = await loadPdf(path.join(ROOT, "public", doc.path));
      expect(derived.getPageCount(), doc.path).toBe(
        original.getPageCount() - doc.removedPages.length,
      );
      // Each surviving page keeps its size, so the copy is the original with pages dropped.
      const removed = new Set(doc.removedPages);
      const kept = original
        .getPages()
        .filter((_, i) => !removed.has(i + 1))
        .map((p) => p.getSize());
      expect(derived.getPages().map((p) => p.getSize())).toEqual(kept);
      // A removed page's viewer label goes with it, so the others still match their print.
      expect(pageLabels(derived), doc.path).toEqual(
        pageLabels(original).filter((_, i) => !removed.has(i + 1)),
      );
    }
  });

  it("has no unfilled placeholder and no phone-shaped string outside the reviewed matches", async () => {
    for (const doc of documents) {
      const pages = await pageTexts(path.join(ROOT, "public", doc.path));
      expect(pages.length, doc.path).toBe(doc.pageCount);
      const offenders: string[] = [];
      for (const page of pages) {
        if (page.text.includes("[ADD "))
          offenders.push(`${doc.path} p.${page.num}: [ADD placeholder`);
        const reviewed = REVIEWED_MATCHES.find((r) => r.path === doc.path && r.page === page.num);
        for (const { match, token } of phoneMatches(page.text)) {
          if (reviewed?.allowed(match, token)) continue;
          offenders.push(`${doc.path} p.${page.num}: phone-shaped "${match}"`);
        }
      }
      expect(offenders).toEqual([]);
    }
  });

  it("every reviewed exception names a page of a listed document and still rejects a phone number", () => {
    for (const r of REVIEWED_MATCHES) {
      const doc = documents.find((d) => d.path === r.path);
      expect(doc, r.path).toBeDefined();
      expect(r.page, `${r.path} p.${r.page}`).toBeLessThanOrEqual(doc?.pageCount ?? 0);
      // A number typed as its own token, in the common shapes, never passes an exception. The
      // examples are assembled here so no phone-shaped literal sits in the repository's text.
      const [a, b, c] = ["604", "555", "0199"];
      for (const shape of [`${a}-${b}-${c}`, `${a}.${b}.${c}`, `(${a}) ${b}-${c}`, a + b + c]) {
        const [m] = phoneMatches(`call ${shape} now`);
        expect(m && r.allowed(m.match, m.token), `${r.path} p.${r.page}: ${shape}`).toBe(false);
      }
    }
    expect(PHONE_PATTERN.source).toBe("\\(?\\d{3}\\)?[ .-]*\\d{3}[ .-]*\\d{4}");
  });

  // removePage() alone leaves the page, its images and its info dict in the saved file,
  // reachable by any PDF object tool though no viewer shows them.
  it("a shipped document carries no object outside its page tree, catalog and info", async () => {
    for (const doc of documents) {
      const pdf = await loadPdf(path.join(ROOT, "public", doc.path));
      const objects = pdf.context.enumerateIndirectObjects();
      expect(orphanRefs(pdf), doc.path).toEqual([]);
      const pageObjects = objects.filter(
        ([, obj]) => obj instanceof PDFDict && obj.get(PDFName.of("Type")) === PDFName.of("Page"),
      );
      expect(pageObjects.length, doc.path).toBe(doc.pageCount);
    }
  });
});
