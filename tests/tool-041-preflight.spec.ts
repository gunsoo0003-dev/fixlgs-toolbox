import { test, expect } from '@playwright/test';
for(const locale of ['ko','en','ja'] as const){
  test(`TOOL041 ${locale} route and core DOM`,async({page})=>{await page.goto(`/${locale}/text-extractor`);await expect(page.getByTestId('tool041-root')).toBeVisible();await expect(page.getByTestId('tool041-start-dropzone')).toBeVisible();await expect(page.getByTestId('tool041-extract')).toBeDisabled();await expect(page.getByTestId('tool041-copy')).toBeDisabled();await expect(page.getByTestId('tool041-download')).toBeDisabled();});
}
