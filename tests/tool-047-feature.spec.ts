import { expect, test } from '@playwright/test';

test('TOOL047 mode transition mounts only active controls', async ({page}) => {
  await page.goto('/ko/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-birthday').click();
  await expect(page.getByTestId('tool047-birthday')).toBeVisible();
  await expect(page.getByTestId('tool047-target')).toHaveCount(0);
  await page.getByTestId('tool047-mode-anniversary').click();
  await expect(page.getByTestId('tool047-start')).toBeVisible();
  await expect(page.getByTestId('tool047-custom-milestone')).toBeVisible();
  await expect(page.getByTestId('tool047-reference')).toHaveCount(0);
});

test('TOOL047 quick +30 days uses current reference date', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-reference').fill('2026-08-17');
  await page.getByRole('button',{name:'30 days'}).click();
  await expect(page.getByTestId('tool047-target')).toHaveValue('2026-09-16');
  await expect(page.getByTestId('tool047-result')).toContainText('D-30');
});

test('TOOL047 complete reset restores D-Day mode and clears custom state', async ({page}) => {
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-mode-anniversary').click();
  await page.getByTestId('tool047-event').fill('Launch');
  await page.getByTestId('tool047-custom-milestone').fill('777');
  await page.getByTestId('tool047-reset').click();
  await expect(page.getByTestId('tool047-mode-dday')).toHaveAttribute('aria-selected','true');
  await expect(page.getByTestId('tool047-event')).toHaveValue('');
  await expect(page.getByTestId('tool047-custom-milestone')).toHaveCount(0);
  await expect(page.getByTestId('tool047-error')).toHaveCount(0);
});

test('TOOL047 copy uses event name and calculated result', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/en/dday-anniversary-calculator');
  await page.getByTestId('tool047-reference').fill('2026-08-17');
  await page.getByTestId('tool047-target').fill('2026-08-18');
  await page.getByTestId('tool047-event').fill('Launch');
  await page.getByTestId('tool047-copy').click();
  await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toContain('Launch - D-1');
});
