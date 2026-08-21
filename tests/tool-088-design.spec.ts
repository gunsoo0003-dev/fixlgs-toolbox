import {test,expect} from '@playwright/test';
test('TOOL088 KO EN JA route title structure',async({page})=>{for(const l of ['ko','en','ja']){await page.goto(`/${l}/concrete-volume-calculator`);await expect(page.locator('h1')).toBeVisible();await expect(page.getByTestId('tool088-workspace')).toBeVisible();}});
