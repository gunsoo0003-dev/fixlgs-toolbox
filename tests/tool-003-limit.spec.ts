import { expect, test } from "@playwright/test";
import { makeSvgBuffer, projectMatches, saveMetric, waitForStatus } from "./helpers/limit-test-utils";

const stages = [
  { label: "desktop-4MP-svg", width: 2000, height: 2000, complexity: 64, timeout: 90_000, project: "desktop" as const },
  { label: "desktop-12MP-svg", width: 4000, height: 3000, complexity: 128, timeout: 120_000, project: "desktop" as const },
  { label: "desktop-24MP-svg", width: 6000, height: 4000, complexity: 192, timeout: 180_000, project: "desktop" as const },
  { label: "desktop-36MP-svg", width: 6000, height: 6000, complexity: 256, timeout: 240_000, project: "desktop" as const },
  { label: "desktop-40MP-svg", width: 8000, height: 5000, complexity: 320, timeout: 300_000, project: "desktop" as const },
  { label: "mobile-12MP-svg", width: 4000, height: 3000, complexity: 128, timeout: 180_000, project: "mobile" as const },
];

test.describe("003 확정 운영 안전선·경계 검수", () => {
  for (const stage of stages) {
    test(`${stage.label} 래스터 변환`, async ({ page }, testInfo) => {
      test.skip(!projectMatches(testInfo, stage.project), `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeout + 60_000);
      const started = Date.now();
      await page.goto("/ko/svg-bmp-tiff-image-converter");
      const buffer = makeSvgBuffer(stage.width, stage.height, stage.complexity);
      await page.getByTestId("svg-file-input").setInputFiles({ name: "stage.svg", mimeType: "image/svg+xml", buffer });
      await expect(page.getByTestId("svg-file-card")).toHaveCount(1);
      await page.getByTestId("svg-run").click();
      const status = await waitForStatus(page, "svg-file-card", /done|error|cancelled/, stage.timeout);
      await saveMetric("003", testInfo, stage.label, { width: stage.width, height: stage.height, pixels: stage.width * stage.height, svgComplexity: stage.complexity, inputBytes: buffer.length, status, durationMs: Date.now() - started });
      expect(status).toBe("done");
    });
  }

  test("40MP 초과·파일 수 경계", async ({ page }, testInfo) => {
    test.skip(!projectMatches(testInfo, "desktop"), "desktop 전용 경계 검수");
    await page.goto("/ko/svg-bmp-tiff-image-converter");
    const sample = makeSvgBuffer(256, 256, 8);
    await page.getByTestId("svg-file-input").setInputFiles(Array.from({ length: 11 }, (_, i) => ({ name: `count-${i}.svg`, mimeType: "image/svg+xml", buffer: sample })));
    await expect(page.getByTestId("svg-file-card")).toHaveCount(10);
    await page.reload();
    const over = makeSvgBuffer(8001, 5000, 16);
    await page.getByTestId("svg-file-input").setInputFiles({ name: "over.svg", mimeType: "image/svg+xml", buffer: over });

    // SVG는 입력 단계에서 벡터 원본을 허용하고, 실제 래스터 출력 시점에
    // 40MP 초과를 차단하는 구조다. 파일 카드가 생성된 뒤 처리 오류가 나야 정상이다.
    const overCard = page.getByTestId("svg-file-card");
    await expect(overCard).toHaveCount(1);
    await page.getByTestId("svg-run").click();
    const overStatus = await waitForStatus(page, "svg-file-card", /error/, 30_000);
    expect(overStatus).toBe("error");
    await saveMetric("003", testInfo, "validated-operational-limits", { acceptedFiles: 10, rejectedAtFiles: 11, svgOutputPixelsBlockedAbove: 40_000_000, overLimitStatus: overStatus, tiffTotalPixelsConfigured: 80_000_000, note: "SVG는 업로드 후 래스터 변환 시 출력 픽셀을 검증한다. 실제 다중 페이지 TIFF fixture 부재로 TIFF 총 픽셀 한계는 코드 경계만 기록하며 실제 디코딩 계측은 별도 필요." });
  });
});
