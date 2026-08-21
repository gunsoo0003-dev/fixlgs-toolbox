import {test,expect} from '@playwright/test';
test('zero area is rejected',async({page})=>{await page.goto('/ko/area-price-per-unit-calculator');await page.getByTestId('tool081-supply-area').fill('0');await expect(page.getByTestId('tool081-error')).toBeVisible()});
test('zero price is accepted',async({page})=>{await page.goto('/ko/area-price-per-unit-calculator');await page.getByTestId('tool081-total-price').fill('0');await expect(page.getByTestId('tool081-supply-price-sqm')).toContainText('0')});
