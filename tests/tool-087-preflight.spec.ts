import {test,expect} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL087 ${locale} preflight`,async({page})=>{await page.goto(`/${locale}/brick-block-quantity-calculator`);await expect(page.getByTestId('tool087-root')).toBeVisible();await expect(page.getByTestId('tool087-workspace')).toBeVisible();await expect(page.getByTestId('tool087-result')).toBeVisible();});
