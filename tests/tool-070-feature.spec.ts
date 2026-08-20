import {expect,test} from '@playwright/test';
test('TOOL070 copy/reset/precision controls',async({page})=>{
  await page.goto('/ja/unit-price-comparison-calculator');
  await expect(page.getByTestId('tool070-copy')).toBeEnabled();
  const precision=page.getByTestId('tool070-precision');
  const advanced=page.locator('details').filter({has:precision});
  await advanced.locator('summary').click();
  await expect(precision).toBeVisible();
  await precision.fill('4');
  await expect(precision).toHaveValue('4');
  await page.getByTestId('tool070-mode-volume').click();
  await page.getByTestId('tool070-reset').click();
  await expect(page.getByTestId('tool070-root')).toHaveAttribute('data-mode','items');
});
