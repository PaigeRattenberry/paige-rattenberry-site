import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  about,
  allMetrics,
  allSkillRefs,
  allSourceIds,
  assets,
  certifications,
  deepPageProjects,
  education,
  featuredProjects,
  figures,
  leadership,
  profile,
  projects,
  research,
  researchByTheme,
  roles,
  skills,
  SOURCE_LABELS,
} from "@/lib/content/load";
import { findMetric } from "@/lib/content/metrics";
import { AssetSchema, MetricSchema } from "@/lib/content/schema";
import { metricRefProblems, metricRefs } from "@/lib/mdx";
import { projectSlugs } from "@/lib/routes";

import { PHONE_PATTERN } from "./helpers/privacy";
import { ROOT, loadTerms, termHits } from "./helpers/publication";

const privateTerms = loadTerms();

const NUMBER_WORDS =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundreds?|thousands?|millions?|billions?|dozens?|half|twice|single|double|triple)\b/i;

/**
 * The counts a line prints outside its declared metrics, in digits or in words. Dates and
 * identifiers need no metric object: a year, a code of capitals then digits (SEC595, BM25F)
 * and a standard's number (IEC 62304) are not counts.
 */
function unsourcedCounts(line: string, values: readonly string[]): string[] {
  let rest = line
    .replace(/\b[A-Z]{2,}\d+[A-Z]*\b/g, " ")
    .replace(/\b(?:IEC|ISO) \d+\b/g, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ");
  for (const v of values) {
    for (let i = findMetric(rest, v); i >= 0; i = findMetric(rest, v)) {
      rest = `${rest.slice(0, i)} ${rest.slice(i + v.length)}`;
    }
  }
  return [...rest.matchAll(new RegExp(`\\d+|${NUMBER_WORDS.source}`, "gi"))].map((m) => m[0]);
}

function walk(dir: string): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** DESIGN §3.4: the check reads text files only; binaries (images, fonts) are skipped. */
function readText(file: string): string | null {
  const bytes = readFileSync(file);
  if (bytes.subarray(0, 8192).includes(0)) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

describe("claims gate (DESIGN §3.3)", () => {
  it("every metric is well-formed and names a source", () => {
    const metrics = allMetrics();
    expect(metrics.length).toBeGreaterThan(0);
    for (const m of metrics) {
      expect(() => MetricSchema.parse(m)).not.toThrow();
      expect(m.source, `metric ${m.value} (${m.label})`).toBeTruthy();
    }
  });

  it("every source id has a reader-facing label", () => {
    for (const id of allSourceIds()) {
      expect(SOURCE_LABELS[id], `no label for source "${id}" in content/sources.ts`).toBeTruthy();
    }
  });

  /** The plain-text hosts of metrics, each with the texts its metrics must occur in. */
  const hosts: { where: string; texts: string[]; metrics: readonly { value: string }[] }[] = [
    ...roles.map((r) => ({ where: `experience:${r.id}`, texts: r.bullets, metrics: r.metrics })),
    { where: "education", texts: education.bullets, metrics: education.metrics },
    ...certifications.map((c) => ({
      where: `certifications:${c.id}`,
      texts: [c.detail ?? ""],
      metrics: c.metrics,
    })),
    ...research.map((r) => ({
      where: `research:${r.id}`,
      texts: [r.summary],
      metrics: r.metrics,
    })),
    ...leadership.map((l) => ({
      where: `leadership:${l.id}`,
      texts: [l.summary],
      metrics: l.metrics,
    })),
    {
      where: "profile:currently",
      texts: [profile.currently.text],
      metrics: profile.currently.metrics,
    },
    { where: "profile:summary", texts: [profile.summary.text], metrics: profile.summary.metrics },
  ];

  it("every declared metric occurs in its associated content text", () => {
    for (const host of hosts) {
      for (const m of host.metrics) {
        expect(
          host.texts.some((t) => findMetric(t, m.value) >= 0),
          `${host.where}: metric "${m.value}" does not appear as a whole token in its text`,
        ).toBe(true);
      }
    }
    // MDX projects: only the texts a page actually routes through MetricStat count. A grid card
    // renders tagline and proof; a compact card (featured deep pages, on home and /projects)
    // renders the proof alone. A deep page renders its body's `<MetricStat value="..." />`
    // references, or, until the body exists, the proof and bullets. A raw number typed into a
    // body does not count, since it would render unsourced.
    const compact = new Set(featuredProjects.map((p) => p.slug));
    for (const p of projects) {
      const texts = compact.has(p.slug) ? [p.proof] : [p.tagline, p.proof];
      if (p.deepPage && !p.body) texts.push(...p.bullets);
      const refs = p.deepPage ? metricRefs(p.body) : [];
      for (const m of p.metrics) {
        expect(
          texts.some((t) => findMetric(t, m.value) >= 0) || refs.includes(m.value),
          `projects:${p.slug}: metric "${m.value}" is rendered with its source nowhere (card text${p.deepPage ? (p.body ? " or a MetricStat in the body" : " or the bullets") : ""})`,
        ).toBe(true);
      }
    }
  });

  it("no metric host prints a count that is not one of its declared metrics", () => {
    // The check above proves each declared metric is present, not that nothing else is: a
    // spelled-out count typed later would render with no source.
    for (const host of hosts) {
      const values = host.metrics.map((m) => m.value);
      for (const t of host.texts) expect(unsourcedCounts(t, values), host.where).toEqual([]);
    }
  });

  it("a certification's resume line prints no number that is not a declared metric", () => {
    // Every metric is already required to occur in `detail` (above), so a value the resume line
    // shares is sourced; nothing else in it may be a count.
    for (const c of certifications) {
      if (!c.resumeDetail) continue;
      const values = c.metrics.map((m) => m.value);
      expect(unsourcedCounts(c.resumeDetail, values), `certifications:${c.id}`).toEqual([]);
    }
  });

  it("the count check catches a count in words or digits and passes dates and identifiers", () => {
    expect(unsourcedCounts("covering twelve domains", [])).toEqual(["twelve"]);
    expect(unsourcedCounts("in 6 sections", [])).toEqual(["6"]);
    expect(unsourcedCounts("its six sections, often", ["six"])).toEqual([]);
    expect(unsourcedCounts("Scored 99%, in 13 of 14 domains", ["99%", "13 of 14"])).toEqual([]);
    expect(unsourcedCounts("via SANS SEC573, applying MLOps", [])).toEqual([]);
    expect(unsourcedCounts("BM25F search under IEC 62304, AAAI 2022", [])).toEqual([]);
    expect(unsourcedCounts("across 250 pull requests", [])).toEqual(["250"]);
  });

  it("no deep-page tagline contains a declared metric (the page header renders it as plain text)", () => {
    for (const p of deepPageProjects) {
      for (const m of p.metrics) {
        expect(
          findMetric(p.tagline, m.value),
          `projects:${p.slug}: tagline shows metric "${m.value}" without its source`,
        ).toBeLessThan(0);
      }
    }
  });

  it("every MetricStat tag in an MDX body is well-formed and refers to a declared metric", () => {
    for (const p of projects) {
      expect(metricRefProblems(p.body, p.metrics), `projects:${p.slug}`).toEqual([]);
    }
  });

  it("the featured projects keep the DESIGN §0 order", () => {
    expect(featuredProjects.map((p) => p.slug)).toEqual([
      "stimmap3d",
      "interpretable-medical-imaging-thesis",
      "spinal-curvature-capstone",
    ]);
  });

  it("research-backed project cards carry their research item's facts, not a copy", () => {
    const backed = projects.filter((p) => p.researchId);
    expect(backed.map((p) => p.slug).sort()).toEqual([
      "capnography-eeg-research",
      "clinical-copilot",
      "genai-literature-review",
    ]);
    for (const p of backed) {
      const item = research.find((r) => r.id === p.researchId)!;
      expect(item).toBeDefined();
      expect(p.title).toBe(item.title);
      expect(p.dates).toBe(item.dates);
      expect(p.proof).toBe(item.summary);
      expect(p.metrics).toEqual(item.metrics);
      expect(p.source).toBe(item.source);
    }
  });

  it("only StimMap3D links a repository or a live app, and only the ones INVENTORY.md records", () => {
    const found = projects.flatMap((p) =>
      (p.links ?? [])
        .filter((l) => l.kind === "repo" || l.kind === "live")
        .map((l) => `${p.slug} ${l.kind} ${l.url}`),
    );
    expect(found).toEqual([
      "stimmap3d live https://stimmap3d.pages.dev",
      "stimmap3d repo https://github.com/PaigeRattenberry/stimmap3d",
    ]);
  });

  it("every StimMap3D repository URL is the public repo, and file links pin one full commit", () => {
    const p = projects.find((x) => x.slug === "stimmap3d")!;
    const text = [JSON.stringify(p.links), JSON.stringify(p.aside), p.body].join("\n");
    const urls = text.match(/https:\/\/github\.com\/[^\s)"\\]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(1);
    const pins = new Set<string>();
    for (const url of urls) {
      // Exactly the cleared repository: a longer name that merely starts the same way fails.
      expect(url).toMatch(/^https:\/\/github\.com\/PaigeRattenberry\/stimmap3d(\/|$)/);
      const pin = /\/blob\/([^/]+)\//.exec(url);
      if (pin) pins.add(pin[1]);
    }
    // One pinned commit for every file link, the same one the repository screenshot records.
    const shot = assets.find((a) => a.path === "images/stimmap3d/visualizer.png")!;
    expect(shot.provenance.kind).toBe("repository");
    expect([...pins]).toEqual([shot.provenance.revision]);
    expect(shot.provenance.revision).toMatch(/^[a-f0-9]{40}$/);
  });

  it("every research item has a theme, and the themed groups drop and repeat nothing", () => {
    const grouped = researchByTheme.flatMap((g) => g.items.map((r) => r.id));
    expect([...grouped].sort()).toEqual(research.map((r) => r.id).sort());
    // DESIGN §2's order, with each group newest first.
    expect(researchByTheme.map((g) => [g.theme, g.items.map((r) => r.id)])).toEqual([
      ["interpretability-evaluation", ["genai-literature-review", "honours-thesis", "stryker-xai"]],
      [
        "medical-neural-ai",
        ["spinal-curvature-capstone", "rostrum-healthtech-connex", "sfu-faisal-lab"],
      ],
      ["applied-llm-systems", ["clinical-copilot"]],
    ]);
  });

  it("the literature review's count is its reference list, called papers and never studies", () => {
    const item = research.find((r) => r.id === "genai-literature-review")!;
    expect(item.metrics.map((m) => m.value)).toEqual(["14"]);
    expect(item.summary).toMatch(/\b14 (papers|references)\b/);
    expect(item.summary).not.toMatch(/\b14 (studies|frameworks)\b/);
  });

  it("the positioning line fits the Open Graph card (DESIGN §1: about 280 characters)", () => {
    // lib/og/card.tsx draws it into a fixed 1200×630 image with no overflow handling.
    expect(profile.positioning.length).toBeLessThanOrEqual(280);
  });

  // The term lists live outside the repository (tests/unit/helpers/publication.ts). A hit
  // reports the field and the term's index only, so no term reaches a log. A missing list skips
  // these two, and fails the publication gate's presence test unless PUBLICATION_TERMS_OPTIONAL=1.
  const firstPerson: [string, string][] = [
    ["profile.positioning", profile.positioning],
    ["profile.currently.text", profile.currently.text],
    ["profile.builtWith", profile.builtWith],
    ...about.paragraphs.map((p, i): [string, string] => [`about.paragraphs[${i}]`, p]),
    ...roles.flatMap((r) =>
      r.bullets.map((b, i): [string, string] => [`roles.${r.id}.bullets[${i}]`, b]),
    ),
  ];

  const hitsIn = (section: RegExp[] | undefined, texts: [string, string][]) =>
    texts.flatMap(([where, text]) => termHits(where, text, section ?? []));

  it.skipIf(!privateTerms["content-claims"])(
    "first-person and employer text carries no term from the private list",
    () => {
      // Project bodies are out of scope: a cited author's subject is not a claim about the work.
      expect(hitsIn(privateTerms["content-claims"], firstPerson)).toEqual([]);
    },
  );

  it.skipIf(!privateTerms["content-framing"])(
    "reader-facing content text carries no term from the private list",
    () => {
      const texts: [string, string][] = [
        ...firstPerson,
        ...projects.flatMap((p): [string, string][] => [
          [`projects.${p.slug}.tagline`, p.tagline],
          [`projects.${p.slug}.proof`, p.proof],
          [`projects.${p.slug}.body`, p.body],
        ]),
        ...research.map((r): [string, string] => [`research.${r.id}.summary`, r.summary]),
      ];
      expect(hitsIn(privateTerms["content-framing"], texts)).toEqual([]);
    },
  );

  it("the About narrative carries no numbers (numbers live with their sources elsewhere)", () => {
    for (const paragraph of about.paragraphs) {
      // A product or method name may carry a digit (StimMap3D, BM25F); nothing else may.
      expect(paragraph.replace(/StimMap3D|BM25F|M365/g, "")).not.toMatch(/\d/);
    }
  });

  it("the three featured projects are deep pages, and the deep pages are exactly the routes", () => {
    // Three, not four: both featured grids are three columns (DESIGN §0, "Featured order"), so
    // the literature review has a deep page without being featured.
    expect(featuredProjects).toHaveLength(3);
    for (const p of featuredProjects) expect(projectSlugs, p.slug).toContain(p.slug);
    expect(projectSlugs.filter((slug) => !featuredProjects.some((p) => p.slug === slug))).toEqual([
      "genai-literature-review",
    ]);
    expect(
      projects
        .filter((p) => p.deepPage)
        .map((p) => p.slug)
        .sort(),
    ).toEqual([...projectSlugs].sort());
  });

  it("every deep page has an MDX body (no frontmatter fallback since Session 4)", () => {
    expect(deepPageProjects).toHaveLength(4);
    for (const p of deepPageProjects) {
      expect(p.body.trim().length, `projects:${p.slug}`).toBeGreaterThan(0);
      // The aside always appends the "How this site was built" link, which is StimMap3D's.
      expect(p.aside !== undefined, `projects:${p.slug}: aside`).toBe(p.slug === "stimmap3d");
    }
  });

  it("every research projectSlug names a deep page whose title and dates it repeats exactly", () => {
    const linked = research.filter((r) => r.projectSlug);
    expect(linked.map((r) => r.projectSlug).sort()).toEqual([
      "interpretable-medical-imaging-thesis",
      "spinal-curvature-capstone",
    ]);
    for (const item of linked) {
      const project = deepPageProjects.find((p) => p.slug === item.projectSlug);
      expect(project, `research:${item.id}: projectSlug "${item.projectSlug}"`).toBeDefined();
      expect(item.title, `research:${item.id} title`).toBe(project!.title);
      expect(item.dates, `research:${item.id} dates`).toBe(project!.dates);
      expect(item.periods, `research:${item.id} periods`).toEqual(project!.periods);
    }
  });

  it("the thesis research item declares the project's 'five' before /research renders it", () => {
    const item = research.find((r) => r.id === "honours-thesis")!;
    const project = deepPageProjects.find((p) => p.slug === item.projectSlug)!;
    const five = project.metrics.find((m) => m.value === "five")!;
    expect(item.metrics).toContainEqual(five);
  });

  it("the thesis page's headline IoU metrics agree with the replotted tables", () => {
    const project = deepPageProjects.find(
      (p) => p.slug === "interpretable-medical-imaging-thesis",
    )!;
    const peak = (id: string) => {
      const table = figures.iouTables.find((t) => t.id === id)!;
      const fullGrad = table.series.find((s) => s.method === "FullGrad")!;
      const max = Math.max(...fullGrad.values);
      return { max, threshold: table.thresholds[fullGrad.values.indexOf(max)], table };
    };
    const resnet = peak("iou-resnet34");
    expect(resnet.max).toBeCloseTo(0.53, 3);
    expect(resnet.threshold).toBe(90);
    const vgg = peak("iou-vgg16");
    expect(vgg.max).toBeCloseTo(0.56, 3);
    expect(vgg.threshold).toBe(65);
    const values = project.metrics.map((m) => m.value);
    expect(values).toContain("0.53");
    expect(values).toContain("0.560");
    for (const table of figures.iouTables) {
      expect(table.thresholds).toEqual([50, 55, 60, 65, 70, 75, 80, 85, 90, 95]);
      expect(table.series.map((s) => s.method)).toEqual([
        "Grad-CAM",
        "Eigen-CAM",
        "Grad-CAM++",
        "Layer-CAM",
        "FullGrad",
      ]);
      expect(table.source).toMatch(/^_source\/thesis\//);
    }
  });

  it("every DESIGN §3.2 project has a card", () => {
    expect(projects.map((p) => p.slug).sort()).toEqual([
      "capnography-eeg-research",
      "clinical-copilot",
      "cmpt412-vision",
      "eegtms-app",
      "genai-literature-review",
      "interpretable-medical-imaging-thesis",
      "mentalwell",
      "ml-cybersecurity",
      "paige-rattenberry-site",
      "spinal-curvature-capstone",
      "stimmap3d",
    ]);
  });
});

describe("skills vocabulary (DESIGN §3.1)", () => {
  it("has unique ids", () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every skill tag anywhere in content/ is in the vocabulary", () => {
    const ids = new Set(skills.map((s) => s.id));
    for (const ref of allSkillRefs()) {
      expect(ids.has(ref.id), `${ref.where}: unknown skill "${ref.id}"`).toBe(true);
    }
  });
});

describe("assets provenance (DESIGN §3.4)", () => {
  const publicDir = path.join(ROOT, "public");
  // Windows Explorer and macOS Finder droppings are git-ignored and never ship; skip them.
  const onDisk = walk(publicDir)
    .filter((f) => {
      const relative = path.relative(publicDir, f).split(path.sep).join("/");
      return (
        relative.startsWith("images/") || relative.startsWith("docs/") || /\.pdf$/i.test(relative)
      );
    })
    .filter((f) => !/(^|[\\/])(Thumbs\.db|\.DS_Store)$/.test(f))
    .map((f) => path.relative(path.join(ROOT, "public"), f).split(path.sep).join("/"))
    .sort();
  const listed = assets.map((a) => a.path).sort();

  it("managed public images, documents and root PDFs match assets.json exactly", () => {
    expect(onDisk).toEqual(listed);
  });

  it("every asset has valid media metadata and publication provenance", () => {
    for (const a of assets) {
      expect(a.consent).toBe(true);
      expect(() => AssetSchema.parse(a)).not.toThrow();
    }
  });

  it("the profile headshot is a listed asset", () => {
    expect(listed).toContain(profile.headshot);
  });

  it("nothing is cropped or copied from the capstone decks or the SFU article (INVENTORY: sources only)", () => {
    for (const a of assets) {
      expect(a.provenance.source, a.path).not.toMatch(/_source\/capstone\//);
    }
  });

  it("any shipped thesis PDF is the derivative with original page 2 removed", () => {
    const thesis = assets.filter(
      (a) => a.provenance.kind === "staged" && /_source\/thesis\//.test(a.provenance.source),
    );
    expect(thesis.length).toBeGreaterThan(0);
    for (const a of thesis) {
      expect(a.kind).toBe("document");
      if (a.kind !== "document") continue;
      expect(a.removedPages).toContain(2);
      expect(a.transformations.join(" ")).toMatch(/page 2/i);
    }
  });

  it("at least one /docs/ link exists, so the loader's document check is exercised", () => {
    // The loaders throw at import for a /docs/ link that names no listed document
    // (projects.test.ts covers the refusal), so this only proves the guard sees real content.
    const links = [...research, ...leadership, ...projects].flatMap((x) => x.links ?? []);
    expect(links.some((l) => l.url.startsWith("/docs/"))).toBe(true);
  });

  it("body figure numbers run 1..n in order, after the cover when the page has one", () => {
    for (const p of deepPageProjects) {
      const numbers = [
        ...p.body.matchAll(/<(?:Diagram|IouChart|Screenshot)\b[^>]*\bnumber="(\d+)"/g),
      ].map((m) => Number(m[1]));
      const first = p.coverAsset ? 2 : 1;
      expect(numbers, `projects:${p.slug}`).toEqual(numbers.map((_, i) => first + i));
    }
  });
});

describe("privacy gate (DESIGN §3.4)", () => {
  // Generic North-American shape; never the real number. Matches SVG coordinate pairs too,
  // which is why only text files are read and why app/icon.svg is written not to match.
  const PHONE = PHONE_PATTERN;
  const scanned = ["app", "components", "content", "lib", "public", "docs/build-log"];

  it("no phone-shaped string in public text, including build logs", () => {
    const offenders: string[] = [];
    let files = 0;
    for (const dir of scanned) {
      for (const file of walk(path.join(ROOT, dir))) {
        const text = readText(file);
        if (text === null) continue;
        files += 1;
        const m = text.match(PHONE);
        if (m) offenders.push(`${path.relative(ROOT, file)}: ${m[0]}`);
      }
    }
    expect(files).toBeGreaterThan(10);
    expect(offenders).toEqual([]);
  });

  it("StimMap3D ships one repository screenshot and live captures staged with commit, origin and date", () => {
    const shots = assets.filter((a) => a.path.startsWith("images/stimmap3d/"));
    expect(shots.length).toBeGreaterThanOrEqual(4);
    expect(shots.length).toBeLessThanOrEqual(6);
    const fromRepo = shots.filter((a) => a.provenance.kind === "repository");
    expect(fromRepo.map((a) => a.path)).toEqual(["images/stimmap3d/visualizer.png"]);
    const pinned = fromRepo[0].provenance.revision;
    for (const a of shots) {
      if (a.provenance.kind !== "staged") continue;
      expect(a.provenance.source).toMatch(/^_source\/stimmap3d\/[a-z0-9-]+\.png$/);
      expect(a.provenance.revision, a.path).toMatch(/^sha256-base64:/);
      expect(a.provenance.revision, a.path).toContain(pinned);
      expect(a.provenance.revision, a.path).toContain("https://stimmap3d.pages.dev");
      expect(a.provenance.revision, a.path).toMatch(/captured \d{4}-\d{2}-\d{2}/);
    }
  });

  it("nothing in content/ references a _source file that is not staged", () => {
    // Sources must be real files so a claim can be re-checked; skipped when _source is absent
    // (CI), since it is untracked by design.
    const sourceDir = path.join(ROOT, "_source");
    if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) return;
    for (const id of allSourceIds()) {
      if (!id.startsWith("_source/")) continue;
      expect(statSync(path.join(ROOT, id), { throwIfNoEntry: false })?.isFile(), id).toBe(true);
    }
    for (const a of assets) {
      if (a.provenance.kind !== "staged") continue;
      const source = path.join(ROOT, a.provenance.source);
      expect(statSync(source, { throwIfNoEntry: false })?.isFile(), a.provenance.source).toBe(true);
      // The digest must still describe the staged original. A live capture's revision goes on
      // after the digest to name what was captured (DESIGN §3.5, amended 2026-09-20), so the
      // pattern stops at the separator — and a revision it cannot read fails here rather than
      // quietly going unchecked.
      const digest = /^sha256-base64:([A-Za-z0-9+/]+=*)(?:;|$)/.exec(a.provenance.revision)?.[1];
      expect(digest, `${a.path}: revision "${a.provenance.revision}" records no digest`).toBeTypeOf(
        "string",
      );
      const actual = createHash("sha256").update(readFileSync(source)).digest("base64");
      expect(actual, a.provenance.source).toBe(digest);
    }
  });
});
