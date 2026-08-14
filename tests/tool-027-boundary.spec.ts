import { test, expect } from "@playwright/test";

test("027 rejects non-PDF content", async ({ page }) => {
  await page.goto("/en/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/invalid.pdf");
  await expect(page.getByTestId("tool027-status")).toHaveAttribute("role", "alert");
  await expect(page.getByTestId("tool027-workspace")).toHaveCount(0);
});

test("027 rejects bad page range without losing loaded PDF", async ({ page }) => {
  await page.goto("/ja/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await page.getByTestId("tool027-range").fill("1-9");
  await page.getByTestId("tool027-range").locator("xpath=following-sibling::button").click();
  await expect(page.getByTestId("tool027-status")).toHaveAttribute("role", "alert");
  await expect(page.getByTestId("tool027-workspace")).toBeVisible();
  await expect(page.getByTestId("tool027-selected-count")).toHaveText("3 / 3");
});
