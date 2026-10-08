import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * Crawl everything and point at the sitemap (DESIGN §5.5). Previews stay out of search
 * engines through Vercel's `X-Robots-Tag: noindex` header (IMPLEMENTATION_PLAN §3 S0-E), not
 * through this file, so the production robots.txt needs no environment switch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
