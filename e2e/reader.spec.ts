import { test, expect } from "@playwright/test";

// Seeded book: "Pip and the Whispering Forest" has 5 sections → 5 pages + cover.
const SEED_ID = "seed-courage-0";

test.describe("Reader (/book/:id)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/book/${SEED_ID}`);
    await expect(page.getByTestId("reader-view")).toBeVisible();
  });

  test("opens on the cover with prev disabled", async ({ page }) => {
    await expect(page.getByTestId("page-indicator")).toHaveText("Cover");
    await expect(page.getByTestId("reader-prev")).toBeDisabled();
    await expect(page.getByTestId("reader-title")).toContainText("Pip and the Whispering Forest");
    await expect(page.getByTestId("story-page")).toBeVisible();
  });

  test("next advances cover → page 1", async ({ page }) => {
    await page.getByTestId("reader-next").click();
    await expect(page.getByTestId("page-indicator")).toHaveText("Page 1 / 5");
    await expect(page.getByTestId("reader-prev")).toBeEnabled();
  });

  test("next is disabled on the last page", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("reader-next").click();
    }
    await expect(page.getByTestId("page-indicator")).toHaveText("Page 5 / 5");
    await expect(page.getByTestId("reader-next")).toBeDisabled();
  });

  test("page dots jump directly to a page", async ({ page }) => {
    const dots = page.getByTestId("reader-dot");
    await expect(dots).toHaveCount(6); // cover + 5 pages
    await dots.last().click();
    await expect(page.getByTestId("page-indicator")).toHaveText("Page 5 / 5");
  });

  test("back returns to the library", async ({ page }) => {
    await page.getByTestId("reader-back").click();
    await expect(page).toHaveURL(/\/library$/);
  });
});
