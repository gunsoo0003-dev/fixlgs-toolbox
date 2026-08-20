import {expect,test} from '@playwright/test';
test('physical size service limit',async({page})=>{await page.goto('/en/pixel-print-size-converter');await page.getByTestId('tool059-tab-print-to-pixels').click();await page.getByTestId('tool059-unit').selectOption('in');await page.getByTestId('tool059-width-physical').fill('10001');await expect(page.getByTestId('tool059-error')).toBeVisible();});
