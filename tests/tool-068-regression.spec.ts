import {test,expect} from '@playwright/test';
test('TOOL068 prior business route survives',async({page})=>{const r=await page.goto('/ko/vat-calculator');expect(r?.status()).toBeLessThan(400)});
