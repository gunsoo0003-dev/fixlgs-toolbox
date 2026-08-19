import {expect,test} from '@playwright/test';
test('TOOL058 8bit=1byte',async({page})=>{await page.goto('/ko/data-cooking-unit-converter');await page.getByTestId('tool058-value').fill('8');await page.getByTestId('tool058-from').selectOption('bit');await page.getByTestId('tool058-to').selectOption('byte');await expect(page.getByTestId('tool058-main-result')).toContainText('1');});
test('TOOL058 data summary has six units',async({page})=>{await page.goto('/en/data-cooking-unit-converter');await expect(page.getByTestId('tool058-summary').locator('[data-unit]')).toHaveCount(6);});
