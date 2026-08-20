import {expect,test} from '@playwright/test';
test('TOOL070 bundle 6x250mL',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await page.getByTestId('tool070-mode-bundle-volume').click();await expect(page.getByTestId('tool070-result-a')).toContainText('166.67');await expect(page.getByTestId('tool070-formula')).toContainText('count × per-item quantity')});
