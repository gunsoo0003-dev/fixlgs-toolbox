import {expect,test} from '@playwright/test';
test('TOOL058 zero allowed',async({page})=>{await page.goto('/ko/data-cooking-unit-converter');await page.getByTestId('tool058-value').fill('0');await expect(page.getByTestId('tool058-main-result')).toContainText('0');});
test('TOOL058 negative blocked',async({page})=>{await page.goto('/ko/data-cooking-unit-converter');await page.getByTestId('tool058-value').fill('-1');await expect(page.getByTestId('tool058-error')).toBeVisible();});
test('TOOL058 over service limit blocked',async({page})=>{await page.goto('/en/data-cooking-unit-converter');await page.getByTestId('tool058-value').fill('1000000000000001');await expect(page.getByTestId('tool058-error')).toBeVisible();});
