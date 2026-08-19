import {expect,test} from '@playwright/test';
async function waitReady(page:any){await expect(page.getByTestId('tool050-start')).not.toHaveValue('');}
test('TOOL050 over 20-year range blocked',async({page})=>{await page.goto('/en/business-day-calculator');await waitReady(page);await page.getByTestId('tool050-start').fill('2000-01-01');await page.getByTestId('tool050-end').fill('2021-01-02');await page.getByTestId('tool050-calculate').click();await expect(page.getByTestId('tool050-error')).toContainText('20');});
