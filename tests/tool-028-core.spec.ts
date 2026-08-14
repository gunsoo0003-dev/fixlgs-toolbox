import { test, expect } from '@playwright/test';

for (const locale of ['ko', 'en', 'ja']) {
  test(`028 core ${locale}: two PDFs preserve totals and merge`, async ({ page }) => {
    await page.goto(`/${locale}/merge-pdf`);
    await expect(page.getByTestId('tool028-root')).toBeVisible();
    await page.getByTestId('tool028-file-input').setInputFiles([
      'tests/fixtures/tool-028/A-2pages.pdf',
      'tests/fixtures/tool-028/B-3pages.pdf',
    ]);
    await expect(page.getByTestId('tool028-file-count')).toHaveText('2');
    await expect(page.getByTestId('tool028-page-count')).toHaveText('5');
    await page.getByTestId('tool028-filename').fill('core-result');
    await page.getByTestId('tool028-merge-button').click();
    await expect(page.getByTestId('tool028-result')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('tool028-result')).toContainText('5');
    await expect(page.getByTestId('tool028-download')).toHaveAttribute('download', 'core-result.pdf');
  });
}
