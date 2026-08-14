import { test, expect } from "@playwright/test";

test("027 loads PDF and converts selected page to JPG", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await expect(page.getByTestId("tool027-workspace")).toBeVisible();
  await expect(page.getByTestId("tool027-selected-count")).toHaveText("3 / 3");
  await page.getByTestId("tool027-range").fill("2");
  await page.getByTestId("tool027-range").locator("xpath=following-sibling::button").click();
  await expect(page.getByTestId("tool027-selected-count")).toHaveText("1 / 3");
  await page.getByTestId("tool027-convert").click();
  await expect(page.getByTestId("tool027-results")).toBeVisible();
  await expect(page.getByTestId("tool027-result-card")).toHaveCount(1);
  await expect(page.getByTestId("tool027-result-card")).toHaveAttribute("data-page", "2");
  await expect(page.getByTestId("tool027-result-card").locator("strong")).toContainText("page-002.jpg");
});
