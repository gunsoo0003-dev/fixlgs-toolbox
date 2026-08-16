import { test, expect } from '@playwright/test';

test('TOOL036 core English statistics update without a calculate button', async ({ page }) => {
  await page.goto('/en/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('Hello world.');
  await expect(page.getByTestId('tool036-chars-with')).toHaveText('12');
  await expect(page.getByTestId('tool036-chars-without')).toHaveText('11');
  await expect(page.getByTestId('tool036-words')).toHaveText('2');
  await expect(page.getByTestId('tool036-sentences')).toHaveText('1');
  await expect(page.getByTestId('tool036-paragraphs')).toHaveText('1');
  await expect(page.getByTestId('tool036-lines')).toHaveText('1');
  await expect(page.getByTestId('tool036-bytes')).toHaveText('12');
  await expect(page.getByTestId('tool036-reading-time')).toContainText('1 sec');
});

test('TOOL036 Japanese no-space text is not one word', async ({ page }) => {
  await page.goto('/ja/character-document-counter');
  await page.getByTestId('tool036-textarea').fill('今日は良い天気です。文章の文字数と単語数を確認します。');
  await expect.poll(async () => Number((await page.getByTestId('tool036-words').innerText()).replace(/,/g, ''))).toBeGreaterThan(1);
  await expect(page.getByTestId('tool036-sentences')).toHaveText('2');
});


test('TOOL036 start dropzone disappears after direct input and returns only after clear', async ({ page }) => {
  await page.goto('/ko/character-document-counter');
  const textarea = page.getByTestId('tool036-textarea');
  const startDropzone = page.getByTestId('tool036-start-dropzone');

  await expect(startDropzone).toBeVisible();
  const initialDropzoneBox = await startDropzone.boundingBox();
  const initialTextareaBox = await textarea.boundingBox();
  expect(initialDropzoneBox?.height ?? 0).toBeGreaterThanOrEqual(200);
  expect(initialTextareaBox?.height ?? 999).toBeLessThanOrEqual(70);

  await textarea.click();
  await textarea.pressSequentially('직접 입력 테스트');
  await expect(textarea).toHaveValue('직접 입력 테스트');
  await expect(startDropzone).toHaveCount(0);
  const expandedTextareaBox = await textarea.boundingBox();
  expect(expandedTextareaBox?.height ?? 0).toBeGreaterThanOrEqual(150);
  expect(expandedTextareaBox?.height ?? 0).toBeGreaterThanOrEqual((initialTextareaBox?.height ?? 0) + 100);
  await expect(page.getByTestId('tool036-chars-with')).not.toHaveText('0');

  await textarea.fill('붙여넣기 테스트 한글 😀');
  await expect(textarea).toHaveValue('붙여넣기 테스트 한글 😀');
  await expect(startDropzone).toHaveCount(0);
  await expect(page.getByTestId('tool036-chars-without')).not.toHaveText('0');

  await page.getByTestId('tool036-clear').click();
  await expect(textarea).toHaveValue('');
  await expect(startDropzone).toBeVisible();
});
