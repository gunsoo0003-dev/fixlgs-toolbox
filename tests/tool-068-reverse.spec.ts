import {test,expect} from '@playwright/test';
test('TOOL068 target profit reverse',async({page})=>{await page.goto('/ko/seller-fee-settlement-calculator');await page.getByTestId('tool068-mode-target-profit').click();await page.getByTestId('tool068-target-profit').fill('20000');await expect(page.getByTestId('tool068-result-required-sale')).toContainText('83,333.33')});
