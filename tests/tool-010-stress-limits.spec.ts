import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { dragCanvasPointer, openTool010 } from "./helpers/tool-010";

const outputDir = path.join(process.cwd(), "test-results");

test("010 progressively probes region count, brush-point density and history responsiveness", async ({ page }) => {
  test.setTimeout(420_000);
  mkdirSync(outputDir, { recursive: true });
  await openTool010(page);
  const canvas = page.locator('[data-testid="tool010-canvas"]');
  const milestones = [10, 25, 50, 60, 75];
  const regionResults: Array<{ count: number; elapsedMs: number; responsive: boolean }> = [];
  let created = 0;
  await page.locator('[data-testid="tool010-mode-rect"]').click();
  for (const target of milestones) {
    const started = Date.now();
    while (created < target) {
      const col = created % 10;
      const row = Math.floor(created / 10) % 8;
      const start = { x: 0.05 + col * 0.085, y: 0.05 + row * 0.105 };
      const end = { x: Math.min(0.98, start.x + 0.045), y: Math.min(0.98, start.y + 0.055) };
      await dragCanvasPointer(page, start, end, 2);
      created += 1;
    }
    const responsive = await page.locator('[data-testid="tool010-download"]').isEnabled();
    regionResults.push({ count: target, elapsedMs: Date.now() - started, responsive });
    if (!responsive) break;
  }

  const countBeforeOverflow = Number((await page.locator('[data-testid="tool010-applied-count"]').textContent())?.match(/\d+/)?.[0] ?? 0);
  expect(countBeforeOverflow).toBe(75);
  await dragCanvasPointer(page, { x: 0.12, y: 0.12 }, { x: 0.2, y: 0.2 }, 2);
  const countAfterOverflow = Number((await page.locator('[data-testid="tool010-applied-count"]').textContent())?.match(/\d+/)?.[0] ?? 0);
  const regionHardLimitApplied = countBeforeOverflow === 75 && countAfterOverflow === 75;
  expect(regionHardLimitApplied).toBe(true);
  await expect(page.locator('[data-testid="tool010-error"]')).toContainText(/75/);

  await page.locator('[data-testid="tool010-mode-brush"]').click();
  const brushStarted = Date.now();
  const box = await canvas.boundingBox(); if (!box) throw new Error("canvas missing");
  await page.mouse.move(box.x + 20, box.y + box.height * .7); await page.mouse.down();
  for (let point = 0; point < 500; point += 1) {
    await page.mouse.move(box.x + 20 + (point % Math.max(30, Math.floor(box.width - 40))), box.y + box.height * .7 + Math.sin(point / 8) * 20);
  }
  await page.mouse.up();
  const brushElapsedMs = Date.now() - brushStarted;
  const afterBrushResponsive = await page.locator('[data-testid="tool010-download"]').isEnabled();

  let undoSteps = 0;
  const undo = page.locator('[data-testid="tool010-undo"]');
  while (await undo.isEnabled() && undoSteps < 120) { await undo.click(); undoSteps += 1; }
  const historyBounded = undoSteps <= 60;
  const maxResponsiveRegions = Math.max(...regionResults.filter(item => item.responsive).map(item => item.count));
  const warningThreshold = Math.max(1, Math.floor(maxResponsiveRegions * .8));
  const report = { generatedAt: new Date().toISOString(), regionResults, maxResponsiveRegions, warningThreshold, hardRegionLimit: 75, regionHardLimitApplied, brushPointsAttempted: 500, brushElapsedMs, afterBrushResponsive, undoSteps, historyBounded, verdict: regionResults.every(item => item.responsive) && regionHardLimitApplied && afterBrushResponsive && historyBounded ? "PASS" : "FAIL" };
  writeFileSync(path.join(outputDir, "tool-010-stress-limit-report.json"), JSON.stringify(report, null, 2));
  expect(report.verdict).toBe("PASS");
});
