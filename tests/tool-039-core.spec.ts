import { expect, test } from '@playwright/test';

const route = '/ko/list-sorter-duplicate-remover';
async function useMode(page: any, mode: string) {
  await page.getByTestId('tool039-options').locator('summary').click();
  await page.getByTestId(`tool039-mode-${mode}`).check();
}

test('TOOL039 exact duplicate removal preserves first occurrence', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('b\na\nb');
  await expect(page.getByTestId('tool039-result')).toHaveValue('b\na');
  await expect(page.getByTestId('tool039-change-stat')).toContainText('1개 제거');
});

test('TOOL039 locale text sort follows page locale', async ({ page }) => {
  await page.goto('/ko/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-source').fill('바나나\n가나\n사과');
  await useMode(page, 'text');
  await expect(page.getByTestId('tool039-result')).toHaveValue(/가나\n바나나\n사과/);
});

test('TOOL039 numeric sort separates non-numeric stable tail', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('10\n2\nfoo\n  1 \nbar\n1e3\n12px\nInfinity\n1,000');
  await useMode(page, 'numeric');
  await expect(page.getByTestId('tool039-result')).toHaveValue('  1 \n2\n10\n1e3\nfoo\nbar\n12px\nInfinity\n1,000');
});

test('TOOL039 reverse is source-order reverse, not sorted reverse', async ({ page }) => {
  await page.goto(route);
  await page.getByTestId('tool039-source').fill('b\nA\n10');
  await useMode(page, 'reverse');
  await expect(page.getByTestId('tool039-result')).toHaveValue('10\nA\nb');
});
