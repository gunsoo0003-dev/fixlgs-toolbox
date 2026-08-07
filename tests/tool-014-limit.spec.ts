import { expect, test, type Page, type TestInfo } from '@playwright/test';
import path from 'node:path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { TOOL014_LIMIT_CANDIDATES as L } from './config/tool-014-limit-candidates';

const TOOL_NUMBER = '014';
const TOOL_SLUG = 'image-collage-maker';
const ROOT_TEST_ID = 'tool014-workbench';
const ROUTE = `/ko/${TOOL_SLUG}`;
const FIXTURE_DIR = path.resolve(process.cwd(), 'test-fixtures/tool-014-limit');

function productFail(message: string): never { throw new Error(`[PRODUCT_FAIL] ${message}`); }
function harnessError(message: string): never { throw new Error(`[HARNESS_ERROR] ${message}`); }

async function open014(page: Page) {
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  const response = await page.goto(ROUTE);
  if (!response) harnessError(`${TOOL_NUMBER} route returned no HTTP response: ${ROUTE}`);
  if (!response!.ok()) productFail(`${TOOL_NUMBER} route failed: ${ROUTE} / HTTP ${response!.status()}`);

  const root = page.getByTestId(ROOT_TEST_ID);
  const rootCount = await root.count();
  if (rootCount !== 1) harnessError(`expected exactly one [data-testid="${ROOT_TEST_ID}"], found ${rootCount}`);
  await expect(root).toBeVisible();

  const fileInput = root.locator('input[type="file"]').first();
  if (await fileInput.count() !== 1) harnessError('014 upload input[type=file] was not found under the workbench root');
  return { root, fileInput, pageErrors };
}

function baseFixtures(count: number) {
  return Array.from({ length: count }, (_, index) =>
    path.join(FIXTURE_DIR, `tiny-${String((index % 10) + 1).padStart(2, '0')}.png`)
  );
}

function uniqueTinyFixtures(count: number, testInfo: TestInfo) {
  const base = path.join(FIXTURE_DIR, 'tiny-01.png');
  if (!existsSync(base)) harnessError(`missing base fixture ${base}`);

  // Playwright can run desktop/mobile projects in parallel. Keep generated upload
  // fixtures inside this test's unique output directory so workers never delete
  // or overwrite each other's files.
  const tmpDir = testInfo.outputPath('tool-014-limit-fixtures');
  mkdirSync(tmpDir, { recursive: true });
  return Array.from({ length: count }, (_, index) => {
    const out = path.join(tmpDir, `count-${String(index + 1).padStart(2, '0')}.png`);
    copyFileSync(base, out);
    return out;
  });
}


async function waitReadyCount(page: Page, count: number) {
  const root = page.getByTestId(ROOT_TEST_ID);
  // Do not confuse the upload-count badge (items.length / limit) with the
  // decoded-ready count. Limit tests must continue only after the images
  // have actually decoded, otherwise an invalid fixture can falsely look
  // like a valid boundary observation.
  const readyCounter = root.locator('.tool014-left .toolbox-workbench-settings-head p');
  if (await readyCounter.count() !== 1) harnessError('014 ready-image counter was not found');
  await expect(readyCounter).toHaveText(`${count} / ${L.selectedFiles.candidate}`, { timeout: 15_000 });
}

async function select3x3(page: Page) {
  const root = page.getByTestId(ROOT_TEST_ID);
  const button = root.getByTestId('tool014-layout-3x3');

  // The 3×3 option is rendered only after the Grid group is selected.
  // Select the group first instead of assuming every layout button is always in the DOM.
  if (await button.count() !== 1) {
    const gridGroup = root.getByRole('button', { name: /^(격자|Grid|グリッド)$/i }).first();
    if (await gridGroup.count() !== 1) harnessError('014 Grid layout group button was not found');
    await gridGroup.click();
  }

  if (await button.count() !== 1) harnessError('014 3×3 layout button was not found after selecting the Grid group');
  await button.click();
  await expect(button).toHaveClass(/is-active/);
}

async function visibleUnplacedCount(page: Page): Promise<number | null> {
  const root = page.getByTestId(ROOT_TEST_ID);
  const directState = root.locator('[data-testid="tool014-state"]');
  if (await directState.count()) {
    for (const attr of ['data-unplaced','data-unplaced-count','data-unplaced-images']) {
      const value = await directState.getAttribute(attr);
      if (value != null && Number.isFinite(Number(value))) return Number(value);
    }
  }
  const text = (await root.innerText()).replace(/\s+/g, ' ');
  for (const pattern of [
    /미배치[^0-9]{0,12}(\d+)/i,/(\d+)[^0-9]{0,12}미배치/i,
    /unplaced[^0-9]{0,12}(\d+)/i,/(\d+)[^0-9]{0,12}unplaced/i,
    /未配置[^0-9]{0,12}(\d+)/i,/(\d+)[^0-9]{0,12}未配置/i,
  ]) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

async function expectUnplacedCount(page: Page, expected: number, context: string) {
  // Changing layouts updates React state asynchronously. Poll the observable
  // contract instead of sampling the old layout state immediately after click.
  await expect.poll(
    async () => await visibleUnplacedCount(page),
    { message: `${context}: expected ${expected} unplaced image(s)`, timeout: 5_000 },
  ).toBe(expected);
}

async function assertNoSilentCrash(root: ReturnType<Page['getByTestId']>, pageErrors: string[], context: string) {
  await expect(root).toBeVisible();
  if (pageErrors.length) productFail(`${context}: pageerror detected: ${pageErrors.join(' | ')}`);
}

test.describe('014 limit-only — confirmed contract', () => {
  test('3×3 confirmed maximum grid: 9 images => 0 unplaced', async ({ page }) => {
    const { root, fileInput, pageErrors } = await open014(page);
    await fileInput.setInputFiles(baseFixtures(L.layoutCells.candidate));
    await waitReadyCount(page, L.layoutCells.candidate);
    await select3x3(page);
    await expectUnplacedCount(page, 0, '9-cell contract');
    await assertNoSilentCrash(root, pageErrors, '9-cell contract');
  });

  test('3×3 overflow contract: 10th image remains unplaced', async ({ page }) => {
    const { root, fileInput, pageErrors } = await open014(page);
    await fileInput.setInputFiles(baseFixtures(L.layoutCells.above));
    await waitReadyCount(page, L.layoutCells.above);
    await select3x3(page);
    await expectUnplacedCount(page, 1, '10-image overflow contract');
    await assertNoSilentCrash(root, pageErrors, '10-image overflow contract');
  });
});

test.describe('014 limit-only — service upper-bound candidate probes', () => {
  for (const count of [L.selectedFiles.before, L.selectedFiles.candidate, L.selectedFiles.above]) {
    test(`selected-file candidate probe: ${count} files`, async ({ page }, testInfo) => {
      const { root, fileInput, pageErrors } = await open014(page);
      const files = uniqueTinyFixtures(count, testInfo);
      await fileInput.setInputFiles(files);
      const accepted = Math.min(count, L.selectedFiles.candidate);
      await waitReadyCount(page, accepted);
      await select3x3(page);
      await assertNoSilentCrash(root, pageErrors, `${count}-file candidate`);
      const unplaced = await visibleUnplacedCount(page);
      console.log(`[CANDIDATE_OBSERVATION] selectedFiles=${count} unplaced=${unplaced ?? 'unobservable'}`);
    });
  }

  for (const side of [L.outputMaxSide.before, L.outputMaxSide.candidate, L.outputMaxSide.above]) {
    test(`output-side candidate probe: ${side}px square`, async ({ page }) => {
      const { root, fileInput, pageErrors } = await open014(page);
      await fileInput.setInputFiles(baseFixtures(2));
      await waitReadyCount(page, 2);
      const width = root.getByTestId('tool014-width');
      const height = root.getByTestId('tool014-height');
      if (await width.count() !== 1 || await height.count() !== 1) harnessError('output width/height selectors unavailable');
      await width.fill(String(side));
      await height.fill(String(side));
      await width.blur();
      await assertNoSilentCrash(root, pageErrors, `${side}px output-side candidate`);
      console.log(`[CANDIDATE_OBSERVATION] output=${side}x${side}`);
    });
  }
});
