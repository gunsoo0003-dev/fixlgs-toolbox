import { test, expect } from "@playwright/test";

test("035 preflight route, root, single PDF input, local-first copy", async ({ page }) => {
  await page.goto("/ko/pdf-text-image-extractor");
  await expect(page.getByTestId("tool035-root")).toBeVisible();
  const input = page.getByTestId("tool035-file-input");
  await expect(input).toHaveAttribute("accept", /pdf/);
  await expect(input).not.toHaveAttribute("multiple", "");
  await expect(page.locator("h1")).toContainText("PDF 텍스트·이미지 추출기");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});
