import {expect,test} from '@playwright/test';
test('TOOL070 page keeps common shell contracts',async({page})=>{await page.goto('/ko/unit-price-comparison-calculator');await expect(page.getByText('NEXT WORK')).toBeVisible();await expect(page.getByText('HOW TO USE')).toBeVisible();await expect(page.getByText('FAQ',{exact:true}).first()).toBeVisible()});
