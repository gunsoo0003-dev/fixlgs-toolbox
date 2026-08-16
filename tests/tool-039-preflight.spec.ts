import { expect, test } from '@playwright/test';

const route = '/ko/list-sorter-duplicate-remover';

test('TOOL039 initial contract: workspace, source, options and disabled actions', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByTestId('tool039-root')).toBeVisible();
  await expect(page.getByTestId('tool039-local-notice')).toBeVisible();
  await expect(page.getByTestId('tool039-workspace')).toHaveAttribute('data-drag-active', 'false');
  await expect(page.getByTestId('tool039-file-input')).toHaveAttribute('accept', /\.txt/);
  await expect(page.getByTestId('tool039-file-button')).toBeVisible();
  await expect(page.getByTestId('tool039-start-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool039-source')).toHaveValue('');
  const options = page.getByTestId('tool039-options');
  await expect(options).not.toHaveAttribute('open', /.*/);
  for (const mode of ['dedupe','text','numeric','reverse','shuffle']) {
    const radio = page.getByTestId(`tool039-mode-${mode}`);
    await expect(radio).toBeAttached();
  }
  await expect(page.getByTestId('tool039-mode-dedupe')).toBeChecked();
  await options.locator('summary').click();
  await expect(options).toHaveAttribute('open', '');
  for (const mode of ['dedupe','text','numeric','reverse','shuffle']) {
    await expect(page.getByTestId(`tool039-mode-${mode}`).locator('xpath=ancestor::label')).toBeVisible();
  }
  await expect(page.getByTestId('tool039-copy')).toBeDisabled();
  await expect(page.getByTestId('tool039-download')).toBeDisabled();
  await expect(page.getByTestId('tool039-result')).toHaveValue('');
});
