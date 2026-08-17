import { expect,test } from '@playwright/test';
test('TOOL045 long supported span remains deterministic',async({page})=>{await page.goto('/en/date-difference-calculator');await page.getByTestId('tool045-start').fill('1900-01-01');await page.getByTestId('tool045-end').fill('2100-12-31');await expect(page.getByTestId('tool045-total-days')).toHaveText('73,413');});
