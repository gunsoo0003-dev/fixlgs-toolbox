import path from 'node:path';
import { expect, test } from '@playwright/test';

const route = '/ko/jpg-png-webp-image-converter';
const fixture = (name: string) => path.join(process.cwd(), 'test-fixtures', name);

test.describe('TOOL001 V57R2 captured-input / ImageData path', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V57R2_SELECTION_CAPTURES_FILE_AND_DEFERS_CONVERSION_UNTIL_RUN', async ({ page }) => {
    await page.goto(route);

    const trigger = page.locator('.toolbox-upload-focus button').first();
    const chooserPromise = page.waitForEvent('filechooser');
    await trigger.tap();
    const chooser = await chooserPromise;
    await chooser.setFiles(fixture('sample.jpg'));

    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
    await expect.poll(async () => card.getByRole('img').first().evaluate((el) => el instanceof HTMLCanvasElement ? el.width : el instanceof HTMLImageElement ? el.naturalWidth : 0)).toBeGreaterThan(0);
    await expect.poll(async () => page.getByTestId('converter-file-input').inputValue()).toBe('');
    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await expect(card).toHaveAttribute('data-status', 'done');
  });

  test('V57R2_RESELECT_AFTER_RESET_REMAINS_USABLE_WITH_CAPTURED_INPUT', async ({ page }) => {
    await page.goto(route);
    const pick = async () => {
      const chooserPromise = page.waitForEvent('filechooser');
      await page.locator('.toolbox-upload-focus button').first().tap();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture('sample.jpg'));
      const card = page.getByTestId('converter-file-card').first();
      await expect(card).toBeVisible({ timeout: 15000 });
      await expect.poll(async () => card.getByRole('img').first().evaluate((el) => el instanceof HTMLCanvasElement ? el.width : el instanceof HTMLImageElement ? el.naturalWidth : 0)).toBeGreaterThan(0);
    };
    await pick();
    await page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first().tap();
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await pick();
  });
});
