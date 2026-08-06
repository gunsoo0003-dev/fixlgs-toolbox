import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WEB_IMAGE_OPTIMIZER_LIMITS as CURRENT } from "../components/web-image-optimizer-tool";

type Probe = {
  kind: "pixels" | "batch";
  label: string;
  success: boolean;
  durationMs: number;
  pixelsPerImage: number;
  imageCount: number;
  error?: string;
};

const outputDir = join(process.cwd(), "test-results");
const jsonPath = join(outputDir, "tool-007-auto-limit-report.json");
const textPath = join(outputDir, "tool-007-auto-limit-report.txt");

function safeFloor(value: number, step: number) {
  return Math.max(step, Math.floor(value / step) * step);
}

async function runCanvasProbe(
  page: import("@playwright/test").Page,
  width: number,
  height: number,
  count: number,
  timeoutMs: number,
): Promise<{ success: boolean; durationMs: number; error?: string }> {
  return page.evaluate(
    async ({ width, height, count, timeoutMs }) => {
      const started = performance.now();
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`probe timeout after ${timeoutMs}ms`)), timeoutMs);
      });
      const work = (async () => {
        for (let index = 0; index < count; index += 1) {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d", { alpha: true });
          if (!context) throw new Error("2d canvas unavailable");
          context.fillStyle = `rgb(${(index * 47) % 255}, ${(index * 83) % 255}, ${(index * 131) % 255})`;
          context.fillRect(0, 0, width, height);
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((value) => value ? resolve(value) : reject(new Error("canvas encoding returned null")), "image/webp", 0.84);
          });
          if (!blob.size) throw new Error("empty encoded blob");
          canvas.width = 1;
          canvas.height = 1;
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      })();
      try {
        await Promise.race([work, timeout]);
        return { success: true, durationMs: Math.round(performance.now() - started) };
      } catch (error) {
        return {
          success: false,
          durationMs: Math.round(performance.now() - started),
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    { width, height, count, timeoutMs },
  );
}

test("TOOLBOX 007 automatically explores browser processing headroom and writes a safety report", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "resource-heavy exploratory probe runs once on desktop");
  test.setTimeout(180_000);
  await page.goto("/ko/web-image-optimizer");

  const probes: Probe[] = [];
  const pixelCandidates = [
    { width: 4096, height: 4096 },
    { width: 5632, height: 5632 },
    { width: 7168, height: 7168 },
    { width: 8192, height: 8192 },
  ];

  for (const candidate of pixelCandidates) {
    const result = await runCanvasProbe(page, candidate.width, candidate.height, 1, 20_000);
    probes.push({
      kind: "pixels",
      label: `${candidate.width}x${candidate.height}`,
      success: result.success,
      durationMs: result.durationMs,
      pixelsPerImage: candidate.width * candidate.height,
      imageCount: 1,
      error: result.error,
    });
    if (!result.success || result.durationMs > 15_000) break;
  }

  const batchCandidates = [5, 10, 15, 20];
  for (const count of batchCandidates) {
    const result = await runCanvasProbe(page, 1920, 1080, count, 30_000);
    probes.push({
      kind: "batch",
      label: `${count}x 1920x1080`,
      success: result.success,
      durationMs: result.durationMs,
      pixelsPerImage: 1920 * 1080,
      imageCount: count,
      error: result.error,
    });
    if (!result.success || result.durationMs > 25_000) break;
  }

  const successfulPixelProbes = probes.filter((probe) => probe.kind === "pixels" && probe.success && probe.durationMs <= 15_000);
  const firstPixelFailure = probes.find((probe) => probe.kind === "pixels" && (!probe.success || probe.durationMs > 15_000));
  const maxSuccessfulPixels = Math.max(...successfulPixelProbes.map((probe) => probe.pixelsPerImage), 0);

  const successfulBatchProbes = probes.filter((probe) => probe.kind === "batch" && probe.success && probe.durationMs <= 25_000);
  const firstBatchFailure = probes.find((probe) => probe.kind === "batch" && (!probe.success || probe.durationMs > 25_000));
  const maxSuccessfulCount = Math.max(...successfulBatchProbes.map((probe) => probe.imageCount), 0);
  const maxSuccessfulBatchPixels = Math.max(...successfulBatchProbes.map((probe) => probe.pixelsPerImage * probe.imageCount), 0);

  const measuredPixelRecommendation = safeFloor(maxSuccessfulPixels * 0.55, 1_000_000);
  const measuredTotalPixelRecommendation = safeFloor(maxSuccessfulBatchPixels * 0.55, 5_000_000);
  const coherentPixelLimit = Math.min(CURRENT.pixels, measuredPixelRecommendation, measuredTotalPixelRecommendation);
  const recommendations = {
    count: Math.min(CURRENT.count, Math.max(1, Math.floor(maxSuccessfulCount * 0.6))),
    pixels: coherentPixelLimit,
    totalPixels: Math.max(coherentPixelLimit, Math.min(CURRENT.totalPixels, measuredTotalPixelRecommendation)),
    perFile: CURRENT.perFile,
    total: CURRENT.total,
    maxSide: CURRENT.maxSide,
    safetyMargin: "45% headroom from the largest timely successful browser probe; byte limits remain validated by boundary tests",
  };

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      project: testInfo.project.name,
      browser: testInfo.project.use.browserName ?? "chromium",
    },
    purpose: "Exploratory browser headroom measurement. Expected timeout/failure marks a measured boundary, not a product-test failure.",
    timelyThresholdsMs: { pixels: 15_000, batch: 25_000 },
    currentLimits: CURRENT,
    maximumTimelySuccess: {
      pixelsPerImage: maxSuccessfulPixels,
      imageCount: maxSuccessfulCount,
      batchPixels: maxSuccessfulBatchPixels,
    },
    firstMeasuredBoundary: {
      pixels: firstPixelFailure ?? null,
      batch: firstBatchFailure ?? null,
    },
    recommendations,
    probes,
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const lines = [
    "TOOLBOX 007 자동 한계탐색 결과",
    `생성: ${report.generatedAt}`,
    "",
    `최대 적시 성공 단일 픽셀: ${maxSuccessfulPixels.toLocaleString()}`,
    `최대 적시 성공 파일 수: ${maxSuccessfulCount}`,
    `최대 적시 성공 일괄 픽셀: ${maxSuccessfulBatchPixels.toLocaleString()}`,
    `최초 단일 경계: ${firstPixelFailure ? `${firstPixelFailure.label} / ${firstPixelFailure.durationMs}ms / ${firstPixelFailure.error ?? "slow"}` : "탐색 상한 내 미도달"}`,
    `최초 일괄 경계: ${firstBatchFailure ? `${firstBatchFailure.label} / ${firstBatchFailure.durationMs}ms / ${firstBatchFailure.error ?? "slow"}` : "탐색 상한 내 미도달"}`,
    "",
    "권장 안전 운영 한도",
    `파일 수: ${recommendations.count}`,
    `파일당 픽셀: ${recommendations.pixels.toLocaleString()}`,
    `전체 픽셀: ${recommendations.totalPixels.toLocaleString()}`,
    `파일당 용량: ${recommendations.perFile.toLocaleString()} bytes`,
    `전체 용량: ${recommendations.total.toLocaleString()} bytes`,
    `최대 변 길이: ${recommendations.maxSide.toLocaleString()} px`,
    `안전 여유: ${recommendations.safetyMargin}`,
    "",
    "세부 probe",
    ...probes.map((probe) => `${probe.kind}\t${probe.label}\t${probe.success ? "PASS" : "BOUNDARY"}\t${probe.durationMs}ms\t${probe.error ?? ""}`),
  ];
  writeFileSync(textPath, lines.join("\n"), "utf8");

  console.log(`\n[007 AUTO LIMIT] report: ${textPath}`);
  console.log(`[007 AUTO LIMIT] max timely pixels: ${maxSuccessfulPixels}`);
  console.log(`[007 AUTO LIMIT] max timely count: ${maxSuccessfulCount}`);
  console.log(`[007 AUTO LIMIT] recommended: ${JSON.stringify(recommendations)}\n`);

  expect(maxSuccessfulPixels).toBeGreaterThanOrEqual(4096 * 4096);
  expect(maxSuccessfulCount).toBeGreaterThanOrEqual(5);
  expect(recommendations.count).toBe(CURRENT.count);
  expect(recommendations.pixels).toBe(CURRENT.pixels);
  expect(recommendations.totalPixels).toBe(CURRENT.totalPixels);
});
