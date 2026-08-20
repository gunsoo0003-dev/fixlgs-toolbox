import {expect,test} from '@playwright/test';
test('TOOL064 no mode',async({page})=>{await page.goto('/ko/statistics-calculator');await page.getByTestId('tool064-input').fill('1,2,3,4');await expect(page.getByTestId('tool064-mode')).toContainText('최빈값 없음');});
test('TOOL064 single mode',async({page})=>{await page.goto('/ko/statistics-calculator');await page.getByTestId('tool064-input').fill('1,2,2,3,4');await expect(page.getByTestId('tool064-mode')).toHaveText('2');});
test('TOOL064 multiple mode',async({page})=>{await page.goto('/ja/statistics-calculator');await page.getByTestId('tool064-input').fill('1,1,2,2,3');await expect(page.getByTestId('tool064-mode')).toContainText('1');await expect(page.getByTestId('tool064-mode')).toContainText('2');});
