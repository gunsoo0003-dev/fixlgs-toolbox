import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { expect, test } from '@playwright/test';

const root = process.cwd();
const samplePath = path.join(root, 'test-fixtures', 'sample.jpg');
const route = '/ko/jpg-png-webp-image-converter';

test.describe('TOOL001 mobile rejected-input feedback and silent-dead-state guard', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('zero-byte selection must not look silently accepted', async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const input = page.getByTestId('converter-file-input');
    await input.setInputFiles({ name: 'empty.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(0) });
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
    await expect(page.locator('.toolbox-upload-focus')).toBeVisible();
    await expect(page.locator('.toolbox-workbench-notice')).toBeVisible();
    const text = await page.locator('.toolbox-workbench-notice').innerText();
    expect(text).toMatch(/제외|추가할 수|손상|제한/);
  });

  test('11-file selection must cap at 10 and leave visible feedback', async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const b = fs.readFileSync(samplePath);
    await page.getByTestId('converter-file-input').setInputFiles(Array.from({ length: 11 }, (_, i) => ({ name: `mobile-count-${i}.jpg`, mimeType: 'image/jpeg', buffer: b })));
    await expect(page.getByTestId('converter-file-card')).toHaveCount(10, { timeout: 20_000 });
    await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
    await expect(page.locator('.toolbox-upload-active')).toBeVisible();
    await expect(page.locator('.toolbox-workbench-notice')).toContainText(/제외|10/);
  });

  test('aggregate-byte guard rejects the file that would cross 60MB and stays responsive', async ({ page }) => {
    test.setTimeout(120_000);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tool001-mobile-aggregate-'));
    try {
      const base = fs.readFileSync(samplePath);
      const targetSize = 16 * 1024 * 1024;
      const padded = Buffer.concat([base, Buffer.alloc(Math.max(0, targetSize - base.length))]);
      const tempFiles = Array.from({ length: 4 }, (_, i) => {
        const filePath = path.join(tempDir, `aggregate-${i}.jpg`);
        fs.writeFileSync(filePath, padded);
        return filePath;
      });

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Use real file paths, not Playwright in-memory buffers. The protocol has a
      // ~50MB payload ceiling, while this scenario intentionally selects 64MB.
      await page.getByTestId('converter-file-input').setInputFiles(tempFiles);
      await expect(page.getByTestId('converter-file-card')).toHaveCount(3, { timeout: 60_000 });
      await expect(page.locator('.toolbox-upload-active')).toBeVisible();
      await expect(page.locator('.toolbox-workbench-notice')).toContainText(/제외|제한/);
      await expect(page.getByTestId('converter-run')).toBeVisible();
      await expect(page.getByTestId('converter-run')).toBeEnabled();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
