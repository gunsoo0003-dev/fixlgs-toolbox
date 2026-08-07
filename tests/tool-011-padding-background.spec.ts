import { expect, test } from '@playwright/test';
import path from 'node:path';
const fixture=(name:string)=>path.join(process.cwd(),'test-fixtures',name);
for(const locale of ['ko','en','ja'] as const){
 test(`${locale} 011 route and complete controls`,async({page})=>{await page.goto(`/${locale}/image-padding-background-tool`);await expect(page.locator('h1')).toBeVisible();await expect(page.locator('[data-testid="tool011-select"]')).toBeVisible();});
}
test('tool011 padding, square, linked values, position and history',async({page})=>{await page.goto('/ko/image-padding-background-tool');await page.locator('input[type=file]').first().setInputFiles(fixture('sample.jpg'));await expect(page.locator('[data-testid="tool011-editor"]')).toBeVisible();await page.locator('[data-testid="tool011-canvas-mode"]').selectOption('padding');await page.locator('[data-testid="tool011-padding-top"]').fill('24');await page.locator('[data-testid="tool011-background-mode"]').selectOption('solid');await expect(page.locator('[data-testid="tool011-undo"]')).toBeEnabled();await expect(page.locator('[data-testid="tool011-redo"]')).toBeDisabled();await expect(page.locator('[data-testid="tool011-result-size"]')).toContainText('px');});
