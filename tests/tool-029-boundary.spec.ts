import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { uploadTool029 } from './helpers/tool-029';

test('029 rejects non-PDF signature', async ({ page }) => {
  await page.goto('/ko/split-extract-pdf');
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-not-pdf.pdf');
  await expect(page.getByTestId('tool029-error')).toContainText('PDF 서명');
});

test('029 rejects corrupt and encrypted PDFs without bypass', async ({ page }) => {
  await page.goto('/ko/split-extract-pdf');
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-corrupt.pdf');
  await expect(page.getByTestId('tool029-error')).toContainText(/읽을 수 없습니다|비밀번호/);
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-encrypted.pdf');
  await expect(page.getByTestId('tool029-error')).toContainText(/비밀번호|지원하지 않는/);
});

test('029 validates reverse, out-of-range and consecutive separators', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-range-input').fill('5-3');
  await expect(page.getByTestId('tool029-root').getByText(/역방향|Reverse|逆方向/)).toBeVisible();
  await page.getByTestId('tool029-range-input').fill('1-11');
  await expect(page.getByTestId('tool029-action-panel').getByText(/총 페이지 수를 넘는|exceeds the document page count|総ページ数を超える/)).toBeVisible();
  await page.getByTestId('tool029-range-input').fill('1,,3');
  await expect(page.getByTestId('tool029-root').getByText(/문법|syntax|ページ指定/)).toBeVisible();
  await expect(page.getByTestId('tool029-process')).toBeDisabled();
});

test('029 one-page PDF never creates empty even result', async ({ page }) => {
  await uploadTool029(page,'tests/fixtures/tool-029/tool029-1p.pdf');
  await page.getByTestId('tool029-mode-odd-even').click();
  await page.getByLabel(/짝수 페이지만|Even pages only|偶数ページのみ/).check();
  await expect(page.getByTestId('tool029-process')).toBeDisabled();
});

test('029 sanitizes long and Windows-invalid virtual filenames', async ({ page }) => {
  const buffer=fs.readFileSync('tests/fixtures/tool-029/tool029-2p.pdf');
  await page.goto('/ko/split-extract-pdf');
  await page.getByTestId('tool029-file-input').setInputFiles({name:`../${'긴파일명'.repeat(35)}:*?<>|.pdf`,mimeType:'application/pdf',buffer});
  await expect(page.getByTestId('tool029-prefix')).not.toHaveValue(/[/\\:*?"<>|]/);
  await expect(page.getByTestId('tool029-prefix')).toHaveValue(/.{1,100}/);
});

test('029 duplicate split ranges keep outputs but avoid filename collisions', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-range-input').fill('1-3 / 1-3');
  await expect(page.getByTestId('tool029-plan')).toContainText('tool029-10p-pages-001-003.pdf');
  await expect(page.getByTestId('tool029-plan')).toContainText('tool029-10p-pages-001-003-2.pdf');
  await expect(page.getByTestId('tool029-root').getByText(/중복 포함|included in more than one|重複して含まれ/)).toBeVisible();
});
