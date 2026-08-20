import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL059 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/pixel-print-size-converter`);await expect(page.getByTestId('tool059-root')).toBeVisible();await expect(page.getByTestId('tool059-workspace')).toBeVisible();await expect(page.getByTestId('tool059-result')).toBeVisible();});
