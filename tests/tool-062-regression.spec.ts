import {expect,test} from '@playwright/test';
for(const route of ['/ko/data-cooking-unit-converter','/en/length-area-volume-converter','/ja/time-calculator'])test(`protected route ${route}`,async({page})=>{await page.goto(route);await expect(page.locator('h1')).toBeVisible();});
