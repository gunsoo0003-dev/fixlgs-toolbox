import { test, expect } from '@playwright/test';

test('TOOL036 empty and whitespace-only boundaries', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('0');
  await expect(page.getByTestId('tool036-lines')).toHaveText('0');
  await page.getByTestId('tool036-textarea').fill(' \t\n');
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('3');
  await expect(page.getByTestId('tool036-chars-without')).toHaveText('0');
  await expect(page.getByTestId('tool036-words')).toHaveText('0');
  await expect(page.getByTestId('tool036-sentences')).toHaveText('0');
  await expect(page.getByTestId('tool036-paragraphs')).toHaveText('0');
  await expect(page.getByTestId('tool036-lines')).toHaveText('2');
});

test('TOOL036 grapheme, UTF-8 and mixed EOL boundaries', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('A👨‍👩‍👧‍👦é👍🏽');
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('4');
  await page.getByTestId('tool036-textarea').fill('one\r\ntwo\rthree\nfour');
  await expect(page.getByTestId('tool036-lines')).toHaveText('4');
  await page.goto('/ko/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('가A😀');
  await expect(page.getByTestId('tool036-bytes')).toHaveText('8');
});
