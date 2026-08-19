import { expect, test } from '@playwright/test';

test('TOOL051 explicit cross-midnight gate', async ({page}) => {
  await page.goto('/en/time-calculator');
  await page.getByTestId('tool051-mode-difference').click();
  await page.getByTestId('tool051-start').fill('23:30');
  await page.getByTestId('tool051-end').fill('01:15');
  await expect(page.getByTestId('tool051-error')).toContainText('Cross midnight');
  await page.getByTestId('tool051-cross-midnight').check();
  await expect(page.getByTestId('tool051-result-value')).toContainText('1 hr 45 min');
});

test('TOOL051 12 AM/PM conversion', async ({page}) => {
  await page.goto('/en/time-calculator');
  await page.getByTestId('tool051-mode-convert').click();
  await page.getByTestId('tool051-convert-hour12').fill('12');
  await page.getByTestId('tool051-convert-minute12').fill('30');
  await page.getByTestId('tool051-period').selectOption('AM');
  await expect(page.getByTestId('tool051-result-value')).toContainText('00:30');
  await page.getByTestId('tool051-period').selectOption('PM');
  await expect(page.getByTestId('tool051-result-value')).toContainText('12:30');
});
