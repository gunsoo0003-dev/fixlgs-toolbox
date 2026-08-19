import { expect, test } from '@playwright/test';

test('TOOL047 approved max custom milestone is accepted', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-anniversary').click();
  await page.getByTestId('tool047-start').fill('2000-01-01');
  await page.getByTestId('tool047-custom-milestone').fill('10000');
  await expect(page.getByTestId('tool047-error')).toHaveCount(0);
  await expect(page.getByTestId('tool047-result')).toContainText('10000');
  await expect(page.getByTestId('tool047-result')).toContainText('May 18, 2027');
});

test('TOOL047 event name DOM limit remains 80 characters', async ({page}) => {
  await page.goto('/ko/dday-anniversary-calculator');
  await expect(page.getByTestId('tool047-event')).toHaveAttribute('maxlength','80');
});
