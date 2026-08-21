import {test,expect} from '@playwright/test';
test('TOOL087 rejects zero wall dimension',async({page})=>{await page.goto('/ko/brick-block-quantity-calculator');await page.getByTestId('tool087-wall-length').fill('0');await expect(page.getByTestId('tool087-error')).toBeVisible();});
test('TOOL087 rejects negative-like invalid input',async({page})=>{await page.goto('/ko/brick-block-quantity-calculator');await page.getByTestId('tool087-unit-price').fill('-1');await expect(page.getByTestId('tool087-error')).toBeVisible();});
