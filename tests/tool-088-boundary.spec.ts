import {test,expect} from '@playwright/test';
test('TOOL088 zero dimension error',async({page})=>{await page.goto('/ko/concrete-volume-calculator');await page.getByTestId('tool088-length').fill('0');await expect(page.getByTestId('tool088-error')).toBeVisible();});
test('TOOL088 zero delivery error',async({page})=>{await page.goto('/ko/concrete-volume-calculator');await page.getByTestId('tool088-delivery').fill('0');await expect(page.getByTestId('tool088-error')).toBeVisible();});
