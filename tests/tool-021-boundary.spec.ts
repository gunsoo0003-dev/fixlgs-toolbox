import { test, expect } from "@playwright/test";
import path from "node:path";

const f = (name:string) => path.join(process.cwd(),'test-fixtures/tool-021',name);

test.beforeEach(async ({page}) => { await page.goto('/ko/social-media-image-maker'); });

test('corrupted image is rejected', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('corrupted.jpg'));
  await expect(page.locator('[data-testid="tool021-error"]')).toBeVisible();
});

test('MIME/extension mismatch is rejected', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('mismatch.png'));
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/확장자|형식/);
});

test('animated WebP and APNG are rejected', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('animated.webp'));
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/애니메이션/);
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('animated.png'));
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/애니메이션/);
});

test('title and description enforce 120/240 character limits', async ({page}) => {
  // TOOL 021 intentionally opens on the start screen; enter the blank editor first.
  await page.locator('[data-testid="tool021-start-blank"]').click();
  const title = page.locator('[data-testid="tool021-title"]');
  const subtitle = page.locator('[data-testid="tool021-subtitle"]');
  await title.fill('T'.repeat(120));
  await subtitle.fill('D'.repeat(240));
  await expect(title).toHaveValue('T'.repeat(120));
  await expect(subtitle).toHaveValue('D'.repeat(240));
  await expect(title).toHaveAttribute('maxlength','120');
  await expect(subtitle).toHaveAttribute('maxlength','240');
});

test('canvas encode failure is surfaced without false success', async ({page}) => {
  await page.locator('[data-testid="tool021-start-blank"]').click();
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = function(callback) { callback(null); };
  });
  await page.locator('[data-testid="tool021-download-current"]').click();
  await expect(page.locator('[data-testid="tool021-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool021-status"]')).not.toContainText(/완료/);
});

test('ZIP partial generation failure preserves successful individual output', async ({page}) => {
  await page.locator('[data-testid="tool021-start-blank"]').click();
  // Keep only Instagram Post and Story selected so the fallback is deterministic.
  for (const id of ['facebook-feed','x-post','linkedin-post']) {
    await page.locator(`[data-testid="tool021-select-${id}"]`).uncheck();
  }
  await page.locator('[data-testid="tool021-format"]').selectOption('png');
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    let calls = 0;
    HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
      calls += 1;
      if (calls === 2) { callback(null); return; }
      return original.call(this, callback, type, quality);
    };
  });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-testid="tool021-download-zip"]').click(),
  ]);
  expect(download.suggestedFilename()).toBe('social-design-instagram-post.png');
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/성공한 파일|개별/);
});
