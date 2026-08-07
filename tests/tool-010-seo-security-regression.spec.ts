import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const slugs = ["ko", "en", "ja"].map(locale => `/${locale}/image-mosaic-blur-tool`);

test.describe("010 SEO, privacy and additive regression", () => {
  for (const route of slugs) {
    test(`${route} exposes canonical, alternates and structured data`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route}$`));
      for (const lang of ["ko", "en", "ja", "x-default"]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
      }
      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      expect(jsonLd).toContain("WebApplication");
      expect(jsonLd).toContain("FAQPage");
      expect(jsonLd).toContain("BreadcrumbList");
    });
  }

  test("sitemap contains all 010 locales and robots allows indexing", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const route of slugs) expect(sitemap).toContain(route);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("https://toolbox.fixlgs.com/sitemap.xml");
    expect(robots).not.toContain("image-mosaic-blur-tool");
  });

  test("category card is live and contact link carries actual tool name", async ({ page }) => {
    await page.goto("/ko/category/image-edit");
    await expect(page.getByRole("link", { name: /이미지 모자이크/ })).toHaveAttribute("href", "/ko/image-mosaic-blur-tool");
    await page.goto("/ko/image-mosaic-blur-tool");
    const contact = page.locator('a[href*="fixlgs.com/contact?app="]').first();
    const href = await contact.getAttribute("href");
    expect(href).toBeTruthy();
    expect(new URL(href!).searchParams.get("app")).toContain("이미지 모자이크");
  });

  test("normal image editing and download do not transmit filenames, pixels, EXIF or region coordinates", async ({ page }) => {
    const suspicious: Array<{ url: string; method: string; post: string }> = [];
    page.on("request", request => {
      const url = request.url();
      const post = request.postData() || "";
      if (request.method() !== "GET" || /private-sample|redacted|data:image|blob:|region|exif|gps/i.test(url + post)) suspicious.push({ url, method: request.method(), post });
    });
    await page.goto("/ko/image-mosaic-blur-tool");
    await page.locator('input[type="file"]').first().setInputFiles({ name: "private-sample.jpg", mimeType: "image/jpeg", buffer: readFileSync(path.join(process.cwd(), "test-fixtures/sample.jpg")) });
    await expect(page.locator('[data-testid="tool010-editor"]')).toBeVisible();
    const canvas = page.locator('[data-testid="tool010-canvas"]'); const box = await canvas.boundingBox(); if (!box) throw new Error("canvas missing");
    await page.locator('[data-testid="tool010-mode-rect"]').click();
    await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down(); await page.mouse.move(box.x + 180, box.y + 130); await page.mouse.up();
    const download = page.waitForEvent("download"); await page.locator('[data-testid="tool010-download"]').click(); await download;
    const leaked = suspicious.filter(item => {
      const parsed = new URL(item.url);
      const sameOrigin = parsed.origin === new URL(page.url()).origin;
      return !sameOrigin && !item.url.includes("/_next/") && !item.url.includes("/test-fixtures/");
    });
    expect(leaked).toEqual([]);
  });

  test("preserves prior completed routes and common shell", async ({ page }) => {
    for (const route of ["/ko/jpg-png-webp-image-converter", "/ko/image-cropper-rotator", "/ko/image-brightness-color-adjuster", "/ko/image-mosaic-blur-tool"]) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
