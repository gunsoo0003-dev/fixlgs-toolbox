import { test, expect } from '@playwright/test';
import { openTool017, uploadImages, TOOL017_TESTIDS } from './helpers/tool-017';

test.describe('017 boundary-only', () => {
  test('rejects unsupported file before editor activation', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not image') });
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByTestId(TOOL017_TESTIDS.canvas)).toHaveCount(0);
  });

  test('keeps watermark text within the 300 character service boundary', async ({ page }) => {
    await uploadImages(page, 1);
    const input = page.getByTestId(TOOL017_TESTIDS.textInput);
    await input.fill('A'.repeat(301));
    await expect(input).toHaveValue('A'.repeat(300));
  });

  test('range controls remain inside declared product bounds', async ({ page }) => {
    await uploadImages(page, 1);
    await expect(page.getByTestId(TOOL017_TESTIDS.size)).toHaveAttribute('min', '3');
    await expect(page.getByTestId(TOOL017_TESTIDS.size)).toHaveAttribute('max', '30');
    await expect(page.getByTestId(TOOL017_TESTIDS.opacity)).toHaveAttribute('min', '0');
    await expect(page.getByTestId(TOOL017_TESTIDS.opacity)).toHaveAttribute('max', '100');
    await expect(page.getByTestId(TOOL017_TESTIDS.rotation)).toHaveAttribute('min', '-180');
    await expect(page.getByTestId(TOOL017_TESTIDS.rotation)).toHaveAttribute('max', '180');
  });

  test('repeat mode exposes density and spacing controls while single-position mode does not', async ({ page }) => {
    await uploadImages(page, 1);
    await page.getByTestId(TOOL017_TESTIDS.repeatGrid).click();
    await expect(page.getByTestId(TOOL017_TESTIDS.density)).toBeVisible();
    await expect(page.getByTestId(TOOL017_TESTIDS.gapX)).toBeVisible();
    await expect(page.getByTestId(TOOL017_TESTIDS.gapY)).toBeVisible();
    await page.getByTestId(TOOL017_TESTIDS.repeatOff).click();
    await expect(page.getByTestId(TOOL017_TESTIDS.density)).toHaveCount(0);
  });
});
