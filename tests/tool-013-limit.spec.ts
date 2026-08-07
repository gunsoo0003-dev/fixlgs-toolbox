import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { openTool013, TOOL013_TESTIDS } from './helpers/tool-013';
import {
  TOOL013_PRODUCT_LIMITS as LIMITS,
  TOOL013_SERVICE_LIMIT_CANDIDATES as SERVICE_LIMITS,
  TOOL013_SERVICE_LIMIT_TEST_VALUES as SERVICE_VALUES,
} from './helpers/tool-013-limit-profile';

const report: Array<Record<string, unknown>> = [];

async function uploadPair(page: import('@playwright/test').Page, fixture: string) {
  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles([fixture, fixture]);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(2);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).last()).toHaveAttribute('data-status', 'ready');
}

async function configureCustomWidth(page: import('@playwright/test').Page, value: number) {
  await page.getByTestId('tool013-direction-vertical').click();
  await page.getByTestId('tool013-sizing-width').click();
  await page.getByTestId('tool013-size-basis').selectOption('custom');
  await page.getByTestId('tool013-allow-upscale').check();
  await page.getByTestId('tool013-custom-size').fill(String(value));
}

async function previewSummary(page: import('@playwright/test').Page) {
  return (await page.getByTestId('tool013-preview').locator('.toolbox-workbench-settings-head p').textContent())?.trim() || '';
}

test.afterAll(() => {
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/tool-013-limit-report.json', JSON.stringify({ productSafetyLimits: LIMITS, serviceLimits: SERVICE_LIMITS, serviceLimitTestValues: SERVICE_VALUES, observations: report }, null, 2));
});

test('service image-count limit accepts 20 and rejects the 21st', async ({ page }) => {
  const fixture = 'test-fixtures/tool013-limit-square-1x1.png';
  await openTool013(page);
  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles(Array.from({ length: SERVICE_LIMITS.imageCount }, () => fixture));
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(20);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard).last()).toHaveAttribute('data-status', 'ready');

  await page.getByTestId(TOOL013_TESTIDS.fileInput).setInputFiles(fixture);
  await expect(page.getByTestId(TOOL013_TESTIDS.fileCard)).toHaveCount(20);
  await expect(page.getByTestId('tool013-error')).toContainText(/최대 20장/);
  report.push({ test: 'service-image-count', accepted: 20, rejectedNext: 21 });
});

test('service output-side limit allows exactly 10000px and blocks 10001px', async ({ page }) => {
  await openTool013(page);
  await uploadPair(page, 'test-fixtures/tool013-limit-landscape-100x1.png');
  await configureCustomWidth(page, SERVICE_VALUES.outputSide.candidate);
  await expect(page.getByTestId('tool013-limit-blocked')).toHaveCount(0);
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeEnabled();
  const atCandidate = await previewSummary(page);
  const dl = page.waitForEvent('download');
  await page.getByTestId(TOOL013_TESTIDS.download).click();
  await dl;

  await page.getByTestId('tool013-custom-size').fill(String(SERVICE_VALUES.outputSide.nextExploration));
  await expect(page.getByTestId('tool013-limit-blocked')).toBeVisible();
  await expect(page.getByTestId('tool013-limit-blocked')).toContainText(/10,000px/);
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeDisabled();
  report.push({ test: 'service-output-side', atCandidate, blocked: await previewSummary(page) });
});

test('service pixel limit allows exactly 25M and blocks the first over-candidate value', async ({ page }) => {
  test.setTimeout(120_000);
  await openTool013(page);
  await uploadPair(page, 'test-fixtures/tool013-limit-ratio-2x1.png');
  await configureCustomWidth(page, SERVICE_VALUES.outputPixels.candidateWidth);
  await expect(page.getByTestId('tool013-preview').locator('.toolbox-workbench-settings-head p')).toContainText('25,000,000');
  await expect(page.getByTestId('tool013-limit-blocked')).toHaveCount(0);
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeEnabled();
  const atCandidate = await previewSummary(page);
  const dl = page.waitForEvent('download');
  await page.getByTestId(TOOL013_TESTIDS.download).click();
  await dl;

  await page.getByTestId('tool013-custom-size').fill(String(SERVICE_VALUES.outputPixels.nextExplorationWidth));
  await expect(page.getByTestId('tool013-limit-blocked')).toBeVisible();
  await expect(page.getByTestId('tool013-limit-blocked')).toContainText(/2,500만 픽셀/);
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeDisabled();
  report.push({ test: 'service-output-pixels', atCandidate, blocked: await previewSummary(page) });
});

test('service block recovers immediately after returning below the limit', async ({ page }) => {
  await openTool013(page);
  await uploadPair(page, 'test-fixtures/tool013-limit-landscape-100x1.png');
  await configureCustomWidth(page, 10_001);
  await expect(page.getByTestId('tool013-limit-blocked')).toBeVisible();
  await page.getByTestId('tool013-custom-size').fill('1200');
  await expect(page.getByTestId('tool013-limit-blocked')).toHaveCount(0);
  await expect(page.getByTestId(TOOL013_TESTIDS.download)).toBeEnabled();
  report.push({ test: 'service-block-recovery', recovered: await previewSummary(page) });
});

test('technical safety constants remain above the service limits as a second guard', async () => {
  expect(LIMITS.maxSideWarn).toBeGreaterThan(SERVICE_LIMITS.outputMaxSide);
  expect(LIMITS.maxSideBlock).toBeGreaterThan(LIMITS.maxSideWarn);
  expect(LIMITS.maxPixelsWarn).toBeGreaterThan(SERVICE_LIMITS.outputMaxPixels);
  expect(LIMITS.maxPixelsBlock).toBeGreaterThan(LIMITS.maxPixelsWarn);
  report.push({ test: 'technical-safety-guard-retained', productSafety: LIMITS, service: SERVICE_LIMITS });
});
