import { test, expect } from '@playwright/test';

test('024 rejects unsupported or corrupt input', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles('test-fixtures/corrupt.jpg');
  await expect(page.getByRole('status')).toBeVisible();
});

test('024 rejects animated WebP input', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles('test-fixtures/animated.webp');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByTestId('tool024-preview')).toHaveCount(0);
});

test('024 reports the 10 file service cap when more files are selected', async ({ page }) => {
  await page.goto('/ko/app-store-screenshot-maker');
  const files = Array.from({ length: 11 }, () => 'test-fixtures/tiny-image.jpg');
  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles(files);
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByText(/최대 10장/)).toBeVisible();
});
