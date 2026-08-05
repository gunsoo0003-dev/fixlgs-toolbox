import { expect, test } from "@playwright/test";
import { makeOversizedJpeg, makeRasterBuffer, projectMatches, saveMetric, waitForStatus } from "./helpers/limit-test-utils";

const stages = [
  { label: "desktop-4MP-500KB", width: 2000, height: 2000, targetKB: 500, resize: false, timeout: 120_000, project: "desktop" as const },
  { label: "desktop-12MP-500KB", width: 4000, height: 3000, targetKB: 500, resize: false, timeout: 180_000, project: "desktop" as const },
  { label: "desktop-24MP-300KB-resize", width: 6000, height: 4000, targetKB: 300, resize: true, timeout: 300_000, project: "desktop" as const },
  { label: "desktop-30MP-200KB-resize", width: 6000, height: 5000, targetKB: 200, resize: true, timeout: 420_000, project: "desktop" as const },
  { label: "mobile-12MP-500KB", width: 4000, height: 3000, targetKB: 500, resize: false, timeout: 240_000, project: "mobile" as const },
];

test.describe("005 확정 운영 안전선·경계 검수", () => {
  for (const stage of stages) {
    test(`${stage.label} 반복 목표 압축`, async ({ page }, testInfo) => {
      test.skip(!projectMatches(testInfo, stage.project), `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeout + 90_000);
      const started = Date.now();
      await page.goto("/ko/target-size-image-compressor");
      const buffer = await makeRasterBuffer(page, stage.width, stage.height, "image/jpeg", 0.95);
      await page.getByTestId("target-file-input").setInputFiles({ name: "stage.jpg", mimeType: "image/jpeg", buffer });
      await expect(page.getByTestId("target-file-card")).toHaveCount(1);
      await page.getByTestId("target-value").fill(String(stage.targetKB));
      const resizeToggle = page.locator(".target-size-mode-toggle input[type=checkbox]");
      await resizeToggle.setChecked(stage.resize, { force: true });
      await page.getByRole("button", { name: "모든 파일에 적용", exact: true }).click();
      await page.getByTestId("target-compress-button").click();
      const status = await waitForStatus(page, "target-file-card", /reached|already|unreached|failed|cancelled/, stage.timeout);
      const card = page.getByTestId("target-file-card");
      await saveMetric("005", testInfo, stage.label, { width: stage.width, height: stage.height, pixels: stage.width * stage.height, targetKB: stage.targetKB, allowResize: stage.resize, inputBytes: buffer.length, resultBytes: Number(await card.getAttribute("data-result-size") || 0), attempts: Number(await card.getAttribute("data-attempts") || 0), resultWidth: Number(await card.getAttribute("data-result-width") || 0), resultHeight: Number(await card.getAttribute("data-result-height") || 0), status, durationMs: Date.now() - started });
      expect(status).toMatch(/reached|already|unreached/);
    });
  }

  test("30MP 초과·파일 수·파일 용량 경계", async ({ page }, testInfo) => {
    test.skip(!projectMatches(testInfo, "desktop"), "desktop 전용 경계 검수");
    await page.goto("/ko/target-size-image-compressor");
    const sample = await makeRasterBuffer(page, 256, 256, "image/jpeg");
    await page.getByTestId("target-file-input").setInputFiles(Array.from({ length: 11 }, (_, i) => ({ name: `count-${i}.jpg`, mimeType: "image/jpeg", buffer: sample })));
    await expect(page.getByTestId("target-file-card")).toHaveCount(10);
    await page.reload();
    const oversized = await makeOversizedJpeg(15 * 1024 * 1024 + 1);
    await page.getByTestId("target-file-input").setInputFiles({ name: "oversized.jpg", mimeType: "image/jpeg", buffer: oversized });
    await expect(page.getByTestId("target-file-card")).toHaveCount(0);
    await page.reload();
    const overPixels = await makeRasterBuffer(page, 6001, 5000, "image/jpeg", 0.7);
    await page.getByTestId("target-file-input").setInputFiles({ name: "over-pixels.jpg", mimeType: "image/jpeg", buffer: overPixels });
    await expect(page.getByTestId("target-file-card")).toHaveCount(0);
    await saveMetric("005", testInfo, "validated-operational-limits", { acceptedFiles: 10, rejectedAtFiles: 11, perFileBytesBlockedAbove: 15 * 1024 * 1024, pixelsBlockedAbove: 30_000_000, totalPixelsConfigured: 80_000_000, maxQualitySearch: 9 });
  });
});
