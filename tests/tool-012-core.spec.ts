import { expect, test, type Download, type Page } from '@playwright/test';
import path from 'node:path';

const TOOL_URL = '/ko/image-border-rounded-corners-tool';
const JPG = path.join(process.cwd(), 'public', 'test-fixtures', 'sample.jpg');
const PNG = path.join(process.cwd(), 'public', 'test-fixtures', 'transparent.png');

async function openTool(page: Page, fixture = JPG) {
  const response = await page.goto(TOOL_URL);
  expect(response?.ok()).toBeTruthy();

  // Upload state and edit state are separate render branches.
  // The root/editor test ids only exist after a valid image has decoded.
  const fileInput = page.getByTestId('tool012-file');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles(fixture);

  await expect(page.getByTestId('tool012-root')).toBeVisible();
  await expect(page.getByTestId('tool012-editor')).toBeVisible();
}

async function setLinkedRadius(page: Page, value: number) {
  const row = page.locator('.padding-range').filter({ hasText: '모서리 반경' });
  await row.locator('input[type="range"]').fill(String(value));
  await expect(row.locator('input[inputmode="numeric"]')).toHaveValue(String(value));
}

async function downloadPng(page: Page): Promise<Download> {
  await page.getByTestId('tool012-output-format').selectOption('png');
  const promise = page.waitForEvent('download');
  await page.getByTestId('tool012-download').click();
  const download = await promise;
  await expect(page.getByTestId('tool012-status')).toContainText('다운로드 준비 완료');
  return download;
}

async function readDownload(download: Download) {
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  if (stream) for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  expect(bytes.length).toBeGreaterThan(100);
  return bytes;
}

async function samplePngPixel(page: Page, bytes: Buffer, x: number, y: number) {
  const b64 = bytes.toString('base64');
  return page.evaluate(async ({ b64, x, y }) => {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const blob = new Blob([raw], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    const rgba = Array.from(ctx.getImageData(x, y, 1, 1).data);
    bitmap.close();
    return { width: canvas.width, height: canvas.height, rgba };
  }, { b64, x, y });
}

test('012 route loads and accepts JPG/PNG input with original/result workspace', async ({ page }) => {
  await openTool(page, PNG);
  await expect(page.getByText('원본 보기', { exact: true })).toBeVisible();
  await expect(page.getByText('결과 보기', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tool012-result-size')).toContainText('640 × 480px');
});

test('linked radius, individual corners, undo and redo operate on settings state', async ({ page }) => {
  await openTool(page);
  await setLinkedRadius(page, 80);
  const undo = page.getByRole('button', { name: '실행 취소' });
  const redo = page.getByRole('button', { name: '다시 실행' });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(redo).toBeEnabled();
  await redo.click();
  await page.getByRole('button', { name: '값 연결' }).click();
  const cornerInputs = page.locator('.padding-four input');
  await expect(cornerInputs).toHaveCount(4);
  await cornerInputs.nth(0).fill('12');
  await cornerInputs.nth(2).fill('36');
  await expect(cornerInputs.nth(0)).toHaveValue('12');
  await expect(cornerInputs.nth(2)).toHaveValue('36');
});

test('circle mode preserves the whole rectangular source in a square result canvas', async ({ page }) => {
  await openTool(page);
  await page.getByTestId('tool012-mode-circle').click();
  await expect(page.getByTestId('tool012-output-size')).toHaveText('1000 × 1000px');
  await expect(page.getByTestId('tool012-result-size')).toContainText('1000 × 1000px');
});

test('outside border expands result dimensions and exposes all three alignments', async ({ page }) => {
  await openTool(page);
  await page.getByTestId('tool012-border-toggle').check();
  await expect(page.getByRole('button', { name: '안쪽', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '중앙', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '바깥쪽', exact: true }).click();
  await expect(page.getByTestId('tool012-output-size')).toHaveText('816 × 616px');
});

test('shadow auto padding expands canvas using blur/spread/offset bounds', async ({ page }) => {
  await openTool(page);
  await page.getByTestId('tool012-shadow-toggle').check();
  await expect(page.getByText('자동 여백', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tool012-output-size')).toHaveText('896 × 696px');
});

test('rounded PNG download contains real transparent corner pixels at original resolution', async ({ page }) => {
  await openTool(page);
  await setLinkedRadius(page, 80);
  const download = await downloadPng(page);
  expect(download.suggestedFilename()).toMatch(/\.png$/i);
  const bytes = await readDownload(download);
  const corner = await samplePngPixel(page, bytes, 0, 0);
  const center = await samplePngPixel(page, bytes, 400, 300);
  expect(corner.width).toBe(800);
  expect(corner.height).toBe(600);
  expect(corner.rgba[3]).toBeLessThan(32);
  expect(center.rgba[3]).toBeGreaterThan(240);
});

test('border is rendered into downloaded pixels and reset-all returns to upload state', async ({ page }) => {
  await openTool(page);
  await setLinkedRadius(page, 60);
  await page.getByTestId('tool012-border-toggle').check();
  const thickness = page.locator('.padding-range').filter({ hasText: '두께' }).locator('input[type="range"]');
  await thickness.fill('12');
  const download = await downloadPng(page);
  const bytes = await readDownload(download);
  const topCenter = await samplePngPixel(page, bytes, 400, 2);
  expect(topCenter.rgba[0]).toBeLessThan(20);
  expect(topCenter.rgba[1]).toBeLessThan(20);
  expect(topCenter.rgba[2]).toBeLessThan(20);
  expect(topCenter.rgba[3]).toBeGreaterThan(240);

  await page.getByRole('button', { name: '전체 초기화' }).click();
  await expect(page.getByTestId('tool012-editor')).toHaveCount(0);
  await expect(page.getByText('이미지를 여기에 놓으세요', { exact: true })).toBeVisible();
});
