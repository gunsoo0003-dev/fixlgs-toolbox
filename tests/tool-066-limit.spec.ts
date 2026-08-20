import {expect,test} from '@playwright/test';
test('TOOL066 amount limit',async({page})=>{await page.goto('/ko/vat-calculator');await page.getByTestId('tool066-amount').fill('1000000000000001');await expect(page.getByTestId('tool066-error')).toContainText('1e15')});
