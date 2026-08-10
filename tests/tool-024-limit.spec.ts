import { test, expect } from '@playwright/test';
test('024 service limit candidate is 10 files',async({page})=>{await page.goto('/ko/app-store-screenshot-maker');const files=Array.from({length:10},()=> 'test-fixtures/tiny-image.jpg');await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles(files);await expect(page.getByText(/1\. tiny-image/)).toBeVisible();});
