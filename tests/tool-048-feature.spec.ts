import { expect, test } from '@playwright/test';

test('TOOL048 reset restores default date state', async ({ page }) => {
  await page.goto('/ko/age-life-calculator');

  const asOf = page.getByTestId('tool048-as-of');

  // Hydration 이후 기본 오늘 날짜가 실제로 세팅될 때까지 대기
  await expect(asOf).not.toHaveValue('');

  const initialAsOf = await asOf.inputValue();

  await page.getByTestId('tool048-dob').fill('2000-01-01');
  await page.getByTestId('tool048-reset').click();

  await expect(page.getByTestId('tool048-dob')).toHaveValue('');
  await expect(asOf).toHaveValue(initialAsOf);
});
