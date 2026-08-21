import {test,expect} from '@playwright/test';
test('TOOL070 route remains available after TOOL081 integration',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await expect(page.getByTestId('tool070-root')).toBeVisible()});
