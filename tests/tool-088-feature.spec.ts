import {test,expect} from '@playwright/test';
test('TOOL088 delivery reference uses ceil',async({page})=>{await page.goto('/ko/concrete-volume-calculator');await expect(page.getByTestId('tool088-reference-deliveries')).toHaveText('1');await page.getByTestId('tool088-delivery').fill('');await expect(page.getByTestId('tool088-reference-deliveries')).toHaveCount(0);});
