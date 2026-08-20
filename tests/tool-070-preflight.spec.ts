import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja']) test(`TOOL070 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/unit-price-comparison-calculator`);await expect(page.getByTestId('tool070-root')).toBeVisible();await expect(page.getByTestId('tool070-workspace')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible()});
