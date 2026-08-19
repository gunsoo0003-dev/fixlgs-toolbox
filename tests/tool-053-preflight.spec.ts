import { test, expect } from '@playwright/test';

test('053 preflight route/root and hydration safety', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto('/en/unix-timestamp-converter');
  await expect(page.getByTestId('tool053-root')).toBeVisible();
  await expect(page.getByTestId('tool053-current-seconds')).not.toHaveText('—');
  await page.waitForTimeout(1100);
  expect(runtimeErrors.filter(message => /hydration failed|hydration mismatch/i.test(message))).toEqual([]);
});
