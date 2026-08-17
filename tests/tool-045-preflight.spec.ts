import { expect, test } from '@playwright/test';

for (const locale of ['ko','en','ja'] as const) {
  test(`TOOL045 ${locale} initial state inventory`, async ({ page }) => {
    await page.goto(`/${locale}/date-difference-calculator`);
    await expect(page.getByTestId('tool045-root')).toBeVisible();
    await expect(page.getByTestId('tool045-workspace')).toBeVisible();
    await expect(page.getByTestId('tool045-start')).toHaveValue('');
    await expect(page.getByTestId('tool045-end')).toHaveValue('');
    await expect(page.getByTestId('tool045-include-start')).not.toBeChecked();
    await expect(page.getByTestId('tool045-reset')).toBeDisabled();
    await expect(page.getByTestId('tool045-empty-result')).toBeVisible();
    await expect(page.getByTestId('tool045-result')).toHaveCount(0);
    await expect(page.getByTestId('tool045-error')).toHaveCount(0);
  });
}
