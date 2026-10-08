/**
 * Load the env files with Next's own loader (@next/env, pinned to the `next` version) before any
 * module reads process.env, so the resume sees the same files, in the same order, as the
 * `next dev` or `next build` it runs before: `predev` loads the development files, `prebuild`
 * the production ones, `pretest` (NODE_ENV=test under Vitest) the test ones. tsx hoists a file's
 * imports above its statements, so a script cannot load env inline and then import lib/site: it
 * imports this module first, and imports evaluate in source order. Variables already set in the
 * environment (as on Vercel) keep their values.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.npm_lifecycle_event === "predev", {
  info: () => {},
  error: console.error,
});
