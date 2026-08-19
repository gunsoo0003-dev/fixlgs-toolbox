import { expect, test } from '@playwright/test';
for (const locale of ['ko','en','ja'] as const) {
  test(`TOOL047 ${locale} initial state and mount contract`, async ({page}) => {
    await page.goto(`/${locale}/dday-anniversary-calculator`);
    await expect(page.getByTestId('tool047-root')).toBeVisible();
    await expect(page.getByTestId('tool047-workspace')).toBeVisible();
    await expect(page.getByTestId('tool047-mode-dday')).toHaveAttribute('aria-selected','true');
    await expect(page.getByTestId('tool047-mode-birthday')).toHaveAttribute('aria-selected','false');
    await expect(page.getByTestId('tool047-mode-anniversary')).toHaveAttribute('aria-selected','false');
    await expect(page.getByTestId('tool047-reference')).toBeVisible();
    await expect(page.getByTestId('tool047-target')).toBeVisible();
    await expect(page.getByTestId('tool047-event')).toBeVisible();
    await expect(page.getByTestId('tool047-birthday')).toHaveCount(0);
    await expect(page.getByTestId('tool047-start')).toHaveCount(0);
    await expect(page.getByTestId('tool047-custom-milestone')).toHaveCount(0);
    await expect(page.getByTestId('tool047-reset')).toBeEnabled();
    await expect(page.getByTestId('tool047-result')).toBeVisible();
    await expect(page.getByTestId('tool047-copy')).toBeEnabled();
    await expect(page.getByTestId('tool047-error')).toHaveCount(0);
  });
}
