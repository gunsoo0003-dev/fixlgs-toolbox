import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { openTool018, upload018, TOOL018_FIXTURES } from './helpers/tool-018';

test.describe('018 boundary and malformed input', () => {
  test.beforeEach(async ({ page }) => { await openTool018(page); });

  test('distinguishes extension mismatch from unreadable image', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.mismatch);
    await expect(page.getByText('확장자와 실제 이미지 형식이 다릅니다.')).toBeVisible();
  });

  test('malformed EXIF keeps basic image analysis and reports partial metadata warning', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.malformedExif);
    await expect(page.getByTestId('tool018-basic-info')).toContainText('300 × 240 px');
    await expect(page.getByText(/EXIF IFD offset is outside the file/)).toBeVisible();
  });

  test('rejects JPEG that has dimensions but no valid scan payload', async ({ page }) => {
    await page.getByTestId('tool018-input').setInputFiles(TOOL018_FIXTURES.headerOnlyCorrupt);
    await expect(page.getByTestId('tool018-root').getByRole('alert').filter({ hasText: '이미지를 읽을 수 없습니다.' })).toBeVisible();
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-ready', '0');
  });

  test('rejects invalid custom PPI values without replacing the last valid calculation', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.noExif);
    const input = page.getByTestId('tool018-custom-ppi');
    await input.fill('0');
    await expect(page.getByText('PPI는 1~2400 사이의 값을 입력해 주세요.')).toBeVisible();
    await input.fill('2401');
    await expect(page.getByText('PPI는 1~2400 사이의 값을 입력해 주세요.')).toBeVisible();
    await input.fill('300');
    await expect(page.getByText('PPI는 1~2400 사이의 값을 입력해 주세요.')).toHaveCount(0);
  });

  test('corrupt image failure does not remove other successful results', async ({ page }) => {
    await page.getByTestId('tool018-input').setInputFiles([TOOL018_FIXTURES.noExif, TOOL018_FIXTURES.corrupt]);
    await expect(page.getByTestId('tool018-batch-summary')).toContainText('2');
    await expect(page.getByTestId('tool018-batch-summary')).toContainText('실패');
    await expect(page.getByTestId('tool018-file-item')).toHaveCount(2);
  });

  test('zero byte is rejected as unsupported instead of metadata absent', async ({ page }) => {
    await page.getByTestId('tool018-input').setInputFiles(TOOL018_FIXTURES.zero);
    await expect(page.getByTestId('tool018-root').getByRole('alert').filter({ hasText: '지원하지 않는 이미지 형식입니다.' })).toBeVisible();
  });

  test('long metadata values wrap without horizontal page overflow', async ({ page }) => {
    await upload018(page, TOOL018_FIXTURES.longMetadata);
    await page.setViewportSize({ width: 320, height: 900 });
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });

  test('unicode filenames are preserved in selected file list', async ({ page }) => {
    const buffer = fs.readFileSync(TOOL018_FIXTURES.noExif);
    await page.getByTestId('tool018-input').setInputFiles({ name: '사진_テスト.jpg', mimeType: 'image/jpeg', buffer });
    await expect(page.getByTestId('tool018-batch-summary')).toContainText('사진_テスト.jpg');
  });

  test('ZIP download keeps duplicate clean filenames unique', async ({ page }, testInfo) => {
    const buffer = fs.readFileSync(TOOL018_FIXTURES.noExif);
    await page.getByTestId('tool018-input').setInputFiles([
      { name: 'duplicate.jpg', mimeType: 'image/jpeg', buffer },
      { name: 'duplicate.jpg', mimeType: 'image/jpeg', buffer },
    ]);
    await expect(page.getByTestId('tool018-file-item')).toHaveCount(2);
    await page.getByTestId('tool018-remove-all').click();
    await expect(page.getByTestId('tool018-download-zip')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('tool018-download-zip').click();
    const download = await downloadPromise;
    const zipPath = testInfo.outputPath('metadata-clean-images.zip');
    await download.saveAs(zipPath);
    const zip = fs.readFileSync(zipPath).toString('latin1');
    expect(zip).toContain('duplicate-clean.jpg');
    expect(zip).toContain('duplicate-clean-2.jpg');
  });
});
