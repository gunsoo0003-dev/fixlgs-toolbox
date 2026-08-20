import {expect,test} from '@playwright/test';
test.describe('TOOL070 boundary',()=>{
 test('zero quantity error',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await page.getByTestId('tool070-a-quantity').fill('0');await expect(page.getByTestId('tool070-error')).toBeVisible()});
 test('zero price allowed',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await page.getByTestId('tool070-a-price').fill('0');await expect(page.getByTestId('tool070-result-a')).toContainText('0')});
 test('negative rejected as invalid input',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await page.getByTestId('tool070-a-price').fill('-1');await expect(page.getByTestId('tool070-error')).toBeVisible()});
});
