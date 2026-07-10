import { test, expect } from "@playwright/test";

test.describe("Login (/login)", () => {
  test("renders the sign-in form and headline", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toHaveAttribute("type", "password");
    await expect(page.getByTestId("signin-button")).toBeVisible();
    await expect(page.getByText("Little stories that grow big hearts.")).toBeVisible();
  });

  test("/ redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sign in navigates to the library", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("parent@home.com");
    await page.locator('input[name="password"]').fill("secret");
    await page.getByTestId("signin-button").click();
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByTestId("library-view")).toBeVisible();
  });
});
