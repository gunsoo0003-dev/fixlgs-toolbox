import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function fileNames(page: import('@playwright/test').Page) {
  return page.getByTestId('tool028-file-card').locator('h3').allTextContents();
}

async function resultBytes(page: import('@playwright/test').Page): Promise<Uint8Array> {
  const href = await page.getByTestId('tool028-download').getAttribute('href');
  expect(href).toBeTruthy();
  const numbers = await page.evaluate(async (url) => {
    const response = await fetch(url!);
    return Array.from(new Uint8Array(await response.arrayBuffer()));
  }, href);
  return Uint8Array.from(numbers);
}

test('028 reorders whole files and generated PDF uses the latest order', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  const cards = page.getByTestId('tool028-file-card');
  await cards.nth(1).getByRole('button', { name: /맨앞/ }).click();
  expect(await fileNames(page)).toEqual(['B-3pages.pdf', 'A-2pages.pdf']);
  await page.getByTestId('tool028-merge-button').click();
  await expect(page.getByTestId('tool028-result')).toBeVisible({ timeout: 60_000 });

  const merged = await PDFDocument.load(await resultBytes(page));
  expect(merged.getPageCount()).toBe(5);
  const sizes = merged.getPages().map((pdfPage) => [Math.round(pdfPage.getWidth()), Math.round(pdfPage.getHeight())]);
  expect(sizes).toEqual([
    [612, 792], [612, 792], [612, 792],
    [595, 842], [595, 842],
  ]);
});

test('028 preserves mixed page sizes and orientations without rasterizing to one size', async ({ page }) => {
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/C-mixed-pages.pdf',
    'tests/fixtures/tool-028/A-2pages.pdf',
  ]);
  await page.getByTestId('tool028-merge-button').click();
  await expect(page.getByTestId('tool028-result')).toBeVisible({ timeout: 60_000 });
  const merged = await PDFDocument.load(await resultBytes(page));
  const sizes = merged.getPages().map((pdfPage) => [Math.round(pdfPage.getWidth()), Math.round(pdfPage.getHeight())]);
  expect(sizes.slice(0, 3)).toEqual([[595, 842], [842, 595], [612, 792]]);
});

test('028 opens all-page thumbnail preview and navigates pages', async ({ page }) => {
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  await page.getByTestId('tool028-file-card').first().getByRole('button', { name: 'Page preview' }).click();
  await expect(page.getByTestId('tool028-preview-dialog')).toBeVisible();
  await expect(page.getByTestId('tool028-preview-canvas')).toBeVisible();
  await expect(page.getByTestId('tool028-preview-thumbnails').getByRole('button')).toHaveCount(2);
  await page.getByTestId('tool028-preview-dialog').getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByTestId('tool028-preview-dialog')).toContainText('2 / 2');
});

test('028 delete and reset clear current state without touching other files first', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  await page.getByTestId('tool028-file-card').first().getByRole('button', { name: /삭제/ }).click();
  await expect(page.getByTestId('tool028-file-count')).toHaveText('1');
  await page.getByRole('button', { name: '전체 초기화' }).click();
  await expect(page.getByTestId('tool028-file-count')).toHaveText('0');
  await expect(page.getByTestId('tool028-page-count')).toHaveText('0');
});
