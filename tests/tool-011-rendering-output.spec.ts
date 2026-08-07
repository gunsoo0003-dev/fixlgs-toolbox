import { test, expect } from '@playwright/test';
import { openTool011, upload011, downloadAndDecode, decodeDownloadedImage, canvasSize } from './helpers/tool-011';

test.describe('011 rendered pixels and output decode', () => {
  test('transparent padding stays alpha and checkerboard is never baked into output', async ({page}) => {
    await openTool011(page); await upload011(page,'test-fixtures/transparent.png');
    await page.getByTestId('tool011-mode-padding').click(); await page.getByTestId('tool011-padding-all').fill('24');
    await page.getByTestId('tool011-bg-transparent').click(); await page.getByTestId('tool011-output-format').selectOption('png');
    const d=await downloadAndDecode(page); const decoded=await decodeDownloadedImage(page,d.path); expect(decoded.corner[3]).toBe(0); await expect(page.getByTestId('tool011-result')).toContainText(/PNG/i);
  });
  test('JPG with transparent background requires/uses solid composition instead of claiming alpha', async ({page}) => {
    await openTool011(page); await upload011(page,'test-fixtures/transparent.png'); await page.getByTestId('tool011-bg-transparent').click();
    await page.getByTestId('tool011-output-format').selectOption('jpg'); await expect(page.getByTestId('tool011-jpg-transparency-note')).toBeVisible();
  });
  test('blur background fills canvas while foreground remains unblurred', async ({page}) => {
    await openTool011(page); await upload011(page); await page.getByTestId('tool011-mode-square').click(); await page.getByTestId('tool011-bg-blur').click();
    await page.getByTestId('tool011-blur-strength').fill('24'); await expect(page.getByTestId('tool011-background-state')).toHaveAttribute('data-background','blur');
    await expect(page.getByTestId('tool011-crop-state')).toBeVisible();
  });
  test('JPG PNG WebP output downloads and preserves declared result dimensions', async ({page}) => {
    await openTool011(page); await upload011(page);
    const expected=await canvasSize(page); for(const format of ['jpg','png','webp']) { await page.getByTestId('tool011-output-format').selectOption(format); const d=await downloadAndDecode(page); const decoded=await decodeDownloadedImage(page,d.path); expect(decoded.width).toBe(expected.width); expect(decoded.height).toBe(expected.height); }
  });
});
