import { test, expect } from '@playwright/test';
import { TOOL029_FINAL_LIMITS } from './config/tool-029-limits';
import { createSizedValidPdf } from './helpers/tool-029-limit-file';

const MIB=1024*1024;

test('029 final limit accepts exact page count 300 in plan and rejects 301', async ({ page }) => {
  expect(TOOL029_FINAL_LIMITS.pages).toBe(300);
  await page.goto('/ko/split-extract-pdf');
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-300p.pdf');
  await page.getByTestId('tool029-mode-individual').click();
  await expect(page.getByTestId('tool029-plan')).toContainText('300');
  await expect(page.getByTestId('tool029-process')).toBeEnabled();
  await page.getByTestId('tool029-new-pdf').click();
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-301p.pdf');
  await expect(page.getByTestId('tool029-error')).toContainText('300페이지');
});

test('029 final range-item limit accepts 100 and rejects 101', async ({ page }) => {
  await page.goto('/ko/split-extract-pdf');
  await page.getByTestId('tool029-file-input').setInputFiles('tests/fixtures/tool-029/tool029-10p.pdf');
  const hundred=Array.from({length:100},()=> '1').join(' / ');
  const hundredOne=Array.from({length:101},()=> '1').join(' / ');
  await page.getByTestId('tool029-range-input').fill(hundred);
  await expect(page.getByTestId('tool029-process')).toBeEnabled();
  await page.getByTestId('tool029-range-input').fill(hundredOne);
  await expect(page.getByTestId('tool029-process')).toBeDisabled();
  await expect(page.getByTestId('tool029-action-panel').getByText(/100개|100 range|100件/)).toBeVisible();
});

test('029 final file-size limit accepts exact 50 MiB and rejects +1 byte', async ({ page }) => {
  test.setTimeout(120_000);
  const exact=createSizedValidPdf('tests/fixtures/tool-029/tool029-1p.pdf',50*MIB);
  const over=createSizedValidPdf('tests/fixtures/tool-029/tool029-1p.pdf',50*MIB+1);
  try{
    await page.goto('/ko/split-extract-pdf');
    await page.getByTestId('tool029-file-input').setInputFiles(exact.file);
    await expect(page.getByTestId('tool029-settings')).toBeVisible({timeout:60_000});
    await page.getByTestId('tool029-new-pdf').click();
    await page.getByTestId('tool029-file-input').setInputFiles(over.file);
    await expect(page.getByTestId('tool029-error')).toContainText('50MB');
  } finally { exact.cleanup(); over.cleanup(); }
});

test('029 final limits remain synchronized', async () => {
  expect(TOOL029_FINAL_LIMITS).toEqual({fileMiB:50,pages:300,outputFiles:300,rangeItems:100});
});
