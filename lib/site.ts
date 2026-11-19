/**
 * The public site origin (DESIGN §5.5). `NEXT_PUBLIC_SITE_URL` is set in Vercel and in
 * `.env.example`; on Vercel without it the project's production hostname stands in, so
 * previews still canonicalise to production; anywhere else the dev server's origin does.
 * `metadataBase`, the sitemap, robots.txt, JSON-LD and the resume PDF's contact line all
 * derive from this one value, so a route is spelled out once.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

// An origin only: a value without a scheme would make `new URL()` throw a bare "Invalid URL"
// deep in the build, and one with a path would resolve differently in `absoluteUrl()` and in
// Next's own metadataBase handling. A trailing slash is still an origin and is stripped below.
if (configured && !/^https?:\/\/[^/?#\s]+\/?$/.test(configured)) {
  throw new Error(
    `NEXT_PUBLIC_SITE_URL must be an origin such as https://example.com (got "${configured}")`,
  );
}

export const SITE_URL = (
  configured || (vercel ? `https://${vercel}` : "http://localhost:3000")
).replace(/\/+$/, "");

/** True when the origin came from configuration rather than the localhost fallback. */
export const siteUrlConfigured = Boolean(configured || vercel);

/** An absolute URL for a site path ("/projects/stimmap3d" → "https://…/projects/stimmap3d"). */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/** The origin as printed on the resume: no scheme, no trailing slash. */
export const siteHost = SITE_URL.replace(/^https?:\/\//, "");

/**
 * Google Search Console's HTML-tag verification token (the `content` value of the
 * `google-site-verification` meta tag it hands out), read at build time from
 * `GOOGLE_SITE_VERIFICATION`, which is set in Vercel rather than committed, so a new property
 * (a custom domain, say) needs no code change. Unset, no tag is emitted. The root layout puts it
 * in `metadata.verification`. A pasted whole tag fails the build here instead of shipping a
 * broken one.
 */
const googleToken = process.env.GOOGLE_SITE_VERIFICATION?.trim();

if (googleToken && !/^[A-Za-z0-9_-]+$/.test(googleToken)) {
  throw new Error(
    'GOOGLE_SITE_VERIFICATION must be the token alone (the content="…" value), not the whole meta tag',
  );
}

export const googleSiteVerification = googleToken || undefined;
