import { test, expect } from "@playwright/test";

test("035 rejects extension-spoofed non-PDF by signature", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  await page.getByTestId("tool035-file-input").setInputFiles("test-fixtures/tool-035/not-a-pdf.pdf");
  await expect(page.getByTestId("tool035-error")).toBeVisible();
});

test("035 corrupt PDF leaves recoverable input UI", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  await page.getByTestId("tool035-file-input").setInputFiles("test-fixtures/tool-035/corrupt.pdf");
  await expect(page.getByTestId("tool035-error")).toBeVisible();
  await expect(page.getByTestId("tool035-file-input")).toBeAttached();
});

test("035 image-only scan reports no text layer and never pretends OCR", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const root = page.getByTestId("tool035-root");
  await root.getByTestId("tool035-file-input").setInputFiles("test-fixtures/tool-035/scan-image-only.pdf");
  await expect(root.getByTestId("tool035-extract")).toBeEnabled({ timeout: 30_000 });
  await root.getByTestId("tool035-mode-text").click();
  await root.getByTestId("tool035-extract").click();
  await expect(root.getByTestId("tool035-scan-hint")).toContainText("does not run OCR");
});

test("035 password dialog appears for encrypted PDF", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  await page.getByTestId("tool035-file-input").setInputFiles("test-fixtures/tool-035/encrypted-password.pdf");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByPlaceholder("PDF 비밀번호").fill("tool035");
  await page.getByRole("button", { name: "PDF 열기", exact: true }).click();
  await expect(page.getByTestId("tool035-workspace")).toBeVisible();
});
