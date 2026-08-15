import { test, expect } from '@playwright/test';
for (const locale of ['ko','en','ja'] as const) {
  test(`029 preflight ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/split-extract-pdf`);
    await expect(page.getByTestId('tool029-root')).toBeVisible();
    await expect(page.getByTestId('tool029-dropzone')).toBeVisible();
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
  });
}
