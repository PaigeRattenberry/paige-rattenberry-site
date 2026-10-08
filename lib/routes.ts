/**
 * Every route on the site (DESIGN.md §2). One list, imported by the header nav, the
 * screenshot spec and the a11y spec, so a later session adds a route here exactly once.
 * Deep project pages and build-log pages are not typed here: they come from the loaders (the
 * validated project files, and docs/build-log/), the same lists `generateStaticParams` reads, so
 * the two can never diverge. Server-only (fs via the loaders); Header passes the plain route
 * objects down to the Nav client island.
 */
import { buildLogs, deepPageProjects } from "./content/load";
import { RESUME_PDF_PATH } from "./resume";

export type SiteRoute = {
  /** Path as it appears in the URL. */
  path: string;
  /** Short label used in navigation and tests. */
  label: string;
  /** Whether the header nav shows this route. */
  inNav: boolean;
  /**
   * An HTML page, or a redirect to a document (DESIGN §5.2): the axe sweep, the screenshots
   * and the sitemap take the pages; the nav renders a redirect as a plain anchor so the
   * client router never fetches a PDF as a page.
   */
  kind: "page" | "redirect";
};

/** The deep-page projects (DESIGN §0), from content/projects/*.mdx. */
export const projectRoutes: readonly SiteRoute[] = deepPageProjects.map((p) => ({
  path: `/projects/${p.slug}`,
  label: p.displayTitle ?? p.title,
  inNav: false,
  kind: "page",
}));

/** One page per build log (Session 8), from docs/build-log/, the list generateStaticParams reads. */
export const buildLogRoutes: readonly SiteRoute[] = buildLogs.map((entry) => ({
  path: `/how-this-was-built/${entry.slug}`,
  label: entry.title,
  inNav: false,
  kind: "page",
}));

export const routes: readonly SiteRoute[] = [
  { path: "/", label: "Home", inNav: false, kind: "page" },
  { path: "/about", label: "About", inNav: true, kind: "page" },
  { path: "/experience", label: "Experience", inNav: true, kind: "page" },
  { path: "/projects", label: "Projects", inNav: true, kind: "page" },
  ...projectRoutes,
  { path: "/research", label: "Research", inNav: true, kind: "page" },
  { path: "/leadership", label: "Leadership", inNav: true, kind: "page" },
  { path: "/how-this-was-built", label: "How this was built", inNav: true, kind: "page" },
  ...buildLogRoutes,
  { path: "/contact", label: "Contact", inNav: true, kind: "page" },
  // A redirects() entry in next.config.ts sends this to the generated PDF (DESIGN §5.4).
  { path: "/resume", label: "Resume", inNav: true, kind: "redirect" },
];

/** The HTML pages: what the axe sweep, the screenshots and the sitemap cover. */
export const htmlRoutes = routes.filter((r) => r.kind === "page");
/** Where the one redirect route lands; tests check the config sends it here. */
export const redirectTargets: Readonly<Record<string, string>> = { "/resume": RESUME_PDF_PATH };

export const navRoutes = routes.filter((r) => r.inNav);

/** Slugs under /projects/ that get a deep page. */
export const projectSlugs = deepPageProjects.map((p) => p.slug);
