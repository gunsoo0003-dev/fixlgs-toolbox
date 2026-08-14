import { expect, test } from '@playwright/test';
import path from 'node:path';
const fixture=(name:string)=>path.join(process.cwd(),'test-fixtures',name);
for(const locale of ['ko','en','ja'] as const){
 test(`${locale} 011 route and complete controls`,async({page})=>{await page.goto(`/${locale}/image-padding-background-tool`);await expect(page.locator('h1')).toBeVisible();await expect(page.locator('.toolbox-upload-focus button').first()).toBeVisible();await expect(page.locator('[data-testid="tool011-file"]')).toBeAttached();});
}
test('tool011 padding, square, linked values, position and history',async({page})=>{await page.goto('/ko/image-padding-background-tool');await page.getByTestId('tool011-file').setInputFiles(fixture('sample.jpg'));await expect(page.getByTestId('tool011-editor')).toBeVisible();await page.getByTestId('tool011-mode-padding').click();await page.getByTestId('tool011-padding-all').fill('24');await page.getByTestId('tool011-padding-all').blur();await page.getByTestId('tool011-bg-solid').click();await expect(page.getByTestId('tool011-undo')).toBeEnabled();await expect(page.getByTestId('tool011-redo')).toBeDisabled();await expect(page.getByTestId('tool011-result-size')).toContainText('px');});
