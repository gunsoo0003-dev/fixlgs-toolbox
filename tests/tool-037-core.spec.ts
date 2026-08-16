import { expect, test } from '@playwright/test';
import { clean037, route037 } from './helpers/tool-037';

test('TOOL037 default pipeline matches exact string',async({page})=>{
  await page.goto(route037());
  await clean037(page,'  FIXLGS   TOOLBOX  \r\n\ttext   cleaner\r\n\r\n B  ');
  await expect(page.getByTestId('tool037-result')).toHaveValue('FIXLGS TOOLBOX\ntext cleaner\nB');
  await expect(page.getByTestId('tool037-summary-spaces')).toHaveText(/\d+/);
});

test('TOOL037 tabs are actual removal',async({page})=>{
  await page.goto(route037());
  await clean037(page,'A\tB\tC');
  await expect(page.getByTestId('tool037-result')).toHaveValue('ABC');
  await expect(page.getByTestId('tool037-summary-tabs')).toHaveText('2');
});

test('TOOL037 blank removal can be disabled',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-options').locator('summary').click();
  await page.getByTestId('tool037-remove-blank-lines').uncheck();
  await clean037(page,'A\n\nB');
  await expect(page.getByTestId('tool037-result')).toHaveValue('A\n\nB');
});
