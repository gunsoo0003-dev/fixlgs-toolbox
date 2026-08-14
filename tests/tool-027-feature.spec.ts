import { test, expect } from "@playwright/test";

test("027 PNG multi-page conversion and ZIP download", async ({ page }) => {
  await page.goto("/en/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await page.getByTestId("tool027-range").fill("1,3");
  await page.getByTestId("tool027-range").locator("xpath=following-sibling::button").click();
  await page.getByTestId("tool027-format").selectOption("png");
  await page.getByTestId("tool027-scale-preset").selectOption("1.5");
  await page.getByTestId("tool027-convert").click();
  await expect(page.getByTestId("tool027-result-card")).toHaveCount(2);
  await expect(page.getByTestId("tool027-quality")).toHaveCount(0);
  const names = await page.getByTestId("tool027-result-card").locator("strong").allTextContents();
  expect(names[0]).toContain("page-001.png");
  expect(names[1]).toContain("page-003.png");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("tool027-export-zip").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("sample-3pages-images.zip");
});

test("027 reset returns to initial upload state", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  await page.getByTestId("tool027-file-input").setInputFiles("test-fixtures/tool-027/sample-3pages.pdf");
  await page.getByTestId("tool027-format").selectOption("png");
  await page.getByTestId("tool027-reset-all").click();
  await expect(page.getByTestId("tool027-workspace")).toHaveCount(0);
  await expect(page.getByTestId("tool027-results")).toHaveCount(0);
  await expect(page.getByTestId("tool027-dropzone")).not.toHaveClass(/dropzoneReady/);
});
