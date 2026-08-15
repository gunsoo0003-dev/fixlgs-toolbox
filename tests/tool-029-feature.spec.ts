import { test, expect } from '@playwright/test';
import { uploadTool029 } from './helpers/tool-029';

test('029 mode state transitions and page selection stay inside tool scope', async ({ page }) => {
  await uploadTool029(page);
  const root=page.getByTestId('tool029-root');
  await expect(page.getByTestId('tool029-workspace')).toBeVisible();
  await expect(page.getByTestId('tool029-dropzone')).toHaveAttribute('data-drag-active','false');
  await expect(page.getByTestId('tool029-workspace')).toHaveAttribute('data-drag-active','false');
  await page.getByTestId('tool029-mode-selected').click();
  await expect(page.getByTestId('tool029-selection-input')).toBeVisible();
  await page.getByTestId('tool029-selection-input').fill('');
  await page.getByTestId('tool029-page-1').click();
  await page.getByTestId('tool029-page-3').click();
  await expect(page.getByTestId('tool029-selection-input')).toHaveValue('1,3');
  await expect(root.getByTestId('tool029-plan')).toContainText(/2/);
  await page.getByTestId('tool029-mode-individual').click();
  await expect(page.getByTestId('tool029-process')).toBeEnabled();
});
