import { expect, test } from "@playwright/test";

const locales = ["ko", "en", "ja"] as const;

test("009 is present in sitemap without removing validated earlier tool URLs", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const xml = await response.text();
  for (const locale of locales) expect(xml).toContain(`/${locale}/image-brightness-color-adjuster`);
  for (const slug of [
    "jpg-png-webp-image-converter",
    "heic-avif-image-converter",
    "svg-bmp-tiff-image-converter",
    "image-compressor",
    "target-size-image-compressor",
    "image-resizer",
    "web-image-optimizer",
    "image-cropper-rotator",
  ]) expect(xml).toContain(slug);
});

test("robots remains indexable and keeps the production sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const robots = await response.text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("https://toolbox.fixlgs.com/sitemap.xml");
});

test("language switching preserves the tool 009 slug", async ({ page }) => {
  await page.goto("/ko/image-brightness-color-adjuster");
  await page.getByRole("button", { name: "언어 선택" }).click();
  await page.getByRole("option", { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en\/image-brightness-color-adjuster$/);
  await page.getByRole("button", { name: "Select language" }).click();
  await page.getByRole("option", { name: /日本語/ }).click();
  await expect(page).toHaveURL(/\/ja\/image-brightness-color-adjuster$/);
});

test("common header, theme control, FAQ, related content, and footer remain visible", async ({ page }) => {
  await page.goto("/ko/image-brightness-color-adjuster");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator(".toolbox-tool-faq-list")).toBeVisible();
  await expect(page.locator('.toolbox-theme-toggle')).toBeVisible();
});
