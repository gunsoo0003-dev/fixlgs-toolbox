import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { openTool016, upload016, TOOL016_TESTIDS } from './helpers/tool-016';

const LIMITS = {
  fileBytes: 15 * 1024 * 1024,
  pixels: 12_000_000,
  side: 6_000,
  layers: 20,
  textChars: 2_000,
  history: 30,
} as const;

const FILE_FIXTURE_DIR = resolve(tmpdir(), 'fixlgs-toolbox-tool016-limit-fixtures');
const fileFixture = (name: string) => resolve(FILE_FIXTURE_DIR, name);

test.describe('016 limit-only service boundary checks', () => {
  test('exposes the applied service limits in the actual tool DOM', async ({ page }) => {
    await openTool016(page);
    const root = page.getByTestId(TOOL016_TESTIDS.root);
    await expect(root).toHaveAttribute('data-max-file-bytes', String(LIMITS.fileBytes));
    await expect(root).toHaveAttribute('data-max-pixels', String(LIMITS.pixels));
    await expect(root).toHaveAttribute('data-max-side', String(LIMITS.side));
    await expect(root).toHaveAttribute('data-max-layers', String(LIMITS.layers));
    await expect(root).toHaveAttribute('data-max-text-chars', String(LIMITS.textChars));
    await expect(root).toHaveAttribute('data-max-history', String(LIMITS.history));
  });

  test('accepts just below and exactly 15 MiB, then rejects one byte over', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles(fileFixture('file-before.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(fileFixture('file-limit.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(fileFixture('file-over.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('15MB');
  });

  test('accepts just below and exactly 12,000,000 pixels, then rejects over', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles('test-fixtures/tool016-pixels-before.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-pixels-limit.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-pixels-over.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('1,200만 픽셀');
  });

  test('accepts 5,999px and exactly 6,000px, then rejects 6,001px', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles('test-fixtures/tool016-side-before.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-side-limit.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-side-over.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('6,000px');
  });

  test('allows 19 and exactly 20 text layers, then rejects the 21st', async ({ page }) => {
    await upload016(page);
    const add = page.getByRole('button', { name: '글자 추가' });
    for (let i = 0; i < LIMITS.layers - 1; i += 1) await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers - 1);
    await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers);
    await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers);
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('최대 20개');
  });

  test('allows 1,999 and exactly 2,000 characters, then rejects 2,001', async ({ page }) => {
    await upload016(page);
    await page.getByRole('button', { name: '본문 추가' }).click();
    const input = page.getByTestId(TOOL016_TESTIDS.content);
    const before = '가'.repeat(LIMITS.textChars - 1);
    const exact = '가'.repeat(LIMITS.textChars);
    await input.fill(before);
    await expect(input).toHaveValue(before);
    await input.fill(exact);
    await expect(input).toHaveValue(exact);
    await input.fill(exact + '나');
    await expect(input).toHaveValue(exact);
  });

  test('keeps undo history capped at 30 completed edits', async ({ page }) => {
    await upload016(page);
    await page.getByRole('button', { name: '제목 추가' }).click();
    const bold = page.getByRole('button', { name: '굵게' });
    for (let i = 0; i < LIMITS.history + 5; i += 1) await bold.click();
    const undo = page.getByRole('button', { name: '실행 취소' });
    for (let i = 0; i < LIMITS.history; i += 1) await undo.click();
    await expect(undo).toBeDisabled();
  });
});
