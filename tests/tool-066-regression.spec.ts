import {expect,test} from '@playwright/test';
test('TOOL066 does not remove prior unit routes',async({page})=>{for(const slug of ['length-area-volume-converter','weight-temperature-pressure-converter','speed-fuel-energy-converter','data-cooking-unit-converter']){const response=await page.goto(`/ko/${slug}`);expect(response?.status()).toBeLessThan(400)}});
