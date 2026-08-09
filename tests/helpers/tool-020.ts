import {expect,type Page} from '@playwright/test';
import path from 'node:path';

export const TOOL020_ROUTE='/ko/youtube-channel-banner-maker';
export const TOOL020_HARNESS='/tool020-harness';
export const TOOL020_TESTIDS={
  root:'tool020-root',
  backgroundInput:'tool020-background-input',
  drop:'tool020-drop',
  startBlank:'tool020-start-blank',
  preview:'tool020-preview-canvas',
  title:'tool020-title',
  logoInput:'tool020-logo-input',
  error:'tool020-error',
  output:'tool020-output',
  fileSize:'tool020-file-size',
  download:'tool020-download',
  checkSize:'tool020-check-size',
  fitLimit:'tool020-fit-limit',
  bgZoom:'tool020-bg-zoom',
} as const;
export const TOOL020_PREVIEW_MODES=['tv','desktop','mobile','safe'] as const;
export const tool020Fixture=(name:string)=>path.resolve(process.cwd(),'test-fixtures','tool020',name);

export type Tool020CheckResult='PASS'|'PRODUCT_FAIL'|'HARNESS_ERROR'|'SKIP';
export function classify020Failure(input:{productEvidence?:boolean;harnessEvidence?:boolean;explicitSkipReason?:string}):Tool020CheckResult{
  if(input.productEvidence)return'PRODUCT_FAIL';
  if(input.harnessEvidence)return'HARNESS_ERROR';
  if(input.explicitSkipReason)return'SKIP';
  return'PASS';
}

export function tool020Root(page:Page){return page.getByTestId(TOOL020_TESTIDS.root)}

export async function openTool020Harness(page:Page){
  const response=await page.goto(TOOL020_HARNESS,{waitUntil:'domcontentloaded'});
  expect(response,'HARNESS_ERROR: no HTTP response for TOOL020 isolated harness').not.toBeNull();
  expect(response?.ok(),`HARNESS_ERROR: isolated harness returned ${response?.status()}`).toBeTruthy();
  const root=tool020Root(page);
  await expect(root,`HARNESS_ERROR: missing [data-testid="${TOOL020_TESTIDS.root}"]`).toHaveCount(1);
  for(const id of [TOOL020_TESTIDS.backgroundInput,TOOL020_TESTIDS.drop,TOOL020_TESTIDS.startBlank]){
    await expect(root.getByTestId(id),`HARNESS_ERROR: initial-state selector ${id} missing`).toHaveCount(1);
  }
  // Initial DOM is intentionally different from the editor DOM.
  await expect(root.getByTestId(TOOL020_TESTIDS.preview),'HARNESS_ERROR: preview unexpectedly exists before start').toHaveCount(0);
  return root;
}

export async function revealTool020Editor(page:Page,mode:'blank'|'background'='blank'){
  const root=await openTool020Harness(page);
  if(mode==='blank') await root.getByTestId(TOOL020_TESTIDS.startBlank).click();
  else await root.getByTestId(TOOL020_TESTIDS.backgroundInput).setInputFiles(tool020Fixture('landscape.jpg'));
  for(const id of [TOOL020_TESTIDS.preview,TOOL020_TESTIDS.title,TOOL020_TESTIDS.logoInput,TOOL020_TESTIDS.output,TOOL020_TESTIDS.download]){
    await expect(root.getByTestId(id),`HARNESS_ERROR: editor-state selector ${id} missing after ${mode}`).toHaveCount(1);
  }
  for(const modeId of TOOL020_PREVIEW_MODES){
    await expect(root.getByTestId(`tool020-preview-${modeId}`),`HARNESS_ERROR: preview selector tool020-preview-${modeId} missing`).toHaveCount(1);
  }
  // The initial start-only controls must leave the DOM once the editor is open.
  await expect(root.getByTestId(TOOL020_TESTIDS.startBlank),'HARNESS_ERROR: initial start control remained in editor DOM').toHaveCount(0);
  return root;
}

export async function openTool020Route(page:Page,locale:'ko'|'en'|'ja'='ko'){
  const route=`/${locale}/youtube-channel-banner-maker`;
  const response=await page.goto(route,{waitUntil:'domcontentloaded'});
  expect(response,`HARNESS_ERROR: no HTTP response for ${route}`).not.toBeNull();
  expect(response?.ok(),`PRODUCT_FAIL: route ${route} returned ${response?.status()}`).toBeTruthy();
  await expect(page.getByTestId(TOOL020_TESTIDS.root),`HARNESS_ERROR: ${route} missing TOOL020 root selector`).toHaveCount(1);
}
