import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const fixture = (name: string) => path.resolve('tests/fixtures/tool-039', name);

function multiset(lines: string[]) {
  const m = new Map<string, number>();
  for (const line of lines) m.set(line, (m.get(line) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

test('TOOL039 five modes are independently selectable and options are collapsed initially', async ({ page }) => {
  await page.goto('/en/list-sorter-duplicate-remover');
  await expect(page.getByTestId('tool039-options')).not.toHaveAttribute('open', /.*/);
  await page.getByTestId('tool039-options').locator('summary').click();
  for (const mode of ['dedupe','text','numeric','reverse','shuffle']) await expect(page.getByTestId(`tool039-mode-${mode}`)).toBeVisible();
  await expect(page.getByTestId('tool039-mode-dedupe')).toBeChecked();
});

test('TOOL039 reset returns to initial 037/038-style state', async ({ page }) => {
  await page.goto('/ja/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-source').fill('3\n1\n2');
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId('tool039-mode-numeric').check();
  await page.getByTestId('tool039-reset').click();
  await expect(page.getByTestId('tool039-source')).toHaveValue('');
  await expect(page.getByTestId('tool039-result')).toHaveValue('');
  await expect(page.getByTestId('tool039-start-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool039-mode-dedupe')).toBeChecked();
  await expect(page.getByTestId('tool039-workspace')).toHaveAttribute('data-drag-active', 'false');
});

test('TOOL039 file loading uses the real file lifecycle', async ({ page }) => {
  await page.goto('/en/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool039-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool039-source')).toContainText('Apple');
  await expect(page.getByTestId('tool039-start-dropzone')).toHaveCount(0);
});

test('TOOL039 download uses the actual result output and expected filename', async ({ page }) => {
  await page.goto('/ko/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-source').fill('3\n1\n3\n2');
  await expect(page.getByTestId('tool039-copy')).toBeEnabled();
  await expect(page.getByTestId('tool039-download')).toBeEnabled();
  await expect(page.getByTestId('tool039-download')).toHaveText('TXT 다운로드');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('tool039-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('processed-list.txt');
  const saved = path.resolve('tests/fixtures/tool-039/.download-check.txt');
  await download.saveAs(saved);
  expect(await fs.readFile(saved, 'utf8')).toBe('3\n1\n2');
  await fs.rm(saved, { force: true });
  await expect(page.getByTestId('tool039-status')).toHaveText('TXT 파일을 저장했습니다.');
});

test('TOOL039 replacement confirmation applies the new file and resets mode', async ({ page }) => {
  await page.goto('/en/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-source').fill('3\n1\n2');
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId('tool039-mode-numeric').check();
  await page.getByTestId('tool039-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool039-replace-dialog')).toBeVisible();
  await page.getByTestId('tool039-replace-confirm').click();
  await expect(page.getByTestId('tool039-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool039-source')).toContainText('Apple');
  await expect(page.getByTestId('tool039-mode-dedupe')).toBeChecked();
});

test('TOOL039 shuffle preserves multiset and reshuffle stays source-based', async ({ page }) => {
  await page.goto('/en/list-sorter-duplicate-remover');
  const src = Array.from({ length: 20 }, (_, i) => String(i + 1));
  await page.getByTestId('tool039-source').fill(src.join('\n'));
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId('tool039-mode-shuffle').check();
  const first = (await page.getByTestId('tool039-result').inputValue()).split('\n');
  expect(first).toHaveLength(src.length);
  expect(multiset(first)).toEqual(multiset(src));
  expect(await page.getByTestId('tool039-reshuffle').isEnabled()).toBeTruthy();
  let changed = first.join('\n') !== src.join('\n');
  for (let i = 0; i < 5 && !changed; i += 1) {
    await page.getByTestId('tool039-reshuffle').click();
    const next = (await page.getByTestId('tool039-result').inputValue()).split('\n');
    expect(multiset(next)).toEqual(multiset(src));
    changed = next.join('\n') !== src.join('\n');
  }
  expect(changed).toBeTruthy();
});
