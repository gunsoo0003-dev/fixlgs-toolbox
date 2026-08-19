import { expect, test } from '@playwright/test';

test('invalid birthday is rejected without stale computed date', async ({page}) => {
  await page.goto('/ko/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-birthday').click();
  await page.getByTestId('tool047-reference').fill('2026-08-17');
  await page.getByTestId('tool047-birthday').fill('02-30');
  await expect(page.getByTestId('tool047-error')).toBeVisible();
  await expect(page.getByTestId('tool047-result')).toContainText('—');
});

test('custom milestone above 10000 is rejected', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-anniversary').click();
  await page.getByTestId('tool047-start').fill('2026-01-01');
  await page.getByTestId('tool047-custom-milestone').fill('10001');
  await expect(page.getByTestId('tool047-error')).toBeVisible();
});

test('out-of-range anniversary result is explicitly bounded', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-anniversary').click();
  await page.getByTestId('tool047-start').fill('2100-12-31');
  await expect(page.getByTestId('tool047-result')).toContainText('Outside service range');
});
