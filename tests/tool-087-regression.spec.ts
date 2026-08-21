import {test,expect} from '@playwright/test';
test('TOOL081 route remains available',async({page})=>{await page.goto('/ko/area-price-per-unit-calculator');await expect(page.getByTestId('tool081-root')).toBeVisible();});
