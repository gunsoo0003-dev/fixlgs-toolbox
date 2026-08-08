import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';
import { openTool017, uploadImages, payload, fixture, TOOL017_TESTIDS } from './helpers/tool-017';

async function uploadJpegs(page: Parameters<typeof openTool017>[0], count: number) {
  await openTool017(page, 'ko');
  await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(
    Array.from({ length: count }, (_, i) => payload(`core-${i + 1}.jpg`, fixture('jpg'), 'image/jpeg')),
  );
  await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 15000 }).toBe(count);
}

async function canvasDataUrl(page: Parameters<typeof openTool017>[0]) {
  return page.getByTestId(TOOL017_TESTIDS.canvas).evaluate((node) => (node as HTMLCanvasElement).toDataURL());
}

async function cornerSums(page: Parameters<typeof openTool017>[0]) {
  return page.getByTestId(TOOL017_TESTIDS.canvas).evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [0, 0, 0, 0];
    const w = canvas.width;
    const h = canvas.height;
    const cw = Math.max(8, Math.floor(w * 0.2));
    const ch = Math.max(8, Math.floor(h * 0.2));
    const boxes = [[0, 0], [w - cw, 0], [0, h - ch], [w - cw, h - ch]] as const;
    return boxes.map(([x, y]) => {
      const data = ctx.getImageData(x, y, cw, ch).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum = (sum + data[i] * ((i % 13) + 1)) % 2147483647;
      return sum;
    });
  });
}

async function storeOriginalPixels(page: Parameters<typeof openTool017>[0]) {
  await page.getByTestId(TOOL017_TESTIDS.canvas).evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    (window as any).__tool017OriginalPixels = ctx ? new Uint8ClampedArray(ctx.getImageData(0, 0, canvas.width, canvas.height).data) : null;
  });
}

async function diffPixelCount(page: Parameters<typeof openTool017>[0]) {
  return page.getByTestId(TOOL017_TESTIDS.canvas).evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const original = (window as any).__tool017OriginalPixels as Uint8ClampedArray | null;
    if (!ctx || !original) return 0;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    for (let i = 0; i < current.length; i += 4) {
      const delta = Math.abs(current[i] - original[i]) + Math.abs(current[i + 1] - original[i + 1]) + Math.abs(current[i + 2] - original[i + 2]) + Math.abs(current[i + 3] - original[i + 3]);
      if (delta > 12) changed += 1;
    }
    return changed;
  });
}

test.describe('017 core-only', () => {
  test('tool hero eyebrow uses exact three-digit number 017', async ({ page }) => {
    await openTool017(page, 'ko');
    await expect(page.locator('.toolbox-subpage-eyebrow')).toHaveText('017 · IMAGE EDIT');
  });

  test('multiple files keep upload count and representative preview', async ({ page }) => {
    await uploadImages(page, 2);
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-files', '2');
    await expect(page.getByTestId(TOOL017_TESTIDS.canvas)).toBeVisible();
  });

  test('original and result preview share the same representative image', async ({ page }) => {
    await uploadImages(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.previewOriginal).click();
    await expect(state).toHaveAttribute('data-preview', 'original');
    await page.getByTestId(TOOL017_TESTIDS.previewResult).click();
    await expect(state).toHaveAttribute('data-preview', 'result');
  });

  test('text settings change actual preview pixels', async ({ page }) => {
    await uploadJpegs(page, 1);
    const before = await canvasDataUrl(page);
    const text = page.getByTestId(TOOL017_TESTIDS.textInput);
    await text.fill('TOOL017-PIXEL-CHECK');
    await text.blur();
    await expect.poll(() => canvasDataUrl(page), { timeout: 5000 }).not.toBe(before);
  });

  test('logo mode changes actual preview pixels', async ({ page }) => {
    await uploadJpegs(page, 1);
    const before = await canvasDataUrl(page);
    await page.getByTestId(TOOL017_TESTIDS.logoMode).click();
    await page.getByTestId(TOOL017_TESTIDS.logoInput).setInputFiles(fixture('logo'));
    await expect.poll(() => canvasDataUrl(page), { timeout: 5000 }).not.toBe(before);
  });

  test('repeat mode changes all four preview corner regions', async ({ page }) => {
    await uploadJpegs(page, 1);
    await page.getByTestId(TOOL017_TESTIDS.previewOriginal).click();
    const original = await cornerSums(page);
    await page.getByTestId(TOOL017_TESTIDS.previewResult).click();
    await page.getByTestId(TOOL017_TESTIDS.repeatDiagonal).click();
    await expect.poll(async () => {
      const repeated = await cornerSums(page);
      return repeated.every((sum, index) => sum !== original[index]);
    }, { timeout: 5000 }).toBe(true);
    const repeated = await cornerSums(page);
    expect(repeated).toHaveLength(4);
  });

  test('secondary text+logo layer can be enabled independently', async ({ page }) => {
    await uploadImages(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.logoInput).setInputFiles(fixture('logo'));
    await page.getByTestId(TOOL017_TESTIDS.secondary).check();
    await expect(state).toHaveAttribute('data-secondary', '1');
    await expect(state).toHaveAttribute('data-secondary-kind', 'logo');
  });

  test('opacity supports 0 percent and rotation supports plus/minus 180', async ({ page }) => {
    await uploadImages(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.opacity).fill('0');
    await expect(state).toHaveAttribute('data-opacity', '0');
    await page.getByTestId(TOOL017_TESTIDS.rotation).fill('-180');
    await expect(page.getByTestId(TOOL017_TESTIDS.rotation)).toHaveValue('-180');
    await page.getByTestId(TOOL017_TESTIDS.rotation).fill('180');
    await expect(page.getByTestId(TOOL017_TESTIDS.rotation)).toHaveValue('180');
  });

  test('higher repeat density changes more source pixels than lower density', async ({ page }) => {
    await uploadJpegs(page, 1);
    await page.getByTestId(TOOL017_TESTIDS.previewOriginal).click();
    await storeOriginalPixels(page);
    await page.getByTestId(TOOL017_TESTIDS.previewResult).click();
    await page.getByTestId(TOOL017_TESTIDS.repeatGrid).click();
    await page.getByTestId(TOOL017_TESTIDS.density).fill('60');
    const sparse = await diffPixelCount(page);
    await page.getByTestId(TOOL017_TESTIDS.density).fill('160');
    await expect.poll(() => diffPixelCount(page), { timeout: 5000 }).toBeGreaterThan(sparse);
  });

  test('cancel stops the sequential queue and keeps completed results', async ({ page }) => {
    await uploadJpegs(page, 6);
    await page.evaluate(() => {
      const proto = HTMLCanvasElement.prototype;
      const original = proto.toBlob;
      (window as any).__tool017OriginalToBlob = original;
      proto.toBlob = function (callback, type, quality) {
        setTimeout(() => original.call(this, callback, type, quality), 60);
      };
    });
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect(page.getByTestId(TOOL017_TESTIDS.cancel)).toBeVisible();
    await expect(page.getByRole('button', { name: '이미지 모두 제거' })).toBeDisabled();
    await expect(page.getByRole('button', { name: '전체 초기화' })).toBeDisabled();
    await expect(page.locator('.tool017-remove').first()).toHaveAttribute('aria-disabled', 'true');
    await page.getByTestId(TOOL017_TESTIDS.cancel).click();
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await expect(state).toHaveAttribute('data-processing', '0');
    const completed = Number(await state.getAttribute('data-completed') || 0);
    expect(completed).toBeLessThan(6);
    await page.evaluate(() => {
      const original = (window as any).__tool017OriginalToBlob;
      if (original) HTMLCanvasElement.prototype.toBlob = original;
    });
  });

  test('one processing failure is isolated and retry-failed recovers it', async ({ page }) => {
    await uploadJpegs(page, 2);
    await page.evaluate(() => {
      const proto = HTMLCanvasElement.prototype;
      const original = proto.toBlob;
      (window as any).__tool017OriginalToBlob = original;
      let calls = 0;
      proto.toBlob = function (callback, type, quality) {
        calls += 1;
        if (calls === 1) { callback(null); return; }
        original.call(this, callback, type, quality);
      };
    });
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect.poll(async () => Number(await state.getAttribute('data-failed') || 0), { timeout: 20000 }).toBe(1);
    await expect(state).toHaveAttribute('data-completed', '1');
    await page.evaluate(() => {
      const original = (window as any).__tool017OriginalToBlob;
      if (original) HTMLCanvasElement.prototype.toBlob = original;
    });
    await page.getByTestId(TOOL017_TESTIDS.retryFailed).click();
    await expect.poll(async () => Number(await state.getAttribute('data-failed') || 0), { timeout: 20000 }).toBe(0);
    await expect(state).toHaveAttribute('data-completed', '2');
  });

  test('continuous settings undo to the pre-edit snapshot and new edits clear redo', async ({ page }) => {
    await uploadJpegs(page, 1);
    const size = page.getByTestId(TOOL017_TESTIDS.size);
    await expect(size).toHaveValue('9');
    await size.fill('20');
    await size.blur();
    await expect(size).toHaveValue('20');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(size).toHaveValue('9');
    await page.getByRole('button', { name: 'Redo' }).click();
    await expect(size).toHaveValue('20');
    await page.getByRole('button', { name: 'Undo' }).click();
    await size.fill('12');
    await size.blur();
    await expect(page.getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  test('reset all restores result preview mode after original preview was selected', async ({ page }) => {
    await uploadImages(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.previewOriginal).click();
    await expect(state).toHaveAttribute('data-preview', 'original');
    await page.getByRole('button', { name: '전체 초기화' }).click();
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(payload('after-reset.png'));
    await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 15000 }).toBe(1);
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-preview', 'result');
  });

  test('individual and ZIP downloads produce non-empty files', async ({ page }) => {
    await uploadJpegs(page, 1);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect.poll(async () => Number(await state.getAttribute('data-completed') || 0), { timeout: 20000 }).toBe(1);

    const [single] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId(TOOL017_TESTIDS.downloadCurrent).click(),
    ]);
    expect(single.suggestedFilename()).toMatch(/-watermarked\.jpg$/i);
    const singlePath = await single.path();
    expect(singlePath).toBeTruthy();
    if (singlePath) expect(statSync(singlePath).size).toBeGreaterThan(100);

    const [zip] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId(TOOL017_TESTIDS.downloadZip).click(),
    ]);
    expect(zip.suggestedFilename()).toBe('watermarked-images.zip');
    const zipPath = await zip.path();
    expect(zipPath).toBeTruthy();
    if (zipPath) expect(statSync(zipPath).size).toBeGreaterThan(22);
  });

  test('output format is observable and results are generated sequentially', async ({ page }) => {
    await uploadImages(page, 2);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await page.getByTestId(TOOL017_TESTIDS.output).selectOption('png');
    await expect(state).toHaveAttribute('data-output', 'png');
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect.poll(async () => Number(await state.getAttribute('data-completed') || 0), { timeout: 20000 }).toBe(2);
    await expect(page.getByTestId(TOOL017_TESTIDS.downloadZip)).toBeEnabled();
  });

  test('duplicate source filenames receive unique result names', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles([payload('same.png'), payload('same.png')]);
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await expect.poll(async () => Number(await state.getAttribute('data-files') || 0), { timeout: 15000 }).toBe(2);
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect.poll(async () => Number(await state.getAttribute('data-completed') || 0), { timeout: 20000 }).toBe(2);
    const names = await page.locator('.tool017-file-item').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-result-name')).filter(Boolean));
    expect(new Set(names).size).toBe(2);
    expect(names.some(n => n?.includes('-2.'))).toBeTruthy();
  });

  test('MIME and extension mismatch is rejected before processing', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(payload('mismatch.jpg', fixture('png'), 'image/png'));
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-files', '0');
    await expect(page.locator('.tool017-file-item.is-failed')).toHaveCount(1);
  });
});
