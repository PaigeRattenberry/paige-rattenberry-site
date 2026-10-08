/**
 * Zod schemas for everything under `content/` (DESIGN §3.1). The loaders in `./load.ts` parse
 * each module through these at import time, so a malformed fact fails the build and the tests
 * rather than rendering.
 *
 * The claims gate (DESIGN §3.3) is the `source` field: every metric and every content item
 * must name where it came from. `resume-2026` is the resume of record
 * (`_source/resume/resume-2026-09-11.pdf`); `linkedin` is the
 * snapshot at `_source/linkedin/profile-2026-09-11.pdf` or the verbatim quotes recorded in
 * `_source/INVENTORY.md`; `site-build-record` is this site's own planning documents and build
 * logs; `giac-gmle-objectives` and `sans-sec595-course` are the official GIAC and SANS pages, read
 * 2026-10-05; `_source/<file>` points at one staged document.
 */
import { z } from "zod";

export const SourceIdSchema = z.union([
  z.literal("resume-2026"),
  z.literal("linkedin"),
  z.literal("stimmap3d-repo"),
  z.literal("site-build-record"),
  z.literal("giac-gmle-objectives"),
  z.literal("sans-sec595-course"),
  z.string().regex(/^_source\/.+/, "a _source/<file> path"),
]);
export type SourceId = z.infer<typeof SourceIdSchema>;

/** "2026-09" style year-month, used for sorting and the Session 5 timeline. */
const YearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "YYYY-MM");

export const PeriodSchema = z.object({
  start: YearMonth,
  /** `null` means ongoing. */
  end: YearMonth.nullable(),
});
export type Period = z.infer<typeof PeriodSchema>;

/**
 * A number that appears on the site. `value` is rendered exactly as written (`300+`,
 * `16th/1,253`, `99%`); `label` says what it counts; `source` is where it was checked.
 */
export const MetricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  source: SourceIdSchema,
  /** Extra context for the tooltip, e.g. the pass mark next to a score. */
  note: z.string().optional(),
});
export type Metric = z.infer<typeof MetricSchema>;

const SkillId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case skill id");
const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case slug");

/**
 * A site path to a shipped PDF under public/docs/. The one non-URL link form; the loaders
 * check that it names a `document` in content/assets.json (IMPLEMENTATION_PLAN §4 Session 4).
 */
export const DocumentPath = z
  .string()
  .regex(/^\/docs\/[^/?#\\]+\.pdf$/, "a /docs/<file>.pdf site path");

export const LinkSchema = z.object({
  label: z.string().min(1),
  /** An absolute URL, or a site path to a document listed in content/assets.json. */
  url: z.union([z.url(), DocumentPath]),
  /** A sentence shown beside the link or its embed, e.g. what a video recording contains. */
  note: z.string().min(1).optional(),
});
export type Link = z.infer<typeof LinkSchema>;

export const SkillCategorySchema = z.object({
  id: SkillId,
  label: z.string().min(1),
});

export const SkillSchema = z.object({
  id: SkillId,
  label: z.string().min(1),
  category: SkillId,
});
export type Skill = z.infer<typeof SkillSchema>;

export const SkillsSchema = z.object({
  categories: z.array(SkillCategorySchema).min(1),
  skills: z.array(SkillSchema).min(1),
});

export const RoleSchema = z.object({
  id: Slug,
  org: z.string().min(1),
  /** Resume wording. */
  title: z.string().min(1),
  /** Team or group, when the resume heading names one after the title. */
  team: z.string().optional(),
  location: z.string().min(1),
  /** Date range exactly as the resume prints it. */
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  /** Resume bullets, verbatim. */
  bullets: z.array(z.string().min(1)).min(1),
  skills: z.array(SkillId),
  metrics: z.array(MetricSchema),
  /** The heading (title, team, dates) and every bullet the next field does not account for. */
  source: SourceIdSchema,
  /** Where bullet wording that `source` does not hold came from (Session 9's rewrites). */
  bulletSources: z.array(SourceIdSchema).min(1).optional(),
});
export type Role = z.infer<typeof RoleSchema>;

export const HonourSchema = z.object({
  title: z.string().min(1),
  detail: z.string().optional(),
  source: SourceIdSchema,
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  location: z.string().min(1),
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  bullets: z.array(z.string().min(1)).min(1),
  honours: z.array(HonourSchema),
  metrics: z.array(MetricSchema),
  source: SourceIdSchema,
});
export type Education = z.infer<typeof EducationSchema>;

export const CertificationSchema = z.object({
  id: Slug,
  name: z.string().min(1),
  issuer: z.string().min(1),
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  /** Shown on /experience. */
  detail: z.string().optional(),
  /** What the resume prints when the site's `detail` is longer; falls back to `detail`. */
  resumeDetail: z.string().optional(),
  metrics: z.array(MetricSchema),
  source: SourceIdSchema,
});
export type Certification = z.infer<typeof CertificationSchema>;

/** The /research groups, in the order DESIGN §2 lists them. */
export const RESEARCH_THEME_IDS = [
  "interpretability-evaluation",
  "medical-neural-ai",
  "applied-llm-systems",
] as const;

export const ResearchItemSchema = z.object({
  id: Slug,
  title: z.string().min(1),
  kind: z.enum(["thesis", "capstone", "research", "review", "hackathon", "industry"]),
  /**
   * The group /research lists the item under (DESIGN §2, amended 2026-09-20). A fact about the
   * work, so it lives on the item; it cannot be derived from `kind`, since one theme spans a
   * thesis, an industry role and a review. Headings and order are in lib/content/labels.ts.
   */
  theme: z.enum(RESEARCH_THEME_IDS),
  org: z.string().min(1),
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  summary: z.string().min(1),
  skills: z.array(SkillId),
  metrics: z.array(MetricSchema),
  /** Deep project page this item expands into, if any. */
  projectSlug: Slug.optional(),
  /** Role in experience.ts this item happened inside, if any. */
  roleId: Slug.optional(),
  links: z.array(LinkSchema).optional(),
  /**
   * Whether the Session 6 resume PDF prints this item in its "AI leadership & research
   * contributions" section. An item that reaches the resume through a project card
   * (`projectSlug`, or a card's `researchId`) or a role (`roleId`) says `false`, so
   * nothing is printed twice.
   */
  resume: z.object({ include: z.boolean() }),
  source: SourceIdSchema,
});
export type ResearchItem = z.infer<typeof ResearchItemSchema>;

export const LeadershipItemSchema = z.object({
  id: Slug,
  title: z.string().min(1),
  org: z.string().min(1),
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  summary: z.string().min(1),
  metrics: z.array(MetricSchema),
  links: z.array(LinkSchema).optional(),
  /** Also listed on /research (DESIGN §2 names conference reviewing there), without a second copy. */
  alsoResearch: z.boolean().optional(),
  /**
   * Whether the Session 6 resume PDF prints this item in its "AI leadership & research
   * contributions" section; an item the education bullets already state says `false`.
   */
  resume: z.object({ include: z.boolean() }),
  source: SourceIdSchema,
});
export type LeadershipItem = z.infer<typeof LeadershipItemSchema>;

/**
 * Plotted values are facts (DESIGN §3.5): a table of average IoU scores recreated from one of
 * the thesis's own tables, with the table number and PDF page so every value can be re-read.
 */
export const IouTableSchema = z
  .object({
    id: Slug,
    /** The trained model whose predictions the CAMs explained, e.g. "ResNet-34". */
    model: z.string().min(1),
    /** Caption text shown under the figure. */
    caption: z.string().min(1),
    /** The thesis table reproduced, e.g. "Table 4.6". */
    table: z.string().min(1),
    /**
     * Where it is printed, e.g. "thesis p. 31 (PDF p. 38)": the PDF page is in the shipped copy
     * the site links, one less than the staged original's past the removed page 2.
     */
    cite: z.string().min(1),
    /** Threshold percentages, ascending, one column each. */
    thresholds: z.array(z.number().int().min(1).max(100)).min(2),
    series: z
      .array(
        z.object({
          method: z.string().min(1),
          /** Average IoU at each threshold, in `thresholds` order, exactly as printed. */
          values: z.array(z.number().min(0).max(1)),
        }),
      )
      .min(1),
    source: SourceIdSchema,
  })
  .refine(
    (t) => t.series.every((s) => s.values.length === t.thresholds.length),
    "every series needs one value per threshold",
  );
export type IouTable = z.infer<typeof IouTableSchema>;

/** An original flow diagram drawn from a procedure a source document describes in prose. */
export const DiagramSchema = z.object({
  id: Slug,
  caption: z.string().min(1),
  /** Where the drawn structure is described, e.g. "thesis §3.2–3.3 (PDF pp. 21–22)". */
  cite: z.string().min(1),
  /** Whether the last step feeds back into the first (a loop) or the flow ends. */
  loop: z.boolean(),
  steps: z
    .array(
      z.object({
        title: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .min(2),
  source: SourceIdSchema,
});
export type Diagram = z.infer<typeof DiagramSchema>;

export const FiguresSchema = z.object({
  iouTables: z.array(IouTableSchema),
  diagrams: z.array(DiagramSchema),
});

/**
 * A project link. `kind` says what it opens (DESIGN §3.1 names `live`, `repo` and `pdf`;
 * `article` covers the capstone's SFU news piece, `notebook` MentalWell's Kaggle notebook).
 * A `repo` link is only allowed once INVENTORY.md clears that repository: today the public
 * StimMap3D repository alone (cleared at S0-D, 2026-09-20). The loader holds the list
 * (`CLEARED_REPOSITORIES` in `./projects.ts`) and refuses any other.
 */
export const ProjectLinkSchema = LinkSchema.extend({
  kind: z.enum(["live", "repo", "pdf", "article", "notebook"]),
});
export type ProjectLink = z.infer<typeof ProjectLinkSchema>;

/**
 * Frontmatter of `content/projects/*.mdx` (DESIGN §3.1): card data for every project and the
 * facts a deep page renders around its body. Extends the Session 2 card schema; the loader in
 * `./projects.ts` fills a research-backed card from `content/research.ts` (see `researchId`)
 * and validates the merged record against this schema.
 */
export const ProjectSchema = z.object({
  slug: Slug,
  title: z.string().min(1),
  /** Short card title; retain the official title on the detail page. */
  displayTitle: z.string().min(1).optional(),
  /** One line under the title on a card. */
  tagline: z.string().min(1),
  /** One-line proof for the DESIGN §1 30-second test. */
  proof: z.string().min(1),
  year: z.number().int(),
  dates: z.string().min(1),
  periods: z.array(PeriodSchema).min(1),
  kind: z.enum(["project", "research", "coursework"]),
  featured: z.boolean(),
  deepPage: z.boolean(),
  /**
   * Display position among featured projects (DESIGN §0 lists StimMap3D, the capstone, the
   * thesis); lower first. Unfeatured projects sort by date and ignore it.
   */
  order: z.number().int().optional(),
  /** Resume bullets, verbatim (or the research item's summary for a research-backed card). */
  bullets: z.array(z.string().min(1)).min(1),
  skills: z.array(SkillId),
  metrics: z.array(MetricSchema),
  /** Shown wherever the project appears; StimMap3D's non-clinical wording (DESIGN §3.3). */
  disclaimer: z.string().optional(),
  links: z.array(ProjectLinkSchema).optional(),
  /** Card/hero image: the `path` of an image in content/assets.json. */
  cover: z.string().min(1).optional(),
  /**
   * A click-to-load live demo at the top of the deep page (DESIGN §7.1). `src` is the framed
   * URL, deep link included; the always-visible link opens the project's `live` link, and the
   * poster is the project's `cover`, so both are required beside it (checked by the loader).
   */
  embed: z
    .object({
      src: z.url(),
      /** Accessible name of the frame. */
      title: z.string().min(1),
      /** A sentence for the caption, e.g. what the frame opens on. */
      note: z.string().min(1).optional(),
    })
    .optional(),
  /**
   * Session 6 resume generator: whether the project is printed, and with which bullets. An
   * empty `bullets` means the project's own `bullets` (only the first `firstBullets` of them,
   * when set), so nothing is typed twice. `org` is the line printed under the title when no
   * research item supplies one; without it the resume prints the card's tagline there. The
   * loader (lib/content/projects.ts) checks both against the card: `firstBullets` must leave a
   * bullet out, and `org` is refused on a card a research item pairs with.
   */
  resume: z
    .object({
      include: z.boolean(),
      bullets: z.array(z.string().min(1)),
      firstBullets: z.number().int().min(1).optional(),
      org: z.string().min(1).optional(),
    })
    .refine((r) => r.firstBullets === undefined || r.bullets.length === 0, {
      message: "firstBullets selects from the card's own bullets; leave resume.bullets empty",
    }),
  /**
   * Research item in content/research.ts this card is drawn from. When set, title, dates,
   * periods, proof, bullets, metrics, skills and source come from that item and must not be
   * retyped here (IMPLEMENTATION_PLAN §4 Session 3a amendment).
   */
  researchId: Slug.optional(),
  /** A short sidebar on the deep page, e.g. "Built with Claude Code" (plain paragraphs). */
  aside: z
    .object({
      title: z.string().min(1),
      paragraphs: z.array(z.string().min(1)).min(1),
      /** Absolute links shown under the paragraphs, e.g. the project's own workflow document. */
      links: z.array(LinkSchema).optional(),
    })
    .optional(),
  source: SourceIdSchema,
});
export type Project = z.infer<typeof ProjectSchema>;

/** Fields a research-backed card inherits from its research item rather than declaring. */
export const RESEARCH_DERIVED_FIELDS = [
  "title",
  "dates",
  "periods",
  "proof",
  "bullets",
  "metrics",
  "skills",
  "source",
] as const;

/** Fields the loader fills for a research-backed card (the derived ones plus `year`). */
const RESEARCH_FILLED = [...RESEARCH_DERIVED_FIELDS, "year"] as const;
const researchFilledMask = Object.fromEntries(RESEARCH_FILLED.map((f) => [f, true])) as Record<
  (typeof RESEARCH_FILLED)[number],
  true
>;

/**
 * What an MDX file may declare before the loader merges in a research item. Everything the
 * item supplies is optional here and rejected when `researchId` is set, so the two copies of a
 * fact cannot drift; `year` is derived from the item's first period.
 */
export const ProjectFrontmatterSchema = ProjectSchema.partial(researchFilledMask).superRefine(
  (fm, ctx) => {
    if (!fm.researchId) return;
    for (const field of RESEARCH_FILLED) {
      if (fm[field] !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `"${field}" comes from research item "${fm.researchId}"; do not retype it`,
        });
      }
    }
  },
);
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

/** A short passage that carries numbers, so they can be rendered through MetricStat. */
export const StatementSchema = z.object({
  text: z.string().min(1),
  metrics: z.array(MetricSchema),
  source: SourceIdSchema,
});
export type Statement = z.infer<typeof StatementSchema>;

export const ProfileSchema = z.object({
  name: z.string().min(1),
  /** Short line used in the header and <title>. */
  role: z.string().min(1),
  /** The hero positioning line (DESIGN §3.2). */
  positioning: z.string().min(1),
  location: z.string().min(1),
  email: z.email(),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
  }),
  /** Path under public/, listed in assets.json. */
  headshot: z.string().min(1),
  /** The "Currently" one-liner on the home page. */
  currently: StatementSchema,
  /** Skill ids for the compact strip on the home page, in display order. */
  skillsStrip: z.array(SkillId).min(1),
  /** The resume's opening paragraph, verbatim; printed by the Session 6 PDF generator. */
  summary: StatementSchema,
  /** How the site describes itself (DESIGN §1 item 3). */
  builtWith: z.string().min(1),
  sources: z.record(z.string(), z.string()),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const AboutSchema = z.object({
  /** 3–5 paragraphs, first person, plain text (DESIGN §2; INVENTORY.md About notes). */
  paragraphs: z.array(z.string().min(1)).min(3).max(5),
  /** Where the narrative was drawn from; shown nowhere, checked at review. */
  sources: z.array(z.string().min(1)).min(1),
});
export type About = z.infer<typeof AboutSchema>;

/** Portable relative file paths: reject traversal, absolute paths, URL escapes and backslashes. */
const RelativeFile = z
  .string()
  .min(1)
  .refine(
    (value) =>
      !/[\\:%?#]/.test(value) &&
      value.split("/").every((part) => part !== "" && part !== "." && part !== ".."),
    "a portable relative file path without traversal",
  );

const ProvenanceSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("staged"),
    source: RelativeFile.refine((value) => value.startsWith("_source/")),
    /** Revision of the actual original, e.g. its SHA-256 or a dated source revision. */
    revision: z.string().trim().min(1),
  }),
  z.strictObject({
    kind: z.literal("repository"),
    source: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*-repo$/, "repository source id, e.g. stimmap3d-repo"),
    repository: z.url(),
    sourceFile: RelativeFile,
    /** Immutable repository revision; a moving branch name is insufficient. */
    revision: z.string().regex(/^[a-f0-9]{40}$/i, "full git commit SHA"),
  }),
]);

const AssetBase = {
  provenance: ProvenanceSchema,
  /** Rights holder/license and the evidence granting publication permission. */
  rights: z.string().trim().min(1),
  permission: z.string().trim().min(1),
  transformations: z.array(z.string().trim().min(1)).min(1),
  people: z.array(z.string().trim().min(1)),
  consent: z.literal(true),
};

export const ImageAssetSchema = z.strictObject({
  ...AssetBase,
  kind: z.literal("image"),
  path: RelativeFile.refine((value) => /^images\/.+\.(png|jpe?g|webp|avif|gif|svg)$/i.test(value)),
  alt: z.string().trim().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const DocumentAssetSchema = z.strictObject({
  ...AssetBase,
  kind: z.literal("document"),
  path: RelativeFile.refine(
    (value) => /^docs\/.+\.pdf$/.test(value) || value === "Paige-Rattenberry-Resume.pdf",
  ),
  title: z.string().trim().min(1),
  mediaType: z.literal("application/pdf"),
  pageCount: z.number().int().positive(),
  /** Original page numbers removed from the derived PDF; [] means no removals. */
  removedPages: z
    .array(z.number().int().positive())
    .refine((pages) => new Set(pages).size === pages.length),
});

/** Managed images and documents use media-specific metadata and explicit publication evidence. */
export const AssetSchema = z.discriminatedUnion("kind", [ImageAssetSchema, DocumentAssetSchema]);
export type Asset = z.infer<typeof AssetSchema>;
export const AssetsSchema = z
  .array(AssetSchema)
  .refine(
    (assets) => new Set(assets.map((asset) => asset.path.toLowerCase())).size === assets.length,
    "asset paths must be unique (including case)",
  );

const IsoTimestamp = z.iso.datetime();

/**
 * content/generated/build-stats.json (DESIGN §5.6, decision D6): a snapshot of the pre-launch
 * repository's history, written by hand with scripts/fetch-build-stats.ts. Counts and dates
 * only; strict, so a title, branch name or message can never be added to the file unnoticed.
 */
export const BuildStatsSchema = z
  .strictObject({
    /** When the snapshot was taken (UTC). */
    fetchedAt: IsoTimestamp,
    /** Pull requests merged into the default branch. */
    mergedPullRequests: z.number().int().positive(),
    /** Commits reachable from the default branch, merge commits included. */
    commits: z.number().int().positive(),
    /** How many of `commits` are merge commits. */
    mergeCommits: z.number().int().nonnegative(),
    firstMergedAt: IsoTimestamp,
    lastMergedAt: IsoTimestamp,
  })
  .refine((s) => s.mergeCommits <= s.commits, "more merge commits than commits")
  .refine((s) => s.firstMergedAt <= s.lastMergedAt, "first merge after the last")
  .refine((s) => s.lastMergedAt <= s.fetchedAt, "a merge after the snapshot");
export type BuildStats = z.infer<typeof BuildStatsSchema>;

const LogSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "a docs/build-log/ file name");

/** A note's logs, each once: the page keys each log's link by its slug. */
const NoteLogs = z
  .array(LogSlug)
  .min(1)
  .refine((logs) => new Set(logs).size === logs.length, "a note lists the same log twice");

/**
 * content/build-story.ts: the words of /how-this-was-built that are not build logs (DESIGN §6).
 * The synthesis's counts are never typed: each category lists its items, every item names the
 * log it comes from, and the page counts them. Each quote must occur verbatim in its log, and
 * every log named must exist (tests/unit/build-story.test.ts).
 */
export const BuildStorySchema = z.strictObject({
  /**
   * The public repository (decision D3), one constant: the planning-document links and the
   * build logs' relative links resolve against it. It is not a project link, so
   * `assertPublishableLinks` never sees it.
   */
  repository: z.strictObject({
    url: z.url().refine((u) => u.startsWith("https://github.com/"), "a GitHub repository URL"),
    planningDocs: z
      .array(
        z.strictObject({
          /** Resolved by `resolveRepositoryLink`, so a missing or ignored file fails the build. */
          file: z.string().regex(/^[A-Z_]+\.md$/),
          description: z.string().min(1),
        }),
      )
      .min(1),
  }),
  /** The page's own sentences: its lede and each section's introduction. */
  copy: z.strictObject({
    /** The page's meta description. */
    description: z.string().min(1),
    lede: z.string().min(1),
    plan: z.string().min(1),
    draft: z.string().min(1),
    logs: z.string().min(1),
    /** Each log page's meta description, after its title and date: sections every log has. */
    logDescription: z.string().min(1),
    gallery: z.string().min(1),
  }),
  transparency: z.strictObject({
    generated: z.array(z.string().min(1)).min(1),
    paige: z.array(z.string().min(1)).min(1),
    tools: z.string().min(1),
  }),
  /** DESIGN §5.6's sentence, verbatim. */
  statsSentence: z.string().min(1),
  /** Follows the snapshot date: when and how it was taken. */
  statsNote: z.string().min(1),
  synthesis: z.strictObject({
    /** Shown as a draft until Paige has edited it. */
    draft: z.boolean(),
    intro: z.string().min(1),
    /** What the record is not (IMPLEMENTATION_PLAN §4 Session 8, task 2). */
    bound: z.string().min(1),
    /** Follows the counts of items that added a gate and of those that came out of a review. */
    added: z.string().min(1),
    categories: z
      .array(
        z.strictObject({
          id: LogSlug,
          label: z.string().min(1),
          description: z.string().min(1),
          items: z
            .array(
              z.strictObject({
                log: LogSlug,
                what: z.string().min(1),
                /** The gate, test or rule the log says was added because of this failure. */
                added: z.string().min(1).optional(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
    quotes: z
      .array(z.strictObject({ log: LogSlug, text: z.string().min(1) }))
      .min(2)
      .max(3),
    worked: z.array(z.strictObject({ text: z.string().min(1), logs: NoteLogs })),
    didNot: z.array(z.strictObject({ text: z.string().min(1), logs: NoteLogs })),
  }),
  gallery: z
    .array(
      z.strictObject({
        /** An image in assets.json, derived by scripts/derive-build-story-images.ts. */
        asset: z.string().regex(/^images\/build-story\/[a-z0-9-]+\.webp$/),
        /** The committed screenshot it is cropped from. */
        screenshot: z.string().regex(/^docs\/screenshots\/[a-z0-9-]+\.png$/),
        crop: z.strictObject({
          top: z.number().int().nonnegative(),
          height: z.number().int().positive(),
        }),
        /** The build log of the session the screenshot belongs to. */
        log: LogSlug,
        caption: z.string().min(1),
      }),
    )
    .min(1),
  /** The project shown as case study #1, by slug; its words come from the project's aside. */
  caseStudy: z.strictObject({
    projectSlug: z.string().min(1),
    intro: z.string().min(1),
    /** Under the project's disclaimer: where else the disclaimer is shown (AGENTS.md gate c). */
    disclaimerNote: z.string().min(1),
  }),
});
export type BuildStory = z.infer<typeof BuildStorySchema>;
