import { test, expect } from '@playwright/test';
for(const locale of ['ko','en','ja'] as const){
  test(`TOOL040 ${locale} preflight`,async({page})=>{
    await page.goto(`/${locale}/delimiter-list-converter`);
    await expect(page.getByTestId('tool040-root')).toBeVisible();
    await expect(page.getByTestId('tool040-workspace')).toBeVisible();
    await expect(page.getByTestId('tool040-start-dropzone')).toBeVisible();
    await expect(page.getByTestId('tool040-file-button')).toBeVisible();
    await expect(page.getByTestId('tool040-source')).toBeVisible();
    await expect(page.getByTestId('tool040-result')).toBeVisible();
    await expect(page.getByTestId('tool040-convert')).toBeVisible();
    await expect(page.getByTestId('tool040-copy')).toBeVisible();
    await expect(page.getByTestId('tool040-download')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
}
