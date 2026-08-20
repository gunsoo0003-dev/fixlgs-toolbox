import {expect,test} from '@playwright/test';
test('TOOL063 ratio',async({page})=>{await page.goto('/ko/ratio-proportion-calculator');await page.getByTestId('tool063-a').fill('0.5');await page.getByTestId('tool063-b').fill('1.5');await expect(page.getByTestId('tool063-main-result')).toHaveText('1:3');});
