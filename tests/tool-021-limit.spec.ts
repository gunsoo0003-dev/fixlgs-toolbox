import { test, expect } from "@playwright/test";
import path from "node:path";

const f = (name:string) => path.join(process.cwd(),'test-fixtures/tool-021',name);

test.beforeEach(async ({page}) => { await page.goto('/en/social-media-image-maker'); });

test('30MP image is accepted under 40MP limit', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('large-30mp.jpg'));
  await expect(page.locator('[data-testid="tool021-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool021-error"]')).toHaveCount(0);
});

test('image over 40MP is rejected', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('over-40mp.jpg'));
  await expect(page.locator('[data-testid="tool021-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/40|pixel|픽셀|ピクセル/i);
});

test('background over 20MB is rejected before decode', async ({page}) => {
  await page.locator('[data-testid="tool021-background-input"]').setInputFiles(f('over-20mb.jpg'));
  await expect(page.locator('[data-testid="tool021-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="tool021-error"]')).toContainText(/20|MB/i);
});
