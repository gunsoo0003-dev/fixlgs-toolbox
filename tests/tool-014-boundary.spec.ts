import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { openTool014, TOOL014_TESTIDS } from './helpers/tool-014';

test.describe('014 boundary-only', () => {
  test('one image remains accepted but download is disabled', async ({ page }) => {
    await openTool014(page);
    await page.getByTestId(TOOL014_TESTIDS.fileInput).setInputFiles('test-fixtures/sample.jpg');
    await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveAttribute('data-files', '1');
    await expect(page.getByTestId(TOOL014_TESTIDS.download)).toBeDisabled();
    await expect(page.getByText('콜라주를 만들려면 이미지를 한 장 더 추가하세요.')).toBeVisible();
  });

  test('unsupported and corrupted inputs do not crash the workbench', async ({ page }) => {
    await openTool014(page);
    await page.getByTestId(TOOL014_TESTIDS.fileInput).setInputFiles([
      { name:'vector.svg', mimeType:'image/svg+xml', buffer:Buffer.from('<svg/>') },
      { name:'broken.jpg', mimeType:'image/jpeg', buffer:Buffer.from('broken') },
    ]);
    await expect(page.getByTestId(TOOL014_TESTIDS.root)).toBeVisible();
    await expect(page.getByTestId(TOOL014_TESTIDS.download)).toBeDisabled();
  });

  test('13th selected file is rejected by the 12-file service limit', async ({ page }) => {
    await openTool014(page);
    const buf = await readFile('test-fixtures/tool-014-limit/tiny-01.png');
    const files = Array.from({length:13},(_,i)=>({name:`tiny-${i+1}.png`,mimeType:'image/png',buffer:buf}));
    await page.getByTestId(TOOL014_TESTIDS.fileInput).setInputFiles(files);
    await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveAttribute('data-files', '12');
    await expect(page.getByTestId(TOOL014_TESTIDS.error)).toContainText('최대 12장');
  });

  test('gap and padding clamp to configured UI ranges', async ({ page }) => {
    await openTool014(page);
    await page.getByTestId(TOOL014_TESTIDS.fileInput).setInputFiles(['test-fixtures/sample.jpg','test-fixtures/sample.webp']);
    const gap = page.getByLabel('이미지 간격');
    const padding = page.getByLabel('외곽 여백');
    await gap.fill('-1'); await expect(gap).toHaveValue('0');
    await gap.fill('999'); await expect(gap).toHaveValue('200');
    await padding.fill('-1'); await expect(padding).toHaveValue('0');
    await padding.fill('999'); await expect(padding).toHaveValue('300');
  });
});
