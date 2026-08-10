import { test, expect } from '@playwright/test';
test('existing 018 route remains available',async({page})=>{await page.goto('/ko/image-metadata-checker');await expect(page.locator('h1')).toContainText('메타데이터')});
