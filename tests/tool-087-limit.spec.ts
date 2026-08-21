import {test,expect} from '@playwright/test';
test('TOOL087 over waste limit shows error',async({page})=>{await page.goto('/ko/brick-block-quantity-calculator');await page.getByTestId('tool087-waste-rate').fill('101');await expect(page.getByTestId('tool087-error')).toBeVisible();});
