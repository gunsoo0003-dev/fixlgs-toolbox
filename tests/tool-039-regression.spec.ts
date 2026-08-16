import { expect, test } from '@playwright/test';

for (const locale of ['ko','en','ja'] as const) {
  test(`TOOL039 ${locale} route renders without horizontal overflow`, async ({ page }) => {
    await page.goto(`/${locale}/list-sorter-duplicate-remover`);
    await expect(page.getByTestId('tool039-root')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('TOOL039 Japanese mobile stays within viewport with options and action row open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ja/list-sorter-duplicate-remover');
  await page.getByTestId('tool039-options').locator('summary').click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
});

test('TOOL039 category card and related links point to the live 039 route', async ({ page }) => {
  await page.goto('/ko/category/text');
  const card = page.locator('a.toolbox-subpage-card').filter({ hasText: '039' });
  await expect(card).toHaveAttribute('href', '/ko/list-sorter-duplicate-remover');
  await expect(card).toContainText('LIVE');
});

test('TOOL038 to TOOL039 next-work chain remains intact', async ({ page }) => {
  await page.goto('/en/case-sentence-format-converter');
  const link = page.locator('a.toolbox-next-work-card').filter({ hasText: '039' });
  await expect(link).toHaveAttribute('href', '/en/list-sorter-duplicate-remover');
});

test('TOOL039 activeWorkspace is the only drag workspace', async ({ page }) => {
  await page.goto('/ko/list-sorter-duplicate-remover');
  await expect(page.locator('[data-testid="tool039-workspace"]')).toHaveCount(1);
});
