import path from 'node:path';
import { expect, test } from '@playwright/test';

const route = '/ko/jpg-png-webp-image-converter';
const fixture = (name: string) => path.join(process.cwd(), 'test-fixtures', name);

test.describe('TOOL001 V24 mobile attachment lightweight path', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V24_SELECTION_USES_SMALL_HEADER_AND_DEFERS_CREATEIMAGEBITMAP_UNTIL_CONVERT', async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => {
      const w = window as any;
      w.__v24BitmapCalls = 0;
      w.__v24ArrayBufferSizes = [];
      const nativeBitmap = window.createImageBitmap?.bind(window);
      if (nativeBitmap) {
        window.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) => {
          w.__v24BitmapCalls += 1;
          return nativeBitmap(...args);
        }) as typeof createImageBitmap;
      }
      const nativeArrayBuffer = Blob.prototype.arrayBuffer;
      Blob.prototype.arrayBuffer = function() {
        w.__v24ArrayBufferSizes.push(this.size);
        return nativeArrayBuffer.call(this);
      };
    });

    const trigger = page.locator('.toolbox-upload-focus button').first();
    const chooserPromise = page.waitForEvent('filechooser');
    await trigger.tap();
    const chooser = await chooserPromise;
    await chooser.setFiles(fixture('sample.jpg'));

    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);

    const before = await page.evaluate(() => ({ calls: (window as any).__v24BitmapCalls, sizes: (window as any).__v24ArrayBufferSizes }));
    expect(before.calls).toBe(0);
    expect(before.sizes.length).toBeGreaterThan(0);
    expect(Math.max(...before.sizes)).toBeLessThanOrEqual(256 * 1024);

    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    const afterCalls = await page.evaluate(() => (window as any).__v24BitmapCalls);
    expect(afterCalls).toBeGreaterThanOrEqual(1);
  });

  test('V24_RESELECT_AFTER_RESET_REMAINS_USABLE_WITH_LIGHTWEIGHT_ATTACH', async ({ page }) => {
    await page.goto(route);
    const pick = async () => {
      const chooserPromise = page.waitForEvent('filechooser');
      await page.locator('.toolbox-upload-focus button').first().tap();
      const chooser = await chooserPromise;
      await chooser.setFiles(fixture('sample.jpg'));
      await expect(page.getByTestId('converter-file-card').first()).toBeVisible({ timeout: 10000 });
    };
    await pick();
    await page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first().tap();
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await pick();
  });
});
