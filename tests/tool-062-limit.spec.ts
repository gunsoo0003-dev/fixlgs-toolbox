import {expect,test} from '@playwright/test';
test('TOOL062 service max price accepted',async({page})=>{await page.goto('/en/discount-price-calculator');await page.getByTestId('tool-062-original').fill('1000000000000000');await page.getByTestId('tool-062-rate').fill('1');await expect(page.getByTestId('tool-062-final')).toBeVisible();});
test('TOOL062 price over service max rejected',async({page})=>{await page.goto('/en/discount-price-calculator');await page.getByTestId('tool-062-original').fill('1000000000000001');await expect(page.locator('p[role="alert"]')).toBeVisible();});
