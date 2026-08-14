import { test, expect } from '@playwright/test';

async function externalFileDrag(page: import('@playwright/test').Page) {
  return page.evaluateHandle(() => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([new Uint8Array([37, 80, 68, 70, 45])], 'drag-probe.pdf', { type: 'application/pdf' }));
    return dataTransfer;
  });
}

test('028 shared external drag state covers dropzone and workspace', async ({ page }) => {
  await page.goto('/ko/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  const dropzone = page.getByTestId('tool028-dropzone');
  const workspace = page.getByTestId('tool028-workspace');
  await expect(workspace).toBeVisible();

  const fromTop = await externalFileDrag(page);
  await dropzone.dispatchEvent('dragenter', { dataTransfer: fromTop });
  await expect(dropzone).toHaveAttribute('data-drag-active', 'true');
  await expect(workspace).toHaveAttribute('data-drag-active', 'true');
  await dropzone.dispatchEvent('dragleave', { dataTransfer: fromTop });
  await expect(dropzone).toHaveAttribute('data-drag-active', 'false');
  await expect(workspace).toHaveAttribute('data-drag-active', 'false');

  const fromWorkspace = await externalFileDrag(page);
  await workspace.dispatchEvent('dragenter', { dataTransfer: fromWorkspace });
  await expect(dropzone).toHaveAttribute('data-drag-active', 'true');
  await expect(workspace).toHaveAttribute('data-drag-active', 'true');
  await workspace.dispatchEvent('dragleave', { dataTransfer: fromWorkspace });
  await expect(dropzone).toHaveAttribute('data-drag-active', 'false');
  await expect(workspace).toHaveAttribute('data-drag-active', 'false');
});

test('028 internal reorder drag stays separate from external PDF add state', async ({ page }) => {
  await page.goto('/en/merge-pdf');
  await page.getByTestId('tool028-file-input').setInputFiles([
    'tests/fixtures/tool-028/A-2pages.pdf',
    'tests/fixtures/tool-028/B-3pages.pdf',
  ]);
  const cards = page.getByTestId('tool028-file-card');
  const handles = cards.locator('button[draggable="true"]');
  await handles.first().dragTo(cards.nth(1));
  await expect(cards.first().locator('h3')).toHaveText('B-3pages.pdf');
  await expect(page.getByTestId('tool028-dropzone')).toHaveAttribute('data-drag-active', 'false');
  await expect(page.getByTestId('tool028-workspace')).toHaveAttribute('data-drag-active', 'false');
});
