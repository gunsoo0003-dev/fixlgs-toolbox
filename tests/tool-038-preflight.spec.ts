import { expect, test } from '@playwright/test';
import { route038 } from './helpers/tool-038';

test('TOOL038 initial 037-design contract',async({page})=>{
  await page.goto(route038());
  await expect(page.getByTestId('tool038-root')).toBeVisible();
  await expect(page.getByTestId('tool038-local-notice')).toBeVisible();
  await expect(page.getByTestId('tool038-workspace')).toBeVisible();
  await expect(page.getByTestId('tool038-workspace')).toHaveAttribute('data-drag-active','false');
  await expect(page.getByTestId('tool038-file-input')).toHaveAttribute('accept',/\.txt/);
  await expect(page.getByTestId('tool038-file-button')).toBeVisible();
  await expect(page.getByTestId('tool038-start-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool038-input')).toBeVisible();
  await expect(page.getByTestId('tool038-options')).not.toHaveAttribute('open',/.*/);
  await expect(page.getByTestId('tool038-result')).toHaveCount(0);
  await expect(page.getByTestId('tool038-mode-upper')).toBeChecked();
});
