import { test, expect } from '@playwright/test';
test('024 keeps existing 021 route reachable',async({page})=>{await page.goto('/ko/social-media-image-maker');await expect(page.locator('h1')).toContainText('SNS');});
