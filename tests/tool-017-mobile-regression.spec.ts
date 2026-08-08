import { test, expect } from '@playwright/test';
import { TOOL017, TOOL017_TESTIDS } from './helpers/tool-017';

test.describe('017 mobile regression', () => {
  test('017 ko/en/ja routes remain reachable and viewport-safe on mobile', async ({ page }) => {
    for (const locale of ['ko', 'en', 'ja'] as const) {
      const response = await page.goto(TOOL017[locale], { waitUntil: 'domcontentloaded' });
      expect(response?.ok()).toBeTruthy();
      await expect(page.getByTestId(TOOL017_TESTIDS.root)).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('017 image-edit category card remains reachable on mobile', async ({ page }) => {
    const response = await page.goto('/ko/category/image-edit', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    const card = page.locator('a[href="/ko/image-watermark-tool"]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('17');
    await expect(card).toContainText('LIVE');
  });
});
