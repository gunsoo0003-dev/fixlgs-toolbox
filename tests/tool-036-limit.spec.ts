import { test, expect } from '@playwright/test';

const LIMIT = 300_000; // approved service limit; independent checker expected

test('TOOL036 accepts exact grapheme limit', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  const exact = 'a'.repeat(LIMIT);
  await page.getByTestId('tool036-textarea').fill(exact);
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('300,000');
  await expect(page.getByTestId('tool036-error')).toHaveCount(0);
});

test('TOOL036 caps one grapheme over the approved limit and reports it', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  const over = 'a'.repeat(LIMIT) + '👨‍👩‍👧‍👦';
  await page.getByTestId('tool036-textarea').fill(over);
  await expect(page.getByTestId('tool036-textarea')).toHaveValue('a'.repeat(LIMIT));
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('300,000');
  await expect(page.getByTestId('tool036-error')).toContainText('300,000');
});

test('TOOL036 handles just below the approved limit', async ({ page }) => {
  await page.goto('/ja/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('あ'.repeat(LIMIT - 1));
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('299,999');
});
