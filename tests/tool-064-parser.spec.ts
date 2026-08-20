import {expect,test} from '@playwright/test';
test('TOOL064 comma newline space parser',async({page})=>{await page.goto('/en/statistics-calculator');await page.getByTestId('tool064-input').fill('1, 2\n3 4');await expect(page.getByTestId('tool064-count')).toHaveText('4');});
test('TOOL064 invalid token surfaced without hiding valid values',async({page})=>{await page.goto('/en/statistics-calculator');await page.getByTestId('tool064-input').fill('1,abc,3');await expect(page.getByTestId('tool064-invalid')).toContainText('abc');await expect(page.getByTestId('tool064-count')).toHaveText('2');});
