import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL062 ${locale} route`,async({page})=>{await page.goto(`/${locale}/discount-price-calculator`);await expect(page.getByTestId('tool-062-root')).toBeVisible();await expect(page.getByTestId('tool-062-original')).toBeVisible();await expect(page.getByTestId('tool-062-rate')).toBeVisible();});
