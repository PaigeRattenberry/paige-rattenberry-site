/**
 * Writes the site's web fonts to app/fonts/ (Session 7). The three families are the ones DESIGN
 * §4.1 names, taken from the pinned @fontsource-variable packages (the same files Google Fonts
 * serves, byte for byte) and cut down to what the site draws:
 *
 *   - every glyph of Google's "latin" subset is kept, so no page can lose a character it has today;
 *   - the weight axis is limited to the range the pages use (DESIGN §8's JS and Lighthouse budgets:
 *     the full 200–900 range was 211 KB of preloaded fonts on every page, this is 135 KB);
 *   - Source Serif keeps its optical-size axis, which is what gives headings their display cut;
 *   - the few characters outside the latin subset that body text uses (a "ć" in a name pulled an
 *     85 KB latin-ext file) get a face of their own holding just those glyphs.
 *
 * Source Serif 4 declares the Reserved Font Name "Source", and a limited-axis file is a Modified
 * Version under the OFL, so its name table is rewritten to a name of our own (the copyright
 * notice stays as it is). Inter and JetBrains Mono reserve no name. harfbuzz keeps name ids 0–6
 * only, which drops the licence-URL record, so each family's OFL text is copied beside the files.
 *
 * The output is committed, like content/generated/explorer-layout.json: `npm run fonts` rewrites
 * it, `prebuild` runs `--check`, which fails on any difference. harfbuzz and the woff2 encoder run
 * as WebAssembly, so the bytes are the same on every platform; the packages are pinned exactly
 * because the bytes depend on them. app/fonts/manifest.json records source, axes, size and
 * SHA-256 per file, and tests/unit/fonts.test.ts holds app/layout.tsx to it.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import * as fontverter from "fontverter";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);
const OUT_DIR = path.join(process.cwd(), "app", "fonts");
const check = process.argv.includes("--check");

/** Google Fonts' "latin" unicode-range, verbatim from its CSS for these three families. */
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

/**
 * Body-text characters outside the latin subset, by the @fontsource subset that holds them.
 * A page that uses another one falls back to a system font for it; tests/e2e/fonts.spec.ts
 * fails then, and the fix is to add the character here and run `npm run fonts`.
 */
const INTER_EXTRAS = [
  { subset: "latin-ext", chars: "ćğƒ" },
  { subset: "greek", chars: "φ" },
];

/**
 * The same for code and data text, from JetBrains Mono (Session 8: the build logs rendered on
 * /how-this-was-built name these characters inside code spans).
 */
const MONO_EXTRAS = [{ subset: "latin-ext", chars: "ćğƒ" }];

function rangeToText(range) {
  let text = "";
  for (const part of range.split(",")) {
    const [from, to] = part
      .trim()
      .replace("U+", "")
      .split("-")
      .map((hex) => parseInt(hex, 16));
    for (let cp = from; cp <= (to ?? from); cp++) text += String.fromCodePoint(cp);
  }
  return text;
}

function charsToRange(chars) {
  return [...chars]
    .map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`)
    .join(", ");
}

const latinText = rangeToText(LATIN_RANGE);

const FONTS = [
  {
    file: "serif.woff2",
    pkg: "@fontsource-variable/source-serif-4",
    source: "files/source-serif-4-latin-opsz-normal.woff2",
    text: latinText,
    unicodeRange: LATIN_RANGE,
    axes: { wght: { min: 400, max: 500, default: 400 } },
    rename: [
      [/Source Serif 4/g, "PR Site Serif"],
      [/SourceSerif4/g, "PRSiteSerif"],
    ],
  },
  {
    file: "inter.woff2",
    pkg: "@fontsource-variable/inter",
    source: "files/inter-latin-wght-normal.woff2",
    text: latinText,
    unicodeRange: LATIN_RANGE,
    axes: { wght: { min: 400, max: 700, default: 400 } },
  },
  {
    file: "mono.woff2",
    pkg: "@fontsource-variable/jetbrains-mono",
    source: "files/jetbrains-mono-latin-wght-normal.woff2",
    text: latinText,
    unicodeRange: LATIN_RANGE,
    axes: { wght: { min: 400, max: 700, default: 400 } },
  },
  ...INTER_EXTRAS.map(({ subset, chars }) => ({
    file: `inter-${subset}-extras.woff2`,
    pkg: "@fontsource-variable/inter",
    source: `files/inter-${subset}-wght-normal.woff2`,
    text: chars,
    unicodeRange: charsToRange(chars),
    axes: { wght: { min: 400, max: 700, default: 400 } },
  })),
  ...MONO_EXTRAS.map(({ subset, chars }) => ({
    file: `mono-${subset}-extras.woff2`,
    pkg: "@fontsource-variable/jetbrains-mono",
    source: `files/jetbrains-mono-${subset}-wght-normal.woff2`,
    text: chars,
    unicodeRange: charsToRange(chars),
    axes: { wght: { min: 400, max: 700, default: 400 } },
  })),
];

const LICENSES = [
  ["@fontsource-variable/source-serif-4", "LICENSE-source-serif-4.txt"],
  ["@fontsource-variable/inter", "LICENSE-inter.txt"],
  ["@fontsource-variable/jetbrains-mono", "LICENSE-jetbrains-mono.txt"],
];

function packageDir(pkg) {
  return path.dirname(require.resolve(`${pkg}/package.json`));
}

// ── sfnt name-table rewrite ──────────────────────────────────────────────────────────────────

const COPYRIGHT = 0;
const LICENSE_IDS = new Set([13, 14]);

function tableDirectory(sfnt) {
  const count = sfnt.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < count; i++) {
    const at = 12 + i * 16;
    const offset = sfnt.readUInt32BE(at + 8);
    const length = sfnt.readUInt32BE(at + 12);
    tables.push({
      tag: sfnt.toString("latin1", at, at + 4),
      data: sfnt.subarray(offset, offset + length),
    });
  }
  return tables;
}

function decodeName(platformId, raw) {
  if (platformId === 1) return raw.toString("latin1");
  let text = "";
  for (let i = 0; i + 1 < raw.length; i += 2) text += String.fromCharCode(raw.readUInt16BE(i));
  return text;
}

function encodeName(platformId, text) {
  if (platformId === 1) return Buffer.from(text, "latin1");
  const raw = Buffer.alloc(text.length * 2);
  for (let i = 0; i < text.length; i++) raw.writeUInt16BE(text.charCodeAt(i), i * 2);
  return raw;
}

function renameNameTable(name, rules) {
  if (name.readUInt16BE(0) !== 0) throw new Error("name table format 1 is not handled");
  const count = name.readUInt16BE(2);
  const storage = name.readUInt16BE(4);
  const records = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 12;
    const ids = [0, 2, 4, 6].map((o) => name.readUInt16BE(at + o));
    const [platformId, , , nameId] = ids;
    const length = name.readUInt16BE(at + 8);
    const offset = name.readUInt16BE(at + 10);
    let text = decodeName(platformId, name.subarray(storage + offset, storage + offset + length));
    if (nameId !== COPYRIGHT && !LICENSE_IDS.has(nameId)) {
      for (const [from, to] of rules) text = text.replace(from, to);
      if (/source/i.test(text)) throw new Error(`name ${nameId} still holds the reserved name`);
    }
    records.push({ ids, raw: encodeName(platformId, text) });
  }
  const header = Buffer.alloc(6 + count * 12);
  header.writeUInt16BE(0, 0);
  header.writeUInt16BE(count, 2);
  header.writeUInt16BE(header.length, 4);
  let offset = 0;
  records.forEach(({ ids, raw }, i) => {
    const at = 6 + i * 12;
    ids.forEach((id, j) => header.writeUInt16BE(id, at + j * 2));
    header.writeUInt16BE(raw.length, at + 8);
    header.writeUInt16BE(offset, at + 10);
    offset += raw.length;
  });
  return Buffer.concat([header, ...records.map((r) => r.raw)]);
}

function checksum(data) {
  const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

/** Reassembles an sfnt from its tables: directory, 4-byte alignment and every checksum. */
function assembleSfnt(version, tables) {
  const sorted = [...tables].sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const count = sorted.length;
  const entrySelector = Math.floor(Math.log2(count));
  const header = Buffer.alloc(12 + count * 16);
  version.copy(header, 0);
  header.writeUInt16BE(count, 4);
  header.writeUInt16BE(2 ** entrySelector * 16, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(count * 16 - 2 ** entrySelector * 16, 10);
  const chunks = [header];
  let offset = header.length;
  let headAt = -1;
  sorted.forEach(({ tag, data }, i) => {
    let body = data;
    if (tag === "head") {
      body = Buffer.from(data);
      body.writeUInt32BE(0, 8); // checkSumAdjustment is computed over a file that holds zero here
      headAt = offset;
    }
    const at = 12 + i * 16;
    header.write(tag, at, "latin1");
    header.writeUInt32BE(checksum(body), at + 4);
    header.writeUInt32BE(offset, at + 8);
    header.writeUInt32BE(body.length, at + 12);
    const padding = Buffer.alloc((4 - (body.length % 4)) % 4);
    chunks.push(body, padding);
    offset += body.length + padding.length;
  });
  const file = Buffer.concat(chunks);
  if (headAt < 0) throw new Error("no head table");
  file.writeUInt32BE((0xb1b0afba - checksum(file)) >>> 0, headAt + 8);
  return file;
}

function renameFamily(sfnt, rules) {
  const tables = tableDirectory(sfnt).map((t) =>
    t.tag === "name" ? { tag: t.tag, data: renameNameTable(t.data, rules) } : t,
  );
  return assembleSfnt(sfnt.subarray(0, 4), tables);
}

// ── build ────────────────────────────────────────────────────────────────────────────────────

const outputs = new Map();
const manifest = {};
for (const font of FONTS) {
  const dir = packageDir(font.pkg);
  const version = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).version;
  const input = readFileSync(path.join(dir, font.source));
  let bytes;
  if (font.rename) {
    const sfnt = await subsetFont(input, font.text, {
      targetFormat: "sfnt",
      variationAxes: font.axes,
    });
    bytes = await fontverter.convert(renameFamily(sfnt, font.rename), "woff2");
  } else {
    bytes = await subsetFont(input, font.text, {
      targetFormat: "woff2",
      variationAxes: font.axes,
    });
  }
  bytes = Buffer.from(bytes);
  outputs.set(font.file, bytes);
  manifest[font.file] = {
    source: `${font.pkg}@${version}/${font.source}`,
    sourceBytes: input.length,
    bytes: bytes.length,
    // Base64, not hex: a hex digest can hold a run of ten digits, which the privacy gate reads
    // as a phone number (DESIGN §3.4; the 2026-09-13 review follow-up met the same problem).
    sha256: createHash("sha256").update(bytes).digest("base64"),
    weight: `${font.axes.wght.min} ${font.axes.wght.max}`,
    unicodeRange: font.unicodeRange,
    renamed: Boolean(font.rename),
  };
}
for (const [pkg, file] of LICENSES) {
  // Normalised line endings, so a checkout with autocrlf compares equal.
  const text = readFileSync(path.join(packageDir(pkg), "LICENSE"), "utf8").replace(/\r\n/g, "\n");
  outputs.set(file, Buffer.from(text));
}
outputs.set("manifest.json", Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));

const stale = [];
for (const [file, bytes] of outputs) {
  const target = path.join(OUT_DIR, file);
  const isText = !file.endsWith(".woff2");
  const current = existsSync(target)
    ? isText
      ? Buffer.from(readFileSync(target, "utf8").replace(/\r\n/g, "\n"))
      : readFileSync(target)
    : null;
  if (current && current.equals(bytes)) continue;
  stale.push(file);
  if (!check) {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(target, bytes);
  }
}

if (check && stale.length) {
  console.error(`app/fonts is stale (${stale.join(", ")}); run npm run fonts and commit it.`);
  process.exit(1);
}
for (const [file, entry] of Object.entries(manifest)) {
  console.log(`${file}: ${entry.sourceBytes} -> ${entry.bytes} bytes`);
}
console.log(check ? "app/fonts is up to date." : `wrote ${stale.length} file(s) to app/fonts/`);
