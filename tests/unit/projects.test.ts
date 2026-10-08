import { describe, expect, it } from "vitest";

import { assets, projectBySlug, research } from "@/lib/content/load";
import { loadProject, mergeResearch, resolveCover } from "@/lib/content/projects";
import type { ProjectFile } from "@/lib/content/project-files";
import { ProjectFrontmatterSchema } from "@/lib/content/schema";

const deps = { research, assets };

const card = {
  slug: "fixture",
  title: "Fixture",
  tagline: "A fixture",
  proof: "Proves nothing.",
  year: 2024,
  dates: "2024",
  periods: [{ start: "2024-01", end: "2024-01" }],
  kind: "project",
  featured: false,
  deepPage: false,
  bullets: ["A bullet."],
  skills: [],
  metrics: [],
  resume: { include: false, bullets: [] },
  source: "resume-2026",
};

function file(data: Record<string, unknown>, body = ""): ProjectFile {
  return { file: String(data.slug), data, body };
}

describe("project loader", () => {
  it("fills a research-backed card from research.ts and derives the year", () => {
    const fm = ProjectFrontmatterSchema.parse({
      slug: "fixture",
      researchId: "clinical-copilot",
      tagline: "A fixture",
      kind: "project",
      featured: false,
      deepPage: false,
      resume: { include: false, bullets: [] },
    });
    const merged = mergeResearch(fm, research);
    const item = research.find((r) => r.id === "clinical-copilot")!;
    expect(merged.title).toBe(item.title);
    expect(merged.bullets).toEqual([item.summary]);
    expect(merged.skills).toEqual(item.skills);
    expect(merged.year).toBe(2023);
  });

  it("rejects a research-backed card that retypes a derived fact", () => {
    const result = ProjectFrontmatterSchema.safeParse({
      ...card,
      researchId: "clinical-copilot",
      title: "Clinical CoPilot",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("do not retype");
  });

  it("rejects an unknown researchId and a slug that differs from the file name", () => {
    const { slug, tagline, kind, featured, deepPage, resume } = card;
    expect(() =>
      mergeResearch(
        ProjectFrontmatterSchema.parse({
          slug,
          tagline,
          kind,
          featured,
          deepPage,
          resume,
          researchId: "nope",
        }),
        research,
      ),
    ).toThrow(/researchId "nope"/);
    expect(() => loadProject({ ...file(card), file: "other" }, deps)).toThrow(/must equal/);
  });

  it("resolves cover against assets.json and rejects anything else", () => {
    expect(resolveCover({ slug: "x" }, assets)).toBeUndefined();
    expect(resolveCover({ slug: "x", cover: assets[0].path }, assets)?.kind).toBe("image");
    expect(() => resolveCover({ slug: "x", cover: "images/nope.png" }, assets)).toThrow(
      /not an image in content\/assets.json/,
    );
  });

  it("refuses a repository link outside CLEARED_REPOSITORIES, and accepts one inside it", () => {
    const withRepo = {
      ...card,
      links: [{ kind: "repo", label: "Repo", url: "https://github.com/example/repo" }],
    };
    expect(() => loadProject(file(withRepo), deps)).toThrow(/repo link .* is not cleared/);
    // Clearance is per repository, by exact URL: a name that only starts the same is refused.
    const lookalike = {
      ...card,
      links: [
        {
          kind: "repo",
          label: "Repo",
          url: "https://github.com/PaigeRattenberry/stimmap3d-other",
        },
      ],
    };
    expect(() => loadProject(file(lookalike), deps)).toThrow(/is not cleared/);
    const cleared = {
      ...card,
      links: [
        { kind: "repo", label: "Repo", url: "https://github.com/PaigeRattenberry/stimmap3d" },
      ],
    };
    expect(loadProject(file(cleared), deps).links).toHaveLength(1);
  });

  it("holds the aside's own links to the same gates as the facts column", () => {
    const aside = (links: unknown[]) => ({
      ...card,
      aside: { title: "Built with Claude Code", paragraphs: ["How it was built."], links },
    });
    // An aside link carries no `kind`, so the gate reads the URL: anything under github.com must
    // sit inside a cleared repository, or the aside becomes a way around the clearance.
    expect(() =>
      loadProject(
        file(aside([{ label: "Repo", url: "https://github.com/example/private" }])),
        deps,
      ),
    ).toThrow(/repository link .* is not cleared/);
    // A document path in an aside needs its assets.json record, exactly as in `links`.
    expect(() =>
      loadProject(file(aside([{ label: "Paper", url: "/docs/not-a-real-document.pdf" }])), deps),
    ).toThrow(/is not a document in content\/assets\.json/);
    const workflow =
      "https://github.com/PaigeRattenberry/stimmap3d/blob/0a20e810e48dca8aac1780c6478c3d1f51663989/docs/agentic-development.md";
    expect(
      loadProject(file(aside([{ label: "Notes", url: workflow }])), deps).aside?.links,
    ).toEqual([{ label: "Notes", url: workflow }]);
  });

  it("an embed needs a cover for its poster and a live link for its open link", () => {
    const embed = { src: "https://example.com/?view=1", title: "Demo" };
    const live = [{ kind: "live", label: "Live", url: "https://example.com" }];
    expect(() => loadProject(file({ ...card, embed }), deps)).toThrow(/needs a cover and a live/);
    expect(() => loadProject(file({ ...card, embed, links: live }), deps)).toThrow(
      /needs a cover and a live/,
    );
    expect(
      loadProject(file({ ...card, embed, links: live, cover: assets[0].path }), deps).embed?.src,
    ).toBe(embed.src);
  });

  it("refuses a resume selection that would change nothing in print", () => {
    const twoBullets = { ...card, bullets: ["One.", "Two."] };
    const resume = (extra: Record<string, unknown>) => ({ include: true, bullets: [], ...extra });
    expect(
      loadProject(file({ ...twoBullets, resume: resume({ firstBullets: 1 }) }), deps).resume
        .firstBullets,
    ).toBe(1);
    for (const n of [2, 3]) {
      expect(() =>
        loadProject(file({ ...twoBullets, resume: resume({ firstBullets: n }) }), deps),
      ).toThrow(/keeps all 2 bullets/);
    }
    // A research item's org is the resume's line under a paired card's title.
    expect(
      loadProject(file({ ...card, resume: resume({ org: "Personal" }) }), deps).resume.org,
    ).toBe("Personal");
    const thesis = research.find((r) => r.projectSlug)!;
    expect(() =>
      loadProject(
        file({ ...card, slug: thesis.projectSlug!, resume: resume({ org: "Personal" }) }),
        deps,
      ),
    ).toThrow(/resume.org is never printed/);
    const { slug, tagline, kind, featured, deepPage } = card;
    expect(() =>
      loadProject(
        file({
          slug,
          tagline,
          kind,
          featured,
          deepPage,
          researchId: "clinical-copilot",
          resume: resume({ org: "Personal" }),
        }),
        deps,
      ),
    ).toThrow(/resume.org is never printed/);
  });

  it("keeps the MDX body and the resolved cover beside the record", () => {
    expect(loadProject(file(card, "## Body"), deps).body).toBe("## Body");
    expect(loadProject(file(card), deps).coverAsset).toBeUndefined();
    expect(loadProject(file({ ...card, cover: assets[0].path }), deps).coverAsset?.path).toBe(
      assets[0].path,
    );
    expect(projectBySlug("stimmap3d")?.body).toContain("## What it is");
    expect(projectBySlug("spinal-curvature-capstone")?.body).toContain("## The problem");
  });

  it("refuses a deep page without a body (a body is all a deep page renders since Session 4)", () => {
    const deep = { ...card, featured: true, deepPage: true };
    expect(() => loadProject(file(deep), deps)).toThrow(/needs an MDX body/);
    expect(() => loadProject(file(deep, "   \n"), deps)).toThrow(/needs an MDX body/);
    expect(loadProject(file(deep, "## Body"), deps).body).toBe("## Body");
  });

  it("accepts a /docs/ link only when it names a document in assets.json", () => {
    const pdf = assets.find((a) => a.kind === "document")!;
    const good = { ...card, links: [{ kind: "pdf", label: "PDF", url: `/${pdf.path}` }] };
    expect(loadProject(file(good), deps).links?.[0].url).toBe(`/${pdf.path}`);
    const bad = { ...card, links: [{ kind: "pdf", label: "PDF", url: "/docs/nope.pdf" }] };
    expect(() => loadProject(file(bad), deps)).toThrow(/not a document in content\/assets.json/);
    // An image path is not a document, and a bare site path is not a link form at all.
    expect(
      ProjectFrontmatterSchema.safeParse({
        ...card,
        links: [{ kind: "pdf", label: "PDF", url: "/images/about/paige-rattenberry.jpg" }],
      }).success,
    ).toBe(false);
  });
});
