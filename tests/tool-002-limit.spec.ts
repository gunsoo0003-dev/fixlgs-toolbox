import { expect, test } from "@playwright/test";
import { makeOversizedJpeg, makeRasterBuffer, projectMatches, saveMetric, waitForStatus } from "./helpers/limit-test-utils";

const stages = [
  { label: "desktop-4MP-jpg-to-avif", width: 2000, height: 2000, mime: "image/jpeg" as const, timeout: 180_000, project: "desktop" as const },
  { label: "desktop-12MP-png-to-avif", width: 4000, height: 3000, mime: "image/png" as const, timeout: 240_000, project: "desktop" as const },
  { label: "desktop-24MP-jpg-to-avif", width: 6000, height: 4000, mime: "image/jpeg" as const, timeout: 360_000, project: "desktop" as const },
  { label: "desktop-32MP-jpg-to-avif", width: 8000, height: 4000, mime: "image/jpeg" as const, timeout: 480_000, project: "desktop" as const },
  { label: "desktop-40MP-jpg-to-avif", width: 8000, height: 5000, mime: "image/jpeg" as const, timeout: 600_000, project: "desktop" as const },
  { label: "mobile-8MP-jpg-to-avif", width: 3200, height: 2500, mime: "image/jpeg" as const, timeout: 300_000, project: "mobile" as const },
];

test.describe("002 확정 운영 안전선·경계 검수", () => {
  for (const stage of stages) {
    test(`${stage.label} 실제 변환`, async ({ page }, testInfo) => {
      test.skip(!projectMatches(testInfo, stage.project), `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeout + 90_000);
      const started = Date.now();
      await page.goto("/ko/heic-avif-image-converter");
      const buffer = await makeRasterBuffer(page, stage.width, stage.height, stage.mime, 0.78);
      const extension = stage.mime === "image/png" ? "png" : "jpg";
      await page.getByTestId("heic-file-input").setInputFiles({ name: `stage.${extension}`, mimeType: stage.mime, buffer });
      await expect(page.getByTestId("heic-file-card")).toHaveCount(1);
      await page.getByTestId("heic-run").click();
      const status = await waitForStatus(page, "heic-file-card", /done|error|cancelled/, stage.timeout);
      await saveMetric("002", testInfo, stage.label, { width: stage.width, height: stage.height, pixels: stage.width * stage.height, inputMime: stage.mime, expectedOutput: "image/avif", inputBytes: buffer.length, status, durationMs: Date.now() - started, note: "JPG/PNG→AVIF 인코더 한계 계측. HEIC 디코딩은 실제 HEIC fixture 확보 후 별도 검수 필요." });
      expect(status).toBe("done");
    });
  }

  test("파일 수·파일 용량·40MP 초과 경계", async ({ page }, testInfo) => {
    test.skip(!projectMatches(testInfo, "desktop"), "desktop 전용 경계 검수");
    await page.goto("/ko/heic-avif-image-converter");
    const sample = await makeRasterBuffer(page, 256, 256, "image/jpeg");
    await page.getByTestId("heic-file-input").setInputFiles(Array.from({ length: 11 }, (_, i) => ({ name: `count-${i}.jpg`, mimeType: "image/jpeg", buffer: sample })));
    await expect(page.getByTestId("heic-file-card")).toHaveCount(10);
    await page.reload();
    const oversized = await makeOversizedJpeg(10 * 1024 * 1024 + 1);
    await page.getByTestId("heic-file-input").setInputFiles({ name: "oversized.jpg", mimeType: "image/jpeg", buffer: oversized });
    await expect(page.getByTestId("heic-file-card")).toHaveCount(0);
    await page.reload();
    const overPixels = await makeRasterBuffer(page, 8001, 5000, "image/jpeg", 0.65);
    await page.getByTestId("heic-file-input").setInputFiles({ name: "over-pixels.jpg", mimeType: "image/jpeg", buffer: overPixels });
    await expect(page.getByTestId("heic-file-card")).toHaveCount(0);
    await saveMetric("002", testInfo, "validated-operational-limits", { acceptedFiles: 10, rejectedAtFiles: 11, perFileBytesBlockedAbove: 10 * 1024 * 1024, pixelsBlockedAbove: 40_000_000 });
  });
});
