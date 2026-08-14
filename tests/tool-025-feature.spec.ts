import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('025 Korea online output is locked to JPG and at most 500KB', async ({ page }) => {
  await page.goto('/ko/id-passport-photo-maker');
  await page.getByRole('button', { name: /한국 여권 · 온라인 413×531px/ }).click();
  await expect(page.getByTestId('tool025-online-rule')).toContainText('413×531px');
  await expect(page.getByTestId('tool025-format')).toHaveValue('jpg');
  await expect(page.getByTestId('tool025-format')).toBeDisabled();
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('tool025-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/kr-passport-online-413x531\.jpg$/);
  const saved = await download.path();
  expect(saved).toBeTruthy();
  expect(fs.statSync(saved!).size).toBeLessThanOrEqual(500 * 1024);
});

test('025 normal print preset still allows PNG', async ({ page }) => {
  await page.goto('/en/id-passport-photo-maker');
  await page.getByRole('button', { name: /US Passport/ }).click();
  await expect(page.getByTestId('tool025-format')).toBeEnabled();
  await page.getByTestId('tool025-format').selectOption('png');
  await expect(page.getByTestId('tool025-format')).toHaveValue('png');
});
