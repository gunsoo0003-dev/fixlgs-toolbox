import { test, expect } from '@playwright/test';

test('028 rejects a fake PDF with a named error', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles('tests/fixtures/tool-028/fake.pdf');
  await expect(page.getByTestId('tool028-error')).toContainText('fake.pdf');
  await expect(page.getByTestId('tool028-file-count')).toHaveText('0');
});

test('028 rejects encrypted PDF and keeps valid inputs', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/encrypted.pdf',
  ]);
  await expect(page.getByTestId('tool028-file-count')).toHaveText('1');
  await expect(page.getByTestId('tool028-error')).toContainText('encrypted.pdf');
});

test('028 permits intentional duplicate files as independent items', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/A-2pages.pdf',
  ]);
  await expect(page.getByTestId('tool028-file-count')).toHaveText('2');
  await expect(page.getByTestId('tool028-page-count')).toHaveText('4');
});

test('028 requires at least two PDFs before merge', async ({ page }) => {
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles('tests/fixtures/tool-028/A-2pages.pdf');
  await expect(page.getByTestId('tool028-merge-button')).toBeDisabled();
});

test('028 normalizes output filename and prevents duplicate pdf extension', async ({ page }) => {
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  await page.getByTestId('tool028-filename').fill('  report<>:"/\\|?*.pdf.pdf  ');
  await page.getByTestId('tool028-merge-button').click();
  await expect(page.getByTestId('tool028-result')).toBeVisible({ timeout: 60_000 });
  const download = await page.getByTestId('tool028-download').getAttribute('download');
  expect(download).toBe('report---------.pdf');
});
