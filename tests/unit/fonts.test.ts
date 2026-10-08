// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

// @ts-expect-error fontverter ships no type declarations
import * as fontverter from "fontverter";
import { describe, expect, it } from "vitest";

/**
 * The committed web fonts (scripts/build-fonts.mjs → app/fonts/). `prebuild` re-derives them
 * with `--check`; these tests cover what that cannot: that app/layout.tsx, whose font-loader
 * arguments must be typed as literals, still says what the manifest says; that the Source Serif
 * derivative no longer carries its Reserved Font Name and still has both axes; and that the
 * preloaded files stay inside the budget Session 7 set for them.
 */
type ManifestEntry = {
  source: string;
  bytes: number;
  sha256: string;
  weight: string;
  unicodeRange: string;
  renamed: boolean;
};

const FONT_DIR = path.join(process.cwd(), "app", "fonts");
const manifest = JSON.parse(readFileSync(path.join(FONT_DIR, "manifest.json"), "utf8")) as Record<
  string,
  ManifestEntry
>;
const layout = readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");

/** The `localFont({ … })` call in app/layout.tsx that loads `file`. */
function loaderCall(file: string): string {
  const call = layout
    .split("localFont(")
    .slice(1)
    .map((rest) => rest.slice(0, rest.indexOf("\n});")))
    .find((body) => body.includes(`"./fonts/${file}"`));
  expect(call, `app/layout.tsx loads ${file}`).toBeDefined();
  return call!;
}

async function sfntTables(file: string): Promise<Map<string, Buffer>> {
  const sfnt = Buffer.from(
    await fontverter.convert(readFileSync(path.join(FONT_DIR, file)), "sfnt"),
  );
  const tables = new Map<string, Buffer>();
  for (let i = 0; i < sfnt.readUInt16BE(4); i++) {
    const at = 12 + i * 16;
    const offset = sfnt.readUInt32BE(at + 8);
    tables.set(
      sfnt.toString("latin1", at, at + 4),
      sfnt.subarray(offset, offset + sfnt.readUInt32BE(at + 12)),
    );
  }
  return tables;
}

function nameRecords(name: Buffer): { nameId: number; text: string }[] {
  const storage = name.readUInt16BE(4);
  return Array.from({ length: name.readUInt16BE(2) }, (_, i) => {
    const at = 6 + i * 12;
    const start = storage + name.readUInt16BE(at + 10);
    const raw = name.subarray(start, start + name.readUInt16BE(at + 8));
    const text =
      name.readUInt16BE(at) === 1
        ? raw.toString("latin1")
        : Buffer.from(raw).swap16().toString("utf16le");
    return { nameId: name.readUInt16BE(at + 6), text };
  });
}

function axes(fvar: Buffer): Record<string, [number, number]> {
  const fixed = (at: number) => fvar.readInt32BE(at) / 65536;
  const start = fvar.readUInt16BE(4);
  const size = fvar.readUInt16BE(10);
  return Object.fromEntries(
    Array.from({ length: fvar.readUInt16BE(8) }, (_, i) => {
      const at = start + i * size;
      return [fvar.toString("latin1", at, at + 4), [fixed(at + 4), fixed(at + 12)]];
    }),
  );
}

describe("web fonts", () => {
  it.each(Object.entries(manifest))("%s is the file the manifest describes", (file, entry) => {
    const bytes = readFileSync(path.join(FONT_DIR, file));
    expect(bytes.length).toBe(entry.bytes);
    expect(createHash("sha256").update(bytes).digest("base64")).toBe(entry.sha256);
    // Pinned source, so the bytes can be re-derived: "<package>@<exact version>/files/<file>".
    expect(entry.source).toMatch(/^@fontsource-variable\/[a-z0-9-]+@\d+\.\d+\.\d+\/files\//);
  });

  it.each(Object.entries(manifest))(
    "app/layout.tsx declares %s with the manifest's weight range and unicode-range",
    (file, entry) => {
      const call = loaderCall(file);
      expect(call).toContain(`weight: "${entry.weight}"`);
      expect(call).toContain('display: "swap"');
      const latin = entry.unicodeRange.startsWith("U+0000-00FF");
      if (latin) {
        // The three families are preloaded and carry no unicode-range of their own.
        expect(call).not.toContain("preload: false");
        expect(call).not.toContain("unicode-range");
      } else {
        expect(call).toContain("preload: false");
        expect(call).toContain(`{ prop: "unicode-range", value: "${entry.unicodeRange}" }`);
      }
    },
  );

  it("loads nothing from next/font/google and no file the manifest does not list", () => {
    expect(layout).not.toContain("next/font/google");
    const loaded = [...layout.matchAll(/src: "\.\/fonts\/([^"]+)"/g)].map((m) => m[1]).sort();
    expect(loaded).toEqual(Object.keys(manifest).sort());
  });

  it("keeps the preloaded families under 140 KB together (they were 211 KB)", () => {
    const preloaded = Object.values(manifest).filter((e) =>
      e.unicodeRange.startsWith("U+0000-00FF"),
    );
    expect(preloaded).toHaveLength(3);
    expect(preloaded.reduce((sum, e) => sum + e.bytes, 0)).toBeLessThan(140 * 1024);
  });

  it("ships the Source Serif derivative without its Reserved Font Name, with both axes", async () => {
    expect(manifest["serif.woff2"].renamed).toBe(true);
    const tables = await sfntTables("serif.woff2");
    const records = nameRecords(tables.get("name")!);
    // The copyright notice (name 0) states the reservation and must stay. harfbuzz keeps name
    // ids 0–6 only, so the licence URL record is gone; the licence text ships beside the file.
    expect(records.find((r) => r.nameId === 0)?.text).toContain("Reserved Font Name");
    const named = records.filter((r) => ![0, 13, 14].includes(r.nameId));
    expect(named.length).toBeGreaterThan(4);
    for (const record of named) expect(record.text, `name ${record.nameId}`).not.toMatch(/source/i);
    expect(records.find((r) => r.nameId === 1)?.text).toBe("PR Site Serif");
    // The served @font-face family is named after the loader's const in app/layout.tsx.
    const family = layout.match(
      /const (\w+) = localFont\(\{\s*src: "\.\/fonts\/serif\.woff2"/,
    )?.[1];
    expect(family, "the const that loads serif.woff2").toBeDefined();
    expect(family).not.toMatch(/source/i);

    expect(axes(tables.get("fvar")!)).toEqual({ opsz: [8, 60], wght: [400, 500] });
  });

  it.each([
    ["inter.woff2", { wght: [400, 700] }],
    ["mono.woff2", { wght: [400, 700] }],
  ])("%s keeps only the weights the pages draw", async (file, expected) => {
    expect(axes((await sfntTables(file)).get("fvar")!)).toEqual(expected);
  });

  it("ships each family's licence beside the files", () => {
    for (const family of ["source-serif-4", "inter", "jetbrains-mono"]) {
      const text = readFileSync(path.join(FONT_DIR, `LICENSE-${family}.txt`), "utf8");
      expect(text).toContain("SIL Open Font License, Version 1.1");
    }
  });
});
