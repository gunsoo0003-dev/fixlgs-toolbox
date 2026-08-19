import {expect,test} from '@playwright/test';
test('TOOL055 uses common detail sections without global overrides',async({page})=>{await page.goto('/ko/length-area-volume-converter');await expect(page.locator('.toolbox-tool-guide')).toBeVisible();await expect(page.locator('.toolbox-tool-expert-post')).toBeVisible();await expect(page.locator('.toolbox-tool-info-band')).toBeVisible();await expect(page.locator('.toolbox-tool-faq')).toBeVisible();await expect(page.getByRole('link',{name:/단위·일반 계산기/})).toHaveAttribute('href','/ko/category/unit-calc');});

test('TOOL055 category card shows 055 number and locale href in all locales', async ({ page }) => {
  for (const locale of ['ko','en','ja']) {
    await page.goto(`/${locale}/category/unit-calc`);
    const link = page.locator(`a.toolbox-subpage-card[href=\"/${locale}/length-area-volume-converter\"]`);
    await expect(link).toBeVisible();
    await expect(link.locator('.toolbox-subpage-card-top > span')).toHaveText('055');
  }
});
