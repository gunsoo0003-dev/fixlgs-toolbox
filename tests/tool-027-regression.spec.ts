import { test, expect } from "@playwright/test";
for (const locale of ["ko", "en", "ja"] as const) {
  test(`027 ${locale} SEO, route and common sections`, async ({ page }) => {
    await page.goto(`/${locale}/pdf-to-image-converter`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.getByTestId("tool027-root")).toBeVisible();
    await expect(page.locator(".toolbox-tool-guide")).toBeVisible();
    await expect(page.locator(".toolbox-tool-faq")).toBeVisible();
  });
}
