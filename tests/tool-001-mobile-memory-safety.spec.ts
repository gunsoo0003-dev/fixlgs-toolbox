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

async function setWorkerDiagnostic(page: import('@playwright/test').Page, fault: string, timeoutMs?: number) {
  await page.evaluate(({ fault, timeoutMs }) => {
    (window as any).__TOOL001_WORKER_DIAGNOSTIC__ = { fault, timeoutMs };
    (window as any).__TOOL001_WORKER_LAST_DIAGNOSTIC__ = undefined;
    (window as any).__TOOL001_WORKER_LAST_ERROR__ = undefined;
  }, { fault, timeoutMs });
}

test.describe.skip('OBSOLETE V27 worker internals — V57R2 GOLDEN uses ImageData path', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('V27_MOBILE_LONG_SIDE_IS_CAPPED_AT_2048_ON_WORKER_EXPORT', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(route);
    await injectGeneratedImage(page, 3000, 2000);
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    await expect(card).toContainText(/2048\s*[×x]\s*1365|2048/);
  });

  test('V27_WORKER_CREATEIMAGEBITMAP_REQUESTS_DOWNSCALED_DECODE', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(route);
    await setWorkerDiagnostic(page, 'report-options');
    await injectGeneratedImage(page, 3000, 2000, 'scaled-worker-decode.png');
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    const diagnostic = await page.evaluate(() => (window as any).__TOOL001_WORKER_LAST_DIAGNOSTIC__);
    expect(diagnostic?.bitmapOptions?.resizeWidth).toBe(2048);
    expect(diagnostic?.bitmapOptions?.resizeHeight).toBe(1365);
    expect(diagnostic?.outputWidth).toBe(2048);
  });

  test('V27_WORKER_DECODE_TIMEOUT_RETURNS_MEMORY_FEEDBACK_NOT_HANG', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto(route);
    await setWorkerDiagnostic(page, 'bitmap-hang', 1200);
    await injectGeneratedImage(page, 800, 600, 'worker-decode-hang.png');
    const card = page.getByTestId('converter-file-card').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await page.getByTestId('converter-run').tap();
    await expect(card).toHaveAttribute('data-status', 'error', { timeout: 10000 });
    await expect(page.locator('.toolbox-workbench-notice')).toContainText(/메모리|크거나|작은 이미지/, { timeout: 10000 });
  });

  test('V27_MAINTHREAD_FALLBACK_CANVAS_IS_RELEASED_WHEN_WORKER_EXPORT_FAILS', async ({ page }) => {
    await page.goto(route);
    await setWorkerDiagnostic(page, 'export-throw');
    await page.evaluate(() => {
      const native = document.createElement.bind(document);
      (window as any).__v27Canvases = [];
      document.createElement = ((tag: string, options?: ElementCreationOptions) => {
        const el = native(tag, options);
        if (tag.toLowerCase() === 'canvas') (window as any).__v27Canvases.push(el);
        return el;
      }) as typeof document.createElement;
    });
    await injectGeneratedImage(page, 1200, 800, 'cleanup-worker-fallback.png');
    await expect(page.getByTestId('converter-file-card').first()).toBeVisible({ timeout: 15000 });
    await page.getByTestId('converter-run').tap();
    await expect(page.getByTestId('converter-file-card').first()).toHaveAttribute('data-status', 'done', { timeout: 30000 });
    const workerError = await page.evaluate(() => (window as any).__TOOL001_WORKER_LAST_ERROR__);
    expect(workerError).toContain('worker-diagnostic-export');
    const leftover = await page.evaluate(() => ((window as any).__v27Canvases as HTMLCanvasElement[]).filter(c => c.width > 0 || c.height > 0).map(c => [c.width,c.height]));
    expect(leftover).toEqual([]);
  });
});
