import {expect,test} from '@playwright/test';
test('TOOL063 boundary',async({page})=>{await page.goto('/ko/ratio-proportion-calculator');await page.getByTestId('tool063-a').fill('0');await page.getByTestId('tool063-b').fill('0');await expect(page.getByTestId('tool063-error')).toBeVisible();});
