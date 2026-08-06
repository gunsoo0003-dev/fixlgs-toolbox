import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const fixture = (name: string) => path.join(process.cwd(), "test-fixtures", name);
const outputDir = path.join(process.cwd(), "test-results");

type Probe = { name: string; width: number; height: number; pixels: number; expected: "accept" | "reject"; accepted: boolean; elapsedMs: number; message: string };

test("009 progressively probes operational pixel boundaries and writes TXT/JSON reports", async ({ page }) => {
  test.setTimeout(180_000);
  mkdirSync(outputDir, { recursive: true });
  const candidates = [
    { name: "tool009-probe-9mp.png", width: 3000, height: 3000, expected: "accept" as const },
    { name: "tool009-probe-16mp.png", width: 4000, height: 4000, expected: "accept" as const },
    { name: "tool009-probe-19_2mp.png", width: 4800, height: 4000, expected: "accept" as const },
    { name: "tool009-probe-over-19_2mp.png", width: 4801, height: 4000, expected: "reject" as const },
  ];
  const probes: Probe[] = [];

  for (const candidate of candidates) {
    await page.goto("/ko/image-brightness-color-adjuster");
    const started = Date.now();
    await page.locator('input[type="file"]').first().setInputFiles(fixture(candidate.name));
    const editor = page.locator('[data-testid="tool009-editor"]');
    const error = page.locator('[data-testid="tool009-error"]');
    await expect(editor.or(error)).toBeVisible({ timeout: 60_000 });
    const accepted = await editor.isVisible();
    const message = accepted ? "accepted" : (await error.textContent())?.trim() || "rejected";
    probes.push({ ...candidate, pixels: candidate.width * candidate.height, accepted, elapsedMs: Date.now() - started, message });
    expect(accepted, `${candidate.name}: ${message}`).toBe(candidate.expected === "accept");
  }

  const accepted = probes.filter(item => item.accepted);
  const highestAccepted = Math.max(...accepted.map(item => item.pixels));
  const firstRejected = probes.find(item => !item.accepted)?.pixels ?? null;
  const sourceVerifiedMaximumPixels = 24_000_000;
  const safetyMarginPercent = 20;
  const safePixelsWith20PercentHeadroom = Math.floor(sourceVerifiedMaximumPixels * 0.8);
  const report = {
    generatedAt: new Date().toISOString(),
    browser: await page.evaluate(() => navigator.userAgent),
    sourceVerifiedMaximumPixels,
    safetyMarginPercent,
    highestAcceptedPixels: highestAccepted,
    firstRejectedPixels: firstRejected,
    configuredBoundaryPixels: 19_200_000,
    safePixelsWith20PercentHeadroom,
    configuredMaxSide: 16_384,
    probes,
    verdict: safePixelsWith20PercentHeadroom === 19_200_000 && highestAccepted === 19_200_000 && firstRejected !== null && firstRejected > 19_200_000 ? "PASS" : "FAIL",
  };
  const lines = [
    "TOOLBOX 009 자동 한계탐색 결과",
    `생성: ${report.generatedAt}`,
    `브라우저: ${report.browser}`,
    `기존 검수 최대 통과 픽셀: ${report.sourceVerifiedMaximumPixels.toLocaleString()}`,
    `안전 여유율: ${report.safetyMarginPercent}%`,
    `운영 한도 통과 픽셀: ${report.highestAcceptedPixels.toLocaleString()}`,
    `최초 차단 픽셀: ${report.firstRejectedPixels?.toLocaleString() ?? "없음"}`,
    `현재 코드 경계: ${report.configuredBoundaryPixels.toLocaleString()}`,
    `안전 여유 적용값: ${report.safePixelsWith20PercentHeadroom.toLocaleString()}`,
    `최대 한 변: ${report.configuredMaxSide.toLocaleString()}px`,
    `판정: ${report.verdict}`,
    "",
    "[탐색 단계]",
    ...probes.map((item, index) => `${index + 1}. ${item.width}×${item.height} (${item.pixels.toLocaleString()}px) / ${item.accepted ? "PASS" : "BLOCK"} / ${item.elapsedMs}ms / ${item.message}`),
  ];
  writeFileSync(path.join(outputDir, "tool-009-auto-limit-report.json"), JSON.stringify(report, null, 2), "utf8");
  writeFileSync(path.join(outputDir, "tool-009-auto-limit-report.txt"), lines.join("\n") + "\n", "utf8");
  expect(report.verdict).toBe("PASS");
});
