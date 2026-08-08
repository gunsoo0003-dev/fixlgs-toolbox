import { test, expect } from '@playwright/test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MiB, TOOL017_LIMIT_CANDIDATES as L } from './config/tool-017-limit-candidates';
import { openTool017, payload, fixture, TOOL017_TESTIDS } from './helpers/tool-017';

function sizedPng(name: string, bytes: number) {
  const base = readFileSync(fixture('png'));
  if (bytes < base.length) throw new Error(`requested payload ${bytes} is smaller than fixture ${base.length}`);
  return { name, mimeType: 'image/png', buffer: Buffer.concat([base, Buffer.alloc(bytes - base.length)]) };
}
function sizedPngPath(dir: string, name: string, bytes: number) {
  const base = readFileSync(fixture('png'));
  if (bytes < base.length) throw new Error(`requested payload ${bytes} is smaller than fixture ${base.length}`);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name);
  writeFileSync(filePath, Buffer.concat([base, Buffer.alloc(bytes - base.length)]));
  return filePath;
}

test.describe('017 limit-only', () => {
  test('service candidate constants match product source', async () => {
    const source = readFileSync('components/image-watermark-tool.tsx', 'utf8');
    expect(source).toContain(`maxFiles: ${L.selectedFiles.candidate}`);
    expect(source).toContain(`maxPerFile: ${L.perFileBytes.candidate / MiB} * 1024 * 1024`);
    expect(source).toContain(`maxTotalBytes: ${L.totalBytes.candidate / MiB} * 1024 * 1024`);
    expect(source).toContain(`maxPixelsPerFile: ${L.sourcePixels.candidate.toLocaleString('en-US').replaceAll(',', '_')}`);
    expect(source).toContain(`maxOutputPixels: ${L.outputPixels.candidate.toLocaleString('en-US').replaceAll(',', '_')}`);
    expect(source).toContain(`maxLength={${L.textLength.candidate}}`);
  });

  test('candidate and above-candidate file count are distinguished', async ({ page }) => {
    await openTool017(page, 'ko');
    const candidate = Array.from({ length: L.selectedFiles.candidate }, (_, i) => payload(`candidate-${i + 1}.png`));
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(candidate);
    await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 25000 }).toBe(L.selectedFiles.candidate);
    await page.reload();
    await openTool017(page, 'ko');
    const above = Array.from({ length: L.selectedFiles.above }, (_, i) => payload(`above-${i + 1}.png`));
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(above);
    await expect(page.getByTestId(TOOL017_TESTIDS.error)).toContainText(String(L.selectedFiles.candidate));
    await expect(page.locator('.tool017-file-item')).toHaveCount(0);
  });

  test('per-file byte candidate is accepted and above candidate is rejected', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(sizedPng('15m.png', L.perFileBytes.candidate));
    await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 20000 }).toBe(1);
    await page.reload();
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(sizedPng('16m.png', L.perFileBytes.above));
    await expect(page.locator('.tool017-file-item.is-failed')).toHaveCount(1);
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-files', '0');
  });

  test('total byte candidate is accepted and above candidate is rejected before decode', async ({ page }) => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'tool017-limit-'));
    try {
      await openTool017(page, 'ko');
      const fiveMiB = 5 * MiB;
      const candidate = Array.from({ length: 16 }, (_, i) => sizedPngPath(tempDir, `total-${i + 1}.png`, fiveMiB));
      await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(candidate);
      await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 30000 }).toBe(16);
      await page.reload();
      await openTool017(page, 'ko');
      const above = [...candidate, sizedPngPath(tempDir, 'total-over.png', 1 * MiB)];
      await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(above);
      await expect(page.getByTestId(TOOL017_TESTIDS.error)).toBeVisible();
      await expect(page.locator('.tool017-file-item')).toHaveCount(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('24MP source/output candidate processes while above-source candidate is rejected', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles({ name: 'candidate-24mp.png', mimeType: 'image/png', buffer: readFileSync('test-fixtures/tool017-24mp.png') });
    const state = page.getByTestId(TOOL017_TESTIDS.state);
    await expect.poll(async () => Number(await state.getAttribute('data-files') || 0), { timeout: 30000 }).toBe(1);
    await page.getByTestId(TOOL017_TESTIDS.output).selectOption('png');
    await page.getByTestId(TOOL017_TESTIDS.processAll).click();
    await expect.poll(async () => Number(await state.getAttribute('data-completed') || 0), { timeout: 60000 }).toBe(1);

    await page.reload();
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles({ name: 'above-24mp.png', mimeType: 'image/png', buffer: readFileSync('test-fixtures/tool017-over-24mp.png') });
    await expect(page.locator('.tool017-file-item.is-failed')).toHaveCount(1);
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-files', '0');
  });

  test('text length candidate is retained and above candidate is truncated at the UI boundary', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(payload('text-limit.png'));
    await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 15000 }).toBe(1);
    const input = page.getByTestId(TOOL017_TESTIDS.textInput);
    await input.fill('A'.repeat(L.textLength.candidate));
    expect((await input.inputValue()).length).toBe(L.textLength.candidate);
    await input.fill('B'.repeat(L.textLength.above));
    expect((await input.inputValue()).length).toBe(L.textLength.candidate);
  });

  test('opacity boundary includes 0 and 100', async ({ page }) => {
    await openTool017(page, 'ko');
    await page.getByTestId(TOOL017_TESTIDS.input).setInputFiles(payload('opacity.png'));
    await expect.poll(async () => Number(await page.getByTestId(TOOL017_TESTIDS.state).getAttribute('data-files') || 0), { timeout: 15000 }).toBe(1);
    const opacity = page.getByTestId(TOOL017_TESTIDS.opacity);
    await opacity.fill('0');
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-opacity', '0');
    await opacity.fill('100');
    await expect(page.getByTestId(TOOL017_TESTIDS.state)).toHaveAttribute('data-opacity', '100');
  });
});
