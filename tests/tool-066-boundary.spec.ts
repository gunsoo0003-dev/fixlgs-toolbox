import {expect,test} from '@playwright/test';
test.describe('TOOL066 boundaries',()=>{
 test('zero accepted',async({page})=>{await page.goto('/ko/vat-calculator');await page.getByTestId('tool066-amount').fill('0');await expect(page.getByTestId('tool066-result-total')).toContainText('0')});
 test('negative rejected',async({page})=>{await page.goto('/ko/vat-calculator');await page.getByTestId('tool066-amount').fill('-1');await expect(page.getByTestId('tool066-error')).toBeVisible()});
 test('rate over 100 rejected',async({page})=>{await page.goto('/ko/vat-calculator');await page.getByTestId('tool066-rate').fill('101');await expect(page.getByTestId('tool066-error')).toContainText('0~100%')});
});
