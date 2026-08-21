import {expect,test} from '@playwright/test';
test.describe('TOOL073 boundaries',()=>{
 test('zero amount accepted',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-amount').fill('0');await expect(page.getByTestId('tool073-result-principal')).toContainText('0')});
 test('zero rate accepted',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-rate').fill('0');await expect(page.getByTestId('tool073-result-gross-interest')).toContainText('0')});
 test('zero term rejected',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-term').fill('0');await expect(page.getByTestId('tool073-error')).toBeVisible()});
 test('negative amount rejected',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-amount').fill('-1');await expect(page.getByTestId('tool073-error')).toBeVisible()});
});
