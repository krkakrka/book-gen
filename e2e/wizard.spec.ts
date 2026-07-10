import { test, expect } from "@playwright/test";

test.describe("Create wizard (/create)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByTestId("wizard-view")).toBeVisible();
  });

  test("starts on step 1 with Next gated and Back disabled", async ({ page }) => {
    await expect(page.getByTestId("wizard-heading")).toHaveText("Create a new story");
    await expect(page.getByTestId("step-counter")).toHaveText("Step 1 of 5");
    await expect(page.getByTestId("prev-step")).toBeDisabled();
    await expect(page.getByTestId("next-step")).toBeDisabled();
    await expect(page.getByTestId("step-node")).toHaveCount(5);
  });

  test("cancel returns to library", async ({ page }) => {
    await page.getByTestId("wizard-cancel").click();
    await expect(page).toHaveURL(/\/library$/);
  });

  test("step 1: selecting a value enables Next and updates the definition", async ({ page }) => {
    await expect(page.getByTestId("value-card")).toHaveCount(9);
    const courage = page.locator('[data-testid="value-card"][data-value-id="courage"]');
    await courage.click();
    await expect(courage).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("value-definition")).toContainText("tries even when they feel scared");
    await expect(page.getByTestId("next-step")).toBeEnabled();
  });

  test("full happy path create → add to library", async ({ page }) => {
    // Step 1: value
    await page.locator('[data-testid="value-card"][data-value-id="courage"]').click();
    await page.getByTestId("next-step").click();

    // Step 2: story
    await expect(page.getByTestId("step-counter")).toHaveText("Step 2 of 5");
    await expect(page.getByTestId("next-step")).toBeDisabled();
    const forest = page.locator('[data-testid="story-card"][data-story-id="forest"]');
    await forest.getByTestId("story-toggle").click();
    await expect(forest.getByTestId("story-full")).toBeVisible();
    await forest.getByTestId("story-choose").click();
    await expect(forest).toHaveAttribute("data-chosen", "true");
    await page.getByTestId("next-step").click();

    // Step 3: pages (seeded from chosen story → 5 pages, all valid)
    await expect(page.getByTestId("step-counter")).toHaveText("Step 3 of 5");
    await expect(page.getByTestId("page-card")).toHaveCount(5);
    await expect(page.getByTestId("next-step")).toBeEnabled();
    await page.getByTestId("next-step").click();

    // Step 4: style
    await expect(page.getByTestId("step-counter")).toHaveText("Step 4 of 5");
    await expect(page.getByTestId("next-step")).toBeDisabled();
    await expect(page.getByTestId("next-step")).toHaveText(/Review/);
    await page.locator('[data-testid="style-card"][data-style-id="crayon"]').click();
    await page.getByTestId("next-step").click();

    // Step 5: review + accept
    await expect(page.getByTestId("review-summary")).toContainText("teaches courage");
    await expect(page.getByTestId("accept-book")).toHaveText(/Add to library/);
    await page.getByTestId("accept-book").click();
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByTestId("book-card")).toHaveCount(4); // 3 seeded + 1 new
  });

  test("step 3: empty narrator text gates Next", async ({ page }) => {
    await page.locator('[data-testid="value-card"][data-value-id="kindness"]').click();
    await page.getByTestId("next-step").click();
    const meadow = page.locator('[data-testid="story-card"][data-story-id="meadow"]');
    await meadow.getByTestId("story-toggle").click();
    await meadow.getByTestId("story-choose").click();
    await page.getByTestId("next-step").click();

    await expect(page.getByTestId("next-step")).toBeEnabled();
    // Clear one narrator field → Next must become disabled.
    await page.getByTestId("page-text-input").first().fill("");
    await expect(page.getByTestId("next-step")).toBeDisabled();
  });

  test("step nodes allow jumping back but not forward", async ({ page }) => {
    await page.locator('[data-testid="value-card"][data-value-id="honesty"]').click();
    await page.getByTestId("next-step").click();
    await expect(page.getByTestId("step-counter")).toHaveText("Step 2 of 5");

    // Forward jump (to step 4) is a no-op.
    await page.locator('[data-testid="step-node"][data-step="4"]').click();
    await expect(page.getByTestId("step-counter")).toHaveText("Step 2 of 5");

    // Back jump (to step 1) works.
    await page.locator('[data-testid="step-node"][data-step="1"]').click();
    await expect(page.getByTestId("step-counter")).toHaveText("Step 1 of 5");
  });
});

test.describe("Edit wizard (/edit/:id)", () => {
  test("opens prefilled in edit mode with Save changes", async ({ page }) => {
    await page.goto("/edit/seed-courage-0");
    await expect(page.getByTestId("wizard-heading")).toHaveText("Edit story");
    // Value already selected → Next enabled on arrival.
    await expect(page.getByTestId("next-step")).toBeEnabled();
    await expect(
      page.locator('[data-testid="value-card"][data-value-id="courage"]')
    ).toHaveAttribute("data-selected", "true");
  });
});
