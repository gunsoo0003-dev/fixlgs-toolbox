import { expect, type Page } from '@playwright/test';

export const TOOL013 = {
  ko: '/ko/image-merger',
  en: '/en/image-merger',
  ja: '/ja/image-merger',
} as const;

export const TOOL013_TESTIDS = {
  root: 'tool013-root',
  workbench: 'tool013-workbench',
  upload: 'tool013-upload',
  fileInput: 'tool013-file-input',
  select: 'tool013-select',
  files: 'tool013-files',
  fileCard: 'tool013-file-card',
  settings: 'tool013-settings',
  preview: 'tool013-preview',
  previewCanvas: 'tool013-preview-canvas',
  output: 'tool013-output',
  download: 'tool013-download',
  status: 'tool013-status',
  error: 'tool013-error',
  directionVertical: 'tool013-direction-vertical',
  sizingWidth: 'tool013-sizing-width',
  sizeBasis: 'tool013-size-basis',
  customSize: 'tool013-custom-size',
  allowUpscale: 'tool013-allow-upscale',
  gap: 'tool013-gap',
  padding: 'tool013-padding',
  limitWarning: 'tool013-limit-warning',
  limitBlocked: 'tool013-limit-blocked',
} as const;

export const TOOL013_INITIAL_REQUIRED = [
  TOOL013_TESTIDS.root,
  TOOL013_TESTIDS.workbench,
  TOOL013_TESTIDS.upload,
  TOOL013_TESTIDS.fileInput,
  TOOL013_TESTIDS.select,
] as const;

export const TOOL013_READY_REQUIRED = [
  TOOL013_TESTIDS.files,
  TOOL013_TESTIDS.fileCard,
  TOOL013_TESTIDS.settings,
  TOOL013_TESTIDS.preview,
  TOOL013_TESTIDS.previewCanvas,
  TOOL013_TESTIDS.output,
  TOOL013_TESTIDS.download,
  TOOL013_TESTIDS.status,
] as const;

export async function openTool013(page: Page, locale: keyof typeof TOOL013 = 'ko') {
  const response = await page.goto(TOOL013[locale], { waitUntil: 'domcontentloaded' });
  if (!response || !response.ok()) {
    throw new Error(`HARNESS_ERROR: route ${TOOL013[locale]} returned ${response?.status() ?? 'NO_RESPONSE'}`);
  }
  for (const testId of TOOL013_INITIAL_REQUIRED) {
    await expect(page.getByTestId(testId), `HARNESS_ERROR: missing initial selector [data-testid="${testId}"]`).toHaveCount(1);
  }
  await expect(page.getByTestId(TOOL013_TESTIDS.root)).toBeVisible();
}

export async function revealTool013ReadyDom(page: Page) {
  const fixture = 'test-fixtures/sample.jpg';
  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles([fixture, fixture]);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(2);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).first()).toHaveAttribute('data-status', 'ready');
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).nth(1)).toHaveAttribute('data-status', 'ready');
  for (const testId of TOOL013_READY_REQUIRED) {
    const locator = page.getByTestId(testId);
    const minCount = testId === TOOL013_TESTIDS.fileCard ? 2 : 1;
    await expect(locator, `HARNESS_ERROR: missing ready-state selector [data-testid="${testId}"]`).toHaveCount(minCount);
  }
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeVisible();
}
