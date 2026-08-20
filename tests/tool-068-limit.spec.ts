import {test,expect} from '@playwright/test';
test('TOOL068 amount limit',async({page})=>{await page.goto('/ko/seller-fee-settlement-calculator');await page.getByTestId('tool068-sale').fill('1000000000000001');await expect(page.getByTestId('tool068-error')).toContainText('1e15')});
