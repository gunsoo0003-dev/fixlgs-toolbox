import path from 'node:path';
import { expect, test } from '@playwright/test';

const route = '/ko/jpg-png-webp-image-converter';
const fixture = (name: string) => path.join(process.cwd(), 'test-fixtures', name);

test.describe('TOOL001 V27 captured-input / deferred-worker path', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V27_SELECTION_CAPTURES_OWNED_FILE_AND_DEFERS_WORKER_UNTIL_CONVERT', async ({ page }) => {
    const workerRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/workers/tool001-image-worker.js')) workerRequests.push(request.url());
    });
    await page.goto(route);

    const trigger = page.locator('.toolbox-upload-focus button').first();
    const chooserPromise = page.waitForEvent('filechooser');
    await trigger.tap();
    const chooser = await chooserPromise;
    await chooser.setFiles(fixture('sample.jpg'));

    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
    await expect.poll(async () => card.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    await expect.poll(async () => page.getByTestId('converter-file-input').inputValue()).toBe('');
    expect(workerRequests.length, 'selection/preview must not start the conversion worker').toBe(0);

    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    expect(workerRequests.length, 'conversion should start the isolated worker').toBeGreaterThan(0);
  });

  test('V27_RESELECT_AFTER_RESET_REMAINS_USABLE_WITH_CAPTURED_INPUT', async ({ page }) => {
    await page.goto(route);
    const pick = async () => {
      const chooserPromise = page.waitForEvent('filechooser');
      await page.locator('.toolbox-upload-focus button').first().tap();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture('sample.jpg'));
      const card = page.getByTestId('converter-file-card').first();
      await expect(card).toBeVisible({ timeout: 15000 });
      await expect.poll(async () => card.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    };
    await pick();
    await page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first().tap();
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await pick();
  });
});
