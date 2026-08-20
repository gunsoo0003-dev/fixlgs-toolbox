import {expect,test} from '@playwright/test';
test('TOOL055 route remains reachable',async({page})=>{await page.goto('/en/length-area-volume-converter');await expect(page.getByTestId('tool055-root')).toBeVisible();});
test('TOOL059 has no file input or image editing surface',async({page})=>{await page.goto('/en/pixel-print-size-converter');await expect(page.locator('input[type=file]')).toHaveCount(0);await expect(page.locator('canvas')).toHaveCount(0);});
