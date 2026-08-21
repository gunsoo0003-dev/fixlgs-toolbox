import {expect,test} from '@playwright/test';
test.describe('TOOL073 limits',()=>{
 test('amount over 1e15 rejected',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-amount').fill('1000000000000001');await expect(page.getByTestId('tool073-error')).toContainText('1e15')});
 test('rate over 100 rejected',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-rate').fill('101');await expect(page.getByTestId('tool073-error')).toContainText('0~100%')});
 test('term over 1200 months rejected',async({page})=>{await page.goto('/ko/deposit-savings-calculator');await page.getByTestId('tool073-term').fill('1201');await expect(page.getByTestId('tool073-error')).toContainText('1200')});
});
