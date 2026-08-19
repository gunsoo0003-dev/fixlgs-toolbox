import { expect, test } from '@playwright/test';
for (const locale of ['ko','en','ja'] as const) {
  test(`TOOL047 ${locale} same D-Day engine result`, async ({page}) => {
    await page.goto(`/${locale}/dday-anniversary-calculator`);
    await page.getByTestId('tool047-reference').fill('2026-08-17');
    await page.getByTestId('tool047-target').fill('2026-08-18');
    await expect(page.getByTestId('tool047-result')).toContainText('D-1');
    await expect(page.locator(`a[href="/${locale}/date-difference-calculator"]`)).toBeVisible();
    await expect(page.locator(`a[href="/${locale}/date-add-subtract-calculator"]`)).toBeVisible();
  });
  test(`TOOL047 ${locale} category card is live`, async ({page}) => {
    await page.goto(`/${locale}/category/date-time`);
    await expect(page.locator(`a[href="/${locale}/dday-anniversary-calculator"]`)).toBeVisible();
  });
}
