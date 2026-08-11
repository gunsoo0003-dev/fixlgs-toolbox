import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const sample = fs.readFileSync(path.join(root, 'test-fixtures', 'sample.jpg'));
const square = fs.readFileSync(path.join(root, 'test-fixtures', 'square.png'));
const ko = '/ko/jpg-png-webp-image-converter';

async function select(page: Page, files: any) {
  await page.getByTestId('converter-file-input').setInputFiles(files as any);
}

async function expectAcceptedPreview(page: Page) {
  await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
  await expect(page.locator('.toolbox-upload-active')).toBeVisible();
  const card = page.getByTestId('converter-file-card').first();
  await expect(card).toBeVisible();
  const img = card.locator('img').first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0 && el.naturalHeight > 0)).toBeTruthy();
}

test.describe('TOOL001 mobile workflow edge gates V18', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('empty chooser return / cancel-like path keeps initial state usable', async ({ page }) => {
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    const input = page.getByTestId('converter-file-input');
    await input.setInputFiles([]);
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
    await expect(page.locator('.toolbox-upload-focus button').first()).toBeEnabled();
  });

  test('mixed valid + zero-byte selection accepts valid item and reports rejected item', async ({ page }) => {
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    await select(page, [
      { name: 'ok.jpg', mimeType: 'image/jpeg', buffer: sample },
      { name: 'empty.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(0) },
    ]);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(1, { timeout: 15000 });
    await expectAcceptedPreview(page);
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible();
  });

  test('same display name with different bytes is not falsely collapsed as one file', async ({ page }) => {
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    await select(page, [
      { name: 'same-name.jpg', mimeType: 'image/jpeg', buffer: sample },
      { name: 'same-name.jpg', mimeType: 'image/jpeg', buffer: Buffer.concat([sample, Buffer.from([0])]) },
    ]);
    await expect(page.getByTestId('converter-file-card')).toHaveCount(2, { timeout: 15000 });
  });

  test('portrait to landscape viewport change after selection keeps preview and action reachable', async ({ page }) => {
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    await select(page, { name: 'rotate.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expectAcceptedPreview(page);
    await page.setViewportSize({ width: 915, height: 412 });
    await expect(page.getByTestId('converter-file-card').first()).toBeVisible();
    await expect(page.getByTestId('converter-run')).toBeVisible();
    const g = await page.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth }));
    expect(g.sw).toBeLessThanOrEqual(g.w + 2);
  });

  for (const locale of ['en', 'ja']) {
    test(`${locale} mobile route performs accepted-file state transition and real preview`, async ({ page }) => {
      await page.goto(`/${locale}/jpg-png-webp-image-converter`, { waitUntil: 'domcontentloaded' });
      await select(page, { name: `${locale}-mobile.png`, mimeType: 'image/png', buffer: square });
      await expectAcceptedPreview(page);
      await expect(page.getByTestId('converter-run')).toBeVisible();
      await expect(page.getByTestId('converter-run')).toBeEnabled();
    });
  }

  test('canvas export returning null must terminate as visible error, never hang processing', async ({ page }) => {
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    await select(page, { name: 'toblob-null.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expectAcceptedPreview(page);
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.toBlob = function(callback: BlobCallback) { setTimeout(() => callback(null), 0); } as typeof HTMLCanvasElement.prototype.toBlob;
    });
    await page.getByTestId('converter-run').tap();
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toHaveAttribute('data-status', 'error', { timeout: 20000 });
    await expect(page.getByTestId('converter-run')).toBeEnabled();
  });

  test('download URL creation failure must not silently crash the page', async ({ page }) => {
    const runtime: string[] = [];
    page.on('pageerror', e => runtime.push(String(e.message || e)));
    await page.goto(ko, { waitUntil: 'domcontentloaded' });
    await select(page, { name: 'download-fail.jpg', mimeType: 'image/jpeg', buffer: sample });
    await expectAcceptedPreview(page);
    await page.getByTestId('converter-run').tap();
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await page.evaluate(() => { URL.createObjectURL = (() => { throw new Error('V18_DOWNLOAD_OBJECTURL_FAIL'); }) as typeof URL.createObjectURL; });
    const button = card.getByRole('button', { name: /다운로드|Download|保存/ }).first();
    await button.tap();
    await page.waitForTimeout(100);
    expect(runtime, 'download failure must be handled instead of escaping as pageerror').toEqual([]);
  });
});

// V18_COVERAGE_MARKERS: en mobile route | ja mobile route
