import { test, expect } from '@playwright/test';
for (const locale of ['ko','en','ja']) test(`TOOL033 ${locale} route`, async ({page})=>{await page.goto(`/${locale}/pdf-compressor`);await expect(page.getByTestId('tool033-root')).toBeVisible();});
