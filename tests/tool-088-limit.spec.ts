import {test,expect} from '@playwright/test';
test('TOOL088 extra limit',async({page})=>{await page.goto('/ko/concrete-volume-calculator');await page.getByTestId('tool088-extra').fill('101');await expect(page.getByTestId('tool088-error')).toBeVisible();});
