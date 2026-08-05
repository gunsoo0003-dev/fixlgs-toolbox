import { expect, test } from "@playwright/test";
import { validationTools } from "../lib/validation/tool-registry";

const base = "https://toolbox.fixlgs.com";

test.describe("TOOLBOX SEO 공통 검수", () => {
  for (const tool of validationTools) {
    for (const locale of tool.locales) {
      test(`${tool.number} ${locale} canonical·hreflang·메타`, async ({ page }) => {
        await page.goto(`/${locale}/${tool.slug}`);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${base}/${locale}/${tool.slug}`);
        for (const alternate of ["ko", "en", "ja"]) {
          await expect(page.locator(`link[rel="alternate"][hreflang="${alternate}"]`)).toHaveAttribute("href", `${base}/${alternate}/${tool.slug}`);
        }
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
        await expect(page).toHaveTitle(/TOOLBOX/);
        const structuredData = page.locator('script[type="application/ld+json"]');
        await expect(structuredData.first()).toBeAttached();
      });
    }
  }

  test("sitemap과 robots가 정상 응답한다", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    for (const tool of validationTools) {
      for (const locale of tool.locales) expect(sitemapText).toContain(`${base}/${locale}/${tool.slug}`);
    }
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain(`${base}/sitemap.xml`);
  });
});
