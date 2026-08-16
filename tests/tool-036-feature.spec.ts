import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const fixture = (name: string) => path.resolve('tests/fixtures/tool-036', name);

test('TOOL036 goals, WPM and complete clear state', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool036-file-info')).toContainText('sample.txt');
  await page.getByTestId('tool036-options').locator('summary').click();
  await page.getByTestId('tool036-goal-toggle').check();
  await page.getByTestId('tool036-character-goal').fill('10');
  await expect(page.getByTestId('tool036-core-stats')).toContainText('characters over');
  await page.getByTestId('tool036-word-goal').fill('10');
  await page.getByTestId('tool036-wpm').selectOption('150');
  await page.getByTestId('tool036-clear').click();
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('');
  await expect(page.getByTestId('tool036-file-info')).toHaveCount(0);
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('0');
  await expect(page.getByTestId('tool036-workspace')).toHaveAttribute('data-drag-active', 'false');
});

test('TOOL036 file choose loads TXT and unsupported file shows error', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('Hello file.\nSecond line.');
  await expect(page.getByTestId('tool036-file-info')).toContainText('sample.txt');
  await page.getByTestId('tool036-file-input').setInputFiles(fixture('invalid.json'));
  await expect(page.getByTestId('tool036-error')).toContainText('TXT, MD, and CSV');
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('Hello file.\nSecond line.');
});

test('TOOL036 drag and drop loads one file into the same workspace', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  const content = 'Dropped text.\nSecond line.';
  await page.getByTestId('tool036-workspace').evaluate((el, value) => {
    const dt = new DataTransfer();
    dt.items.add(new File([value], 'dropped.md', { type: 'text/markdown' }));
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }));
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
  }, content);
  await expect(page.getByTestId('tool036-textarea')).toHaveValue(content);
  await expect(page.getByTestId('tool036-file-info')).toContainText('dropped.md');
  await expect(page.getByTestId('tool036-workspace')).toHaveAttribute('data-drag-active', 'false');
  await expect(page.locator('[data-testid="tool036-workspace"]')).toHaveCount(1);
});

test('TOOL036 TXT download uses current edited content', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-file-input').setInputFiles(fixture('sample.txt'));
  await page.getByTestId('tool036-textarea').fill('Edited 한글 text 😀');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('tool036-download-text').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-edited.txt');
  const saved = path.resolve('tests/fixtures/tool-036/.download-check.txt');
  await download.saveAs(saved);
  expect(await fs.readFile(saved, 'utf8')).toBe('Edited 한글 text 😀');
  await fs.rm(saved, { force: true });
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('Edited 한글 text 😀');
});

test('TOOL036 localized sample text is available', async ({ page }) => {
  await page.goto('/ja/character-document-counter');
  await page.getByTestId('tool036-sample').click();
  await expect(page.getByTestId('tool036-textarea')).not.toHaveValue('');
  await expect.poll(async () => Number((await page.getByTestId('tool036-words').innerText()).replace(/,/g, ''))).toBeGreaterThan(1);
});

test('TOOL036 replacing an existing job requires cancel or confirm', async ({ page }) => {
  await page.goto('/ko/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('기존 작업을 보존해야 합니다.');
  await page.getByTestId('tool036-file-input').setInputFiles(fixture('sample.md'));
  await expect(page.getByTestId('tool036-replace-dialog')).toBeVisible();
  await expect(page.getByTestId('tool036-replace-dialog')).toContainText('초기화');

  await page.getByTestId('tool036-replace-cancel').click();
  await expect(page.getByTestId('tool036-replace-dialog')).toHaveCount(0);
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('기존 작업을 보존해야 합니다.');
  await expect(page.getByTestId('tool036-file-info')).toHaveCount(0);

  await page.getByTestId('tool036-file-input').setInputFiles(fixture('sample.md'));
  await expect(page.getByTestId('tool036-replace-dialog')).toBeVisible();
  await page.getByTestId('tool036-replace-confirm').click();
  await expect(page.getByTestId('tool036-replace-dialog')).toHaveCount(0);
  await expect(page.getByTestId('tool036-file-info')).toContainText('sample.md');
  await expect(page.getByTestId('tool036-textarea')).toContainText('한글 문서 테스트입니다.');
});

test('TOOL036 replacement by drag uses the same confirmation contract', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('Keep this text');
  await page.getByTestId('tool036-workspace').evaluate((el) => {
    const dt = new DataTransfer();
    dt.items.add(new File(['Replacement by drag'], 'replacement.txt', { type: 'text/plain' }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
  });
  await expect(page.getByTestId('tool036-replace-dialog')).toBeVisible();
  await page.getByTestId('tool036-replace-cancel').click();
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('Keep this text');
});
