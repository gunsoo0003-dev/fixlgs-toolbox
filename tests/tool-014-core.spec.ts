import { test, expect } from '@playwright/test';
import { openTool014, TOOL014_TESTIDS, uploadTool014 } from './helpers/tool-014';

test.describe('014 core-only', () => {
  test('two valid images enable collage download and create PNG', async ({ page }) => {
    await openTool014(page);
    await uploadTool014(page);
    const promise = page.waitForEvent('download');
    await page.getByTestId(TOOL014_TESTIDS.download).click();
    const download = await promise;
    expect(download.suggestedFilename()).toMatch(/collage\.png$/i);
    await expect(page.getByText('완료', { exact: true })).toBeVisible();
  });

  test('layout can change from 2x2 to 3x3 and preserves uploaded images', async ({ page }) => {
    await openTool014(page);
    await uploadTool014(page, ['test-fixtures/sample.jpg','test-fixtures/sample.webp','test-fixtures/transparent.png']);
    await page.getByRole('button', { name: '격자', exact: true }).click();
    await page.getByTestId(TOOL014_TESTIDS.layout3x3).click();
    await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveAttribute('data-cells', '9');
    await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveAttribute('data-files', '3');
  });

  test('output width and height update and limit warning blocks oversized output', async ({ page }) => {
    await openTool014(page);
    await uploadTool014(page);
    await page.getByTestId(TOOL014_TESTIDS.width).fill('3001');
    await expect(page.getByTestId(TOOL014_TESTIDS.limitBlocked)).toBeVisible();
    await expect(page.getByTestId(TOOL014_TESTIDS.download)).toBeDisabled();
  });

  test('reset all returns to initial upload state', async ({ page }) => {
    await openTool014(page);
    await uploadTool014(page);
    await page.getByRole('button', { name: '전체 초기화', exact: true }).click();
    await expect(page.getByTestId(TOOL014_TESTIDS.state)).toHaveCount(0);
    await expect(page.getByTestId(TOOL014_TESTIDS.select)).toBeVisible();
    await expect(page.getByTestId(TOOL014_TESTIDS.fileInput)).toHaveValue('');
  });
});
