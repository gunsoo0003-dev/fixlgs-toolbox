import { expect, test } from '@playwright/test';
for(const slug of ['date-difference-calculator','date-add-subtract-calculator','dday-anniversary-calculator'])test(`protected date-time route ${slug}`,async({page})=>{await page.goto(`/en/${slug}`);await expect(page.locator('h1')).toBeVisible();});
test('TOOL052 SEO body sections exist',async({page})=>{await page.goto('/en/world-time-timezone-converter');await expect(page.locator('.toolbox-tool-guide')).toBeVisible();await expect(page.locator('.toolbox-tool-faq')).toBeVisible();});
