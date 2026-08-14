import { test, expect } from '@playwright/test';

test('025 rejects corrupt input', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/corrupt.jpg');
  await expect(page.getByTestId('tool025-error')).toBeVisible();
});

test('025 rejects animated WebP', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/animated.webp');
  await expect(page.getByTestId('tool025-error')).toBeVisible();
});

test('025 rejects animated PNG', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/animated-apng.png');
  await expect(page.getByTestId('tool025-error')).toBeVisible();
});
