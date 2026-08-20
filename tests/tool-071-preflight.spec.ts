import {expect,test} from '@playwright/test';
test('KO EN JA route/root',async({page})=>{for(const l of ['ko','en','ja']){await page.goto(`/${l}/ad-sales-performance-calculator`);await expect(page.getByTestId('tool071-root')).toBeVisible();await expect(page.locator('h1')).toBeVisible()}});
