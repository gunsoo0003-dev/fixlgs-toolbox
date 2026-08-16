import { expect, test } from '@playwright/test';
import { route037, TOOL037_LIMIT } from './helpers/tool-037';

test('TOOL037 approved 1,000,000 character limit is accepted',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-input').fill('A'.repeat(TOOL037_LIMIT));
  await expect(page.getByTestId('tool037-clean')).toBeEnabled();
  await expect(page.getByTestId('tool037-error')).toHaveCount(0);
});

test('TOOL037 limit + 1 is blocked',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-input').fill('A'.repeat(TOOL037_LIMIT+1));
  await expect(page.getByTestId('tool037-clean')).toBeDisabled();
  await expect(page.getByTestId('tool037-error')).toBeVisible();
});
