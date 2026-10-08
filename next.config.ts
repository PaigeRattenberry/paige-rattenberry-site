import type { NextConfig } from "next";

import { RESUME_PDF_PATH } from "./lib/resume";

/**
 * The site is fully static. `/resume` is a redirect to the generated PDF (DESIGN §5.4): a
 * redirects() entry stays a static rewrite rule on Vercel, where a route handler would have
 * become a serverless function. `permanent: false` (307) so the PDF's path can still change.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/resume", destination: RESUME_PDF_PATH, permanent: false }];
  },
};

export default nextConfig;
