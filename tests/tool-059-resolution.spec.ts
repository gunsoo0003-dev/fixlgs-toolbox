import {expect,test} from '@playwright/test';
test('resolution quick presets',async({page})=>{await page.goto('/ko/pixel-print-size-converter');for(const p of [72,96,150,200,240,300,600])await expect(page.getByTestId(`tool059-ppi-${p}`)).toBeVisible();});
