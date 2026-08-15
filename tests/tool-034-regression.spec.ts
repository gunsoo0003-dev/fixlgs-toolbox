import {expect,test} from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`034 ${locale} content and privacy contract`,async({page})=>{await page.goto(`/${locale}/pdf-password-metadata`);await expect(page.getByTestId('tool034-root')).toBeVisible();await expect(page.locator('h1')).toBeVisible();await expect(page.locator('body')).not.toContainText('brute-force');});
