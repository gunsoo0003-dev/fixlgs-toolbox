import {test,expect} from '@playwright/test';
test('area above service limit is rejected',async({page})=>{await page.goto('/ko/area-price-per-unit-calculator');await page.getByTestId('tool081-supply-area').fill('1000000001');await expect(page.getByTestId('tool081-error')).toBeVisible()});
