import {expect,test} from '@playwright/test';
const path=(locale='ko')=>`/${locale}/vat-calculator`;
test.describe('TOOL066 core',()=>{
 test('exclusive 100000 @ 10%',async({page})=>{await page.goto(path());await expect(page.getByTestId('tool066-root')).toBeVisible();await page.getByTestId('tool066-amount').fill('100000');await page.getByTestId('tool066-rate').fill('10');await expect(page.getByTestId('tool066-result-supply')).toContainText('100,000');await expect(page.getByTestId('tool066-result-vat')).toContainText('10,000');await expect(page.getByTestId('tool066-result-total')).toContainText('110,000')});
 test('inclusive 110000 @ 10%',async({page})=>{await page.goto(path());await page.getByTestId('tool066-mode-inclusive').click();await page.getByTestId('tool066-amount').fill('110000');await expect(page.getByTestId('tool066-result-supply')).toContainText('100,000');await expect(page.getByTestId('tool066-result-vat')).toContainText('10,000');await expect(page.getByTestId('tool066-formula')).toContainText('total ÷')});
 test('reverse rate',async({page})=>{await page.goto(path());await page.getByTestId('tool066-mode-reverse-rate').click();await page.getByTestId('tool066-amount').fill('500000');await page.getByTestId('tool066-vat-input').fill('50000');await expect(page.getByTestId('tool066-result-rate')).toContainText('10.00%')});
});
