import { expect, test } from '@playwright/test';
import { clean037, route037 } from './helpers/tool-037';

test('TOOL037 NBSP full-width and zero-width are preserved by default',async({page})=>{
  await page.goto(route037());
  const s='A\u00a0B\u3000C\u200bD';
  await clean037(page,s);
  await expect(page.getByTestId('tool037-result')).toHaveValue(s);
});

test('TOOL037 empty input is deterministic',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-clean').click();
  await expect(page.getByTestId('tool037-result')).toHaveValue('');
  await expect(page.getByTestId('tool037-summary-spaces')).toHaveText('0');
});

test('TOOL037 reset clears file input result and restores defaults',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-options').locator('summary').click();
  await page.getByTestId('tool037-collapse-spaces').uncheck();
  await clean037(page,'A  B');
  await page.getByTestId('tool037-reset').click();
  await expect(page.getByTestId('tool037-input')).toHaveValue('');
  await expect(page.getByTestId('tool037-result')).toHaveCount(0);
  await expect(page.getByTestId('tool037-start-dropzone')).toBeVisible();
  await page.getByTestId('tool037-options').locator('summary').click();
  await expect(page.getByTestId('tool037-collapse-spaces')).toBeChecked();
  await expect(page.getByTestId('tool037-eol-lf')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('tool037-workspace')).toHaveAttribute('data-drag-active','false');
});
