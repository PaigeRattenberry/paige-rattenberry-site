import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonLdHtml } from "@/lib/seo";

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
