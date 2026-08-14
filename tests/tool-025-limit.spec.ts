import { test, expect } from '@playwright/test';

test('025 accepts 40MP candidate fixture', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/limit-40mp.jpg');
  await expect(page.getByTestId('tool025-error')).toHaveCount(0);
});

test('025 rejects above 40MP fixture', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/limit-over-40mp.jpg');
  await expect(page.getByTestId('tool025-error')).toBeVisible();
});
