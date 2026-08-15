import { test, expect } from "@playwright/test";

const APPROVED = {
  maxPdfBytes: 30 * 1024 * 1024,
  maxPages: 300,
  maxSignatureImageBytes: 10 * 1024 * 1024,
  maxSignaturePixels: 20_000_000,
  maxStrokePoints: 20_000,
} as const;

test("032 service limits equal the user-approved A values", async ({ page }) => {
  await page.goto("/en/pdf-signature");
  const root = page.getByTestId("tool032-root");
  await expect(root).toHaveAttribute("data-max-pdf-bytes", String(APPROVED.maxPdfBytes));
  await expect(root).toHaveAttribute("data-max-pages", String(APPROVED.maxPages));
  await expect(root).toHaveAttribute("data-max-signature-bytes", String(APPROVED.maxSignatureImageBytes));
  await expect(root).toHaveAttribute("data-max-signature-pixels", String(APPROVED.maxSignaturePixels));
  await expect(root).toHaveAttribute("data-max-stroke-points", String(APPROVED.maxStrokePoints));
});

test("032 UI exposes approved limit wording and does not call them candidates", async ({ page }) => {
  await page.goto("/en/pdf-signature");
  await expect(page.locator("body")).toContainText("Approved service limits");
  await expect(page.locator("body")).not.toContainText("Current candidate limits");
});
