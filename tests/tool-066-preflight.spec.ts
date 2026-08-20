import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja']) test(`TOOL066 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/vat-calculator`);await expect(page.getByTestId('tool066-root')).toBeVisible();await expect(page.getByTestId('tool066-workspace')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible()});
