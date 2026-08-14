import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MiB = 1024 * 1024;

async function makePdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([595, 842]);
  return await doc.save({ useObjectStreams: false });
}

function paddedPdf(base: Uint8Array, targetBytes: number): Buffer {
  if (base.byteLength > targetBytes) throw new Error(`base PDF ${base.byteLength} > target ${targetBytes}`);
  const out = Buffer.alloc(targetBytes, 0x20);
  Buffer.from(base).copy(out, 0);
  return out;
}

test('028 approved service-limit contract is visible in live product', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  const root = page.getByTestId('tool028-root');
  await expect(root).toHaveAttribute('data-max-files', '20');
  await expect(root).toHaveAttribute('data-max-file-bytes', String(30 * MiB));
  await expect(root).toHaveAttribute('data-max-total-bytes', String(100 * MiB));
  await expect(root).toHaveAttribute('data-max-total-pages', '300');
  await expect(root).toHaveAttribute('data-preview-concurrency', '1');
  await expect(page.getByText(/서비스 한도: 최대 20개/)).toBeVisible();
});

test('028 rejects 30MiB + 1 before PDF parsing', async ({ page }) => {
  const dir = mkdtempSync(join(tmpdir(), 'tool028-limit-file-'));
  const file = join(dir, 'over-30mib.pdf');
  try {
    const body = Buffer.alloc(30 * MiB + 1, 0x20);
    body.write('%PDF-1.7\n', 0, 'latin1');
    writeFileSync(file, body);
    await page.goto('/en/merge-pdf');
    await page.getByTestId('tool028-file-input').setInputFiles(file);
    await expect(page.getByTestId('tool028-error')).toContainText('30MB per-file limit');
    await expect(page.getByTestId('tool028-file-count')).toHaveText('0');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('028 accepts 20 files and rejects the 21st', async ({ page }) => {
  const bytes = await makePdf(1);
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles(
    Array.from({ length: 20 }, (_, i) => ({ name: `ok-${String(i + 1).padStart(2, '0')}.pdf`, mimeType: 'application/pdf', buffer: Buffer.from(bytes) }))
  );
  await expect(page.getByTestId('tool028-file-count')).toHaveText('20', { timeout: 60_000 });
  await page.getByTestId('tool028-file-input').setInputFiles({ name: 'twenty-first.pdf', mimeType: 'application/pdf', buffer: Buffer.from(bytes) });
  await expect(page.getByTestId('tool028-error')).toContainText('20-file limit');
  await expect(page.getByTestId('tool028-file-count')).toHaveText('20');
});

test('028 rejects input that would exceed 100MiB total', async ({ page }) => {
  const base = await makePdf(1);
  const dir = mkdtempSync(join(tmpdir(), 'tool028-limit-total-'));
  try {
    const paths = [] as string[];
    for (let i = 0; i < 4; i++) {
      const file = join(dir, `chunk-${i + 1}.pdf`);
      writeFileSync(file, paddedPdf(base, 26 * MiB));
      paths.push(file);
    }
    await page.goto('/ko/merge-pdf');
    await page.getByTestId('tool028-file-input').setInputFiles(paths);
    await expect(page.getByTestId('tool028-file-count')).toHaveText('3', { timeout: 90_000 });
    await expect(page.getByTestId('tool028-error')).toContainText('총 입력 한도 100MB');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('028 accepts 300 total pages and rejects the next page', async ({ page }) => {
  const p300 = await makePdf(300);
  const p1 = await makePdf(1);
  await page.goto('/ja/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles({ name: '300-pages.pdf', mimeType: 'application/pdf', buffer: Buffer.from(p300) });
  await expect(page.getByTestId('tool028-page-count')).toHaveText('300', { timeout: 90_000 });
  await page.getByTestId('tool028-file-input').setInputFiles({ name: 'one-more.pdf', mimeType: 'application/pdf', buffer: Buffer.from(p1) });
  await expect(page.getByTestId('tool028-error')).toContainText('合計300ページの上限');
  await expect(page.getByTestId('tool028-page-count')).toHaveText('300');
});
