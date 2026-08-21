import {test,expect} from '@playwright/test';
test('TOOL088 5m x 4m x 15cm = 3m3',async({page})=>{await page.goto('/ko/concrete-volume-calculator');await expect(page.getByTestId('tool088-base-volume')).toHaveText('3');await expect(page.getByTestId('tool088-adjusted-volume')).toHaveText('3.15');});
