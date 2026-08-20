import {expect,test} from '@playwright/test';
test('TOOL070 A/B winner uses normalized price',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await expect(page.getByTestId('tool070-winner')).toContainText('B');await expect(page.getByTestId('tool070-savings')).toContainText('100');await expect(page.getByTestId('tool070-equal-quantity')).toContainText('A 990')});
