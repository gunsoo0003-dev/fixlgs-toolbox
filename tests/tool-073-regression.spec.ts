import {expect,test} from '@playwright/test';
test('TOOL073 leaves current baseline routes reachable',async({page})=>{for(const slug of ['vat-calculator','percentage-percent-change-calculator','discount-price-calculator']){const response=await page.goto(`/ko/${slug}`);expect(response?.status()).toBeLessThan(400)}});
