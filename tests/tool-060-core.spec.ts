import {test,expect} from '@playwright/test';
test('TOOL060 five-country shoe reference',async({page})=>{await page.goto('/ko/shoe-clothing-size-converter');await page.getByTestId('tool060-size').selectOption('m270');for(const s of ['KR','US','UK','EU','JP'])await expect(page.getByTestId(`tool060-result-${s}`)).toBeVisible();});
