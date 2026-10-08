import { defineConfig, devices } from "@playwright/test";

// Dedicated port so a running `next dev` on 3000 is never mistaken for the production server.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * E2E runs against the production build (`next start`), which is what CI and Vercel serve.
 * Run `npm run build` first; Playwright starts the server itself.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    // Never reuse: a `next start` left over from an earlier run keeps serving the previous
    // build, so the screenshots and the axe results would silently describe stale markup.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
