import { expect, test } from '@playwright/test';
import { convert038, route038 } from './helpers/tool-038';

test('TOOL038 whitespace tabs NBSP emoji and line structure are preserved',async({page})=>{
  await page.goto(route038());
  const source='  hello\tWORLD\u00a0🔥\nnext  LINE  ';
  await convert038(page,source,'lower');
  await expect(page.getByTestId('tool038-result')).toHaveValue('  hello\tworld\u00a0🔥\nnext  line  ');
});

test('TOOL038 empty input is deterministic',async({page})=>{
  await page.goto(route038());
  await page.getByTestId('tool038-convert').click();
  await expect(page.getByTestId('tool038-result')).toHaveValue('');
  await expect(page.getByTestId('tool038-changed')).toHaveText('0');
});

test('TOOL038 reset returns to 037-style initial state and default mode',async({page})=>{
  await page.goto(route038());
  await convert038(page,'hello','title');
  await page.getByTestId('tool038-reset').click();
  await expect(page.getByTestId('tool038-input')).toHaveValue('');
  await expect(page.getByTestId('tool038-result')).toHaveCount(0);
  await expect(page.getByTestId('tool038-start-dropzone')).toBeVisible();
  await page.getByTestId('tool038-options').locator('summary').click();
  await expect(page.getByTestId('tool038-mode-upper')).toBeChecked();
  await expect(page.getByTestId('tool038-workspace')).toHaveAttribute('data-drag-active','false');
});
