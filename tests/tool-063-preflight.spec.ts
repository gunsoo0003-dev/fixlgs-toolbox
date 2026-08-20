import {expect,test} from '@playwright/test';
test('TOOL063 preflight',async({page})=>{await page.goto('/ko/ratio-proportion-calculator');await expect(page.getByTestId('tool063-root')).toBeVisible();});
