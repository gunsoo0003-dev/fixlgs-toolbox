import {test,expect} from '@playwright/test';
test('TOOL088 route does not replace TOOL081',async({page})=>{await page.goto('/ko/area-price-per-unit-calculator');await expect(page.getByTestId('tool081-root')).toBeVisible();await page.goto('/ko/concrete-volume-calculator');await expect(page.getByTestId('tool088-root')).toBeVisible();});
