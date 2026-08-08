import { test, expect } from '@playwright/test';
import { openTool016, TOOL016_TESTIDS } from './helpers/tool-016';

const expected = {
  ko: { h1: '이미지에글자 넣기', select: '이미지 선택' },
  en: { h1: 'Add Text to Image', select: 'Select Image' },
  ja: { h1: '画像文字入れツール', select: '画像を選択' },
} as const;

test.describe('016 harness connection preflight', () => {
  for (const locale of ['ko', 'en', 'ja'] as const) {
    test(`${locale} route and initial DOM expectations connect`, async ({ page }) => {
      await openTool016(page, locale);
      await expect(page.locator('h1')).toHaveText(expected[locale].h1);
      await expect(page.getByTestId(TOOL016_TESTIDS.fileInput)).toBeAttached();
      await expect(page.getByRole('button', { name: expected[locale].select })).toBeVisible();
    });
  }

  test('ready-state selectors connect after a normal upload', async ({ page }) => {
    await openTool016(page, 'ko');
    await page.getByTestId(TOOL016_TESTIDS.fileInput).setInputFiles('test-fixtures/sample.jpg');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await expect(page.getByTestId(TOOL016_TESTIDS.addbar)).toBeVisible();
    await expect(page.getByTestId(TOOL016_TESTIDS.settings)).toBeVisible();
    await expect(page.getByTestId(TOOL016_TESTIDS.output)).toBeVisible();
  });
});
