import {expect,test} from '@playwright/test';
test('TOOL063 limit',async({page})=>{await page.goto('/ko/ratio-proportion-calculator');await page.getByTestId('tool063-a').fill('1000000000000001');await expect(page.getByTestId('tool063-error')).toBeVisible();});
