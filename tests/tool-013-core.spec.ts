import { test, expect, type Page } from '@playwright/test';
import { openTool013, TOOL013_TESTIDS } from './helpers/tool-013';

const SAMPLE = 'test-fixtures/sample.jpg';
const LANDSCAPE = 'test-fixtures/tool013-limit-landscape-100x1.png';
const SQUARE = 'test-fixtures/tool013-limit-square-1x1.png';

async function uploadTwo(page: Page, a = SAMPLE, b = SAMPLE) {
  await openTool013(page, 'ko');
  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles([a, b]);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(2);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).first()).toHaveAttribute('data-status', 'ready');
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).nth(1)).toHaveAttribute('data-status', 'ready');
}

function previewSummary(page: Page) {
  return page.getByTestId(TOOL013_TESTIDS.preview).locator('.toolbox-workbench-settings-head p');
}

test.describe('013 core-only', () => {
  test('two images load into the merger workspace and enable download', async ({ page }) => {
    await uploadTwo(page);
    await expect(page.getByTestId(TOOL013_TESTIDS.files)).toBeVisible();
    await expect(page.getByTestId(TOOL013_TESTIDS.settings)).toBeVisible();
    await expect(page.getByTestId(TOOL013_TESTIDS.previewCanvas)).toBeVisible();
    await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeEnabled();
  });

  test('vertical and horizontal merge directions both update result geometry', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, LANDSCAPE);
    await expect(previewSummary(page)).toContainText('100 × 2px');
    await page.getByRole('button', { name: '가로', exact: true }).click();
    await expect(previewSummary(page)).toContainText('200 × 1px');
    await page.getByTestId(TOOL013_TESTIDS.directionVertical).click();
    await expect(previewSummary(page)).toContainText('100 × 2px');
  });

  test('gap and outer padding are reflected in result dimensions', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, LANDSCAPE);
    await page.getByTestId(TOOL013_TESTIDS.gap).fill('10');
    await page.getByTestId(TOOL013_TESTIDS.padding).fill('5');
    await expect(previewSummary(page)).toContainText('110 × 22px');
  });

  test('width matching preserves aspect ratio and custom size can upscale when enabled', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, LANDSCAPE);
    await page.getByTestId(TOOL013_TESTIDS.sizingWidth).click();
    await page.getByTestId(TOOL013_TESTIDS.sizeBasis).selectOption('custom');
    await page.getByTestId(TOOL013_TESTIDS.allowUpscale).check();
    await page.getByTestId(TOOL013_TESTIDS.customSize).fill('1000');
    await expect(previewSummary(page)).toContainText('1000 × 20px');
  });

  test('mobile-friendly reorder buttons change item order without removing files', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, SQUARE);
    const cards = page.getByTestId(TOOL013_TESTIDS.fileCard);
    const before = await cards.locator('.merger-file-meta strong').allTextContents();
    await cards.nth(1).getByRole('button', { name: '맨 앞으로' }).click();
    const after = await cards.locator('.merger-file-meta strong').allTextContents();
    expect(after).toEqual([before[1], before[0]]);
    await expect(cards).toHaveCount(2);
  });

  test('PNG download creates a real file and completion status/result card', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, LANDSCAPE);
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId(TOOL013_TESTIDS.download).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/merged-images\.png$/i);
    await expect(page.getByTestId(TOOL013_TESTIDS.status)).toContainText('완료');
    await expect(page.locator('.merger-result')).toBeVisible();
  });

  test('reset settings preserves files while reset all returns to initial upload state', async ({ page }) => {
    await uploadTwo(page, LANDSCAPE, LANDSCAPE);
    await page.getByTestId(TOOL013_TESTIDS.gap).fill('30');
    await page.getByRole('button', { name: '설정 초기화' }).click();
    await expect(page.getByTestId(TOOL013_TESTIDS.gap)).toHaveValue('0');
    await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(2);
    await page.getByRole('button', { name: '전체 초기화' }).click();
    await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(0);
    await expect(page.getByTestId(TOOL013_TESTIDS.select)).toBeVisible();
  });
});
