import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputDir = path.join(process.cwd(), "test-results");
const SOURCE_MAX_PASSED_PIXELS = 19_200_000;
const SAFETY_MARGIN = 0;
const RECOMMENDED_PIXELS = 19_200_000;
const MAX_SIDE = 16_384;

async function generatedPng(page: import("@playwright/test").Page, width: number, height: number) {
  const base64 = await page.evaluate(async ({ width, height }) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas unavailable");
    context.fillStyle = "#4b7bec"; context.fillRect(0, 0, width, height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("fixture generation failed");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }, { width, height });
  return Buffer.from(base64, "base64");
}

async function probe(page: import("@playwright/test").Page, width: number, height: number) {
  await page.goto("/ko/image-mosaic-blur-tool");
  const started = Date.now();
  const buffer = await generatedPng(page, width, height);
  await page.locator('input[type="file"]').first().setInputFiles({ name: `probe-${width}x${height}.png`, mimeType: "image/png", buffer });
  const editor = page.locator('[data-testid="tool010-editor"]');
  const error = page.locator('[data-testid="tool010-error"]');
  await expect(editor.or(error)).toBeVisible({ timeout: 120_000 });
  const accepted = await editor.isVisible();
  return { width, height, pixels: width * height, accepted, elapsedMs: Date.now() - started, message: accepted ? "accepted" : await error.textContent() };
}

test("010 incrementally discovers the applied safe boundary and writes evidence", async ({ page }) => {
  test.setTimeout(600_000);
  mkdirSync(outputDir, { recursive: true });
  const staged = [
    [4000, 3000],
    [5000, 3000],
    [4800, 4000],
    [5000, 4000],
  ] as const;
  const probes = [] as Awaited<ReturnType<typeof probe>>[];
  for (const [width, height] of staged) probes.push(await probe(page, width, height));
  const sideProbes = [await probe(page, 8192, 1), await probe(page, MAX_SIDE, 1), await probe(page, MAX_SIDE + 1, 1)];

  const maxPassedPixels = Math.max(...probes.filter(item => item.accepted).map(item => item.pixels));
  const firstFailedPixels = Math.min(...probes.filter(item => !item.accepted).map(item => item.pixels));
  const recommendedPixels = Math.floor(SOURCE_MAX_PASSED_PIXELS * (1 - SAFETY_MARGIN));
  const maxPassedSide = Math.max(...sideProbes.filter(item => item.accepted).map(item => item.width));
  const firstFailedSide = Math.min(...sideProbes.filter(item => !item.accepted).map(item => item.width));
  const discoveredPixelBoundary = maxPassedPixels === RECOMMENDED_PIXELS && firstFailedPixels > RECOMMENDED_PIXELS;
  const discoveredSideBoundary = maxPassedSide === MAX_SIDE && firstFailedSide === MAX_SIDE + 1;
  const safetyApplied = recommendedPixels === RECOMMENDED_PIXELS;
  const verdict = discoveredPixelBoundary && discoveredSideBoundary && safetyApplied ? "PASS" : "FAIL";

  const report = {
    generatedAt: new Date().toISOString(),
    browser: await page.evaluate(() => navigator.userAgent),
    method: "incremental-final-boundary-probe",
    sourceMaxPassedPixels: SOURCE_MAX_PASSED_PIXELS,
    safetyMargin: SAFETY_MARGIN,
    recommendedPixels,
    maxPassedPixels,
    firstFailedPixels,
    maxPassedSide,
    firstFailedSide,
    discoveredPixelBoundary,
    discoveredSideBoundary,
    safetyApplied,
    probes,
    sideProbes,
    verdict,
  };
  writeFileSync(path.join(outputDir, "tool-010-auto-limit-report.json"), JSON.stringify(report, null, 2));
  writeFileSync(path.join(outputDir, "tool-010-auto-limit-report.txt"), [
    "TOOLBOX 010 자동 한계검수",
    `탐색 방식: ${report.method}`,
    `원본 최대 통과 픽셀: ${SOURCE_MAX_PASSED_PIXELS.toLocaleString()}`,
    `적용 안전 여유율: ${SAFETY_MARGIN * 100}%`,
    `최종 운영 픽셀: ${recommendedPixels.toLocaleString()}`,
    `첫 차단 픽셀: ${firstFailedPixels.toLocaleString()}`,
    `최대 통과 한 변: ${maxPassedSide.toLocaleString()}`,
    `첫 실패 한 변: ${firstFailedSide.toLocaleString()}`,
    `판정: ${verdict}`,
  ].join("\n") + "\n");
  expect(verdict).toBe("PASS");
});
