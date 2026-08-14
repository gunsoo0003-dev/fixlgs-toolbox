import { test, expect } from '@playwright/test';
import path from 'node:path';

const fixture = path.join(process.cwd(), 'test-fixtures', 'sample.jpg');
const route = '/ko/jpg-png-webp-image-converter';

async function openTool(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto(route);
  await expect(page.getByTestId('converter-file-input')).toBeAttached();
}

test.skip('V26_PREVIEW_BLOBURL_FAILURE_FALLS_BACK_TO_APP_OWNED_DATAURL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = URL.createObjectURL.bind(URL);
    let first = true;
    URL.createObjectURL = (blob: Blob) => {
      if (first) {
        first = false;
        return 'blob:https://invalid.local/v26-preview-failure';
      }
      return original(blob);
    };
  });
  await openTool(page);
  await page.getByTestId('converter-file-input').setInputFiles(fixture);
  const card = page.getByTestId('converter-file-card').first();
  await expect(card).toBeVisible();
  const img = card.locator('img');
  await expect.poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});

test.skip('V26_WORKER_ENGINE_IS_USED_FOR_CONVERSION_WHEN_AVAILABLE', async ({ page }) => {
  const workerRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/workers/tool001-image-worker.js')) workerRequests.push(request.url());
  });
  await openTool(page);
  await page.getByTestId('converter-file-input').setInputFiles(fixture);
  await expect(page.getByTestId('converter-file-card')).toHaveCount(1);
  await page.getByTestId('converter-run').click();
  await expect(page.getByTestId('converter-file-card').first()).toHaveAttribute('data-status', 'done', { timeout: 20_000 });
  expect(workerRequests.length).toBeGreaterThan(0);
});

test.skip('V26_SAME_CAPTURED_IMAGE_SURVIVES_INPUT_CLEAR_AND_DELAY', async ({ page }) => {
  await openTool(page);
  const input = page.getByTestId('converter-file-input');
  await input.setInputFiles(fixture);
  await expect(page.getByTestId('converter-file-card')).toHaveCount(1);
  await expect.poll(async () => input.inputValue()).toBe('');
  await page.waitForTimeout(2500);
  const img = page.getByTestId('converter-file-card').first().locator('img');
  await expect.poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});
