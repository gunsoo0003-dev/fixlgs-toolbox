import { test, expect, type Page } from "@playwright/test";
import { WEB_IMAGE_OPTIMIZER_LIMITS } from "../components/web-image-optimizer-tool";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAFElEQVR4nGP8z8AARAwMjDAGCjAAANwAAfLQ6vQAAAAASUVORK5CYII=",
  "base64",
);
const transparentPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFUlEQVR4nGP8z8Dwn4GBgYGJAQoAHgQCAK9MZ9cAAAAASUVORK5CYII=",
  "base64",
);

async function upload(page: Page, name = "sample.png", buffer = png) {
  await page.getByTestId("optimizer-file-input").setInputFiles({ name, mimeType: "image/png", buffer });
}

async function actionMetrics(page: Page, route: string, inputTestId: string, actionTestId: string) {
  await page.goto(route);
  await page.getByTestId(inputTestId).setInputFiles({ name: "sample.png", mimeType: "image/png", buffer: png });
  const box = await page.getByTestId(actionTestId).boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

test.describe("TOOLBOX 007 complete automatic validation", () => {

  for (const [locale, h1, runLabel, safeLimitLabel] of [
    ["ko", "웹 이미지 최적화기", /전체 이미지 최적화/, "안전 처리 한도: 최대 10개 · 파일당 15MB · 전체 50MB · 파일당/전체 2천만 픽셀 · 최대 한 변 16,384px"],
    ["en", "Web Image Optimizer", /Optimize All Images/, "Safe limits: up to 10 files · 15 MB each · 50 MB total · 20 million pixels per file and in total · max side 16,384 px"],
    ["ja", "Web画像最適化ツール", /すべての画像を最適化/, "安全処理上限: 最大10件 · 1件15MB · 合計50MB · 1件/合計2,000万画素 · 最大辺16,384px"],
  ] as const) {
    test(`${locale} route, SEO, primary flow labels`, async ({ page }) => {
      await page.goto(`/${locale}/web-image-optimizer`);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expect(page.getByTestId("optimizer-run")).toBeDisabled();
      await expect(page.getByTestId("optimizer-run")).toHaveText(runLabel);
      await expect(page.getByTestId("optimizer-file-input")).toHaveAttribute("accept", /avif/);
      await expect(page.getByTestId("optimizer-safe-limit")).toHaveText(safeLimitLabel);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}/web-image-optimizer$`));
      for (const alternate of ["ko", "en", "ja"]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${alternate}"]`)).toHaveAttribute("href", new RegExp(`/${alternate}/web-image-optimizer$`));
      }
    });
  }

  test("sitemap, robots and all 007 localized URLs are registered", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    for (const locale of ["ko", "en", "ja"]) {
      expect(xml).toContain(`https://toolbox.fixlgs.com/${locale}/web-image-optimizer`);
    }
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("https://toolbox.fixlgs.com/sitemap.xml");
  });

  test("inherits verified workbench and 001 action-button geometry", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "desktop geometry parity is checked once");
    const reference = await actionMetrics(page, "/ko/jpg-png-webp-image-converter", "converter-file-input", "converter-run");
    const target = await actionMetrics(page, "/ko/web-image-optimizer", "optimizer-file-input", "optimizer-run");
    expect(Math.abs(reference.height - target.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(reference.y - target.y)).toBeLessThanOrEqual(1200); // different content height, same bottom action pattern
    const workbench = page.getByTestId("optimizer-workbench");
    await expect(workbench).toHaveClass(/toolbox-workbench/);
    await expect(workbench.locator(":scope > .toolbox-workbench-upload")).toHaveCount(1);
    await expect(workbench.locator(":scope > .target-size-workbench-files")).toHaveCount(1);
    await expect(page.getByTestId("optimizer-run")).toHaveClass(/toolbox-primary-action/);
    await expect(page.getByTestId("optimizer-zip")).toHaveClass(/toolbox-zip-action/);
    await expect(page.getByTestId("optimizer-reset")).toHaveClass(/toolbox-restart-action/);
  });

  test("uploads, analyzes, optimizes, compares, downloads and resets", async ({ page }) => {
    await page.goto("/ko/web-image-optimizer");
    await upload(page);
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(1);
    await expect(page.getByTestId("optimizer-run")).toBeEnabled();
    await page.getByTestId("optimizer-run").click();
    await expect(page.getByTestId("optimizer-summary")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("optimizer-zip")).toBeEnabled();
    await page.getByRole("button", { name: "원본과 비교" }).click();
    await expect(page.getByTestId("optimizer-compare")).toBeVisible();
    await expect(page.getByLabel("비교 위치")).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("optimizer-reset").click();
    await expect(page.getByTestId("optimizer-file-card")).toHaveCount(0);
    await expect(page.getByTestId("optimizer-run")).toBeDisabled();
  });

  test("transparent input is never auto-forced to JPG", async ({ page }) => {
    await page.goto("/ko/web-image-optimizer");
    await upload(page, "alpha.png", transparentPng);
    await expect(page.getByText("투명 그래픽·로고")).toBeVisible();
    await page.getByTestId("optimizer-run").click();
    await expect(page.getByTestId("optimizer-summary")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("optimizer-file-card")).not.toContainText("→ 결과 JPG");
  });

  test("individual settings persist, exclusion disables all-run when every file is excluded", async ({ page }) => {
    await page.goto("/ko/web-image-optimizer");
    await upload(page);

    await page.getByRole("button", { name: "개별 설정" }).click();
    const purposeSelect = page.locator(".optimizer-file-settings select").first();
    await purposeSelect.selectOption("screenshot");
    await expect(purposeSelect).toHaveValue("screenshot");

    await page.getByRole("button", { name: "설정 닫기" }).click();
    await page.getByRole("button", { name: "개별 설정" }).click();
    await expect(page.locator(".optimizer-file-settings select").first()).toHaveValue("screenshot");

    const exclude = page.getByLabel("이 파일 처리 제외");
    await exclude.check();
    await expect(exclude).toBeChecked();
    await expect(page.getByTestId("optimizer-run")).toBeDisabled();

    await exclude.uncheck();
    await expect(exclude).not.toBeChecked();
    await expect(page.getByTestId("optimizer-run")).toBeEnabled();
  });

  test("mobile action buttons remain visible, stacked and inside the workbench", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "mobile-only layout assertion");
    await page.goto("/ko/web-image-optimizer");
    await upload(page);
    const workbench = await page.getByTestId("optimizer-workbench").boundingBox();
    const run = await page.getByTestId("optimizer-run").boundingBox();
    const zip = await page.getByTestId("optimizer-zip").boundingBox();
    expect(workbench && run && zip).toBeTruthy();
    expect(run!.x).toBeGreaterThanOrEqual(workbench!.x);
    expect(run!.x + run!.width).toBeLessThanOrEqual(workbench!.x + workbench!.width + 1);
    expect(zip!.y).toBeGreaterThan(run!.y);
  });

  test("published safety constants are conservative and internally consistent", async () => {
    expect(WEB_IMAGE_OPTIMIZER_LIMITS.count).toBeGreaterThanOrEqual(1);
    expect(WEB_IMAGE_OPTIMIZER_LIMITS.perFile).toBeLessThanOrEqual(WEB_IMAGE_OPTIMIZER_LIMITS.total);
    expect(WEB_IMAGE_OPTIMIZER_LIMITS.pixels).toBeLessThanOrEqual(WEB_IMAGE_OPTIMIZER_LIMITS.totalPixels);
    expect(WEB_IMAGE_OPTIMIZER_LIMITS.maxSide ** 2).toBeGreaterThanOrEqual(WEB_IMAGE_OPTIMIZER_LIMITS.pixels);
    expect(WEB_IMAGE_OPTIMIZER_LIMITS).toEqual({
      count: 10,
      perFile: 15 * 1024 * 1024,
      total: 50 * 1024 * 1024,
      pixels: 20_000_000,
      totalPixels: 20_000_000,
      maxSide: 16_384,
    });
  });
});
