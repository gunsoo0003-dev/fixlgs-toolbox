import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL064 ${locale} route/root`,async({page})=>{await page.goto(`/${locale}/statistics-calculator`);await expect(page.getByTestId('tool064-root')).toBeVisible();await expect(page.getByTestId('tool064-input')).toBeVisible();await expect(page.getByTestId('tool064-result')).toBeVisible();});
