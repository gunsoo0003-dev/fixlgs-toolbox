import {expect,test} from '@playwright/test';
async function waitReady(page:any){await expect(page.getByTestId('tool050-start')).not.toHaveValue('');}
for(const locale of ['ko','en','ja'] as const)test(`TOOL050 ${locale} metadata shell`,async({page})=>{await page.goto(`/${locale}/business-day-calculator`);await waitReady(page);await expect(page.locator('h1')).toBeVisible();await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);await expect(page.getByTestId('tool050-root')).toBeVisible();});
