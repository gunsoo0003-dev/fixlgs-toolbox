import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja']) test(`TOOL066 legal warning ${locale}`,async({page})=>{await page.goto(`/${locale}/vat-calculator`);await expect(page.getByTestId('tool066-legal-warning')).toBeVisible()});
