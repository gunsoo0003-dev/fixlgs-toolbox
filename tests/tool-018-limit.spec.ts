import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { validateTool018Files } from '../lib/image-metadata';
import { openTool018, TOOL018_FIXTURES } from './helpers/tool-018';
import { TOOL018_LIMIT_CANDIDATES } from './config/tool-018-limit-candidates';

function fakeSizedFiles(totalBytes: number): File[] {
  const files: File[] = [];
  let remaining = totalBytes;
  let index = 0;
  while (remaining > 0) {
    const size = Math.min(TOOL018_LIMIT_CANDIDATES.maxFileBytes, remaining);
    files.push({ name: `total-${index}.jpg`, size } as File);
    remaining -= size;
    index += 1;
  }
  return files;
}

function syntheticPng(width: number, height: number) {
  const chunks: Buffer[] = [];
  const signature = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const chunk = (type: string, data: Buffer) => {
    const out = Buffer.alloc(12 + data.length, 0);
    out.writeUInt32BE(data.length, 0); out.write(type, 4, 4, 'ascii'); data.copy(out, 8);
    return out; // CRC is not needed by the local structural parser used in this boundary test.
  };
  const ihdr = Buffer.alloc(13, 0); ihdr.writeUInt32BE(width,0); ihdr.writeUInt32BE(height,4); ihdr[8]=8; ihdr[9]=2;
  chunks.push(signature, chunk('IHDR', ihdr), chunk('IDAT', Buffer.from([0])), chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

test.describe('018 conservative service-limit candidate', () => {
  test.beforeEach(async ({ page }) => { await openTool018(page); });

  test('state exposes service-limit candidate values for cross-check', async ({ page }) => {
    const state = page.getByTestId('tool018-state');
    await expect(state).toHaveAttribute('data-max-files', String(TOOL018_LIMIT_CANDIDATES.maxFiles));
    await expect(state).toHaveAttribute('data-max-file-bytes', String(TOOL018_LIMIT_CANDIDATES.maxFileBytes));
    await expect(state).toHaveAttribute('data-max-total-bytes', String(TOOL018_LIMIT_CANDIDATES.maxTotalBytes));
    await expect(state).toHaveAttribute('data-max-pixels', String(TOOL018_LIMIT_CANDIDATES.maxPixels));
  });

  test('accepts file-count value immediately below candidate, candidate, and rejects one above it', async ({ page }) => {
    const buffer = fs.readFileSync(TOOL018_FIXTURES.noExif);
    const before = Array.from({ length: TOOL018_LIMIT_CANDIDATES.maxFiles - 1 }, (_, i) => ({ name: `before-${i}.jpg`, mimeType: 'image/jpeg', buffer }));
    await page.getByTestId('tool018-input').setInputFiles(before);
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-files', String(TOOL018_LIMIT_CANDIDATES.maxFiles - 1));
    await page.getByText('전체 초기화').click();
    const valid = Array.from({ length: TOOL018_LIMIT_CANDIDATES.maxFiles }, (_, i) => ({ name: `ok-${i}.jpg`, mimeType: 'image/jpeg', buffer }));
    await page.getByTestId('tool018-input').setInputFiles(valid);
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-files', String(TOOL018_LIMIT_CANDIDATES.maxFiles));
    await page.getByText('전체 초기화').click();
    const over = Array.from({ length: TOOL018_LIMIT_CANDIDATES.maxFiles + 1 }, (_, i) => ({ name: `over-${i}.jpg`, mimeType: 'image/jpeg', buffer }));
    await page.getByTestId('tool018-input').setInputFiles(over);
    await expect(page.getByText(`이미지는 최대 ${TOOL018_LIMIT_CANDIDATES.maxFiles}개까지 선택할 수 있습니다.`)).toBeVisible();
  });

  test('accepts exact per-file byte candidate and rejects one byte above before parsing', async ({ page }) => {
    const exactErrors = validateTool018Files([{ name: 'exact.jpg', size: TOOL018_LIMIT_CANDIDATES.maxFileBytes } as File]);
    expect(exactErrors.some((value) => value.startsWith('FILE_TOO_LARGE'))).toBeFalsy();
    const buffer = Buffer.alloc(TOOL018_LIMIT_CANDIDATES.maxFileBytes + 1, 0);
    await page.getByTestId('tool018-input').setInputFiles({ name: 'too-large.jpg', mimeType: 'image/jpeg', buffer });
    await expect(page.getByText('파일당 15MB까지 지원합니다.')).toBeVisible();
  });

  test('accepts total-byte candidate boundary and rejects one byte above it', async () => {
    const before = validateTool018Files(fakeSizedFiles(TOOL018_LIMIT_CANDIDATES.maxTotalBytes - 1));
    const exact = validateTool018Files(fakeSizedFiles(TOOL018_LIMIT_CANDIDATES.maxTotalBytes));
    const over = validateTool018Files(fakeSizedFiles(TOOL018_LIMIT_CANDIDATES.maxTotalBytes + 1));

    expect(before).not.toContain('TOTAL_TOO_LARGE');
    expect(exact).not.toContain('TOTAL_TOO_LARGE');
    expect(over).toContain('TOTAL_TOO_LARGE');
  });

  test('accepts 48MP candidate and rejects a small pixel overage', async ({ page }) => {
    const pixelHeight = 6000;
    const candidateWidth = TOOL018_LIMIT_CANDIDATES.maxPixels / pixelHeight;
    expect(Number.isInteger(candidateWidth)).toBeTruthy();

    const before = syntheticPng(candidateWidth - 1, pixelHeight);
    await page.getByTestId('tool018-input').setInputFiles({ name: 'pixels-before.png', mimeType: 'image/png', buffer: before });
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-ready', '1');
    await page.getByText('전체 초기화').click();

    const exact = syntheticPng(candidateWidth, pixelHeight);
    await page.getByTestId('tool018-input').setInputFiles({ name: 'pixels-exact.png', mimeType: 'image/png', buffer: exact });
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-ready', '1');
    await expect(page.getByTestId('tool018-basic-info')).toContainText('48.00 MP');
    await page.getByText('전체 초기화').click();

    const over = syntheticPng(candidateWidth + 1, pixelHeight);
    await page.getByTestId('tool018-input').setInputFiles({ name: 'pixels-over.png', mimeType: 'image/png', buffer: over });
    await expect(page.getByTestId('tool018-root').getByRole('alert').filter({ hasText: '이미지 해상도가 기본 서비스 범위를 넘었습니다.' })).toBeVisible();
    await expect(page.getByTestId('tool018-state')).toHaveAttribute('data-ready', '0');
  });
});
