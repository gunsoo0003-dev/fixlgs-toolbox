import { test, expect } from "@playwright/test";

test("030 preflight route, root, local single-PDF input", async ({ page }) => {
  await page.goto("/ko/pdf-page-organizer");
  await expect(page.getByTestId("tool030-root")).toBeVisible();
  await expect(page.getByTestId("tool030-file-input")).toHaveAttribute("accept", /pdf/);
  await expect(page.getByTestId("tool030-file-input")).not.toHaveAttribute("multiple", "");
  await expect(page.locator("h1")).toContainText("PDF 페이지 정리 도구");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});
