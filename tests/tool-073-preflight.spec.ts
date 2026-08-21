import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja']) test(`TOOL073 preflight ${locale}`,async({page})=>{await page.goto(`/${locale}/deposit-savings-calculator`);await expect(page.getByTestId('tool073-root')).toBeVisible();await expect(page.getByTestId('tool073-workspace')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible()});
