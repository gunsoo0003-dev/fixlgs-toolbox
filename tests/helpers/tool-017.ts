import { expect, type Page } from '@playwright/test';
import path from 'node:path';
import { readFileSync } from 'node:fs';

export const TOOL017 = {
  ko: '/ko/image-watermark-tool',
  en: '/en/image-watermark-tool',
  ja: '/ja/image-watermark-tool',
} as const;

export const TOOL017_TESTIDS = {
  root:'tool017-root', input:'tool017-input', logoInput:'tool017-logo-input', select:'tool017-select', canvas:'tool017-preview-canvas', state:'tool017-state',
  textMode:'tool017-mode-text', logoMode:'tool017-mode-logo', repeatOff:'tool017-repeat-off', repeatGrid:'tool017-repeat-grid', repeatDiagonal:'tool017-repeat-diagonal',
  textInput:'tool017-text-input', size:'tool017-size', opacity:'tool017-opacity', rotation:'tool017-rotation', secondary:'tool017-secondary-enabled',
  output:'tool017-output-format', quality:'tool017-quality', processAll:'tool017-process-all', processUnprocessed:'tool017-process-unprocessed', retryFailed:'tool017-retry-failed', downloadZip:'tool017-download-zip', downloadCurrent:'tool017-download-current', cancel:'tool017-cancel', density:'tool017-density', gapX:'tool017-gap-x', gapY:'tool017-gap-y', previewOriginal:'tool017-preview-original', previewResult:'tool017-preview-result', error:'tool017-error'
} as const;

export const fixture = (name:'jpg'|'png'|'webp'|'logo'='jpg') => path.resolve(process.cwd(), name==='jpg'?'test-fixtures/sample.jpg':name==='webp'?'test-fixtures/sample.webp':'test-fixtures/transparent.png');

export function payload(name:string, source=fixture('png'), mimeType='image/png'){
  return { name, mimeType, buffer: readFileSync(source) };
}

const TOOL017_INITIAL_TESTIDS = [
  TOOL017_TESTIDS.input,
  TOOL017_TESTIDS.logoInput,
  TOOL017_TESTIDS.select,
] as const;

const TOOL017_EDITOR_TESTIDS = [
  TOOL017_TESTIDS.state,
  TOOL017_TESTIDS.textMode,
  TOOL017_TESTIDS.logoMode,
  TOOL017_TESTIDS.repeatOff,
  TOOL017_TESTIDS.repeatGrid,
  TOOL017_TESTIDS.repeatDiagonal,
  TOOL017_TESTIDS.secondary,
  TOOL017_TESTIDS.output,
  TOOL017_TESTIDS.processAll,
  TOOL017_TESTIDS.downloadZip,
] as const;

export async function openTool017(page:Page, locale:keyof typeof TOOL017='ko'){
  const route=TOOL017[locale];
  const response=await page.goto(route,{waitUntil:'domcontentloaded'});
  expect(response,`HARNESS_ERROR: no HTTP response for ${route}`).not.toBeNull();
  expect(response?.ok(),`PRODUCT_FAIL: route ${route} returned ${response?.status()}`).toBeTruthy();
  const root=page.getByTestId(TOOL017_TESTIDS.root);
  await expect(root,`HARNESS_ERROR: ${TOOL017_TESTIDS.root} missing`).toHaveCount(1);
  await expect(root).toBeVisible();
  for(const id of TOOL017_INITIAL_TESTIDS){
    await expect(page.getByTestId(id),`HARNESS_ERROR: initial selector ${id} missing`).toHaveCount(1);
  }
  return root;
}

export async function assertTool017EditorReady(page:Page){
  for(const id of TOOL017_EDITOR_TESTIDS){
    await expect(page.getByTestId(id),`HARNESS_ERROR: post-upload selector ${id} missing`).toHaveCount(1);
  }
}

export async function uploadImages(page:Page, count=2){
  await openTool017(page,'ko');
  const files = Array.from({length:count},(_,i)=>payload(`watermark-${String(i+1).padStart(2,'0')}.png`));
  await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(files);
  await expect.poll(async()=>Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files')||0),{timeout:15000}).toBe(count);
  await assertTool017EditorReady(page);
  await expect(page.getByTestId(TOOL017_TESTIDS.canvas)).toHaveCount(1);
}
