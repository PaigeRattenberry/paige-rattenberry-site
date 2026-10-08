import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProjectPage, { generateStaticParams } from "@/app/projects/[slug]/page";
import { deepPageProjects, projectBySlug, projects } from "@/lib/content/load";
import { sourceLabel } from "@/lib/content/sources";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
}));

async function renderProject(slug: string) {
  const ui = await ProjectPage({ params: Promise.resolve({ slug }) } as never);
  return render(ui);
}

/** Every frontmatter metric renders exactly once, through MetricStat, with its public source label. */
async function expectMetricsSourced(slug: string) {
  const project = projectBySlug(slug)!;
  await renderProject(slug);
  // The body, not the old frontmatter fallback, is what renders.
  expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0);
  expect(document.body.textContent).not.toMatch(/written in Session 4/);
  expect(project.metrics.length).toBeGreaterThan(0);
  for (const metric of project.metrics) {
    const buttons = screen.getAllByRole("button", {
      name: `Source for ${metric.value}: ${metric.label}`,
    });
    expect(buttons, `${slug}: ${metric.value}`).toHaveLength(1);
    const tooltip = document.getElementById(buttons[0].getAttribute("aria-describedby")!)!;
    expect(tooltip).toHaveTextContent(`Source: ${sourceLabel(metric.source)}`);
    expect(tooltip.textContent).not.toContain("_source/");
  }
}

/** Figures are numbered 1..n in order, each with a mono caption naming its source. */
function expectNumberedFigures(count: number) {
  const figures = screen.getAllByRole("figure");
  expect(figures).toHaveLength(count);
  figures.forEach((figure, i) => {
    const caption = figure.querySelector("figcaption")!;
    expect(caption).toHaveTextContent(`Fig. ${i + 1}`);
    expect(caption).toHaveTextContent(/Source:/);
    expect(caption.textContent).not.toContain("_source/");
    // Nothing on these pages is an image cropped from a source PDF (Session 4 acceptance).
    expect(figure.querySelector("img")).toBeNull();
  });
}

describe("/projects/stimmap3d", () => {
  it("renders StimMap3D's own non-clinical wording before the body (gate c)", async () => {
    const project = projectBySlug("stimmap3d")!;
    expect(project.disclaimer).toBe("Illustrative model — not for clinical use");
    await renderProject("stimmap3d");
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Illustrative model — not for clinical use");
    // Before the embed and the body.
    const load = screen.getByRole("button", { name: "Load interactive demo" });
    expect(note.compareDocumentPosition(load) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const body = screen.getByRole("heading", { name: "What it is" });
    expect(note.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders every frontmatter metric through MetricStat with a public source label", async () => {
    await expectMetricsSourced("stimmap3d");
  });

  it("carries the Built with Claude Code box inside the one facts landmark", async () => {
    await renderProject("stimmap3d");
    const facts = screen.getByRole("complementary", { name: "Project facts" });
    expect(screen.getAllByRole("complementary")).toHaveLength(1);
    const box = within(facts).getByRole("region", { name: "Built with Claude Code" });
    expect(within(box).getByRole("link", { name: "How this site was built" })).toHaveAttribute(
      "href",
      "/how-this-was-built",
    );
  });

  it("mounts the live app only after the click, with the disclaimer and Open full app beside it (DESIGN §7.1)", async () => {
    const project = projectBySlug("stimmap3d")!;
    const { container } = await renderProject("stimmap3d");
    expect(container.querySelector("iframe")).toBeNull();
    const figure = container.querySelector<HTMLElement>("[data-embed-status]")!;
    expect(figure).toHaveAttribute("data-embed-status", "idle");
    // The poster is the cover from assets.json, and the frame is the page's Fig. 1.
    const poster = within(figure).getByRole("img");
    expect(poster).toHaveAttribute("alt", project.coverAsset!.alt);
    expect(decodeURIComponent(poster.getAttribute("src")!)).toContain(project.coverAsset!.path);
    const caption = figure.querySelector<HTMLElement>("figcaption")!;
    expect(caption).toHaveTextContent("Fig. 1");
    expect(caption).toHaveTextContent("Illustrative model — not for clinical use");
    const open = within(caption).getByRole("link", { name: "Open full app" });
    expect(open).toHaveAttribute("href", "https://stimmap3d.pages.dev");
    expect(open).toHaveAttribute("target", "_blank");

    // happy-dom reports the (deliberately disabled) iframe page load as a console error.
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: "Load interactive demo" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", project.embed!.src);
    expect(frame).toHaveAttribute(
      "src",
      "https://stimmap3d.pages.dev/?preset=F3&proto=10hz-hf-l&elec=1#/",
    );
    expect(frame).toHaveAttribute("title", "StimMap3D interactive demo");
    // Still beside the frame once the app has replaced the poster.
    expect(caption).toHaveTextContent("Illustrative model — not for clinical use");
    expect(within(caption).getByRole("link", { name: "Open full app" })).toBeInTheDocument();
    quiet.mockRestore();
  });

  it("links the live app and the public repository in the facts column and the body", async () => {
    await renderProject("stimmap3d");
    const facts = screen.getByRole("complementary", { name: "Project facts" });
    expect(within(facts).getByRole("link", { name: "StimMap3D live app" })).toHaveAttribute(
      "href",
      "https://stimmap3d.pages.dev",
    );
    expect(within(facts).getByRole("link", { name: "StimMap3D source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/PaigeRattenberry/stimmap3d",
    );
    expect(screen.getByRole("link", { name: "stimmap3d.pages.dev" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/PaigeRattenberry/stimmap3d",
    );
    // The aside links the public workflow document at a pinned commit, never a branch.
    const box = within(facts).getByRole("region", { name: "Built with Claude Code" });
    expect(
      within(box).getByRole("link", { name: /AI-assisted development notes/ }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(
        /^https:\/\/github\.com\/PaigeRattenberry\/stimmap3d\/blob\/[a-f0-9]{40}\/docs\/agentic-development\.md$/,
      ),
    );
  });

  it("numbers its screenshots from 2, each from assets.json with a public source line", async () => {
    await renderProject("stimmap3d");
    const figures = screen.getAllByRole("figure");
    // Fig. 1 is the embed; the body's screenshots follow.
    expect(figures).toHaveLength(6);
    figures.forEach((figure, i) => {
      const caption = figure.querySelector("figcaption")!;
      expect(caption).toHaveTextContent(`Fig. ${i + 1}`);
      expect(caption.textContent).not.toContain("_source/");
      if (i > 0) expect(caption).toHaveTextContent(/Source:/);
      // Every StimMap3D image keeps the app's banner in frame, and its alt text says so.
      expect(figure.querySelector("img")?.getAttribute("alt")).toMatch(/not for clinical use/);
    });
  });

  it("keeps Paige's honest-framing brief: relative units, not FEM, synthetic, no clinical claim", async () => {
    await renderProject("stimmap3d");
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/relative units, never V\/m/);
    expect(text).toMatch(/not a finite-element\s+simulation/);
    expect(text).toMatch(/not a medical device/);
    expect(text).toMatch(/trajectories in the dose–response panel are synthetic/);
    // The forbidden phrasings appear only negated, or inside StimMap3D's own quoted caveat.
    expect(text).not.toMatch(/predicts? (treatment )?response/i);
    expect(text).not.toMatch(/\bis anatomically (faithful|accurate)/i);
    expect(text).not.toMatch(/\d\s*V\/m/);
  });
});

describe("/projects/spinal-curvature-capstone", () => {
  it("renders the body with every metric sourced, the SFU article link, and two original figures", async () => {
    await expectMetricsSourced("spinal-curvature-capstone");
    expect(
      screen.getByRole("heading", { name: "Adolescent Spinal Curvature Brace Optimization" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The problem" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /SFU School of Engineering Science article/ }),
    ).toHaveAttribute("href", expect.stringContaining("sfu.ca"));
    expectNumberedFigures(2);
    for (const caption of document.querySelectorAll("figcaption")) {
      expect(caption).toHaveTextContent("Illustration");
    }
  });

  it("presents the ML model as proposed, never as built, and credits the team without naming it", async () => {
    await renderProject("spinal-curvature-capstone");
    const proposed = screen.getByRole("heading", { name: "What was proposed, not built" });
    expect(proposed).toBeInTheDocument();
    const main = document.body.textContent ?? "";
    expect(main).toMatch(/Neither was built/);
    // Teammates are not named on the site (DESIGN §3.4); the article that names them is linked.
    expect(main).toMatch(/names the whole team/);
    // No "How this site was built" aside on this page (that box is StimMap3D's).
    expect(screen.queryByRole("region", { name: "Built with Claude Code" })).toBeNull();
  });
});

describe("/projects/interpretable-medical-imaging-thesis", () => {
  it("renders the body with every metric sourced, three recreated figures, and the derived PDF link", async () => {
    await expectMetricsSourced("interpretable-medical-imaging-thesis");
    expect(screen.getByRole("heading", { name: "Inducing ground truth" })).toBeInTheDocument();
    expectNumberedFigures(3);
    const facts = screen.getByRole("complementary", { name: "Project facts" });
    expect(within(facts).getByRole("link", { name: /Thesis PDF/ })).toHaveAttribute(
      "href",
      "/docs/paige-rattenberry-honours-thesis-2022.pdf",
    );
  });

  it("plots both IoU tables with a legend, axis labels and a table of values", async () => {
    await renderProject("interpretable-medical-imaging-thesis");
    const charts = screen.getAllByRole("img", { name: /Line chart of average IoU/ });
    expect(charts).toHaveLength(2);
    expect(charts[0]).toHaveAccessibleName(/ResNet-34/);
    expect(charts[1]).toHaveAccessibleName(/VGG-16/);
    const tables = screen.getAllByRole("table");
    expect(tables).toHaveLength(2);
    expect(within(tables[0]).getByRole("rowheader", { name: "FullGrad" })).toBeInTheDocument();
    expect(within(tables[0]).getByText("0.530")).toBeInTheDocument();
    expect(within(tables[1]).getByText("0.560")).toBeInTheDocument();
    expect(screen.getAllByRole("list", { name: "Legend" })).toHaveLength(2);
    expect(screen.getByText(/FullGrad peak 0\.530 at 90%/)).toBeInTheDocument();
    expect(screen.getByText(/FullGrad peak 0\.560 at 65%/)).toBeInTheDocument();
  });
});

describe("/projects/genai-literature-review", () => {
  it("renders the body with its one metric sourced, no figure, and the review PDF in the facts column", async () => {
    await expectMetricsSourced("genai-literature-review");
    for (const name of [
      "Why I wrote it",
      "The failure modes",
      "Interpretability and explainability",
      "What the field was proposing",
      "Where it fell short",
      "What I took from it",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    // Every figure in the review is reproduced from a paper it cites, so the page has none.
    expect(screen.queryAllByRole("figure")).toHaveLength(0);
    const facts = screen.getByRole("complementary", { name: "Project facts" });
    expect(within(facts).getByRole("link", { name: "Literature review PDF" })).toHaveAttribute(
      "href",
      "/docs/paige-rattenberry-genai-interpretability-review-2024.pdf",
    );
  });

  it("types no numeral but the date, and says which way round it uses the two words", async () => {
    const project = projectBySlug("genai-literature-review")!;
    const prose = project.body
      .replace(/<MetricStat value="[^"]+" \/>/g, "")
      .replace("April 2024", "");
    expect(prose).not.toMatch(/\d/);
    await renderProject("genai-literature-review");
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/Other literatures use the same words the other way round/);
    // A survey of other people's work, not a publication or a system Paige built.
    expect(text).toMatch(/is the work of the authors the review cites/);
  });
});

describe("/projects/[slug]", () => {
  it("statically generates exactly the deep-page slugs from content", () => {
    expect(
      generateStaticParams()
        .map((p) => p.slug)
        .sort(),
    ).toEqual(
      projects
        .filter((p) => p.deepPage)
        .map((p) => p.slug)
        .sort(),
    );
  });

  it("every deep page is covered by a body test above", () => {
    expect(deepPageProjects.map((p) => p.slug).sort()).toEqual([
      "genai-literature-review",
      "interpretable-medical-imaging-thesis",
      "spinal-curvature-capstone",
      "stimmap3d",
    ]);
  });

  it("404s for a card that has no deep page", async () => {
    await expect(renderProject("mentalwell")).rejects.toThrow("notFound");
  });
});
