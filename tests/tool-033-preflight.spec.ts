import { test, expect } from '@playwright/test';

test('TOOL033 preflight current product/checker contract', async ({ page }) => {
  await page.goto('/ko/pdf-compressor');

  const root = page.getByTestId('tool033-root');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-max-file-bytes', String(50 * 1024 * 1024));
  await expect(root).toHaveAttribute('data-max-pages', '200');

  const input = page.getByTestId('tool033-file-input');
  await expect(input).toHaveAttribute('accept', /pdf/i);
  await expect(page.getByTestId('tool033-dropzone')).toBeVisible();

  await input.setInputFiles('tests/fixtures/tool-033/text-2pages.pdf');

  // Design/state-transition gate: large Dropzone must disappear after upload.
  await expect(page.getByTestId('tool033-dropzone')).toHaveCount(0);
  await expect(page.getByTestId('tool033-file-info')).toBeVisible();
  await expect(page.getByTestId('tool033-workspace')).toBeVisible();
  await expect(page.getByTestId('tool033-presets')).toBeVisible();

  // Current 4-preset contract. Balanced 92 is the default and slider is locked for presets.
  await expect(page.getByTestId('tool033-preset-high')).toBeVisible();
  await expect(page.getByTestId('tool033-preset-balanced')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('tool033-preset-size')).toBeVisible();
  await expect(page.getByTestId('tool033-preset-custom')).toBeVisible();
  const quality = page.getByTestId('tool033-quality');
  await expect(quality).toHaveValue('92');
  await expect(quality).toBeDisabled();

  // Initial preview must render with zero extra user actions after upload.
  const canvas = page.getByTestId('tool033-preview-canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(async () => canvas.evaluate((el: HTMLCanvasElement) => ({ width: el.width, height: el.height })), { timeout: 20_000 })
    .toEqual(expect.objectContaining({ width: expect.any(Number), height: expect.any(Number) }));
  const dims = await canvas.evaluate((el: HTMLCanvasElement) => ({ width: el.width, height: el.height }));
  expect(dims.width).toBeGreaterThan(0);
  expect(dims.height).toBeGreaterThan(0);
});
