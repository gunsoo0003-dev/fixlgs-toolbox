import { expect, test } from '@playwright/test';

test('TOOL039 service limit remains candidate text and is not enforced as an unapproved hard cap', async ({ page }) => {
  await page.goto('/en/list-sorter-duplicate-remover');
  await expect(page.getByTestId('tool039-root')).toContainText('candidate until user approval');
  const source = 'a'.repeat(100_000);
  await page.getByTestId('tool039-source').fill(source);
  await expect(page.getByTestId('tool039-result')).toHaveValue(source);
  await expect(page.getByTestId('tool039-error')).toHaveCount(0);
});
