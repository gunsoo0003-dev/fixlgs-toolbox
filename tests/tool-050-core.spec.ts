import {expect,test} from '@playwright/test';
async function waitReady(page:any){await expect(page.getByTestId('tool050-start')).not.toHaveValue('');}
test('TOOL050 between dates core',async({page})=>{await page.goto('/ko/business-day-calculator');await waitReady(page);await page.getByTestId('tool050-start').fill('2026-08-03');await page.getByTestId('tool050-end').fill('2026-08-07');await page.getByTestId('tool050-calculate').click();await expect(page.getByTestId('tool050-business-days')).toHaveText('5');});
