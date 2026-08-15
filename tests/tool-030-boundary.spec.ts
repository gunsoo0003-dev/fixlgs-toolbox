import { test, expect } from "@playwright/test";

test("030 rejects extension-spoofed non-PDF", async ({ page }) => {
  await page.goto("/en/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/fake.pdf");
  await expect(page.getByTestId("tool030-error")).toBeVisible();
});

test("030 rejects corrupt PDF with recoverable UI", async ({ page }) => {
  await page.goto("/ko/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/corrupt.pdf");
  await expect(page.getByTestId("tool030-error")).toBeVisible();
  await expect(page.getByTestId("tool030-file-input")).toBeAttached();
});

test("030 rejects encrypted PDF without bypass", async ({ page }) => {
  await page.goto("/ja/pdf-page-organizer");
  await page.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/encrypted.pdf");
  await expect(page.getByTestId("tool030-error")).toBeVisible();
});

test("030 never deletes the last remaining page", async ({ page }) => {
  await page.goto("/ko/pdf-page-organizer");
  const root = page.getByTestId("tool030-root");
  await root.getByTestId("tool030-file-input").setInputFiles("test-fixtures/tool-030/single-page.pdf");
  await root.getByRole("checkbox", { name: "현재 1", exact: true }).check();
  await root.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByTestId("tool030-error")).toContainText("최소 1페이지");
  await expect(page.getByTestId("tool030-page-card")).toHaveCount(1);
});
