import { test, expect } from "@playwright/test";

test("026 jpg -> one page result", async ({ page }) => {
  await page.goto("/ko/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  await expect(page.getByTestId("tool026-count")).toHaveText("1 / 20");
  await page.getByTestId("tool026-create").click();
  await expect(page.getByTestId("tool026-result")).toBeVisible();
  await expect(page.getByTestId("tool026-result-meta")).toContainText("1 페이지");
});

test("026 png -> one page result", async ({ page }) => {
  await page.goto("/en/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/transparent.png");
  await page.getByTestId("tool026-create").click();
  await expect(page.getByTestId("tool026-result")).toBeVisible();
});
