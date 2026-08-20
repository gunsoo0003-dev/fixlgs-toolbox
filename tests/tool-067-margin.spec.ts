import {test,expect} from '@playwright/test';
test('loss margin is negative',async({page})=>{await page.goto('/en/selling-price-margin-calculator');await page.getByTestId('tool-067-cost').fill('10000');await page.getByTestId('tool-067-selling').fill('8000');await expect(page.getByTestId('tool-067-profit')).toContainText('-');await expect(page.getByTestId('tool-067-margin')).toHaveText('-25%');});
