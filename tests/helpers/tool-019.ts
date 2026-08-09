import {expect,type Page} from '@playwright/test';
export const TOOL019_ROUTE='/ko/youtube-thumbnail-maker';
export const TOOL019_TESTIDS={root:'tool019-root',fileInput:'tool019-file-input',preview:'tool019-preview-canvas',small:'tool019-small-preview',settings:'tool019-settings',title:'tool019-title-text',subtitle:'tool019-subtitle-text',quality:'tool019-quality',filename:'tool019-filename',fileSize:'tool019-file-size',output:'tool019-output',download:'tool019-download',status:'tool019-status'} as const;
export type Tool019CheckResult='PASS'|'PRODUCT_FAIL'|'HARNESS_ERROR'|'SKIP';
export function classify019Failure(input:{productEvidence?:boolean;harnessEvidence?:boolean;explicitSkipReason?:string}):Tool019CheckResult{
  if(input.productEvidence)return'PRODUCT_FAIL';
  if(input.harnessEvidence)return'HARNESS_ERROR';
  if(input.explicitSkipReason)return'SKIP';
  return'PASS';
}
export async function openTool019(page:Page,locale='ko'){await page.goto(`/${locale}/youtube-thumbnail-maker`);await expect(page.getByTestId(TOOL019_TESTIDS.root)).toBeVisible();}
export async function upload019(page:Page,path='test-fixtures/sample.jpg'){await openTool019(page);const root=page.getByTestId(TOOL019_TESTIDS.root);await root.getByTestId(TOOL019_TESTIDS.fileInput).setInputFiles(path);await expect(root.getByTestId(TOOL019_TESTIDS.preview)).toBeVisible();}
export function tool019Root(page:Page){return page.getByTestId(TOOL019_TESTIDS.root);}
export function tool019TextPanel(page:Page,target:'title'|'subtitle'){
  const root=tool019Root(page);
  const field=root.getByTestId(target==='title'?TOOL019_TESTIDS.title:TOOL019_TESTIDS.subtitle);
  return field.locator('xpath=ancestor::div[1]');
}

export function tool019BackgroundPanel(page:Page){
  return tool019Root(page).getByRole('button',{name:'배경 편집'}).locator('xpath=ancestor::div[1]');
}
