import {test,expect} from '@playwright/test';
for(const slug of ['length-area-volume-converter','weight-temperature-pressure-converter','speed-fuel-energy-converter','data-cooking-unit-converter'])test(`protected route ${slug}`,async({page})=>{await page.goto(`/ko/${slug}`);await expect(page.locator('h1')).toBeVisible();});
