import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Fonts for the Open Graph images (DESIGN §5.5): the same three families the site uses, read
 * from the @fontsource packages (woff, which Satori accepts) at build time. next/font's output
 * is not reusable outside Next, which is why these packages exist (IMPLEMENTATION_PLAN §2).
 */
const FILES = {
  display: "source-serif-4/files/source-serif-4-latin-600-normal.woff",
  body: "inter/files/inter-latin-400-normal.woff",
  mono: "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
} as const;

async function read(file: string) {
  const buffer = await readFile(path.join(process.cwd(), "node_modules", "@fontsource", file));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/** Satori font descriptors, loaded once per build. */
export async function ogFonts() {
  const [display, body, mono] = await Promise.all([
    read(FILES.display),
    read(FILES.body),
    read(FILES.mono),
  ]);
  return [
    { name: "Source Serif 4", data: display, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: body, weight: 400 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}
