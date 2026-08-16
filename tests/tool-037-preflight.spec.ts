import { expect, test } from '@playwright/test';
import { route037 } from './helpers/tool-037';

test('TOOL037 initial 036-design contract',async({page})=>{
  await page.goto(route037());
  await expect(page.getByTestId('tool037-root')).toBeVisible();
  await expect(page.getByTestId('tool037-local-notice')).toBeVisible();
  await expect(page.getByTestId('tool037-workspace')).toBeVisible();
  await expect(page.getByTestId('tool037-workspace')).toHaveAttribute('data-drag-active','false');
  await expect(page.getByTestId('tool037-file-input')).toHaveAttribute('accept',/\.txt/);
  await expect(page.getByTestId('tool037-file-button')).toBeVisible();
  await expect(page.getByTestId('tool037-start-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool037-input')).toBeVisible();
  await expect(page.getByTestId('tool037-options')).not.toHaveAttribute('open',/.*/);
  await expect(page.getByTestId('tool037-result')).toHaveCount(0);
});
