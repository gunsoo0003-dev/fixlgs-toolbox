import {test,expect} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL075 ${locale} route`,async({page})=>{await page.goto(`/${locale}/loan-interest-calculator`);await expect(page.getByTestId('tool075-root')).toBeVisible();});
