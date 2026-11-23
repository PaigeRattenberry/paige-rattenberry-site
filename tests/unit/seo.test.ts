import { afterEach, describe, expect, it, vi } from "vitest";

import { canonical, jsonLdHtml } from "@/lib/seo";

describe("canonical", () => {
  it("sets the canonical link to the bare path and keeps the page's own fields", () => {
    const meta = canonical("/about", { title: "About", description: "About Paige" });
    expect(meta.title).toBe("About");
    expect(meta.description).toBe("About Paige");
    expect(meta.alternates?.canonical).toBe("/about");
  });

  // Segments merge shallowly: a page that sets either key replaces the layout's whole value,
  // which drops the inherited Open Graph image or the Search Console verification tag. This
  // checks canonical()'s own output; the type keeps a page from passing either key in (the
  // directives below fail `npm run typecheck` if it stops), and seo.spec.ts checks the
  // layout's og fields on every built page.
  it("adds neither openGraph nor verification itself", () => {
    const meta = canonical("/projects", { title: "Projects" });
    expect(meta).not.toHaveProperty("openGraph");
    expect(meta).not.toHaveProperty("verification");
  });

  it("refuses openGraph and verification from a page at the type level", () => {
    // @ts-expect-error a page's openGraph would replace the layout's, image included
    canonical("/x", { openGraph: { url: "/x" } });
    // @ts-expect-error a page's verification would replace the layout's Search Console tag
    canonical("/x", { verification: { google: "token" } });
  });
});

describe("jsonLdHtml", () => {
  it("escapes every < so a value cannot close the script element", () => {
    const html = jsonLdHtml({ description: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("<");
    // The JSON escape for "<", as the six characters backslash, u, 0, 0, 3, c.
    expect(html).toContain(`${String.fromCharCode(92)}u003c/script>`);
    expect(JSON.parse(html)).toEqual({ description: "</script><script>alert(1)</script>" });
  });
});

describe("SITE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function siteWith(value: string) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
    return import("@/lib/site");
  }

  it("accepts an origin with a trailing slash and strips it", async () => {
    const site = await siteWith("https://example.com/");
    expect(site.SITE_URL).toBe("https://example.com");
    expect(site.absoluteUrl("/projects")).toBe("https://example.com/projects");
  });

  it("rejects a value with a path or without a scheme", async () => {
    await expect(siteWith("https://example.com/site")).rejects.toThrow(/must be an origin/);
    await expect(siteWith("example.com")).rejects.toThrow(/must be an origin/);
  });
});

describe("googleSiteVerification", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function siteWith(value: string) {
    vi.resetModules();
    vi.stubEnv("GOOGLE_SITE_VERIFICATION", value);
    return import("@/lib/site");
  }

  it("is undefined when unset or blank, so no tag is emitted", async () => {
    expect((await siteWith("")).googleSiteVerification).toBeUndefined();
    expect((await siteWith("   ")).googleSiteVerification).toBeUndefined();
  });

  it("passes a token through, trimmed", async () => {
    const site = await siteWith(" aBc-123_XyZ \n");
    expect(site.googleSiteVerification).toBe("aBc-123_XyZ");
  });

  it("rejects a pasted meta tag", async () => {
    await expect(
      siteWith('<meta name="google-site-verification" content="aBc-123" />'),
    ).rejects.toThrow(/token alone/);
  });
});
