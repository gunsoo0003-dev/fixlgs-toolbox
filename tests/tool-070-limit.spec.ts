import {expect,test} from '@playwright/test';
test('TOOL070 bundle count limit',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await page.getByTestId('tool070-mode-bundle-volume').click();await page.getByTestId('tool070-a-count').fill('1000001');await expect(page.getByTestId('tool070-error')).toContainText('1,000,000')});
