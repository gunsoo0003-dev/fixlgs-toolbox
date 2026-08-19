import { expect, test } from '@playwright/test';

test('TOOL047 D-Day exact future and elapsed results', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-reference').fill('2026-08-17');
  await page.getByTestId('tool047-target').fill('2026-08-18');
  await expect(page.getByTestId('tool047-result')).toContainText('D-1');
  await page.getByTestId('tool047-target').fill('2026-08-16');
  await expect(page.getByTestId('tool047-result')).toContainText('D+1');
});

test('TOOL047 birthday resolves next occurrence', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-birthday').click();
  await page.getByTestId('tool047-reference').fill('2026-08-17');
  await page.getByTestId('tool047-birthday').fill('05-21');
  await expect(page.getByTestId('tool047-result')).toContainText('May 21, 2027');
});

test('TOOL047 anniversary start-date-is-day-1 rule', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-anniversary').click();
  await page.getByTestId('tool047-start').fill('2026-01-01');
  await expect(page.getByTestId('tool047-result')).toContainText('100');
  await expect(page.getByTestId('tool047-result')).toContainText('April 10, 2026');
});
