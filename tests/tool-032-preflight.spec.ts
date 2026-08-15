import { test, expect } from "@playwright/test";

test("032 preflight route/root and dynamic selector contract", async ({ page }) => {
  await page.goto("/en/pdf-signature");
  const root = page.getByTestId("tool032-root");
  await expect(root).toBeVisible();
  await expect(page.getByTestId("tool032-dropzone")).toBeVisible();
  const input = page.getByTestId("tool032-file-input");
  await expect(input).toHaveAttribute("accept", /application\/pdf/);
  await expect(input).not.toHaveAttribute("multiple", "");
  await expect(page.getByTestId("tool032-workspace")).toHaveCount(0);
  await expect(page.getByTestId("tool032-result")).toHaveCount(0);
});
