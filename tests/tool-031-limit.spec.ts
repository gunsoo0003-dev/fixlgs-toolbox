import { test, expect } from "@playwright/test";
test('031 limit copy matches candidate constants',async({page})=>{await page.goto('/ko/pdf-page-number-watermark');await expect(page.locator('body')).toContainText('30MB');await expect(page.locator('body')).toContainText('300페이지');});
test('031 single PDF input only',async({page})=>{await page.goto('/ko/pdf-page-number-watermark');const input=page.getByTestId('tool031-file-input');await expect(input).not.toHaveAttribute('multiple','');});
