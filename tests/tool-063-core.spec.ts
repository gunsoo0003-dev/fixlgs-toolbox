import {expect,test} from '@playwright/test';
test('TOOL063 core',async({page})=>{await page.goto('/ko/ratio-proportion-calculator');await page.getByTestId('tool063-a').fill('12');await page.getByTestId('tool063-b').fill('18');await expect(page.getByTestId('tool063-main-result')).toHaveText('2:3');});
