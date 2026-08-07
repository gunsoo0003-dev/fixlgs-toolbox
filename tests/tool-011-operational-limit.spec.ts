import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPORT_PATH = path.join(process.cwd(), 'test-results', 'tool-011-limit-report.json');
const FIXTURE = path.join(process.cwd(), 'public', 'test-fixtures', 'sample.jpg');

// 011의 현재 사용자-facing 운영 경계. 이번 검수는 브라우저를 OOM까지 밀어붙이는
// 하드웨어 한계 탐색이 아니라, 실제 도구에서 "최대 성공값 / 첫 차단값"을 증명한다.
const MAX_OUTPUT_PIXELS = 100_000_000;
const MAX_SIDE = 16_384;
const MAX_SQUARE_SIDE = 10_000; // 10,000 x 10,000 = 100,000,000px
const FIRST_BLOCKED_SQUARE_SIDE = 10_001;
const FIRST_BLOCKED_SIDE = 16_385;

type ToolAttempt = {
  width: number;
  height: number;
  pixels: number;
  expected: 'download' | 'blocked';
  passed: boolean;
  elapsedMs: number;
  bytes: number | null;
  filename: string | null;
  warningVisible: boolean;
  error: string | null;
};

type DeviceEvidence = {
  deviceClass: 'desktop' | 'mobile-emulation';
  viewport: { width: number; height: number };
  userAgent: string;
  checks: Array<{
    width: number;
    height: number;
    pixels: number;
    downloadEnabled: boolean;
    warningVisible: boolean;
  }>;
};

async function prepareTool(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto('/ko/image-padding-background-tool');
  await expect(page.getByTestId('tool011-root')).toBeVisible();
  await page.getByTestId('tool011-file').setInputFiles(FIXTURE);
  await expect(page.getByTestId('tool011-editor')).toBeVisible();
  await page.getByTestId('tool011-mode-custom').click();
  await page.getByTestId('tool011-output-format').selectOption('jpg');
}

async function setDimensions(page: Page, width: number, height: number) {
  await page.getByTestId('tool011-custom-width').fill(String(width));
  await page.getByTestId('tool011-custom-height').fill(String(height));
  await expect(page.getByTestId('tool011-result-size')).toContainText(`${width} × ${height}px`);
}

async function proveDownload(page: Page, width: number, height: number): Promise<ToolAttempt> {
  const started = Date.now();
  try {
    await setDimensions(page, width, height);
    await expect(page.getByTestId('tool011-download')).toBeEnabled();
    await expect(page.getByTestId('tool011-limit-warning')).toHaveCount(0);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('tool011-download').click();
    const download = await downloadPromise;
    await expect(page.getByTestId('tool011-status')).toContainText('다운로드 준비 완료', { timeout: 120_000 });

    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    let bytes = 0;
    if (stream) for await (const chunk of stream) bytes += chunk.length;
    expect(bytes).toBeGreaterThan(0);

    return {
      width,
      height,
      pixels: width * height,
      expected: 'download',
      passed: true,
      elapsedMs: Date.now() - started,
      bytes,
      filename: download.suggestedFilename(),
      warningVisible: false,
      error: null,
    };
  } catch (error) {
    return {
      width,
      height,
      pixels: width * height,
      expected: 'download',
      passed: false,
      elapsedMs: Date.now() - started,
      bytes: null,
      filename: null,
      warningVisible: await page.getByTestId('tool011-limit-warning').isVisible().catch(() => false),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function proveBlocked(page: Page, width: number, height: number): Promise<ToolAttempt> {
  const started = Date.now();
  try {
    await setDimensions(page, width, height);
    await expect(page.getByTestId('tool011-download')).toBeDisabled();
    await expect(page.getByTestId('tool011-limit-warning')).toBeVisible();
    return {
      width,
      height,
      pixels: width * height,
      expected: 'blocked',
      passed: true,
      elapsedMs: Date.now() - started,
      bytes: null,
      filename: null,
      warningVisible: true,
      error: null,
    };
  } catch (error) {
    return {
      width,
      height,
      pixels: width * height,
      expected: 'blocked',
      passed: false,
      elapsedMs: Date.now() - started,
      bytes: null,
      filename: null,
      warningVisible: await page.getByTestId('tool011-limit-warning').isVisible().catch(() => false),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function collectDeviceGuardEvidence(
  page: Page,
  deviceClass: DeviceEvidence['deviceClass'],
  viewport: DeviceEvidence['viewport'],
): Promise<DeviceEvidence> {
  await prepareTool(page, viewport);
  const points = [
    { width: MAX_SQUARE_SIDE, height: MAX_SQUARE_SIDE },
    { width: FIRST_BLOCKED_SQUARE_SIDE, height: FIRST_BLOCKED_SQUARE_SIDE },
    { width: MAX_SIDE, height: 1 },
    { width: FIRST_BLOCKED_SIDE, height: 1 },
  ];
  const checks: DeviceEvidence['checks'] = [];
  for (const point of points) {
    await setDimensions(page, point.width, point.height);
    checks.push({
      ...point,
      pixels: point.width * point.height,
      downloadEnabled: await page.getByTestId('tool011-download').isEnabled(),
      warningVisible: await page.getByTestId('tool011-limit-warning').isVisible().catch(() => false),
    });
  }
  return {
    deviceClass,
    viewport,
    userAgent: await page.evaluate(() => navigator.userAgent),
    checks,
  };
}

test('proves the effective 011 operational pixel and side boundaries with real tool output and first-block evidence', async ({ page }) => {
  test.setTimeout(240_000);

  // 실제 출력 성공 증거: 픽셀 상한과 한 변 상한을 각각 도구 다운로드로 검증한다.
  await prepareTool(page, { width: 1440, height: 900 });
  const maxPixelOutput = await proveDownload(page, MAX_SQUARE_SIDE, MAX_SQUARE_SIDE);
  expect(maxPixelOutput.passed, maxPixelOutput.error ?? '100MP output must succeed').toBe(true);

  const firstPixelBlock = await proveBlocked(page, FIRST_BLOCKED_SQUARE_SIDE, FIRST_BLOCKED_SQUARE_SIDE);
  expect(firstPixelBlock.passed, firstPixelBlock.error ?? 'first over-pixel value must be blocked').toBe(true);

  const maxSideOutput = await proveDownload(page, MAX_SIDE, 1);
  expect(maxSideOutput.passed, maxSideOutput.error ?? '16,384px side output must succeed').toBe(true);

  const firstSideBlock = await proveBlocked(page, FIRST_BLOCKED_SIDE, 1);
  expect(firstSideBlock.passed, firstSideBlock.error ?? '16,385px side must be blocked').toBe(true);

  // PC / 모바일 뷰포트에서 동일한 운영 경계가 실제 UI에 적용되는지 별도 확인한다.
  const desktop = await collectDeviceGuardEvidence(page, 'desktop', { width: 1440, height: 900 });
  const mobile = await collectDeviceGuardEvidence(page, 'mobile-emulation', { width: 390, height: 844 });
  for (const evidence of [desktop, mobile]) {
    expect(evidence.checks[0].downloadEnabled).toBe(true);
    expect(evidence.checks[0].warningVisible).toBe(false);
    expect(evidence.checks[1].downloadEnabled).toBe(false);
    expect(evidence.checks[1].warningVisible).toBe(true);
    expect(evidence.checks[2].downloadEnabled).toBe(true);
    expect(evidence.checks[2].warningVisible).toBe(false);
    expect(evidence.checks[3].downloadEnabled).toBe(false);
    expect(evidence.checks[3].warningVisible).toBe(true);
  }

  const report = {
    schemaVersion: 3,
    kind: 'operational-limit-evidence',
    generatedAt: new Date().toISOString(),
    boundaryDefinition: 'effective user-facing 011 tool boundary; not a destructive browser/OOM hard-limit search',
    pixelBoundary: {
      maxPassedPixels: MAX_OUTPUT_PIXELS,
      maxPassedDimensions: { width: MAX_SQUARE_SIDE, height: MAX_SQUARE_SIDE },
      firstFailedPixels: FIRST_BLOCKED_SQUARE_SIDE * FIRST_BLOCKED_SQUARE_SIDE,
      firstFailedDimensions: { width: FIRST_BLOCKED_SQUARE_SIDE, height: FIRST_BLOCKED_SQUARE_SIDE },
      maxPassedEvidence: maxPixelOutput,
      firstFailedEvidence: firstPixelBlock,
    },
    sideBoundary: {
      maxPassedSide: MAX_SIDE,
      maxPassedDimensions: { width: MAX_SIDE, height: 1 },
      firstFailedSide: FIRST_BLOCKED_SIDE,
      firstFailedDimensions: { width: FIRST_BLOCKED_SIDE, height: 1 },
      maxPassedEvidence: maxSideOutput,
      firstFailedEvidence: firstSideBlock,
    },
    deviceEvidence: [desktop, mobile],
    evidence: {
      browserBlobGeneration: true,
      browserDecodeVerification: false,
      actualToolDownloadAtMaxPassed: true,
      firstBlockedValueVerifiedInActualTool: true,
      desktopViewportVerified: true,
      mobileViewportEmulationVerified: true,
      physicalMobileDeviceVerified: false,
    },
    note: 'The previous candidate-only probe passed through 10,240px and therefore could not identify a browser hard failure. This test instead proves the tool operational boundary safely: 100,000,000px and 16,384px succeed through the real 011 download path, while the immediately over-limit values are blocked by the real UI guard. Mobile evidence is viewport emulation, not a physical phone measurement.',
  };

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
});
