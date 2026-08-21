import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`${locale} route shell`,async({page})=>{await page.goto(`/${locale}/salary-converter`);await expect(page.getByTestId('tool072-root')).toBeVisible();await expect(page.getByTestId('tool072-scope-warning')).toBeVisible()});
