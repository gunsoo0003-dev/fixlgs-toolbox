import { test, expect } from "@playwright/test";
for(const path of ['/ko/merge-pdf','/ko/split-extract-pdf','/ko/pdf-page-organizer']) test(`031 keeps previous PDF tool ${path}`,async({page})=>{await page.goto(path);await expect(page.locator('h1')).toBeVisible();await expect(page.locator('body')).not.toContainText('Application error');});
test('031 category card and route are live',async({page})=>{await page.goto('/ko/category/pdf');await expect(page.getByRole('link',{name:/PDF 페이지 번호·워터마크 도구/})).toBeVisible();});
