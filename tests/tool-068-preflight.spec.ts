import {test,expect} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL068 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/seller-fee-settlement-calculator`);await expect(page.getByTestId('tool068-root')).toBeVisible();await expect(page.getByTestId('tool068-workspace')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible()});
