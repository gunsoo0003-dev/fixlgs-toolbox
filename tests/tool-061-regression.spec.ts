import {test,expect} from '@playwright/test';
for(const route of ['length-area-volume-converter','weight-temperature-pressure-converter','speed-fuel-energy-converter','data-cooking-unit-converter'])test(`061 protected prior route ${route}`,async({page})=>{await page.goto(`/ko/${route}`);await expect(page.locator('h1')).toBeVisible();});
