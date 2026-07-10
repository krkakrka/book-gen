import { test, expect } from "@playwright/test";

test.describe("Library (/library)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/library");
  });

  test("shows heading, eyebrow and the new-story controls", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Your library" })).toBeVisible();
    await expect(page.getByTestId("user-eyebrow")).toContainText("Maya");
    await expect(page.getByTestId("new-story-button")).toBeVisible();
    await expect(page.getByTestId("create-tile")).toBeVisible();
  });

  test("renders the 3 seeded books", async ({ page }) => {
    await expect(page.getByTestId("book-card")).toHaveCount(3);
    await expect(page.getByText("Pip and the Whispering Forest")).toBeVisible();
    await expect(page.getByTestId("book-meta").first()).toContainText("pages");
  });

  test("clicking a cover opens the reader", async ({ page }) => {
    await page.getByTestId("book-cover").first().click();
    await expect(page).toHaveURL(/\/book\//);
    await expect(page.getByTestId("reader-view")).toBeVisible();
  });

  test("+ New story and create tile open the wizard", async ({ page }) => {
    await page.getByTestId("new-story-button").click();
    await expect(page).toHaveURL(/\/create$/);
    await page.goto("/library");
    await page.getByTestId("create-tile").click();
    await expect(page).toHaveURL(/\/create$/);
  });

  test("edit icon opens the edit wizard (and does not open the reader)", async ({ page }) => {
    await page.getByTestId("edit-book").first().click();
    await expect(page).toHaveURL(/\/edit\//);
    await expect(page.getByTestId("wizard-view")).toBeVisible();
  });

  test("delete removes a book after confirm", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await expect(page.getByTestId("book-card")).toHaveCount(3);
    await page.getByTestId("delete-book").first().click();
    await expect(page.getByTestId("book-card")).toHaveCount(2);
  });

  test("sign out returns to login", async ({ page }) => {
    await page.getByTestId("signout-button").click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
