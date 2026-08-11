import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const sample = fs.readFileSync(path.join(root, 'test-fixtures', 'sample.jpg'));
const square = fs.readFileSync(path.join(root, 'test-fixtures', 'square.png'));
const route = '/ko/jpg-png-webp-image-converter';

async function select(page: Page, files: any) {
  await page.getByTestId('converter-file-input').setInputFiles(files as any);
}
async function expectReady(page: Page) {
  await expect(page.getByTestId('converter-file-card').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
}
async function runtimeErrors(page: Page) {
  return page.evaluate(() => (window as any).__v21Runtime || { errors: [], rejections: [] });
}
async function installRuntime(page: Page) {
  await page.evaluate(() => {
    const w = window as any;
    w.__v21Runtime = { errors: [] as string[], rejections: [] as string[] };
    addEventListener('error', e => w.__v21Runtime.errors.push(String(e.message || 'error')));
    addEventListener('unhandledrejection', e => w.__v21Runtime.rejections.push(String(e.reason || 'rejection')));
  });
}

test.describe('TOOL001 mobile race/resilience gates V21', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V21_ARRAYBUFFER_AND_FILEREADER_HANG_HAS_TERMINAL_FEEDBACK', async ({ page }) => {
    test.setTimeout(20000);
    await page.goto(route); await installRuntime(page);
    await page.evaluate(() => {
      File.prototype.arrayBuffer = (() => new Promise<ArrayBuffer>(() => {})) as typeof File.prototype.arrayBuffer;
      FileReader.prototype.readAsArrayBuffer = function() {} as typeof FileReader.prototype.readAsArrayBuffer;
    });
    await select(page, { name: 'hang.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
  });

  test('V21_CREATEIMAGEBITMAP_HANG_MUST_NOT_LEAVE_SELECTION_STUCK_FOREVER', async ({ page }) => {
    test.setTimeout(12000);
    await page.goto(route); await installRuntime(page);
    await page.evaluate(() => {
      (window as any).createImageBitmap = () => new Promise(() => {});
    });
    await select(page, { name: 'bitmap-hang.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible({ timeout: 7000 });
  });

  test('V21_IMG_FALLBACK_HANG_MUST_TERMINATE', async ({ page }) => {
    test.setTimeout(12000);
    await page.goto(route); await installRuntime(page);
    await page.evaluate(() => {
      (window as any).createImageBitmap = async () => { throw new Error('force-fallback'); };
      const NativeImage = window.Image;
      (window as any).Image = class extends NativeImage {
        set src(_value: string) { /* intentionally never load/error */ }
      };
    });
    await select(page, { name: 'img-hang.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible({ timeout: 7000 });
  });

  test('V21_UNMOUNT_DURING_DELAYED_SELECTION_MUST_NOT_CRASH_ON_RETURN', async ({ page }) => {
    await page.goto(route); await installRuntime(page);
    await page.evaluate(() => {
      const original = File.prototype.arrayBuffer;
      File.prototype.arrayBuffer = function() { return new Promise((res, rej) => setTimeout(() => original.call(this).then(res, rej), 1200)); };
    });
    const pending = select(page, { name: 'unmount.jpg', mimeType: 'image/jpeg', buffer: sample }).catch(() => {});
    await page.waitForTimeout(100);
    await page.goto('/ko');
    await pending;
    await page.goto(route);
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
  });

  test('V21_RELOAD_DURING_PROCESSING_RECOVERS_TO_USABLE_PAGE', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'reload.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.getByTestId('converter-run').tap();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await expect(page.getByTestId('converter-file-input')).toHaveCount(1);
  });

  test('V21_BACK_FORWARD_AFTER_SELECTION_RETURNS_USABLE', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'history.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.goto('/ko');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('converter-file-input')).toHaveCount(1);
  });

  test('V21_RESET_DURING_ASYNC_CONVERT_MUST_NOT_RESURRECT_STALE_CARD', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'reset-race.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.evaluate(() => {
      const original = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(cb: BlobCallback, type?: string, quality?: any) {
        setTimeout(() => original.call(this, cb, type, quality), 1000);
      } as typeof HTMLCanvasElement.prototype.toBlob;
    });
    await page.getByTestId('converter-run').tap();
    const reset = page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first();
    await reset.tap();
    await page.waitForTimeout(1400);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
  });

  test('V21_DELETE_DURING_ASYNC_CONVERT_MUST_NOT_RESURRECT_REMOVED_ITEM', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'delete-race.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.evaluate(() => {
      const original = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(cb: BlobCallback, type?: string, quality?: any) {
        setTimeout(() => original.call(this, cb, type, quality), 900);
      } as typeof HTMLCanvasElement.prototype.toBlob;
    });
    await page.getByTestId('converter-run').tap();
    await page.getByRole('button', { name: /삭제|Remove|削除/ }).first().tap();
    await page.waitForTimeout(1200);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
  });

  test('V21_FAST_SECOND_SELECTION_MUST_NOT_BE_OVERWRITTEN_BY_SLOW_FIRST', async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => {
      const original = File.prototype.arrayBuffer;
      File.prototype.arrayBuffer = function() {
        const delay = this.name.includes('slow-first') ? 900 : 0;
        return new Promise((res, rej) => setTimeout(() => original.call(this).then(res, rej), delay));
      };
    });
    const first = select(page, { name: 'slow-first.jpg', mimeType: 'image/jpeg', buffer: sample });
    await page.waitForTimeout(50);
    const second = select(page, { name: 'fast-second.png', mimeType: 'image/png', buffer: square });
    await Promise.all([first, second]);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(2, { timeout: 15000 });
  });

  test('V21_DOWNLOAD_ANCHOR_CLICK_FAILURE_IS_HANDLED', async ({ page }) => {
    await page.goto(route); await installRuntime(page);
    await select(page, { name: 'click-fail.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.getByTestId('converter-run').tap();
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await page.evaluate(() => { HTMLAnchorElement.prototype.click = () => { throw new Error('ANCHOR_CLICK_FAIL'); }; });
    await card.getByRole('button', { name: /다운로드|Download|保存/ }).tap();
    const rt = await runtimeErrors(page);
    expect(rt.errors).toEqual([]); expect(rt.rejections).toEqual([]);
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible();
  });

  test('V21_ZERO_BYTE_RESULT_BLOB_MUST_NOT_BE_TREATED_AS_SUCCESS', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'zero-result.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.toBlob = function(cb: BlobCallback, type?: string) { setTimeout(() => cb(new Blob([], { type: type || 'image/webp' })), 0); } as typeof HTMLCanvasElement.prototype.toBlob;
    });
    await page.getByTestId('converter-run').tap();
    await expect(page.getByTestId('converter-file-card').first()).toHaveAttribute('data-status', 'error', { timeout: 15000 });
  });

  test('V21_CONVERT_DOUBLE_TAP_DOES_NOT_DOUBLE_PROCESS', async ({ page }) => {
    await page.goto(route); await select(page, { name: 'double-convert.jpg', mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    const run = page.getByTestId('converter-run');
    await Promise.allSettled([run.tap(), run.tap()]);
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toHaveAttribute('data-status', /done|error/, { timeout: 30000 });
    await expect(page.getByTestId('converter-file-card')).toHaveCount(1);
  });

  test('V21_DELETE_FROM_FULL_10_THEN_READD_REOPENS_CAPACITY', async ({ page }) => {
    await page.goto(route);
    const files = Array.from({ length: 10 }, (_, i) => ({ name: `full-${i}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.concat([sample, Buffer.from([i])]) }));
    await select(page, files);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(10, { timeout: 30000 });
    await page.getByRole('button', { name: /삭제|Remove|削除/ }).first().tap();
    await expect(page.getByTestId('converter-file-card')).toHaveCount(9);
    await select(page, { name: 'replacement.jpg', mimeType: 'image/jpeg', buffer: Buffer.concat([sample, Buffer.from([111])]) });
    await expect(page.getByTestId('converter-file-card')).toHaveCount(10, { timeout: 15000 });
  });

  test('V21_SPECIAL_AND_LONG_FILENAME_SURVIVES_END_TO_END', async ({ page }) => {
    const long = `한글_日本語_%23%3F&+_${'x'.repeat(120)}.jpg`;
    await page.goto(route); await select(page, { name: long, mimeType: 'image/jpeg', buffer: sample }); await expectReady(page);
    await page.getByTestId('converter-run').tap();
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await expect(card.getByRole('button', { name: /다운로드|Download|保存/ })).toBeVisible();
  });

  test('V21_NARROW_320PX_DARKMODE_NO_HORIZONTAL_ESCAPE', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(route); await select(page, { name: 'narrow.png', mimeType: 'image/png', buffer: square }); await expectReady(page);
    const dims = await page.evaluate(() => ({ inner: innerWidth, html: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(dims.html).toBeLessThanOrEqual(dims.inner + 2);
    expect(dims.body).toBeLessThanOrEqual(dims.inner + 2);
  });

  test('V21_REPEAT_UPLOAD_RESET_30X_HAS_NO_RUNTIME_ERROR', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(route); await installRuntime(page);
    for (let i = 0; i < 30; i += 1) {
      await select(page, { name: `loop-${i}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.concat([sample, Buffer.from([i])]) });
      await expect(page.getByTestId('converter-file-card')).toHaveCount(1, { timeout: 10000 });
      await page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first().tap();
      await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
    }
    const rt = await runtimeErrors(page);
    expect(rt.errors).toEqual([]); expect(rt.rejections).toEqual([]);
  });
});
