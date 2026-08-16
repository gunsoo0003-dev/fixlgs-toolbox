import { expect, test } from '@playwright/test';
import path from 'node:path';

const route = '/ko/list-sorter-duplicate-remover';
const fixture = (name: string) => path.resolve('tests/fixtures/tool-039', name);

test('TOOL039 whitespace, blank lines, unicode and EOL semantics remain intact', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('😀\n\n A \nCafé\n日本語');
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId('tool039-mode-reverse').check();
  await expect(page.getByTestId('tool039-result')).toHaveValue('日本語\nCafé\n A \n\n😀');
});

test('TOOL039 empty input is deterministic', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId('tool039-mode-numeric').check();
  await expect(page.getByTestId('tool039-result')).toHaveValue('');
});

test('TOOL039 unsupported file does not destroy current work', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('existing\nwork');
  await page.getByTestId('tool039-file-input').setInputFiles(fixture('invalid.json'));
  await expect(page.getByTestId('tool039-error')).toContainText('TXT, MD, CSV');
  await expect(page.getByTestId('tool039-source')).toHaveValue('existing\nwork');
});

test('TOOL039 file replacement requires confirmation and cancel preserves work', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool039-file-info')).toContainText('sample.txt');
  await page.getByTestId('tool039-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool039-replace-dialog')).toBeVisible();
  await page.getByTestId('tool039-replace-cancel').click();
  await expect(page.getByTestId('tool039-file-info')).toContainText('sample.txt');
});

test('TOOL039 entire active workspace owns drag state and replacement flow', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('existing');
  await page.getByTestId('tool039-workspace').evaluate((el) => {
    const dt = new DataTransfer();
    dt.items.add(new File(['replacement'], 'replacement.md', { type: 'text/markdown' }));
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }));
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
  });
  await expect(page.getByTestId('tool039-workspace')).toHaveAttribute('data-drag-active', 'true');
  await page.getByTestId('tool039-workspace').evaluate((el) => {
    const dt = new DataTransfer();
    dt.items.add(new File(['replacement'], 'replacement.md', { type: 'text/markdown' }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
  });
  await expect(page.getByTestId('tool039-replace-dialog')).toBeVisible();
  await page.getByTestId('tool039-replace-cancel').click();
  await expect(page.getByTestId('tool039-source')).toHaveValue('existing');
  await expect(page.getByTestId('tool039-workspace')).toHaveCount(1);
  await expect(page.getByTestId('tool039-workspace')).toHaveAttribute('data-drag-active', 'false');
});
