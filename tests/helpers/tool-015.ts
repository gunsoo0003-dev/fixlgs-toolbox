import { expect, type Page } from '@playwright/test';
import path from 'node:path';

export const TOOL015 = {
  ko: '/ko/before-after-image-maker',
  en: '/en/before-after-image-maker',
  ja: '/ja/before-after-image-maker',
} as const;

export const TOOL015_TESTIDS = {
  root:'tool015-workbench', beforeInput:'tool015-before-input', afterInput:'tool015-after-input', bothInput:'tool015-both-input', before:'tool015-before-slot', after:'tool015-after-slot', preview:'tool015-preview', canvas:'tool015-preview-canvas', settings:'tool015-settings', state:'tool015-state', swap:'tool015-swap', horizontal:'tool015-layout-horizontal', vertical:'tool015-layout-vertical', cover:'tool015-fit-cover', contain:'tool015-fit-contain', zoom:'tool015-zoom', labels:'tool015-label-visible', divider:'tool015-divider-visible', dividerWidth:'tool015-divider-width', gap:'tool015-gap', padding:'tool015-padding', width:'tool015-width', height:'tool015-height', transparent:'tool015-transparent', format:'tool015-format', download:'tool015-download', resetAll:'tool015-reset-all', error:'tool015-error', status:'tool015-status'
} as const;

export const fixture = (n:number) => {
  const candidates = [
    path.resolve(process.cwd(), n === 1 ? 'test-fixtures/sample.jpg' : 'test-fixtures/target-large.png'),
    path.resolve(process.cwd(), `test-fixtures/tool-015/tiny-${String(n).padStart(2,'0')}.png`),
  ];
  const found = candidates.find((file) => require('node:fs').existsSync(file));
  if (!found) {
    throw new Error(`HARNESS_ERROR: tool015 fixture missing. checked: ${candidates.join(', ')}`);
  }
  return found;
};

export async function openTool015(page:Page, locale:keyof typeof TOOL015='ko'){
  const route=TOOL015[locale];
  const response=await page.goto(route,{waitUntil:'domcontentloaded'});
  expect(response,`HARNESS_ERROR: no HTTP response for ${route}`).not.toBeNull();
  expect(response?.ok(),`PRODUCT_FAIL: route ${route} returned ${response?.status()}`).toBeTruthy();
  const root=page.getByTestId(TOOL015_TESTIDS.root);
  await expect(root,`HARNESS_ERROR: ${TOOL015_TESTIDS.root} missing`).toHaveCount(1);
  await expect(root).toBeVisible();
  for(const id of [TOOL015_TESTIDS.before,TOOL015_TESTIDS.after,TOOL015_TESTIDS.preview,TOOL015_TESTIDS.settings,TOOL015_TESTIDS.state,TOOL015_TESTIDS.swap,TOOL015_TESTIDS.horizontal,TOOL015_TESTIDS.vertical,TOOL015_TESTIDS.download]){
    await expect(page.getByTestId(id),`HARNESS_ERROR: selector ${id} missing`).toHaveCount(1);
  }
  return root;
}

export async function uploadTwo(page:Page){
  await openTool015(page,'ko');
  const beforeInput=page.getByTestId(TOOL015_TESTIDS.beforeInput);
  const afterInput=page.getByTestId(TOOL015_TESTIDS.afterInput);
  await expect(beforeInput,'HARNESS_ERROR: explicit Before file input missing').toHaveCount(1);
  await expect(afterInput,'HARNESS_ERROR: explicit After file input missing').toHaveCount(1);
  // Do not depend on DOM input order: each slot has a stable validation contract.
  const state = page.getByTestId(TOOL015_TESTIDS.state);

  await beforeInput.setInputFiles(fixture(1));
  await expect.poll(
    async () => await beforeInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0),
    { timeout: 10000 }
  ).toBe(1);
  await expect.poll(
    async () => await state.getAttribute('data-before-ready'),
    { timeout: 10000 }
  ).toBe('1');

  await afterInput.setInputFiles(fixture(2));
  await expect.poll(
    async () => await afterInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0),
    { timeout: 10000 }
  ).toBe(1);
  await expect.poll(
    async () => await state.getAttribute('data-after-ready'),
    { timeout: 10000 }
  ).toBe('1');
}
