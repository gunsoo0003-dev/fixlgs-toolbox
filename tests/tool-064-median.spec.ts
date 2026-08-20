import {expect,test} from '@playwright/test';
test('TOOL064 odd median',async({page})=>{await page.goto('/en/statistics-calculator');await page.getByTestId('tool064-input').fill('10,20,30');await expect(page.getByTestId('tool064-median')).toHaveText('20');});
test('TOOL064 even median',async({page})=>{await page.goto('/en/statistics-calculator');await page.getByTestId('tool064-input').fill('1,2,3,4');await expect(page.getByTestId('tool064-median')).toHaveText('2.5');});
