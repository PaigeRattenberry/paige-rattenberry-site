/**
 * MDX compilation for project bodies (DESIGN §5.2): next-mdx-remote's RSC API with
 * remark-gfm, rehype-slug and rehype-autolink-headings. Server-only. The components made
 * available inside MDX are `Figure`, `Callout`, the Session 4 figures (`Diagram`, `IouChart`,
 * which take an id into content/figures.ts and a figure number), `Screenshot` (Session 3b: an
 * image path in content/assets.json and a figure number) and a `MetricStat` that takes
 * only a `value`: the number itself, its label and its source live in the project's
 * frontmatter metrics, so a body can render a figure but never introduce one (DESIGN §3.3).
 * Session 8 adds `renderMarkdown` for the build logs: plain Markdown, no components.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings, { type Options as AutolinkOptions } from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { DiagramFigure } from "@/components/figures/DiagramFigure";
import { IouChartFigure } from "@/components/figures/IouChartFigure";
import { ScreenshotFigure } from "@/components/figures/ScreenshotFigure";
import { Callout } from "@/components/ui/Callout";
import { Figure } from "@/components/ui/Figure";
import { MetricStat } from "@/components/ui/MetricStat";

import type { Metric } from "./content/schema";
import { metricView } from "./content/sources";

/**
 * The one accepted spelling of a metric reference in a body. The claims gate reads bodies
 * with this pattern rather than an MDX parse, so the form is fixed: double quotes, `value`
 * as the only attribute, self-closing, on one line (AGENTS.md).
 */
const METRIC_REF = /<MetricStat\s+value="([^"]+)"\s*\/>/g;
const ANY_METRIC_TAG = /<MetricStat\b[^>]*>/g;

/** `<MetricStat value="..." />` tags in a body, for the claims-gate test. */
export function metricRefs(body: string): string[] {
  return [...body.matchAll(METRIC_REF)].map((m) => m[1]);
}

/**
 * Problems the claims gate must fail on: a reference to an undeclared metric, or a MetricStat
 * tag written in any other form than the one `metricRefs` recognises (it would compile and
 * render, but the gate could not see it).
 */
export function metricRefProblems(body: string, metrics: readonly Metric[]): string[] {
  const declared = new Set(metrics.map((m) => m.value));
  const problems = metricRefs(body)
    .filter((v) => !declared.has(v))
    .map((v) => `undeclared metric "${v}"`);
  const wellFormed = [...body.matchAll(METRIC_REF)].map((m) => m[0]);
  for (const [tag] of body.matchAll(ANY_METRIC_TAG)) {
    if (!wellFormed.includes(tag)) problems.push(`unrecognised MetricStat tag ${tag}`);
  }
  return problems;
}

function boundMetricStat(where: string, metrics: readonly Metric[]) {
  return function BoundMetricStat({ value }: { value: string }) {
    const metric = metrics.find((m) => m.value === value);
    if (!metric) {
      throw new Error(`${where}: <MetricStat value="${value}" /> is not a declared metric`);
    }
    return <MetricStat metric={metricView(metric)} />;
  };
}

type MdxOptions = NonNullable<
  NonNullable<Parameters<typeof compileMDX>[0]["options"]>["mdxOptions"]
>;

/** Linked headings, shared by project bodies and build logs so their heading markup matches. */
const rehypePlugins: MdxOptions["rehypePlugins"] = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap",
      properties: { className: ["heading-link"] },
    } satisfies AutolinkOptions,
  ],
];

type Options = {
  /** Used in error messages, e.g. "projects:stimmap3d". */
  where: string;
  metrics: readonly Metric[];
};

/** Compile an MDX body to React. Throws at build for an unknown component or metric. */
export async function renderMDX(body: string, { where, metrics }: Options) {
  const { content } = await compileMDX({
    source: body,
    components: {
      Figure,
      Callout,
      MetricStat: boundMetricStat(where, metrics),
      // Session 4 figures: values and steps live in content/figures.ts, not in the body. Bodies
      // write `number="2"`: this compile drops JSX expression attributes such as `number={2}`
      // (checked with a probe in Session 4), so the components coerce the string.
      Diagram: DiagramFigure,
      IouChart: IouChartFigure,
      Screenshot: ScreenshotFigure,
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins,
      },
    },
  });
  return content;
}

type MdNode = {
  type: string;
  url?: string;
  value?: string;
  identifier?: string;
  children?: MdNode[];
};

type LinkBase = { from: string; repository: string };

/** A link may not leave the repository or name a git-ignored folder. */
const UNPUBLISHED = /^(\.\.(\/|$)|_source(\/|$)|private(\/|$))/;

let publishedFiles: Set<string> | null | undefined;

/**
 * The files git would publish: tracked or new, never ignored (`--others --exclude-standard`, so a
 * screenshot not yet committed still resolves). Null where git is unavailable (Vercel's build
 * container may ship no `.git`); CI's build and unit tests always have it, so a link to an ignored
 * file fails there first.
 */
function gitPublishedFiles(): Set<string> | null {
  if (publishedFiles !== undefined) return publishedFiles;
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    publishedFiles = new Set(out.split("\0").filter(Boolean));
  } catch {
    publishedFiles = null;
  }
  return publishedFiles;
}

/**
 * existsSync with the letter case checked too, which Windows and macOS would otherwise ignore.
 * The ignore comments keep the bundler from tracing every file under the checkout, git-ignored
 * folders included, into the pages that import this module.
 */
function existsExactly(target: string): boolean {
  let dir = process.cwd();
  for (const segment of target.split("/")) {
    if (
      !existsSync(/*turbopackIgnore: true*/ dir) ||
      !readdirSync(/*turbopackIgnore: true*/ dir).includes(segment)
    ) {
      return false;
    }
    dir = path.join(/*turbopackIgnore: true*/ dir, segment);
  }
  return true;
}

/**
 * Where a build log's link points on the site: a link to another log goes to that log's page,
 * and a link to any other file in the repository goes to the file in the public repository.
 * Absolute URLs, site paths and in-page anchors are left alone. The public repository is not a
 * project link (IMPLEMENTATION_PLAN §4 Session 8), so `assertPublishableLinks` does not apply;
 * instead the build fails on a relative link that would leave the repository, point into a
 * git-ignored folder, name a git-ignored file (a generated PDF or an env file is in the checkout
 * but not in the repository), or name a file that is not in the checkout in exactly that letter
 * case (a typo, a renamed log). The path is percent-decoded before it is checked.
 */
export function resolveRepositoryLink(url: string, { from, repository }: LinkBase): string {
  if (/^([a-z]+:|#|\/)/i.test(url)) return url;
  const [encoded, hash] = url.split("#");
  let file: string;
  try {
    file = decodeURIComponent(encoded);
  } catch {
    throw new Error(`build log link "${url}" is not a valid percent-encoded path`);
  }
  const target = path.posix.normalize(path.posix.join(from, file));
  if (UNPUBLISHED.test(target)) {
    throw new Error(`build log link "${url}" points outside the published tree`);
  }
  if (!existsExactly(target)) {
    throw new Error(`build log link "${url}" names ${target}, which does not exist`);
  }
  const published = gitPublishedFiles();
  if (published && !published.has(target)) {
    throw new Error(`build log link "${url}" names ${target}, which git ignores`);
  }
  const log = /^docs\/build-log\/([^/]+)\.md$/.exec(target);
  const href = log
    ? `/how-this-was-built/${log[1]}`
    : `${repository}/blob/main/${target.split("/").map(encodeURIComponent).join("/")}`;
  return hash ? `${href}#${hash}` : href;
}

/**
 * A remark plugin for build logs: resolveRepositoryLink on every link; inline HTML kept as the
 * text it is (Markdown mode would otherwise drop a placeholder such as "<n>" from the page, so
 * the page would differ from the committed file); and no relative images, inline or
 * reference-style, which would break on the page (a log names screenshots by path instead).
 */
function remarkRepositoryLinks(base: LinkBase) {
  return () => (tree: MdNode) => {
    // A reference-style image takes its URL from a definition, so read them all, as written,
    // before any is rewritten.
    const definitions = new Map<string, string>();
    const collect = (node: MdNode) => {
      if (node.type === "definition" && node.identifier && node.url) {
        definitions.set(node.identifier, node.url);
      }
      node.children?.forEach(collect);
    };
    collect(tree);
    const refuseRelativeImage = (url: string | undefined) => {
      if (url && !/^https?:/i.test(url)) {
        throw new Error(`build log image "${url}": relative images are not rendered`);
      }
    };
    const walk = (node: MdNode) => {
      if ((node.type === "link" || node.type === "definition") && node.url) {
        node.url = resolveRepositoryLink(node.url, base);
      }
      if (node.type === "image") refuseRelativeImage(node.url);
      if (node.type === "imageReference" && node.identifier) {
        refuseRelativeImage(definitions.get(node.identifier));
      }
      if (node.type === "html") node.type = "text";
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * Compile a build log (plain Markdown, not MDX: a log may hold `<` and `{` as text) to React,
 * with GitHub tables and linked headings like the project bodies. Server-only.
 */
export async function renderMarkdown(body: string, { from, repository }: LinkBase) {
  const { content } = await compileMDX({
    source: body,
    options: {
      mdxOptions: {
        format: "md",
        remarkPlugins: [remarkGfm, remarkRepositoryLinks({ from, repository })],
        rehypePlugins,
      },
    },
  });
  return content;
}
