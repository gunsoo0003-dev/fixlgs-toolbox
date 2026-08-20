import {test,expect} from '@playwright/test';
test('061 service limit and precision',async({page})=>{await page.goto('/ja/percentage-percent-change-calculator');await page.getByTestId('tool061-a').fill('1000000000000001');await expect(page.getByTestId('tool061-error')).toBeVisible();await expect(page.getByTestId('tool061-precision')).toHaveAttribute('max','8');});
