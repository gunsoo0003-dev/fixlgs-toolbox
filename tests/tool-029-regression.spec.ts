import { test, expect } from '@playwright/test';
for (const locale of ['ko','en','ja'] as const) {
  test(`029 locale metadata and common sections ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/split-extract-pdf`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new RegExp(`/${locale}/split-extract-pdf$`));
    await expect(page.locator('.toolbox-tool-guide')).toBeVisible();
    await expect(page.locator('.toolbox-tool-expert-post')).toBeVisible();
    await expect(page.locator('.toolbox-tool-info-band')).toBeVisible();
    await expect(page.locator('.toolbox-tool-faq')).toBeVisible();
  });
}
