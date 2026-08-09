import { test, expect } from "@playwright/test";

for (const locale of ["ko", "en", "ja"] as const) {
  test(`021 isolated dev route survives refresh: ${locale}`, async ({page}) => {
    await page.goto(`/${locale}/social-media-image-maker`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/social-media-image-maker$`));
    await expect(page.locator('[data-testid="tool021-root"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="tool021-root"]')).toBeVisible();
  });
}

test('production slug remains documented for main-workspace integration without protected-file edits', async ({page}) => {
  await page.goto('/en/social-media-image-maker');
  await expect(page.getByText('Social Media Image Maker').first()).toBeVisible();
});
