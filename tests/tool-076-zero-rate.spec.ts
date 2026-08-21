import {expect,test} from '@playwright/test';
test('TOOL076 zero rate',async({page})=>{await page.goto('/en/credit-card-installment-calculator');await page.getByTestId('tool076-rate').fill('0');await expect(page.getByTestId('tool076-result-fee')).toContainText('0.00');await expect(page.getByTestId('tool076-reference-warning')).toBeVisible()});
