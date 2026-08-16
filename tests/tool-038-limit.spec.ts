import { expect, test } from '@playwright/test';
import { route038 } from './helpers/tool-038';

test('TOOL038 does not invent an unapproved hard text limit',async({page})=>{
  await page.goto(route038());
  const source='a'.repeat(100_000);
  await page.getByTestId('tool038-input').fill(source);
  await page.getByTestId('tool038-convert').click();
  await expect(page.getByTestId('tool038-result')).toHaveValue('A'.repeat(100_000));
  await expect(page.getByTestId('tool038-error')).toHaveCount(0);
});
