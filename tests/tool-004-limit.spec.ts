import { expect, test } from "@playwright/test";
import { makeOversizedJpeg, makeRasterBuffer, projectMatches, saveMetric, waitForStatus } from "./helpers/limit-test-utils";

const stages = [
  { label: "desktop-4MP", width: 2000, height: 2000, timeout: 90_000, project: "desktop" as const },
  { label: "desktop-12MP", width: 4000, height: 3000, timeout: 120_000, project: "desktop" as const },
  { label: "desktop-24MP", width: 6000, height: 4000, timeout: 180_000, project: "desktop" as const },
  { label: "desktop-30MP", width: 6000, height: 5000, timeout: 240_000, project: "desktop" as const },
  { label: "mobile-12MP", width: 4000, height: 3000, timeout: 180_000, project: "mobile" as const },
];

test.describe("004 확정 운영 안전선·경계 검수", () => {
  for (const stage of stages) {
    test(`${stage.label} 실제 압축`, async ({ page }, testInfo) => {
      test.skip(!projectMatches(testInfo, stage.project), `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeout + 60_000);
      const started = Date.now();
      await page.goto("/ko/image-compressor");
      const buffer = await makeRasterBuffer(page, stage.width, stage.height, "image/jpeg", 0.94);
      await page.getByTestId("compressor-file-input").setInputFiles({ name: "stage.jpg", mimeType: "image/jpeg", buffer });
      await expect(page.getByTestId("compressor-file-card")).toHaveCount(1);
      await page.getByTestId("compressor-run").click();
      const status = await waitForStatus(page, "compressor-file-card", /done|kept|failed|cancelled/, stage.timeout);
      const card = page.getByTestId("compressor-file-card");
      await saveMetric("004", testInfo, stage.label, { width: stage.width, height: stage.height, pixels: stage.width * stage.height, inputBytes: buffer.length, outputBytes: Number(await card.getAttribute("data-result-size") || 0), status, durationMs: Date.now() - started });
      expect(status).toMatch(/done|kept/);
    });
  }

  test("30MP 초과·파일 수·파일 용량 경계", async ({ page }, testInfo) => {
    test.skip(!projectMatches(testInfo, "desktop"), "desktop 전용 경계 검수");
    await page.goto("/ko/image-compressor");
    const sample = await makeRasterBuffer(page, 256, 256, "image/jpeg");
    await page.getByTestId("compressor-file-input").setInputFiles(Array.from({ length: 11 }, (_, i) => ({ name: `count-${i}.jpg`, mimeType: "image/jpeg", buffer: sample })));
    await expect(page.getByTestId("compressor-file-card")).toHaveCount(10);
    await page.reload();
    const oversized = await makeOversizedJpeg(15 * 1024 * 1024 + 1);
    await page.getByTestId("compressor-file-input").setInputFiles({ name: "oversized.jpg", mimeType: "image/jpeg", buffer: oversized });
    await expect(page.getByTestId("compressor-file-card")).toHaveCount(0);
    await page.reload();
    const overPixels = await makeRasterBuffer(page, 6001, 5000, "image/jpeg", 0.7);
    await page.getByTestId("compressor-file-input").setInputFiles({ name: "over-pixels.jpg", mimeType: "image/jpeg", buffer: overPixels });
    await expect(page.getByTestId("compressor-file-card")).toHaveCount(0);
    await saveMetric("004", testInfo, "validated-operational-limits", { acceptedFiles: 10, rejectedAtFiles: 11, perFileBytesBlockedAbove: 15 * 1024 * 1024, pixelsBlockedAbove: 30_000_000, totalPixelsConfigured: 80_000_000 });
  });
});
