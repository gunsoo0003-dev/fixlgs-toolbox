import { test, expect } from '@playwright/test';
import { openTool017, uploadImages, TOOL017_TESTIDS } from './helpers/tool-017';

test.describe('017 harness connection preflight',()=>{
  for(const locale of ['ko','en','ja'] as const) test(`${locale} route and required DOM selectors connect`,async({page})=>{await openTool017(page,locale)});
  test('preview canvas connects after one-image upload',async({page})=>{await uploadImages(page,1);await expect(page.getByTestId(TOOL017_TESTIDS.canvas)).toBeVisible()});
});
