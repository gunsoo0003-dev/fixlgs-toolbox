import { expect, test } from '@playwright/test';

const route = '/ko/jpg-png-webp-image-converter';

async function injectGeneratedImage(page: import('@playwright/test').Page, width: number, height: number, name = 'mobile-memory-large.png') {
  await page.evaluate(async ({ width, height, name }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3569a8'; ctx.fillRect(0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('fixture-blob')), 'image/png'));
    canvas.width = 0; canvas.height = 0;
    const input = document.querySelector('[data-testid="converter-file-input"]') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File([blob], name, { type: 'image/png', lastModified: Date.now() }));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { width, height, name });
}

test.describe('TOOL001 mobile memory safety V23', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V23_MOBILE_LONG_SIDE_IS_CAPPED_AT_2048_ON_EXPORT', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(route);
    await injectGeneratedImage(page, 3000, 2000);
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await expect(card).toContainText(/2048\s*[×x]\s*1365|2048/);
  });

  test('V23_DECODE_TIMEOUT_RETURNS_MEMORY_FEEDBACK_NOT_HANG', async ({ page }) => {
    test.setTimeout(16000);
    await page.goto(route);
    await page.evaluate(() => {
      (window as any).createImageBitmap = () => new Promise(() => {});
      const NativeImage = window.Image;
      (window as any).Image = class extends NativeImage { set src(_v: string) {} };
    });
    await injectGeneratedImage(page, 800, 600, 'decode-hang.png');
    await expect(page.locator('.toolbox-workbench-notice')).toContainText(/메모리|크거나|작은 이미지/, { timeout: 16000 });
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
  });

  test('V23_EXPORT_CANVAS_IS_RELEASED_AFTER_CONVERSION', async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => {
      const native = document.createElement.bind(document);
      (window as any).__v23Canvases = [];
      document.createElement = ((tag: string, options?: ElementCreationOptions) => {
        const el = native(tag, options);
        if (tag.toLowerCase() === 'canvas') (window as any).__v23Canvases.push(el);
        return el;
      }) as typeof document.createElement;
    });
    await injectGeneratedImage(page, 1200, 800, 'cleanup.png');
    await expect(page.getByTestId('converter-file-card').first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('converter-run').tap();
    await expect(page.getByTestId('converter-file-card').first()).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    const leftover = await page.evaluate(() => ((window as any).__v23Canvases as HTMLCanvasElement[]).filter(c => c.width > 0 || c.height > 0).map(c => [c.width,c.height]));
    expect(leftover).toEqual([]);
  });
});
