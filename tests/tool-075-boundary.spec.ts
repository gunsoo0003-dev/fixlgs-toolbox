import {test,expect} from '@playwright/test';
test('TOOL075 zero rate remains valid',async({page})=>{await page.goto('/ko/loan-interest-calculator');await page.getByTestId('tool075-rate').fill('0');await expect(page.getByTestId('tool075-result-interest')).toContainText('0');});
