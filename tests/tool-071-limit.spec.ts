import {expect,test} from '@playwright/test';
test('count limit',async({page})=>{await page.goto('/ko/ad-sales-performance-calculator');await page.getByTestId('tool071-input-a').fill('100');await page.getByTestId('tool071-input-b').fill('1000000000001');await expect(page.getByTestId('tool071-error')).toBeVisible()});
