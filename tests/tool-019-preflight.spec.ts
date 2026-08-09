import {test,expect} from '@playwright/test';import {openTool019} from './helpers/tool-019';
test.describe('019 preflight',()=>{for(const locale of ['ko','en','ja'])test(`${locale} route`,async({page})=>{await openTool019(page,locale);await expect(page.locator('h1')).toBeVisible();});});

import {classify019Failure} from './helpers/tool-019';
test('019 harness result classification stays explicit',()=>{expect(classify019Failure({productEvidence:true})).toBe('PRODUCT_FAIL');expect(classify019Failure({harnessEvidence:true})).toBe('HARNESS_ERROR');expect(classify019Failure({explicitSkipReason:'runtime-only'})).toBe('SKIP');expect(classify019Failure({})).toBe('PASS');});
