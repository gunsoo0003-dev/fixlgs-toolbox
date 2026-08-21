import {expect,test} from '@playwright/test';
test('zero hours shows error',async({page})=>{await page.goto('/ko/salary-converter');await page.getByTestId('tool072-hours-day').fill('0');await expect(page.getByTestId('tool072-error')).toBeVisible()});
test('large salary limit',async({page})=>{await page.goto('/ko/salary-converter');await page.getByTestId('tool072-amount').fill('1000000000000001');await expect(page.getByTestId('tool072-error')).toBeVisible()});
