import {test,expect} from '@playwright/test';
test('TOOL068 100 percent target unavailable',async({page})=>{await page.goto('/ko/seller-fee-settlement-calculator');await page.getByTestId('tool068-mode-target-profit').click();await page.getByTestId('tool068-rate').fill('100');await expect(page.getByTestId('tool068-error')).toBeVisible()});
test('TOOL068 negative rejected',async({page})=>{await page.goto('/ko/seller-fee-settlement-calculator');await page.getByTestId('tool068-sale').fill('-1');await expect(page.getByTestId('tool068-error')).toBeVisible()});
