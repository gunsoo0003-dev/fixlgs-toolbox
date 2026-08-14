import { test, expect } from '@playwright/test';

for (const locale of ['ko','en','ja']) {
  test(`025 core ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/id-passport-photo-maker`);
    await expect(page.getByTestId('tool025-root')).toBeVisible();
    await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
    await expect(page.getByTestId('tool025-preview')).toBeVisible();
    await expect(page.getByTestId('tool025-output-size')).toHaveText(/413 × 531px/);
  });
}
