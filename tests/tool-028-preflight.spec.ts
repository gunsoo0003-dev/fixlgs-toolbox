import { test, expect } from '@playwright/test';

test('028 preflight: live route, category card, stable selector contract', async ({ page }) => {
  await page.goto('/ko/category/pdf');
  await expect(page.locator('a[href="/ko/merge-pdf"]')).toBeVisible();
  await page.goto('/ko/merge-pdf');
  await expect(page.getByTestId('tool028-root')).toBeVisible();
  await expect(page.getByTestId('tool028-dropzone')).toHaveAttribute('data-drag-active', 'false');
  await expect(page.getByTestId('tool028-file-input')).toHaveAttribute('multiple', '');
  await expect(page.getByTestId('tool028-file-count')).toHaveText('0');
});
