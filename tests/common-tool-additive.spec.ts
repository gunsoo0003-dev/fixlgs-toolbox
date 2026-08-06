import { expect, test } from "@playwright/test";
import { commonValidationTools } from "../lib/validation/common-tool-catalog";
import { assertNoHorizontalOverflow, assertNoPageErrors } from "./helpers/toolbox-validation";

const base = "https://toolbox.fixlgs.com";
const normalize = (value: string) => value.replace(/\s+/g, "").trim();

/**
 * 기존 공통검수 파일은 그대로 보존하고, 001~009를 함께 점검하는 추가 레이어다.
 */
test.describe("TOOLBOX 추가 공통검수 레이어", () => {
  for (const tool of commonValidationTools) {
    for (const locale of tool.locales) {
      test(`${tool.number} ${locale} 공개 경로·SEO·공통 UI`, async ({ page }) => {
        const verifyErrors = await assertNoPageErrors(page);
        const response = await page.goto(`/${locale}/${tool.slug}`);
        expect(response?.ok()).toBeTruthy();

        const h1 = (await page.locator("h1").textContent()) ?? "";
        expect(normalize(h1)).toContain(normalize(tool.expectedH1[locale]));
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("footer.toolbox-footer, footer").first()).toBeVisible();
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          `${base}/${locale}/${tool.slug}`,
        );
        for (const alternate of ["ko", "en", "ja"]) {
          await expect(page.locator(`link[rel="alternate"][hreflang="${alternate}"]`)).toHaveAttribute(
            "href",
            `${base}/${alternate}/${tool.slug}`,
          );
        }
        await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
        await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/);
        // Existing 001~008 screen checks remain owned by their validated suites.
        // The additive layer only introduces the new 009 overflow requirement.
        if (tool.number === "009") {
          await assertNoHorizontalOverflow(page);
        }
        await verifyErrors();
      });
    }
  }

  const tool009 = commonValidationTools.find((tool) => tool.number === "009");
  if (!tool009) throw new Error("009 common validation definition is missing");

  test("009 모바일·다크모드 가로 넘침 없음", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/ja/${tool009.slug}`);
    await assertNoHorizontalOverflow(page);

    const themeButton = page.locator(".toolbox-theme-toggle").first();
    if (await themeButton.isVisible().catch(() => false)) {
      await themeButton.click();
      await assertNoHorizontalOverflow(page);
    }
  });

  test("sitemap·robots에 001~009가 모두 유지된다", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    for (const tool of commonValidationTools) {
      for (const locale of tool.locales) {
        expect(xml).toContain(`${base}/${locale}/${tool.slug}`);
      }
    }

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsText = await robots.text();
    expect(robotsText).toContain("Allow: /");
    expect(robotsText).toContain(`${base}/sitemap.xml`);
  });
});
