import { expect, test } from "@playwright/test";
import { validationTools } from "../lib/validation/tool-registry";
import { assertNoHorizontalOverflow, attachScreenshot } from "./helpers/toolbox-validation";

const representative = validationTools.map((tool) => ({ tool, locale: "en" as const }));

test.describe("TOOLBOX 반응형·디자인 기본 검수", () => {
  for (const { tool, locale } of representative) {
    test(`${tool.number} PC·모바일 가로 넘침 없음`, async ({ page }, testInfo) => {
      await page.goto(`/${locale}/${tool.slug}`);
      await assertNoHorizontalOverflow(page);
      await attachScreenshot(page, testInfo, `${tool.number}-${locale}-${testInfo.project.name}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("footer.toolbox-footer")).toBeVisible();
    });
  }

  test("004 작업장 공통 구조가 유지된다", async ({ page }) => {
    await page.goto("/ko/image-compressor");
    const workspace = page.locator(".toolbox-workbench");
    await expect(workspace).toBeVisible();
    const style = await workspace.evaluate((element) => {
      const css = getComputedStyle(element);
      return { radius: css.borderRadius, overflow: css.overflow, width: element.getBoundingClientRect().width };
    });
    expect(parseFloat(style.radius)).toBeGreaterThanOrEqual(18);
    expect(style.overflow).toBe("hidden");
    expect(style.width).toBeGreaterThan(280);
  });
});
