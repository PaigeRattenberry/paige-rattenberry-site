import { readFileSync } from "node:fs";
import path from "node:path";

import { PDFParse } from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";

import {
  assets,
  certifications,
  leadership,
  profile,
  projects,
  research,
  roles,
} from "@/lib/content/load";
import { RESUME_PDF_FILE, RESUME_PDF_PATH } from "@/lib/resume";
import { redirectTargets, routes } from "@/lib/routes";

import nextConfig from "../../next.config";

import { PHONE_PATTERN } from "./helpers/privacy";

const ROOT = path.resolve(__dirname, "../..");
const file = path.join(ROOT, "public", RESUME_PDF_FILE);

/**
 * The generated resume (DESIGN §5.4; IMPLEMENTATION_PLAN §4 Session 6 task 2). `npm test`
 * runs scripts/build-resume.tsx first (`pretest`), as `npm run build` does (`prebuild`), so the
 * file under test is the one the build ships. Run `npm run resume` before a bare `vitest`.
 */
describe("resume PDF", () => {
  let bytes: Buffer;
  let text: string;
  let pageCount: number;

  beforeAll(async () => {
    bytes = readFileSync(file);
    pageCount = (await PDFDocument.load(bytes)).getPageCount();
    const parser = new PDFParse({ data: bytes });
    text = (await parser.getText()).text;
    await parser.destroy();
  });

  it("fits two pages", () => {
    expect(pageCount).toBeLessThanOrEqual(2);
    expect(pageCount).toBeGreaterThan(0);
  });

  it("carries the name, email, Hammerspace and StimMap3D", () => {
    expect(text).toContain(profile.name);
    expect(text).toContain(profile.email);
    expect(text).toContain("Hammerspace");
    expect(text).toContain("StimMap3D");
  });

  it("prints every role title and every project flagged for the resume, in resume wording", () => {
    for (const role of roles) expect(text, role.id).toContain(role.title);
    for (const p of projects) {
      if (p.resume.include) expect(text, p.slug).toContain(p.title);
    }
    // Gate (c): the StimMap3D disclaimer goes wherever the project is named.
    for (const p of projects) {
      if (p.resume.include && p.disclaimer) expect(text, p.slug).toContain(p.disclaimer);
    }
  });

  it("no resume text is a second copy of the site's, so the two cannot drift apart", () => {
    // A resume bullet that repeats a card bullet word for word belongs in `firstBullets`.
    for (const p of projects) {
      for (const b of p.resume.bullets) {
        expect(p.bullets.includes(b), `projects:${p.slug}: use resume.firstBullets`).toBe(false);
      }
    }
    // A certification's shorter resume line is cut from its site detail: every clause of it
    // must still read the same there (ignoring the case its new position gives it).
    const clauses = (s: string) =>
      s
        .split(/[.;]\s+|\.$/)
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
    for (const c of certifications) {
      if (!c.resumeDetail) continue;
      const detail = (c.detail ?? "").toLowerCase();
      for (const clause of clauses(c.resumeDetail)) {
        expect(detail, `certifications:${c.id}: "${clause}"`).toContain(clause);
      }
    }
  });

  it("prints every research and leadership item flagged for it, and each flag is consistent", () => {
    // A research item that a project card or a role already prints must not be flagged, or it
    // would print twice; one flagged for the resume must be printed.
    const printed = projects.filter((p) => p.resume.include);
    for (const r of research) {
      const printedElsewhere = Boolean(
        r.roleId ||
        printed.some((p) => p.slug === r.projectSlug) ||
        printed.some((p) => p.researchId === r.id),
      );
      expect(r.resume.include && printedElsewhere, `research:${r.id} is printed twice`).toBe(false);
      if (r.resume.include) expect(text, `research:${r.id}`).toContain(r.title);
    }
    for (const l of leadership) {
      if (l.resume.include) expect(text, `leadership:${l.id}`).toContain(l.title);
    }
    expect(research.some((r) => r.resume.include)).toBe(true);
    expect(leadership.some((l) => l.resume.include)).toBe(true);
    // The summary paragraph and the degree are always printed.
    expect(text).toContain(profile.summary.text.slice(0, 40));
    expect(text).toContain("Bachelor of Applied Science");
  });

  it("contains no phone-shaped string", () => {
    expect(text.match(PHONE_PATTERN)?.[0]).toBeUndefined();
  });

  it("contains no unfilled placeholder", () => {
    expect(text).not.toContain("[ADD ");
  });

  it("is a listed document at the root PDF path with the recorded page count", () => {
    const record = assets.find((a) => a.path === RESUME_PDF_FILE);
    expect(record?.kind).toBe("document");
    if (record?.kind !== "document") return;
    expect(record.pageCount).toBe(pageCount);
    expect(record.provenance.kind).toBe("repository");
  });
});

describe("/resume", () => {
  it("is the one redirect route, and next.config.ts sends it to the PDF", async () => {
    const redirect = routes.filter((r) => r.kind === "redirect");
    expect(redirect.map((r) => r.path)).toEqual(["/resume"]);
    expect(redirectTargets["/resume"]).toBe(RESUME_PDF_PATH);
    const configured = await nextConfig.redirects?.();
    expect(configured).toEqual([
      { source: "/resume", destination: RESUME_PDF_PATH, permanent: false },
    ]);
  });
});
