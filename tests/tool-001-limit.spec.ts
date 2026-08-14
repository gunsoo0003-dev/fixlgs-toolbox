import { expect, test } from "@playwright/test";
import { makeOversizedJpeg, makeRasterBuffer, projectMatches, saveMetric, waitForStatus, type RasterMime } from "./helpers/limit-test-utils";

const stages = [
  { label: "desktop-4MP-webp", width: 2000, height: 2000, mime: "image/webp" as RasterMime, output: "image/jpeg", timeout: 90_000, project: "desktop" as const },
  { label: "desktop-12MP-jpg", width: 4000, height: 3000, mime: "image/jpeg" as RasterMime, output: "image/webp", timeout: 120_000, project: "desktop" as const },
  { label: "desktop-24MP-png", width: 6000, height: 4000, mime: "image/png" as RasterMime, output: "image/webp", timeout: 180_000, project: "desktop" as const },
  { label: "desktop-36MP-webp", width: 6000, height: 6000, mime: "image/webp" as RasterMime, output: "image/jpeg", timeout: 240_000, project: "desktop" as const },
  { label: "desktop-40MP-jpg", width: 8000, height: 5000, mime: "image/jpeg" as RasterMime, output: "image/webp", timeout: 300_000, project: "desktop" as const },
  { label: "mobile-12MP-jpg", width: 4000, height: 3000, mime: "image/jpeg" as RasterMime, output: "image/webp", timeout: 180_000, project: "mobile" as const },
];

const ext = (mime: RasterMime) => mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";

test.describe("001 확정 운영 안전선·경계 검수", () => {
  for (const stage of stages) {
    test(`${stage.label} 실제 변환`, async ({ page }, testInfo) => {
      test.skip(!projectMatches(testInfo, stage.project), `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeout + 60_000);
      const started = Date.now();
      await page.goto("/ko/jpg-png-webp-image-converter");
      const buffer = await makeRasterBuffer(page, stage.width, stage.height, stage.mime);
      expect(buffer.length, `${stage.label} fixture가 파일당 20MB 제한보다 작아야 픽셀 한계를 측정할 수 있습니다.`).toBeLessThanOrEqual(20 * 1024 * 1024);
      const input = page.getByTestId("converter-file-input");
      await input.setInputFiles({ name: `stage.${ext(stage.mime)}`, mimeType: stage.mime, buffer });
      const card = page.getByTestId("converter-file-card");
      await expect(card, `${stage.label} 파일이 업로드 검증 단계를 통과해야 합니다.`).toHaveCount(1, { timeout: 30_000 });
      await card.locator("select").first().selectOption(stage.output);
      await page.getByTestId("converter-run").click();
      const status = await waitForStatus(page, "converter-file-card", /done|error|cancelled/, stage.timeout);
      await saveMetric("001", testInfo, stage.label, { width: stage.width, height: stage.height, pixels: stage.width * stage.height, inputMime: stage.mime, outputMime: stage.output, inputBytes: buffer.length, status, durationMs: Date.now() - started });
      expect(status).toBe("done");
    });
  }

  test("파일 수·파일 용량 경계", async ({ page }, testInfo) => {
    test.skip(!projectMatches(testInfo, "desktop"), "desktop 전용 경계 검수");
    await page.goto("/ko/jpg-png-webp-image-converter");
    const sample = await makeRasterBuffer(page, 256, 256, "image/jpeg");
    for (let i = 0; i < 11; i += 1) await page.getByTestId("converter-file-input").setInputFiles({ name: `count-${i}.jpg`, mimeType: "image/jpeg", buffer: Buffer.concat([sample, Buffer.from([i])]) });
    await expect(page.getByTestId("converter-file-card")).toHaveCount(10);
    await page.reload();
    const oversized = await makeOversizedJpeg(20 * 1024 * 1024 + 1);
    await page.getByTestId("converter-file-input").setInputFiles({ name: "oversized.jpg", mimeType: "image/jpeg", buffer: oversized });
    await expect(page.getByTestId("converter-file-card")).toHaveCount(0);
    await saveMetric("001", testInfo, "validated-operational-limits", { acceptedFiles: 10, rejectedAtFiles: 11, perFileBytesBlockedAbove: 20 * 1024 * 1024 });
  });
});
