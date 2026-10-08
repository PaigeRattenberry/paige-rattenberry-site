import { describe, expect, it } from "vitest";

import { assets } from "@/lib/content/load";
import { AssetSchema, AssetsSchema } from "@/lib/content/schema";

// Contract fixtures only: these are not shipped assets or evidence of publication clearance.
const repositoryImage = {
  ...assets[0],
  kind: "image",
  path: "images/stimmap3d/hero.png",
  provenance: {
    kind: "repository",
    source: "stimmap3d-repo",
    repository: "https://github.com/PaigeRattenberry/StimMap3D",
    sourceFile: "docs/screenshots/hero.png",
    revision: "a".repeat(40),
  },
  rights: "Fixture rights holder",
  permission: "Fixture permission reference; not a real approval",
  transformations: ["Fixture: screenshot resized for a card"],
  people: [],
  alt: "Fixture application screenshot",
};
const document = {
  kind: "document",
  path: "docs/thesis.pdf",
  provenance: {
    kind: "staged",
    source: "_source/thesis/original.pdf",
    revision: "Fixture source revision",
  },
  rights: "Fixture author",
  permission: "Fixture: publication with approval page removed",
  transformations: ["Removed original page 2 (signed approval page)"],
  people: [],
  consent: true,
  title: "Fixture thesis",
  mediaType: "application/pdf",
  pageCount: 48,
  removedPages: [2],
};

describe("asset publication contract", () => {
  it("accepts the migrated headshot, a repository image, and media-specific PDFs", () => {
    expect(AssetSchema.safeParse(assets[0]).success).toBe(true);
    expect(AssetSchema.safeParse(repositoryImage).success).toBe(true);
    expect(AssetSchema.parse(document)).not.toHaveProperty("width");
    expect(
      AssetSchema.safeParse({
        ...document,
        path: "Paige-Rattenberry-Resume.pdf",
        provenance: {
          ...repositoryImage.provenance,
          source: "paigewebsite-repo",
          sourceFile: "content/profile.ts",
        },
        transformations: ["Fixture: generated from content at the recorded commit"],
      }).success,
    ).toBe(true);
    expect(
      AssetSchema.safeParse({
        ...document,
        path: "Paige-Rattenberry-Resume.pdf",
        pageCount: 2,
        removedPages: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing publication evidence and moving repository revisions", () => {
    for (const field of ["rights", "permission", "transformations", "provenance"]) {
      expect(AssetSchema.safeParse({ ...repositoryImage, [field]: undefined }).success, field).toBe(
        false,
      );
    }
    expect(AssetSchema.safeParse({ ...repositoryImage, consent: false }).success).toBe(false);
    expect(
      AssetSchema.safeParse({
        ...repositoryImage,
        provenance: { ...repositoryImage.provenance, revision: "main" },
      }).success,
    ).toBe(false);
  });

  it("rejects unsafe paths, media mismatches and duplicate manifest entries", () => {
    for (const path of [
      "images/../private.png",
      "images//hero.png",
      "images/%2e%2e/hero.png",
      "images\\hero.png",
      "/images/hero.png",
      "images/hero.pdf",
    ]) {
      expect(AssetSchema.safeParse({ ...repositoryImage, path }).success, path).toBe(false);
    }
    expect(AssetSchema.safeParse({ ...document, width: 400 }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...document, path: "docs/thesis.png" }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...document, pageCount: 0 }).success).toBe(false);
    expect(AssetsSchema.safeParse([repositoryImage, repositoryImage]).success).toBe(false);
  });
});
