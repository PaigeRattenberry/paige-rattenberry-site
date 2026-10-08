/**
 * Render a PDF's pages to PNG with pdf-parse (pdf.js under the hood; no poppler on this
 * machine), for the build-log screenshots of the generated resume (IMPLEMENTATION_PLAN §4
 * Session 6 task 6).
 *
 *   node scripts/render-pdf-pages.mjs <file.pdf> <outDir> <prefix> [scale]
 *
 * Writes <outDir>/<prefix>-<n>.png for every page and prints the page count.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PDFParse } from "pdf-parse";

const [file, outDir, prefix, scale = "1.5"] = process.argv.slice(2);
if (!file || !outDir || !prefix) {
  console.error("usage: node scripts/render-pdf-pages.mjs <file.pdf> <outDir> <prefix> [scale]");
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const parser = new PDFParse({ data: readFileSync(file) });
try {
  const shots = await parser.getScreenshot({ scale: Number(scale), imageDataUrl: false });
  for (const page of shots.pages) {
    writeFileSync(path.join(outDir, `${prefix}-${page.pageNumber}.png`), page.data);
  }
  console.log(`${file}: ${shots.pages.length} page(s) -> ${outDir}/${prefix}-<n>.png`);
} finally {
  await parser.destroy();
}
