import { expect, test } from '@playwright/test';

test('TOOL051 add/subtract and time difference', async ({page}) => {
  await page.goto('/en/time-calculator');
  await page.getByTestId('tool051-base').fill('09:25');
  await page.getByTestId('tool051-duration-hours').fill('2');
  await page.getByTestId('tool051-duration-minutes').fill('40');
  await expect(page.getByTestId('tool051-result-value')).toContainText('12:05');
  await page.getByTestId('tool051-operation').selectOption('subtract');
  await page.getByTestId('tool051-base').fill('17:40');
  await page.getByTestId('tool051-duration-hours').fill('1');
  await page.getByTestId('tool051-duration-minutes').fill('55');
  await expect(page.getByTestId('tool051-result-value')).toContainText('15:45');
  await page.getByTestId('tool051-mode-difference').click();
  await page.getByTestId('tool051-start').fill('09:20');
  await page.getByTestId('tool051-end').fill('17:55');
  await expect(page.getByTestId('tool051-result-value')).toContainText('8 hr 35 min');
});
