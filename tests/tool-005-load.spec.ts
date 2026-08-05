import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const fixture = path.resolve(process.cwd(), "public", "test-fixtures", "target-large.jpg");

test.describe("005 부하·안전선 계측", () => {
  for (const count of [5, 10]) {
    test(`${count}개 JPG 순차 목표 압축 처리 시간을 기록한다`, async ({ page }, testInfo) => {
      await page.goto("/ko/target-size-image-compressor");
      const bytes = await fs.readFile(fixture);
      await page.getByTestId("target-file-input").setInputFiles(Array.from({ length: count }, (_, i) => ({ name: `load-${i + 1}.jpg`, mimeType: "image/jpeg", buffer: bytes })));
      await expect(page.getByTestId("target-file-card")).toHaveCount(count);
      await page.getByTestId("target-value").fill("500");
      await page.getByRole("button", { name: "모든 파일에 적용" }).click();
      const started = Date.now();
      await page.getByTestId("target-compress-button").click();
      await expect.poll(async () => {
        const states = await page.getByTestId("target-file-card").evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-status")));
        return states.every((s) => ["reached", "already", "unreached", "failed", "cancelled"].includes(s || ""));
      }, { timeout: 600_000 }).toBe(true);
      const durationMs = Date.now() - started;
      const states = await page.getByTestId("target-file-card").evaluateAll((nodes) => nodes.map((n) => ({ status: n.getAttribute("data-status"), result: Number(n.getAttribute("data-result-size")), attempts: Number(n.getAttribute("data-attempts")) })));
      await testInfo.attach(`load-${count}-result.json`, { body: Buffer.from(JSON.stringify({ project: testInfo.project.name, count, durationMs, states }, null, 2)), contentType: "application/json" });
      expect(states.every((s) => s.status === "reached" || s.status === "already")).toBe(true);
      expect(states.every((s) => s.result > 0 && s.result <= 497_500)).toBe(true);
      expect(states.every((s) => s.attempts <= 10)).toBe(true);
    });
  }
});
