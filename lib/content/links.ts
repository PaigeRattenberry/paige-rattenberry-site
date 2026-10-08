import type { Asset, Link } from "./schema";

/** The asset path (as listed in assets.json) a `/docs/<file>.pdf` link names, or null for a URL. */
export function documentPath(url: string): string | null {
  return url.startsWith("/docs/") ? url.slice(1) : null;
}

/**
 * A site-path link must name a `document` in content/assets.json, the way `cover` must name
 * an image (IMPLEMENTATION_PLAN §4 Session 4): a PDF cannot be linked before its provenance,
 * rights and removed pages are recorded. Throws at import, so the build fails, not the page.
 */
export function assertDocumentLinks(
  where: string,
  links: readonly Link[] | undefined,
  assets: readonly Asset[],
): void {
  for (const link of links ?? []) {
    const path = documentPath(link.url);
    if (path === null) continue;
    const asset = assets.find((a) => a.path === path);
    if (!asset || asset.kind !== "document") {
      throw new Error(`${where}: link "${link.url}" is not a document in content/assets.json`);
    }
  }
}
