import { expect, test, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const fixturePath = path.resolve(process.cwd(), "public", "test-fixtures", "sample.jpg");
const metricsDir = path.resolve(process.cwd(), "test-results", "006-load-limit-metrics");

type Stage = {
  label: string;
  width: number;
  height: number;
  project: "desktop" | "mobile";
  timeoutMs: number;
};

type StageResult = Stage & {
  outputPixels: number;
  durationMs: number;
  status: "passed" | "failed";
  actualStatus?: string | null;
  actualWidth?: number;
  actualHeight?: number;
  detail?: string;
  note: string;
};

const stages: Stage[] = [
  { label: "desktop-4MP", width: 2000, height: 2000, project: "desktop", timeoutMs: 90_000 },
  { label: "desktop-12MP", width: 4000, height: 3000, project: "desktop", timeoutMs: 120_000 },
  { label: "desktop-24MP", width: 6000, height: 4000, project: "desktop", timeoutMs: 180_000 },
  { label: "desktop-36MP", width: 6000, height: 6000, project: "desktop", timeoutMs: 240_000 },
  { label: "desktop-38MP", width: 7600, height: 5000, project: "desktop", timeoutMs: 270_000 },
  { label: "desktop-40MP", width: 8000, height: 5000, project: "desktop", timeoutMs: 300_000 },
  { label: "viewport-mobile-4MP", width: 2000, height: 2000, project: "mobile", timeoutMs: 90_000 },
  { label: "viewport-mobile-8MP", width: 3200, height: 2500, project: "mobile", timeoutMs: 120_000 },
  { label: "viewport-mobile-12MP", width: 4000, height: 3000, project: "mobile", timeoutMs: 150_000 },
  { label: "viewport-mobile-16MP", width: 4000, height: 4000, project: "mobile", timeoutMs: 180_000 },
];

async function uploadOne(page: Page) {
  await page.getByTestId("resizer-file-input").setInputFiles(fixturePath);
  await expect(page.getByTestId("resizer-file-card")).toHaveCount(1);
  await expect(page.getByTestId("resizer-file-card")).toHaveAttribute("data-status", "calculated");
}

async function setCheckbox(page: Page, testId: string, checked: boolean) {
  const checkbox = page.getByTestId(testId);
  await expect(checkbox).toBeAttached();
  await expect(checkbox).toBeEnabled();
  await checkbox.setChecked(checked, { timeout: 10_000, force: true });
  if (checked) await expect(checkbox).toBeChecked();
  else await expect(checkbox).not.toBeChecked();
}

async function configureExactSize(page: Page, width: number, height: number) {
  await setCheckbox(page, "global-keep-ratio", false);
  await setCheckbox(page, "global-prevent-upscale", false);

  await page.getByTestId("global-width").fill(String(width));
  await page.getByTestId("global-height").fill(String(height));
  await page.getByRole("button", { name: "모든 파일에 적용", exact: true }).click();

  const card = page.getByTestId("resizer-file-card");
  await expect(card).toHaveAttribute("data-status", "calculated");
}

async function waitForFinished(page: Page, timeout: number) {
  const card = page.getByTestId("resizer-file-card");
  await expect.poll(
    async () => card.getAttribute("data-status"),
    { timeout, intervals: [250, 500, 1000, 2000] },
  ).toMatch(/done|kept|failed|cancelled/);
}

async function saveStageResult(testInfo: TestInfo, result: StageResult) {
  const body = Buffer.from(JSON.stringify(result, null, 2));
  await testInfo.attach(`${result.label}.json`, {
    body,
    contentType: "application/json",
  });
  await fs.mkdir(metricsDir, { recursive: true });
  await fs.writeFile(path.join(metricsDir, `${testInfo.project.name}-${result.label}.json`), body);
}

test.describe("006 독립 단계형 부하·안정성 한계 계측", () => {
  for (const stage of stages) {
    test(`${stage.label} 출력 처리`, async ({ page }, testInfo) => {
      const isMobileProject = testInfo.project.name.includes("mobile");
      test.skip(stage.project === "mobile" ? !isMobileProject : isMobileProject,
        `${stage.project} 전용 단계`);
      test.setTimeout(stage.timeoutMs + 45_000);

      const note = isMobileProject
        ? "테스트 PC에서 모바일 viewport를 에뮬레이션한 결과이며 실제 모바일 기기 메모리 한계는 아니다."
        : "Desktop Chromium에서 측정한 단계별 출력 픽셀 처리 결과다.";
      const started = Date.now();
      let result: StageResult;

      try {
        await page.goto("/ko/image-resizer");
        await uploadOne(page);
        await configureExactSize(page, stage.width, stage.height);
        await page.getByTestId("resizer-run").click();
        await waitForFinished(page, stage.timeoutMs);

        const card = page.getByTestId("resizer-file-card");
        const actualStatus = await card.getAttribute("data-status");
        const actualWidth = Number(await card.getAttribute("data-result-width"));
        const actualHeight = Number(await card.getAttribute("data-result-height"));

        result = {
          ...stage,
          outputPixels: stage.width * stage.height,
          durationMs: Date.now() - started,
          status: actualStatus === "done" && actualWidth === stage.width && actualHeight === stage.height
            ? "passed"
            : "failed",
          actualStatus,
          actualWidth,
          actualHeight,
          note,
          detail: actualStatus === "done" && actualWidth === stage.width && actualHeight === stage.height
            ? undefined
            : `status=${actualStatus}, result=${actualWidth}x${actualHeight}`,
        };

        await saveStageResult(testInfo, result);
        expect(result.status, result.detail).toBe("passed");

        await page.getByRole("button", { name: "다시 크기 변경", exact: true }).click();
        await expect(card).toHaveAttribute("data-status", "calculated");
      } catch (error) {
        result = {
          ...stage,
          outputPixels: stage.width * stage.height,
          durationMs: Date.now() - started,
          status: "failed",
          note,
          detail: error instanceof Error ? error.message : String(error),
        };
        await saveStageResult(testInfo, result);
        throw error;
      }
    });
  }

  test("확정 운영 안전선과 출력 픽셀 경계 차단", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto("/ko/image-resizer");
    const bytes = await fs.readFile(fixturePath);

    await page.getByTestId("resizer-file-input").setInputFiles(
      Array.from({ length: 11 }, (_, index) => ({
        name: `limit-${index + 1}.jpg`,
        mimeType: "image/jpeg",
        buffer: bytes,
      })),
    );

    await expect(page.getByTestId("resizer-file-card")).toHaveCount(10);
    await expect(page.getByTestId("resizer-alert")).toContainText("최대 10개");

    await setCheckbox(page, "global-keep-ratio", false);
    await setCheckbox(page, "global-prevent-upscale", false);
    await page.getByTestId("global-width").fill("8001");
    await page.getByTestId("global-height").fill("5000");
    await page.getByRole("button", { name: "모든 파일에 적용", exact: true }).click();
    await page.getByTestId("resizer-run").click();

    await expect(page.getByTestId("resizer-alert")).toContainText("안전한 처리 범위");
    await expect(page.getByTestId("resizer-file-card").first()).toHaveAttribute("data-status", "calculated");

    const result = {
      project: testInfo.project.name,
      acceptedFiles: 10,
      rejectedAtFiles: 11,
      blockedOutput: { width: 8001, height: 5000, pixels: 40_005_000 },
      validatedOperationalLimits: {
        count: 10,
        perFileBytes: 15 * 1024 * 1024,
        totalBytes: 50 * 1024 * 1024,
        inputPixelsPerFile: 32_000_000,
        inputPixelsTotal: 90_000_000,
        outputPixelsPerFile: 40_000_000,
        maxSide: 16_384,
      },
    };
    const body = Buffer.from(JSON.stringify(result, null, 2));
    await testInfo.attach("006-operational-limit-check.json", { body, contentType: "application/json" });
    await fs.mkdir(metricsDir, { recursive: true });
    await fs.writeFile(path.join(metricsDir, `${testInfo.project.name}-operational-limit-check.json`), body);
  });
});
