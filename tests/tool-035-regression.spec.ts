import { test, expect } from "@playwright/test";

for (const locale of ["ko", "en", "ja"] as const) {
  test(`035 ${locale} route SEO and localized UI`, async ({ page }) => {
    await page.goto(`/${locale}/pdf-text-image-extractor`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("tool035-root")).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}/pdf-text-image-extractor$`));
  });
}

test("035 preserves boundary with 027 full-page renderer", async ({ page }) => {
  await page.goto("/en/pdf-text-image-extractor");
  const body = await page.locator("body").innerText();
  expect(body).toContain("PDF Text & Image Extractor");
  expect(body).toContain("embedded");
  expect(body).not.toContain("Convert selected pages");
});
