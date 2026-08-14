import { test, expect } from "@playwright/test";

test("026 024-style dropzone state transition remains intact", async ({ page }) => {
  await page.goto("/ko/image-to-pdf");
  const drop = page.getByTestId("tool026-dropzone");
  await expect(drop).toBeVisible();
  await expect(drop).not.toHaveClass(/dropzoneReady/);
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  await expect(drop).toHaveClass(/dropzoneReady/);
  await expect(page.getByTestId("tool026-workspace-dropzone")).toBeVisible();
  await expect(page.getByTestId("tool026-preview-panel")).toBeVisible();
  await page.getByTestId("tool026-reset-all").click();
  await expect(drop).not.toHaveClass(/dropzoneReady/);
  await expect(page.getByTestId("tool026-workspace-dropzone")).toHaveCount(0);
});

test("026 has no horizontal overflow on representative mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
