import { test, expect } from "@playwright/test";
for (const locale of ["ko", "en", "ja"] as const) {
  test(`030 ${locale} route SEO and localized UI`, async ({ page }) => {
    await page.goto(`/${locale}/pdf-page-organizer`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("tool030-root")).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}/pdf-page-organizer$`));
  });
}
