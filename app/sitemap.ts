import type { MetadataRoute } from "next";

import { lastUpdated } from "@/lib/last-updated";
import { htmlRoutes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

/**
 * Every HTML page, once (DESIGN §5.2, §5.5). `/resume` is a redirect and the PDFs under
 * /docs/ are documents, so none of them is listed: search engines reach the PDFs through the
 * pages that link them, and a sitemap of canonical pages only is what DESIGN §5.2 asks for.
 * Filtered views (`/projects?tag=`, `/experience?skill=`) are not routes and are not listed.
 * `lastModified` is the last commit, the same stamp the footer shows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return htmlRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: lastUpdated.iso,
  }));
}
