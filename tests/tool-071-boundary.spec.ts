import {expect,test} from '@playwright/test';
const path='/ko/ad-sales-performance-calculator';
test.describe('TOOL071 boundary',()=>{
 test('zero denominator is an error',async({page})=>{await page.goto(path);await page.getByTestId('tool071-input-a').fill('100');await page.getByTestId('tool071-input-b').fill('0');await expect(page.getByTestId('tool071-error')).toContainText('분모')});
 test('negative input rejected',async({page})=>{await page.goto(path);await page.getByTestId('tool071-input-a').fill('-1');await page.getByTestId('tool071-input-b').fill('10');await expect(page.getByTestId('tool071-error')).toBeVisible()});
});
