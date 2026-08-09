import {test,expect} from '@playwright/test';
import {classify020Failure,openTool020Harness,openTool020Route,revealTool020Editor,TOOL020_TESTIDS} from './helpers/tool-020';

test.describe('020 preflight',()=>{
  test('isolated harness connects to both initial and post-start dynamic DOM states',async({page})=>{
    const root=await openTool020Harness(page);
    await expect(root.getByTestId(TOOL020_TESTIDS.startBlank)).toBeVisible();
    await revealTool020Editor(page,'blank');
  });
  for(const locale of ['ko','en','ja'] as const){
    test(`${locale} public route responds and exposes stable root`,async({page})=>{await openTool020Route(page,locale)});
  }
  test('failure classification remains explicit',()=>{
    expect(classify020Failure({productEvidence:true})).toBe('PRODUCT_FAIL');
    expect(classify020Failure({harnessEvidence:true})).toBe('HARNESS_ERROR');
    expect(classify020Failure({explicitSkipReason:'runtime-only'})).toBe('SKIP');
    expect(classify020Failure({})).toBe('PASS');
  });
});
