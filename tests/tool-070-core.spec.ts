import {expect,test} from '@playwright/test';
const path='/ko/unit-price-comparison-calculator';
test.describe('TOOL070 core',()=>{
 test('items 9900/10 vs 17800/20',async({page})=>{await page.goto(path);await expect(page.getByTestId('tool070-result-a')).toContainText('990');await expect(page.getByTestId('tool070-result-b')).toContainText('890');await expect(page.getByTestId('tool070-winner')).toContainText('B');await expect(page.getByTestId('tool070-difference')).toContainText('100')});
 test('weight normalized to 100g',async({page})=>{await page.goto(path);await page.getByTestId('tool070-mode-weight').click();await expect(page.getByTestId('tool070-result-a')).toContainText('1,200');await expect(page.getByTestId('tool070-result-b')).toContainText('1,000')});
 test('volume normalized to 100mL',async({page})=>{await page.goto(path);await page.getByTestId('tool070-mode-volume').click();await expect(page.getByTestId('tool070-result-a')).toContainText('500');await expect(page.getByTestId('tool070-result-b')).toContainText('420')});
});
