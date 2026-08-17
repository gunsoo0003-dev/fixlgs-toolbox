import { expect,test } from '@playwright/test';
for(const locale of ['ko','en','ja'])test(`TOOL045 ${locale} has same internal result`,async({page})=>{await page.goto(`/${locale}/date-difference-calculator`);await page.getByTestId('tool045-start').fill('2026-12-31');await page.getByTestId('tool045-end').fill('2027-01-01');await expect(page.getByTestId('tool045-total-days')).toHaveText('1');});


test('TOOL045 category date-time card shows TOOL045 number in all locales', async ({ page }) => {
  for (const locale of ['ko', 'en', 'ja']) {
    await page.goto(`/${locale}/category/date-time`);
    const card = page.locator(`a[href="/${locale}/date-difference-calculator"]`);
    await expect(card).toHaveCount(1);
    await expect(card.locator('.toolbox-subpage-card-top span')).toHaveText('045');
  }
});
