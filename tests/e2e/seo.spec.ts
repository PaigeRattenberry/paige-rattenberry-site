import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

import { profile } from "../../lib/content/load";
import { RESUME_PDF_PATH } from "../../lib/resume";
import { htmlRoutes, routes } from "../../lib/routes";

/**
 * Session 6 (DESIGN §5.2, §5.4, §5.5) against the production build: the /resume redirect and
 * the PDF behind it, the sitemap, robots.txt, the Open Graph images, and one title, description,
 * canonical URL and Open Graph image per page (the root image must reach every child page).
 * The site origin in the built output is whatever NEXT_PUBLIC_SITE_URL was at build time, so
 * URLs are compared by path.
 */

const pathOf = (url: string) => new URL(url).pathname;

test.describe("/resume", () => {
  test("redirects to the PDF, which is served as a two-page application/pdf", async ({
    request,
  }) => {
    const redirect = await request.get("/resume", { maxRedirects: 0 });
    expect(redirect.status()).toBe(307);
    expect(redirect.headers()["location"]).toBe(RESUME_PDF_PATH);

    const pdf = await request.get(RESUME_PDF_PATH);
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    const body = await pdf.body();
    expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    // The served file is the generated one; the unit tests cover its text.
    expect((await PDFDocument.load(body)).getPageCount()).toBe(2);
  });

  test("every resume link on the shell and the home page points at /resume", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .getByRole("link", { name: "Resume" })
      .evaluateAll((links) => links.map((l) => l.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/resume");
  });

  test("the shipped documents under /docs/ are served as PDFs", async ({ request }) => {
    for (const path of [
      "/docs/paige-rattenberry-honours-thesis-2022.pdf",
      "/docs/paige-rattenberry-genai-interpretability-review-2024.pdf",
    ]) {
      const response = await request.get(path);
      expect(response.ok(), path).toBe(true);
      expect(response.headers()["content-type"], path).toBe("application/pdf");
    }
  });
});

test.describe("sitemap and robots", () => {
  test("/sitemap.xml lists every HTML route once and nothing else", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/xml");
    const xml = await response.text();
    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => pathOf(m[1])).sort();
    expect(listed).toEqual(htmlRoutes.map((r) => r.path).sort());
    // The redirect is not a page, and the PDFs are documents (DESIGN §5.2).
    expect(listed).not.toContain("/resume");
    expect(xml).not.toContain(".pdf");
    expect(xml.match(/<lastmod>/g)?.length).toBe(htmlRoutes.length);
  });

  test("/robots.txt allows crawling and names the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBe(true);
    const text = await response.text();
    expect(text).toMatch(/User-Agent: \*\s+Allow: \//i);
    const sitemap = /Sitemap: (\S+)/.exec(text)?.[1];
    expect(sitemap && pathOf(sitemap)).toBe("/sitemap.xml");
  });
});

test.describe("Open Graph images", () => {
  for (const path of ["/opengraph-image", "/projects/stimmap3d/opengraph-image"]) {
    test(`${path} is a 1200 × 630 PNG`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toBe("image/png");
      const png = await response.body();
      // PNG signature, then the IHDR chunk: width and height as big-endian 32-bit integers.
      expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    });
  }
});

test.describe("per-page metadata", () => {
  // Read from the prerendered HTML rather than a browser: thirteen page loads with a locator
  // wait each would run past one test's timeout, and the tags are static markup anyway.
  test("every HTML page has a unique title and description, a canonical URL and social tags", async ({
    request,
  }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const route of htmlRoutes) {
      const html = await (await request.get(route.path)).text();
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
      const meta = (key: string) =>
        new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`).exec(html)?.[1] ?? null;
      const description = meta("description");
      const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] ?? null;
      const ogImage = meta("og:image");
      const twitterCard = meta("twitter:card");
      const twitterImage = meta("twitter:image");

      expect(title, route.path).toContain(profile.name);
      expect(description, route.path).toBeTruthy();
      expect(canonical && pathOf(canonical), route.path).toBe(route.path);
      expect(twitterCard, route.path).toBe("summary_large_image");
      expect(ogImage && pathOf(ogImage), route.path).toMatch(/\/opengraph-image$/);
      expect(twitterImage && pathOf(twitterImage), route.path).toMatch(/\/opengraph-image$/);
      if (route.path.startsWith("/projects/")) {
        expect(ogImage && pathOf(ogImage), route.path).toBe(`${route.path}/opengraph-image`);
      }
      for (const [other, t] of titles) expect(t, `${route.path} vs ${other}`).not.toBe(title);
      for (const [other, d] of descriptions) {
        expect(d, `${route.path} vs ${other}`).not.toBe(description);
      }
      titles.set(route.path, title);
      descriptions.set(route.path, description ?? "");
    }
    expect(titles.size).toBe(htmlRoutes.length);
    expect(routes.length).toBe(htmlRoutes.length + 1);
  });

  test("the home page carries a schema.org Person built from the profile", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const person = JSON.parse(json ?? "null");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(profile.name);
    expect(person.jobTitle).toBe(profile.role);
    expect(person.email).toBe(`mailto:${profile.email}`);
    expect(person.sameAs).toEqual([profile.links.github, profile.links.linkedin]);
    expect(pathOf(person.image)).toBe(`/${profile.headshot}`);
    expect(json).not.toContain("_source/");
  });

  test("the favicon and the SVG icon are linked and served", async ({ page, request }) => {
    await page.goto("/");
    const icons = await page
      .locator('head link[rel="icon"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute("href")));
    expect(icons.some((h) => h?.startsWith("/favicon.ico"))).toBe(true);
    expect(icons.some((h) => h?.startsWith("/icon"))).toBe(true);
    for (const href of icons) {
      const response = await request.get(href!);
      expect(response.ok(), href!).toBe(true);
    }
  });
});
