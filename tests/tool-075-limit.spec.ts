import {test,expect} from '@playwright/test';
test('TOOL075 term over 1200 months is rejected',async({page})=>{await page.goto('/ko/loan-interest-calculator');await page.getByTestId('tool075-term-unit').selectOption('months');await page.getByTestId('tool075-term').fill('1201');await expect(page.getByTestId('tool075-error')).toBeVisible();});
