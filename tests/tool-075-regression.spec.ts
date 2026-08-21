import {test,expect} from '@playwright/test';
test('TOOL075 does not alter TOOL066 route contract',async({page})=>{await page.goto('/ko/vat-calculator');await expect(page.getByTestId('tool066-root')).toBeVisible();});
