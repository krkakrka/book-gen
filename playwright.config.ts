import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const API_PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 8000;
const baseURL = `http://localhost:${PORT}`;
const apiBaseURL = `http://localhost:${API_PORT}`;

// Shared with e2e/auth.setup.ts, which writes these files.
const STORAGE_STATE = "e2e/.auth/storageState.json";
const STORAGE_STATE_SIGNOUT = "e2e/.auth/storageState.signout.json";
// library.spec.ts's one test that performs a real backend logout — routed to
// its own isolated project/session so it can't invalidate the shared one.
const SIGNOUT_TEST = /sign out returns to login/;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Forced serial: tests mutate a real shared backend DB (not per-context
  // localStorage), so create/delete tests across spec files race on the
  // same book collection under concurrent workers.
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // Dependency-less projects run as early as topologically possible, not
    // "immediately before" their dependent — so reset-before-wizard is
    // chained after chromium-library explicitly, forcing library's mutations
    // (its delete test) to land *before* wizard gets its own fresh reset,
    // rather than racing/leaking into wizard's "3 seeded + 1 new" baseline.
    { name: "reset-before-library", testMatch: /reset-books\.setup\.ts/ },

    {
      // login.spec.ts + reader.spec.ts: neither makes absolute book-count
      // assertions that race with library/wizard's create/delete tests.
      name: "chromium",
      testMatch: /login\.spec\.ts|reader\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
    },
    {
      name: "chromium-library",
      testMatch: /library\.spec\.ts/,
      grepInvert: SIGNOUT_TEST,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup", "reset-before-library"],
    },
    {
      name: "reset-before-wizard",
      testMatch: /reset-books\.setup\.ts/,
      dependencies: ["chromium-library"],
    },
    {
      name: "chromium-wizard",
      testMatch: /wizard\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup", "reset-before-wizard"],
    },
    {
      name: "chromium-signout",
      testMatch: /library\.spec\.ts/,
      grep: SIGNOUT_TEST,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE_SIGNOUT },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: `bash -c "cd backend && source .venv/bin/activate && python manage.py runserver ${API_PORT}"`,
      url: `${apiBaseURL}/api/health/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
