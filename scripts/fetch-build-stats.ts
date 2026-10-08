/**
 * Writes content/generated/build-stats.json (DESIGN §5.6, decision D6): a snapshot of the
 * pre-launch repository's history, counts and dates only. Run by hand:
 *
 *   npx tsx scripts/fetch-build-stats.ts [--repo=owner/name]
 *
 * The token comes from GITHUB_TOKEN when set and not empty, else from `gh auth token`. This script is not
 * chained onto `prebuild`: the public repository starts from one seed commit, so live counts
 * from it would say nothing, and no build ever calls the GitHub API or needs a token. The file
 * holds no pull-request title, branch name or commit message, only numbers and timestamps;
 * lib/content/schema.ts (BuildStatsSchema) rejects any other field.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { BuildStatsSchema } from "../lib/content/schema";

const OUT = path.join(process.cwd(), "content", "generated", "build-stats.json");
const repoArg = process.argv.find((a) => a.startsWith("--repo="))?.slice("--repo=".length);
const [owner, name] = (repoArg ?? "PaigeRattenberry/paigewebsite").split("/");

const token =
  process.env.GITHUB_TOKEN || execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await response.json()) as { data?: T; errors?: unknown };
  if (!response.ok || body.errors || !body.data) {
    throw new Error(`GitHub GraphQL ${response.status}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.data;
}

type PullPage = {
  repository: {
    defaultBranchRef: { name: string };
    pullRequests: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: { mergedAt: string; baseRefName: string }[];
    };
  };
};

type HistoryPage = {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: { parents: { totalCount: number } }[];
        };
      };
    };
  };
};

/** Merge timestamps of every pull request merged into the default branch. */
async function mergedIntoDefault(): Promise<string[]> {
  const merged: string[] = [];
  let after: string | null = null;
  let base = "";
  do {
    const page: PullPage = await graphql<PullPage>(
      `
        query ($owner: String!, $name: String!, $after: String) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              name
            }
            pullRequests(states: MERGED, first: 100, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                mergedAt
                baseRefName
              }
            }
          }
        }
      `,
      { owner, name, after },
    );
    base = page.repository.defaultBranchRef.name;
    for (const pr of page.repository.pullRequests.nodes) {
      if (pr.baseRefName === base) merged.push(pr.mergedAt);
    }
    const info = page.repository.pullRequests.pageInfo;
    after = info.hasNextPage ? info.endCursor : null;
  } while (after);
  return merged.sort();
}

/** Commits reachable from the default branch, and how many of them are merge commits. */
async function commitCounts(): Promise<{ commits: number; mergeCommits: number }> {
  let commits = 0;
  let mergeCommits = 0;
  let seen = 0;
  let after: string | null = null;
  do {
    const page: HistoryPage = await graphql<HistoryPage>(
      `
        query ($owner: String!, $name: String!, $after: String) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100, after: $after) {
                    totalCount
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    nodes {
                      parents {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { owner, name, after },
    );
    const history = page.repository.defaultBranchRef.target.history;
    commits = history.totalCount;
    seen += history.nodes.length;
    mergeCommits += history.nodes.filter((c) => c.parents.totalCount > 1).length;
    after = history.pageInfo.hasNextPage ? history.pageInfo.endCursor : null;
  } while (after);
  if (seen !== commits) throw new Error(`walked ${seen} commits of ${commits}`);
  return { commits, mergeCommits };
}

async function main() {
  const merges = await mergedIntoDefault();
  if (merges.length === 0) throw new Error(`${owner}/${name} has no merged pull requests`);
  const { commits, mergeCommits } = await commitCounts();

  const stats = BuildStatsSchema.parse({
    fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    mergedPullRequests: merges.length,
    commits,
    mergeCommits,
    firstMergedAt: merges[0],
    lastMergedAt: merges[merges.length - 1],
  });
  writeFileSync(OUT, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`wrote ${path.relative(process.cwd(), OUT)}:`, stats);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
