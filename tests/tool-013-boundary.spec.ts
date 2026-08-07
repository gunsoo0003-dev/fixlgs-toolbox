import { test, expect, type Page } from '@playwright/test';
import { openTool013, TOOL013_TESTIDS } from './helpers/tool-013';

const SAMPLE = 'test-fixtures/sample.jpg';

async function fileBuffer(path: string, name: string, mimeType: string) {
  const { readFile } = await import('node:fs/promises');
  return { name, mimeType, buffer: await readFile(path) };
}

async function openAndUpload(page: Page, files: string[] = [SAMPLE, SAMPLE]) {
  await openTool013(page, 'ko');
  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles(files);
}

test.describe('013 boundary-only', () => {
  test('one valid image remains usable but download stays disabled until two are ready', async ({ page }) => {
    await openAndUpload(page, [SAMPLE]);
    await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(1);
    await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveAttribute('data-status', 'ready');
    await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeDisabled();
    await expect(page.getByText('이미지를 한 장 더 추가하세요.', { exact: true })).toBeVisible();
  });

  test('unsupported, empty and corrupted files become failed cards without breaking valid files', async ({ page }) => {
    await openTool013(page, 'ko');
    const input = page.getByTestId(TOOL013_TESTIDS.fileInput);
    await input.setInputFiles([
      await fileBuffer(SAMPLE, 'sample.jpg', 'image/jpeg'),
      { name: 'vector.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') },
      { name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
      { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('broken jpeg') },
    ]);
    const cards = page.getByTestId(TOOL013_TESTIDS.fileCard);
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toHaveAttribute('data-status', 'ready');
    await expect(cards.nth(1)).toHaveAttribute('data-status', 'failed');
    await expect(cards.nth(2)).toHaveAttribute('data-status', 'failed');
    await expect(cards.nth(3)).toHaveAttribute('data-status', 'failed');
    await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeDisabled();
  });

  test('gap and padding clamp negatives to zero and values above max to 2000', async ({ page }) => {
    await openAndUpload(page);
    const gap = page.getByTestId(TOOL013_TESTIDS.gap);
    const padding = page.getByTestId(TOOL013_TESTIDS.padding);
    await gap.fill('-1');
    await expect(gap).toHaveValue('0');
    await gap.fill('99999');
    await expect(gap).toHaveValue('2000');
    await padding.fill('-50');
    await expect(padding).toHaveValue('0');
    await padding.fill('99999');
    await expect(padding).toHaveValue('2000');
  });

  test('custom size clamps to 1..16384', async ({ page }) => {
    await openAndUpload(page);
    await page.getByTestId(TOOL013_TESTIDS.sizingWidth).click();
    await page.getByTestId(TOOL013_TESTIDS.sizeBasis).selectOption('custom');
    const size = page.getByTestId(TOOL013_TESTIDS.customSize);
    await size.fill('0');
    await expect(size).toHaveValue('1');
    await size.fill('99999');
    await expect(size).toHaveValue('16384');
  });

  test('removing one of two files disables download and remove-all returns to upload state', async ({ page }) => {
    await openAndUpload(page);
    const cards = page.getByTestId(TOOL013_TESTIDS.fileCard);
    await expect(cards).toHaveCount(2);
    await cards.first().getByRole('button', { name: '삭제', exact: true }).click();
    await expect(cards).toHaveCount(1);
    await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeDisabled();
    await page.getByRole('button', { name: '전체 파일 삭제', exact: true }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.getByTestId(TOOL013_TESTIDS.select)).toBeVisible();
  });

  test('filename sanitizes forbidden filesystem characters before download', async ({ page }) => {
    await openAndUpload(page);
    const filename = page.getByTestId(TOOL013_TESTIDS.output).locator('label').filter({ hasText: '파일명' }).locator('input');
    await filename.fill('a/b:c*?d"e<f>g|h.png');
    await filename.blur();
    await expect(filename).toHaveValue('a-b-c-d-e-f-g-h.png');
  });

  test('transparent background with JPG exposes fallback notice and still downloads', async ({ page }) => {
    await openAndUpload(page);
    await page.getByRole('button', { name: '투명', exact: true }).click();
    await page.getByTestId(TOOL013_TESTIDS.output).locator('select').first().selectOption('jpg');
    await expect(page.getByText(/JPG는 투명 배경을 지원하지 않아/)).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId(TOOL013_TESTIDS.download).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.jpg$/i);
  });
});
