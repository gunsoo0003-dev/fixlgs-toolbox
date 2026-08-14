import { test, expect } from "@playwright/test";

test("027 preflight route/root and file contract", async ({ page }) => {
  await page.goto("/ko/pdf-to-image-converter");
  const root = page.getByTestId("tool027-root");
  await expect(root).toBeVisible();
  await expect(page.getByTestId("tool027-dropzone")).toBeVisible();
  const input = page.getByTestId("tool027-file-input");
  await expect(input).toHaveAttribute("accept", /application\/pdf/);
  await expect(input).not.toHaveAttribute("multiple", "");
  await expect(page.getByTestId("tool027-workspace")).toHaveCount(0);
});
