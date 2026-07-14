import { test as setup, expect, type Page } from "@playwright/test";

// Shared with playwright.config.ts's storageState paths — every other spec
// file runs already-authenticated, since app routes now guard on a real
// backend session (see lib/useRequireSession.ts).
const STORAGE_STATE = "e2e/.auth/storageState.json";
// library.spec.ts's "sign out returns to login" test performs a real
// POST /api/auth/logout/, which destroys that session server-side. If it
// shared the session above, it would log every other concurrently/later
// running test out too. Give it its own throwaway session instead.
const STORAGE_STATE_SIGNOUT = "e2e/.auth/storageState.signout.json";

async function loginAsDevUser(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("parent@home.com");
  await page.locator('input[name="password"]').fill("secret");
  await page.getByTestId("signin-button").click();
  await expect(page).toHaveURL(/\/library$/);
}

setup("authenticate as the seeded dev user", async ({ page }) => {
  await loginAsDevUser(page);
  await page.context().storageState({ path: STORAGE_STATE });
});

setup("authenticate a dedicated session for the sign-out test", async ({ page }) => {
  await loginAsDevUser(page);
  await page.context().storageState({ path: STORAGE_STATE_SIGNOUT });
});
