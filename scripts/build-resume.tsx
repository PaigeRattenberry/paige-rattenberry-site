/**
 * Renders content/ into public/Paige-Rattenberry-Resume.pdf (DESIGN §5.4, IMPLEMENTATION_PLAN §4
 * Session 6): the same validated data the site renders, laid out as a two-page resume in the
 * section order of the resume of record, with the site's typography and accent in place of the
 * resume's blue section bars.
 *
 *   npm run resume    writes the file (prebuild and pretest run it; it is never committed)
 *
 * Every name, date, link, number and bullet is a field from lib/content/load.ts; the only
 * text typed here is layout copy from the resume of record (the section headings, one of them
 * widened in Session 9, and the order of the skill lines). What is printed is decided by content: a project's `resume.include` (and `resume.bullets`, or its
 * own bullets when that list is empty), a research or leadership item's `resume.include`, a
 * certification's `resumeDetail` (or its `detail` when it has none). The
 * site origin comes from NEXT_PUBLIC_SITE_URL (lib/site.ts); when it is not configured the
 * contact line simply omits the site rather than print a placeholder.
 *
 * Fonts are the @fontsource woff files (v5 ships woff and woff2; react-pdf reads woff). They
 * are split by subset, and react-pdf has no fallback between families, so `Runs` gives every
 * character outside the latin subset ("ć", "ğ") the latin-ext file of the same family and
 * weight. The script refuses to run if any character is covered by neither subset.
 *
 * Every printed string passes through `Runs`, so a latin-ext character anywhere gets its face
 * rather than react-pdf's silent Helvetica fallback.
 *
 * tsx runs this file as CommonJS (the package is not `type: module`), and react-pdf's own
 * CommonJS build requires `@react-pdf/hyphenate/en-us`, which that package only exports to
 * `import`. So react-pdf is loaded with a dynamic import(), which tsx leaves native, and the
 * document is built inside `build()` once the module is in hand.
 */
// First, so the site origin below matches what `next build` will see (imports are hoisted
// and evaluated in source order; an inline loadEnvFile() would run after lib/site).
import "./load-env";

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PDFDocument } from "pdf-lib";
import type { ReactNode } from "react";

import {
  categories,
  certifications,
  education,
  leadership,
  newestFirst,
  profile,
  projects,
  research,
  researchForProject,
  roles,
  skills,
} from "../lib/content/load";
import { RESUME_PDF_FILE } from "../lib/resume";
import { absoluteUrl, siteHost, siteUrlConfigured } from "../lib/site";
import { collectGarbage } from "./pdf-graph.mjs";

type ReactPdf = typeof import("@react-pdf/renderer");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "public", RESUME_PDF_FILE);
const overflow = `${out}.overflow.pdf`;
const MAX_PAGES = 2;

// ---------------------------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------------------------

type Family = "serif" | "sans" | "mono";
type Subset = "latin" | "latin-ext";
const FAMILY_NAME: Record<Family, string> = {
  serif: "Source Serif 4",
  sans: "Inter",
  mono: "JetBrains Mono",
};
const PKG: Record<Family, string> = {
  serif: "source-serif-4",
  sans: "inter",
  mono: "jetbrains-mono",
};
const WEIGHTS: Record<Family, number[]> = {
  serif: [400, 600],
  sans: [400, 500, 600],
  mono: [400, 500],
};

function familyName(family: Family, subset: Subset) {
  return subset === "latin" ? FAMILY_NAME[family] : `${FAMILY_NAME[family]} (latin-ext)`;
}

function fontFile(family: Family, subset: Subset, weight: number) {
  const file = `${PKG[family]}-${subset}-${weight}-normal.woff`;
  const full = path.join(root, "node_modules", "@fontsource", PKG[family], "files", file);
  if (!existsSync(full)) throw new Error(`Font file missing: ${full}`);
  return full;
}

function registerFonts(Font: ReactPdf["Font"]) {
  for (const family of ["serif", "sans", "mono"] as const) {
    for (const subset of ["latin", "latin-ext"] as const) {
      Font.register({
        family: familyName(family, subset),
        fonts: WEIGHTS[family].map((weight) => ({
          src: fontFile(family, subset, weight),
          fontWeight: weight,
        })),
      });
    }
  }
  // The lines are short; hyphenating a role title or a product name would hurt more than help.
  Font.registerHyphenationCallback((word) => [word]);
}

/**
 * The subsets' code-point ranges, read from @fontsource/inter/unicode.json (the three packages
 * share the same subset definitions), e.g. "U+0000-00FF,U+0131,...".
 */
const unicodeRanges = JSON.parse(
  readFileSync(path.join(root, "node_modules", "@fontsource", "inter", "unicode.json"), "utf8"),
) as Record<string, string>;

function subsetTest(spec: string) {
  const ranges = spec.split(",").map((r) => {
    const [lo, hi] = r.trim().replace(/^U\+/, "").split("-");
    return [parseInt(lo, 16), parseInt(hi ?? lo, 16)] as const;
  });
  return (ch: string) => {
    const code = ch.codePointAt(0)!;
    return ranges.some(([lo, hi]) => code >= lo && code <= hi);
  };
}
const inLatin = subsetTest(unicodeRanges.latin);
const inLatinExt = subsetTest(unicodeRanges["latin-ext"]);

/** Split a string into runs by subset; throws on a character neither subset covers. */
export function runs(text: string): { text: string; ext: boolean }[] {
  const result: { text: string; ext: boolean }[] = [];
  for (const ch of text) {
    const ext = !inLatin(ch);
    if (ext && !inLatinExt(ch)) {
      const code = ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
      throw new Error(`"${ch}" (U+${code}) is in no registered font subset`);
    }
    const last = result[result.length - 1];
    if (last && last.ext === ext) last.text += ch;
    else result.push({ text: ch, ext });
  }
  return result;
}

// ---------------------------------------------------------------------------------------------
// Data selection (what the resume prints is decided in content/, not here)
// ---------------------------------------------------------------------------------------------

/** Display form of a profile link: no scheme, no "www.", no trailing slash. */
const display = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const contacts: { text: string; href: string }[] = [
  { text: profile.email, href: `mailto:${profile.email}` },
  { text: display(profile.links.linkedin), href: profile.links.linkedin },
  { text: display(profile.links.github), href: profile.links.github },
  ...(siteUrlConfigured ? [{ text: siteHost, href: absoluteUrl("/") }] : []),
];

const resumeProjects = projects
  .filter((p) => p.resume.include)
  .map((p) => {
    // Thesis, capstone and research-backed cards pair with a research item.
    const item = researchForProject(p);
    return {
      slug: p.slug,
      title: p.title,
      dates: p.dates,
      // The organisation line the resume prints under a heading, the card's own resume line,
      // or the card's tagline. The loader rejects a resume.org the paired item would hide.
      org: item?.org ?? p.resume.org ?? p.tagline,
      bullets: p.resume.bullets.length
        ? p.resume.bullets
        : p.bullets.slice(0, p.resume.firstBullets),
      // The deep page when the site origin is known; otherwise the first absolute link.
      href:
        p.deepPage && siteUrlConfigured
          ? absoluteUrl(`/projects/${p.slug}`)
          : p.links?.find((l) => /^https?:/.test(l.url))?.url,
      // Gate (c): StimMap3D's disclaimer goes wherever the project is named.
      disclaimer: p.disclaimer,
    };
  });

/** Leadership and research items flagged for the resume, newest first, as one list. */
const contributions = newestFirst([
  ...leadership.filter((l) => l.resume.include),
  ...research.filter((r) => r.resume.include),
]);

/**
 * Skill lines in the resume of record's order (full-stack first, then agentic, then ML, then
 * tooling); a category this list does not name prints after them, in content order. Like the
 * section headings below, this is presentation copied from the resume's layout, not a fact:
 * every label and skill name comes from content/skills.ts.
 */
const SKILL_LINE_ORDER = ["fullstack", "agentic", "ml", "tooling"];
const lineRank = (id: string) => {
  const i = SKILL_LINE_ORDER.indexOf(id);
  return i < 0 ? SKILL_LINE_ORDER.length : i;
};
const skillLines = [...categories]
  .sort((a, b) => lineRank(a.id) - lineRank(b.id))
  .map((c) => ({
    label: c.label,
    items: skills.filter((sk) => sk.category === c.id).map((sk) => sk.label),
  }))
  .filter((c) => c.items.length > 0);

/** Certifications grouped by issuer (first-appearance order), one bullet per issuer. */
const certificationLines = (() => {
  const byIssuer = new Map<string, (typeof certifications)[number][]>();
  for (const c of certifications) byIssuer.set(c.issuer, [...(byIssuer.get(c.issuer) ?? []), c]);
  return [...byIssuer.entries()].map(([issuer, items]) => {
    const parts = items.map((c) => {
      const line = c.resumeDetail ?? c.detail;
      return `${c.name}, ${c.dates}${line ? ` — ${line}` : ""}`;
    });
    return `${issuer}: ${parts.join("; ")}`;
  });
})();

// ---------------------------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------------------------

// The site's light tokens (app/globals.css), in points.
const ink = "#1a1c1f";
const ink2 = "#605c55";
const accent = "#0e6b6b";
const line = "#d9d6ce";

function build(pdf: ReactPdf) {
  const { Document, Link, Page, StyleSheet, Text, View } = pdf;

  const s = StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 26,
      paddingHorizontal: 32,
      fontFamily: FAMILY_NAME.sans,
      fontSize: 7.9,
      color: ink,
    },
    // Line height is set per text style, always next to an explicit fontSize: a lineHeight on
    // the page style stops react-pdf 4.9 from drawing render-prop text (the page number below),
    // and a unitless lineHeight on a text style without its own fontSize is multiplied by the
    // renderer's default size (18), not the inherited one. Both found by bisecting.
    name: { fontFamily: FAMILY_NAME.serif, fontWeight: 600, fontSize: 20, lineHeight: 1.1 },
    role: {
      fontFamily: FAMILY_NAME.mono,
      fontSize: 7.4,
      color: accent,
      marginTop: 2,
      letterSpacing: 0.4,
    },
    contact: {
      marginTop: 3,
      fontSize: 8,
      lineHeight: 1.23,
      color: ink2,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    contactSep: { color: "#c4c0b6", marginHorizontal: 4 },
    link: { color: ink, textDecoration: "none" },
    rule: { marginTop: 5, borderBottomWidth: 1.2, borderBottomColor: accent },
    summary: { marginTop: 5, fontSize: 8, lineHeight: 1.26 },
    section: { marginTop: 6 },
    sectionHead: {
      fontFamily: FAMILY_NAME.mono,
      fontSize: 6.6,
      fontWeight: 500,
      letterSpacing: 0.9,
      textTransform: "uppercase",
      color: accent,
      paddingBottom: 2,
      marginBottom: 3,
      borderBottomWidth: 0.6,
      borderBottomColor: line,
    },
    entry: { marginTop: 2.8 },
    headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    title: { fontWeight: 600, fontSize: 8.7, lineHeight: 1.23, flex: 1, paddingRight: 8 },
    titleQuiet: { fontWeight: 400, color: ink2 },
    dates: { fontFamily: FAMILY_NAME.mono, fontSize: 6.7, color: ink2, paddingTop: 1.2 },
    org: { fontSize: 7.7, lineHeight: 1.23, color: ink2, marginTop: 0.3 },
    bullets: { marginTop: 1 },
    bullet: { flexDirection: "row", marginTop: 0.6 },
    dot: { width: 8, color: accent },
    bulletText: { flex: 1, fontSize: 7.9, lineHeight: 1.23 },
    skillLine: { marginTop: 1.2, fontSize: 7.9, lineHeight: 1.23 },
    skillLabel: { fontWeight: 600 },
    footer: {
      position: "absolute",
      bottom: 11,
      left: 32,
      right: 32,
      fontFamily: FAMILY_NAME.mono,
      fontSize: 6.4,
      color: ink2,
    },
    footerRight: { textAlign: "right" },
  });

  /** Text in one family, with latin-ext characters given the matching latin-ext face. */
  function Runs({ family, children }: { family: Family; children: string }) {
    return (
      <>
        {runs(children).map((run, i) =>
          run.ext ? (
            <Text key={i} style={{ fontFamily: familyName(family, "latin-ext") }}>
              {run.text}
            </Text>
          ) : (
            run.text
          ),
        )}
      </>
    );
  }

  function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
      <View style={s.section}>
        <Text style={s.sectionHead} minPresenceAhead={40}>
          {title}
        </Text>
        {children}
      </View>
    );
  }

  function Bullets({ items }: { items: readonly string[] }) {
    return (
      <View style={s.bullets}>
        {items.map((item) => (
          <View key={item} style={s.bullet}>
            <Text style={s.dot}>•</Text>
            <Text style={s.bulletText}>
              <Runs family="sans">{item}</Runs>
            </Text>
          </View>
        ))}
      </View>
    );
  }

  type EntryProps = {
    title: string;
    /** Printed after the title in a quieter weight, the way the resume prints "– Team". */
    qualifier?: string;
    /** Absolute URL the title links to, when there is one. */
    href?: string;
    dates?: string;
    org?: string;
    bullets: readonly string[];
  };

  function Entry({ title, qualifier, href, dates, org, bullets }: EntryProps) {
    const heading = (
      <>
        <Runs family="sans">{title}</Runs>
        {qualifier ? (
          <Text style={s.titleQuiet}>
            {" – "}
            <Runs family="sans">{qualifier}</Runs>
          </Text>
        ) : null}
      </>
    );
    return (
      <View style={s.entry} wrap={false}>
        <View style={s.headRow}>
          <Text style={s.title}>
            {href ? (
              <Link src={href} style={s.link}>
                {heading}
              </Link>
            ) : (
              heading
            )}
          </Text>
          {dates ? (
            <Text style={s.dates}>
              <Runs family="mono">{dates}</Runs>
            </Text>
          ) : null}
        </View>
        {org ? (
          <Text style={s.org}>
            <Runs family="sans">{org}</Runs>
          </Text>
        ) : null}
        <Bullets items={bullets} />
      </View>
    );
  }

  return (
    <Document
      title={`${profile.name} – Resume`}
      author={profile.name}
      subject={profile.role}
      creator="scripts/build-resume.tsx (paige-rattenberry-site)"
      language="en"
    >
      <Page size="LETTER" style={s.page}>
        <View>
          <Text style={s.name}>
            <Runs family="serif">{profile.name}</Runs>
          </Text>
          <Text style={s.role}>
            <Runs family="mono">{profile.role}</Runs>
          </Text>
          <View style={s.contact}>
            {contacts.map((c, i) => (
              <Text key={c.href}>
                {i > 0 ? <Text style={s.contactSep}>|</Text> : null}
                <Link src={c.href} style={s.link}>
                  <Runs family="sans">{c.text}</Runs>
                </Link>
              </Text>
            ))}
            <Text>
              <Text style={s.contactSep}>|</Text>
              <Runs family="sans">{profile.location}</Runs>
            </Text>
          </View>
          <View style={s.rule} />
          <Text style={s.summary}>
            <Runs family="sans">{profile.summary.text}</Runs>
          </Text>
        </View>

        <Section title="Technical work experience">
          {roles.map((r) => (
            <Entry
              key={r.id}
              title={r.title}
              qualifier={r.team}
              dates={r.dates}
              org={`${r.org}, ${r.location}`}
              bullets={r.bullets}
            />
          ))}
        </Section>

        {/* The resume of record's "Computer vision & AI research projects", widened in Session 9
            for this site's own entry; a second heading would cost the two-page fit. */}
        <Section title="Computer vision, AI research & engineering projects">
          {resumeProjects.map((p) => (
            <Entry
              key={p.slug}
              title={p.title}
              qualifier={p.disclaimer}
              href={p.href}
              dates={p.dates}
              org={p.org}
              bullets={p.bullets}
            />
          ))}
        </Section>

        <Section title="AI leadership & research contributions">
          {contributions.map((c) => (
            <Entry key={c.id} title={c.title} dates={c.dates} org={c.org} bullets={[c.summary]} />
          ))}
        </Section>

        <Section title="Technical skills">
          {skillLines.map((l) => (
            <Text key={l.label} style={s.skillLine}>
              <Text style={s.skillLabel}>
                <Runs family="sans">{`${l.label}: `}</Runs>
              </Text>
              <Runs family="sans">{l.items.join(", ")}</Runs>
            </Text>
          ))}
        </Section>

        <Section title="Education, certifications & AI specializations">
          <Entry
            title={education.degree}
            dates={education.dates}
            org={`${education.institution}, ${education.location}`}
            bullets={education.bullets}
          />
          <Entry title="Certifications" bullets={certificationLines} />
        </Section>

        <Text style={s.footer} fixed>
          <Runs family="mono">{profile.name}</Runs>
        </Text>
        <Text
          style={[s.footer, s.footerRight]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

async function main() {
  // A failed run leaves its overflow beside the output; a later good run must not ship it.
  rmSync(overflow, { force: true });
  const pdf = await import("@react-pdf/renderer");
  registerFonts(pdf.Font);
  const rendered = await pdf.renderToBuffer(build(pdf));
  const doc = await PDFDocument.load(rendered, { updateMetadata: false });
  const pages = doc.getPageCount();
  if (pages > MAX_PAGES) {
    // Keep the overflowing render next to the output for inspection, never at its path.
    writeFileSync(overflow, rendered);
    throw new Error(
      `${RESUME_PDF_FILE}: ${pages} pages; the resume must fit ${MAX_PAGES} (written to ${overflow})`,
    );
  }
  // pdfkit stores every info-dictionary value as its own indirect object. Re-set them as direct
  // strings (pdf-lib's setters write them inline) so a reader that rewrites the producer, as
  // pdf-lib does by default, leaves no unreferenced object behind; then drop what is orphaned.
  const now = new Date();
  doc.setTitle(doc.getTitle() ?? "");
  doc.setAuthor(doc.getAuthor() ?? "");
  doc.setSubject(doc.getSubject() ?? "");
  doc.setCreator(doc.getCreator() ?? "");
  doc.setProducer(`react-pdf ${pdf.version} + pdf-lib`);
  doc.setCreationDate(now);
  doc.setModificationDate(now);
  collectGarbage(doc);
  const bytes = await doc.save();
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, bytes);
  const kb = (bytes.length / 1024).toFixed(0);
  const site = siteUrlConfigured
    ? `site ${siteHost}`
    : "NEXT_PUBLIC_SITE_URL unset, so no site URL is printed";
  console.log(`public/${RESUME_PDF_FILE}: ${pages} pages, ${kb} KB (${site})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
