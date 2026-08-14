import { test, expect } from '@playwright/test';

test('025 metadata and language route remain aligned', async ({ page }) => {
  await page.goto('/ja/id-passport-photo-maker');
  await expect(page.getByRole('heading',{level:1})).toContainText('証明写真・パスポート写真作成ツール');
  await expect(page.locator('body')).not.toContainText('024 · CONTENT IMAGE');
  await expect(page.getByTestId('tool025-root')).toBeVisible();
});

test('025 face guide is preview-only and output buttons exist', async ({ page }) => {
  await page.goto('/en/id-passport-photo-maker');
  await page.getByTestId('tool025-file-input').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
  await expect(page.getByTestId('tool025-download')).toBeEnabled();
  await expect(page.getByTestId('tool025-a4-download')).toBeEnabled();
});
