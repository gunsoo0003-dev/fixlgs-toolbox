import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { openTool011, upload011 } from './helpers/tool-011';

test('incrementally discovers actual output pixel and max-side boundaries without guessing operational limits', async ({page}) => {
  await openTool011(page); await upload011(page,'test-fixtures/sample.jpg');
  const attempts:number[]=[]; let firstFailed:number|null=null; let maxPassed:number|null=null;
  for(const side of [2048,3072,4096,5120,6144,7168,8192,10240,12288,14000,16000,16384,16385]){
    attempts.push(side); await page.getByTestId('tool011-mode-custom').click(); await page.getByTestId('tool011-custom-width').fill(String(side)); await page.getByTestId('tool011-custom-height').fill(String(side)); await page.getByTestId('tool011-custom-height').blur();
    const blocked=await page.getByTestId('tool011-limit-warning').isVisible().catch(()=>false); if(blocked){firstFailed=side;break;} maxPassed=side;
  }
  const report={attempts,maxPassedSide:maxPassed,firstFailedSide:firstFailed,note:'Candidate discovery only; operational values require actual browser result generation and device-class evidence.'};
  fs.mkdirSync('test-results',{recursive:true}); fs.writeFileSync('test-results/tool-011-limit-report.json',JSON.stringify(report,null,2));
  expect(maxPassed).not.toBeNull(); expect(firstFailed).not.toBeNull();
});
