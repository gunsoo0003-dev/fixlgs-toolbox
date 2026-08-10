import { test, expect } from '@playwright/test';
const paths=['/ko/app-store-screenshot-maker','/en/app-store-screenshot-maker','/ja/app-store-screenshot-maker'];
for(const path of paths){test(`024 core ${path}`,async({page})=>{
  await page.goto(path);
  await expect(page.getByTestId('tool024-root')).toBeVisible();
  await expect(page.getByTestId('tool024-dropzone')).toBeVisible();
  await expect(page.getByTestId('tool024-workspace-dropzone')).toBeVisible();
  await page.getByTestId('tool024-dropzone').locator('input[type=file]').setInputFiles('test-fixtures/portrait-1080x1920.jpg');
  await expect(page.getByTestId('tool024-preview')).toBeVisible();
  await expect(page.getByTestId('tool024-result-count')).toHaveText('1');
});}
