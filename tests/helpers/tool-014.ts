import { expect, type Page } from '@playwright/test';

export const TOOL014 = {
  ko: '/ko/image-collage-maker',
  en: '/en/image-collage-maker',
  ja: '/ja/image-collage-maker',
} as const;

export const TOOL014_TESTIDS = {
  root: 'tool014-root',
  workbench: 'tool014-workbench',
  upload: 'tool014-upload',
  fileInput: 'tool014-file-input',
  select: 'tool014-select',
  previewCanvas: 'tool014-preview-canvas',
  state: 'tool014-state',
  width: 'tool014-width',
  height: 'tool014-height',
  download: 'tool014-download',
  error: 'tool014-error',
  limitBlocked: 'tool014-limit-blocked',
  layout4Grid: 'tool014-layout-4-grid',
  layout3x3: 'tool014-layout-3x3',
} as const;

export async function openTool014(page: Page, locale: keyof typeof TOOL014 = 'ko') {
  const response = await page.goto(TOOL014[locale], { waitUntil: 'domcontentloaded' });
  if (!response || !response.ok()) throw new Error(`HARNESS_ERROR: route ${TOOL014[locale]} returned ${response?.status() ?? 'NO_RESPONSE'}`);
  for (const id of [TOOL014_TESTIDS.root, TOOL014_TESTIDS.workbench, TOOL014_TESTIDS.upload, TOOL014_TESTIDS.fileInput, TOOL014_TESTIDS.select]) {
    await expect(page.getByTestId(id), `HARNESS_ERROR: missing [data-testid="${id}"]`).toHaveCount(1);
  }
  await expect(page.getByTestId(TOOL014_TESTIDS.root)).toBeVisible();
}

export async function uploadTool014(page: Page, files: string[] = ['test-fixtures/sample.jpg','test-fixtures/sample.webp']) {
  await page.getByTestId(TOOL014_TESTIDS.fileInput).setInputFiles(files);
  await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveAttribute('data-files', String(files.length));
  await expect(page.getByTestId(TOOL014_TESTIDS.download)).toBeVisible();
}
