import { test } from '@playwright/test';
import { openTool015, uploadTwo } from './helpers/tool-015';

test.describe('015 harness connection preflight',()=>{
  for(const locale of ['ko','en','ja'] as const) test(`${locale} route and required DOM selectors connect`,async({page})=>{await openTool015(page,locale)});
  test('ready-state DOM connects after two-image upload',async({page})=>{await uploadTwo(page)});
});
