import { test, expect } from "@playwright/test";

test("026 margin boundaries", async ({ page }) => {
  await page.goto("/en/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  const num = page.getByTestId("tool026-margin-number");
  await num.fill("50");
  await expect(num).toHaveValue("50");
  await num.fill("80");
  await expect(num).toHaveValue("50");
});

test("026 remove returns to empty edit state", async ({ page }) => {
  await page.goto("/ja/image-to-pdf");
  await page.getByTestId("tool026-file-input").setInputFiles("test-fixtures/tool-026/sample.jpg");
  await page.getByLabel("削除 1").click();
  await expect(page.getByTestId("tool026-count")).toHaveText("0 / 20");
  await expect(page.getByTestId("tool026-workspace-dropzone")).toHaveCount(0);
});
