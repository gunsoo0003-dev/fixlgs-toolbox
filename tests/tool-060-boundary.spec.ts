import {test,expect} from '@playwright/test';
test('TOOL060 unsupported foot length does not fallback',async({page})=>{await page.goto('/ko/shoe-clothing-size-converter');await page.getByTestId('tool060-foot').fill('999');await page.getByTestId('tool060-foot-find').click();await expect(page.getByTestId('tool060-result')).toContainText('지원 범위');});
