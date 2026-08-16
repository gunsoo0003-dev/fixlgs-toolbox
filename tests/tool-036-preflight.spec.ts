import { test, expect } from '@playwright/test';

test('TOOL036 preflight current product/checker contract', async ({ page }) => {
  await page.goto('/ko/character-document-counter');
  await expect(page.getByTestId('tool036-root')).toBeVisible();
  await expect(page.getByTestId('tool036-workspace')).toBeVisible();
  await expect(page.getByTestId('tool036-workspace')).toHaveAttribute('data-drag-active', 'false');
  await expect(page.getByTestId('tool036-file-input')).toHaveAttribute('accept', /\.txt/);
  await expect(page.getByTestId('tool036-file-button')).toBeVisible();
  await expect(page.getByTestId('tool036-textarea')).toBeVisible();
  await expect(page.getByTestId('tool036-core-stats')).toBeVisible();
  await expect(page.getByTestId('tool036-secondary-stats')).toBeVisible();
  await expect(page.getByTestId('tool036-options')).not.toHaveAttribute('open', /.*/);
  await expect(page.getByTestId('tool036-copy-stats')).toBeDisabled();
  await expect(page.getByTestId('tool036-download-text')).toBeDisabled();
});
