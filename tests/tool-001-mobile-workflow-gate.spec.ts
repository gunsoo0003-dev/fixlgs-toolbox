import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const fixture = (name: string) => path.join(root, 'test-fixtures', name);
const route = '/ko/jpg-png-webp-image-converter';

type WorkflowEvidence = {
  checkpoint: string;
  pass: boolean;
  detail: string;
};

async function evidence(page: Page, checkpoint: string, fn: () => Promise<{ pass: boolean; detail: string }>) {
  const result = await fn();
  const list = await page.evaluate((entry) => {
    const w = window as any;
    w.__tool001WorkflowEvidence = w.__tool001WorkflowEvidence || [];
    w.__tool001WorkflowEvidence.push(entry);
    return w.__tool001WorkflowEvidence;
  }, { checkpoint, ...result } as WorkflowEvidence);
  console.log(`[001 MOBILE WORKFLOW] ${checkpoint}=${result.pass ? 'PASS' : 'FAIL'} ${result.detail}`);
  return { ...result, list };
}

async function installRuntimeCapture(page: Page) {
  await page.evaluate(() => {
    const w = window as any;
    w.__tool001WorkflowEvidence = [];
    w.__tool001Runtime = { errors: [] as string[], rejections: [] as string[], changes: 0 };
    window.addEventListener('error', (event) => w.__tool001Runtime.errors.push(String(event.message || 'window.error')));
    window.addEventListener('unhandledrejection', (event) => w.__tool001Runtime.rejections.push(String(event.reason || 'unhandledrejection')));
    document.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      if (input instanceof HTMLInputElement && input.type === 'file') w.__tool001Runtime.changes += 1;
    }, true);
  });
}

async function pickFile(page: Page, name = 'sample.jpg') {
  const trigger = page.locator('.toolbox-upload-focus button').first();
  await expect(trigger, 'mobile upload trigger must be visible').toBeVisible();
  await expect(trigger, 'mobile upload trigger must be enabled').toBeEnabled();
  const chooserPromise = page.waitForEvent('filechooser');
  await trigger.tap();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixture(name));
}

async function assertNoBlockingOverlay(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(window.innerHeight - 1, Math.max(0, r.top + Math.min(r.height / 2, window.innerHeight / 3)));
    const top = document.elementFromPoint(x, y);
    const style = getComputedStyle(el);
    return {
      reachable: !!top && (top === el || el.contains(top) || top.contains(el)),
      display: style.display,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height },
    };
  });
}

test.describe('TOOL 001 mobile observable workflow gate', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  test('picker return must cause visible state transition through preview, conversion and download', async ({ page }) => {
    test.setTimeout(120_000);
    page.setDefaultTimeout(10_000);
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await installRuntimeCapture(page);

    await evidence(page, '01_INITIAL_UPLOAD_ZONE_VISIBLE', async () => ({
      pass: await page.locator('.toolbox-upload-focus').isVisible(),
      detail: 'blue upload zone visible before selection',
    }));

    const uploadHit = await assertNoBlockingOverlay(page, '.toolbox-upload-focus button');
    expect(uploadHit.reachable, 'upload trigger center must not be blocked by overlay/z-index').toBeTruthy();
    expect(uploadHit.pointerEvents, 'upload trigger pointer-events').not.toBe('none');

    await pickFile(page, 'sample.jpg');

    await evidence(page, '02_FILE_CHANGE_EVENT', async () => {
      const changes = await page.evaluate(() => (window as any).__tool001Runtime?.changes || 0);
      const inputCount = await page.getByTestId('converter-file-input').evaluate((el: HTMLInputElement) => el.files?.length || 0).catch(() => -1);
      return { pass: changes >= 1, detail: `changeEvents=${changes}, inputFilesAtProbe=${inputCount}` };
    });

    const card = page.getByTestId('converter-file-card').first();
    await expect(card, 'selected file must create a product card').toBeVisible({ timeout: 15_000 });

    await evidence(page, '03_BLUE_ZONE_REMOVED_AFTER_ACCEPT', async () => {
      const blueCount = await page.locator('.toolbox-upload-focus').count();
      const activeVisible = await page.locator('.toolbox-upload-active').isVisible().catch(() => false);
      return { pass: blueCount === 0 && activeVisible, detail: `blueCount=${blueCount}, activeVisible=${activeVisible}` };
    });
    expect(await page.locator('.toolbox-upload-focus').count(), 'blue upload zone must be removed after accepted file').toBe(0);
    await expect(page.locator('.toolbox-upload-active'), 'active selected-images area must replace upload zone').toBeVisible();

    await evidence(page, '04_CARD_HAS_REAL_FILE_METADATA', async () => {
      const text = (await card.innerText()).replace(/\s+/g, ' ');
      const dimensions = text.match(/\d+×\d+/)?.[0] || '';
      return { pass: /sample\.jpg/i.test(text) && !!dimensions && !/-×-/.test(text), detail: `card=${text.slice(0, 240)}` };
    });

    const preview = card.getByRole('img').first();
    await expect(preview, 'preview visual must be visible').toBeVisible();
    await expect.poll(async () => preview.evaluate((el) => {
      if (el instanceof HTMLCanvasElement) return { ready: el.width > 0 && el.height > 0, w: el.width, h: el.height };
      if (el instanceof HTMLImageElement) return { ready: el.complete && el.naturalWidth > 0 && el.naturalHeight > 0, w: el.naturalWidth, h: el.naturalHeight };
      return { ready: false, w: 0, h: 0 };
    }), { message: 'preview must decode to non-zero dimensions', timeout: 15_000 }).toMatchObject({ ready: true });
    const dims = await preview.evaluate((el) => el instanceof HTMLCanvasElement ? { w: el.width, h: el.height } : el instanceof HTMLImageElement ? { w: el.naturalWidth, h: el.naturalHeight } : { w: 0, h: 0 });
    expect(dims.w, 'preview width').toBeGreaterThan(0);
    expect(dims.h, 'preview height').toBeGreaterThan(0);

    await evidence(page, '05_PREVIEW_DECODED', async () => ({ pass: dims.w > 0 && dims.h > 0, detail: `${dims.w}x${dims.h}` }));

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));
    expect(geometry.scrollWidth, 'document must not overflow viewport horizontally').toBeLessThanOrEqual(geometry.innerWidth + 2);
    expect(geometry.bodyScrollWidth, 'body must not overflow viewport horizontally').toBeLessThanOrEqual(geometry.innerWidth + 2);
    const cardBox = await card.boundingBox();
    expect(cardBox, 'card must have layout box').toBeTruthy();
    if (cardBox) {
      expect(cardBox.x, 'card left edge must stay on-screen').toBeGreaterThanOrEqual(-2);
      expect(cardBox.x + cardBox.width, 'card right edge must stay on-screen').toBeLessThanOrEqual(geometry.innerWidth + 2);
    }
    await evidence(page, '06_NO_HORIZONTAL_ESCAPE', async () => ({ pass: geometry.scrollWidth <= geometry.innerWidth + 2 && geometry.bodyScrollWidth <= geometry.innerWidth + 2, detail: JSON.stringify(geometry) }));

    const run = page.getByTestId('converter-run');
    await expect(run, 'conversion action must appear after selection').toBeVisible();
    await expect(run, 'conversion action must be enabled').toBeEnabled();
    await run.scrollIntoViewIfNeeded();
    const runHit = await assertNoBlockingOverlay(page, '[data-testid="converter-run"]');
    expect(runHit.reachable, 'conversion action must not be blocked by overlay/z-index').toBeTruthy();
    expect(runHit.pointerEvents).not.toBe('none');
    await evidence(page, '07_POST_SELECTION_CONTROLS_INTERACTIVE', async () => ({ pass: runHit.reachable && runHit.pointerEvents !== 'none', detail: JSON.stringify(runHit) }));

    await run.tap();
    await expect(card, 'conversion must leave processing state').toHaveAttribute('data-status', /done|error/, { timeout: 30_000 });
    const status = await card.getAttribute('data-status');
    expect(status, 'normal sample conversion must complete successfully').toBe('done');
    await evidence(page, '08_CONVERSION_COMPLETES', async () => ({ pass: status === 'done', detail: `status=${status}` }));

    const downloadButton = card.getByRole('button', { name: /다운로드|Download|保存/ }).first();
    await expect(downloadButton, 'individual download must appear after conversion').toBeVisible();
    await expect(downloadButton).toBeEnabled();
    const dl = page.waitForEvent('download');
    await downloadButton.tap();
    const download = await dl;
    const suggested = download.suggestedFilename();
    expect(suggested, 'download filename must have image extension').toMatch(/\.(jpg|jpeg|png|webp)$/i);
    await evidence(page, '09_RESULT_DOWNLOAD_TRIGGERED', async () => ({ pass: /\.(jpg|jpeg|png|webp)$/i.test(suggested), detail: suggested }));

    const runtime = await page.evaluate(() => (window as any).__tool001Runtime);
    expect(runtime.errors, 'window runtime errors during normal workflow').toEqual([]);
    expect(runtime.rejections, 'unhandled rejections during normal workflow').toEqual([]);
    await evidence(page, '10_NO_RUNTIME_EXCEPTION', async () => ({ pass: runtime.errors.length === 0 && runtime.rejections.length === 0, detail: JSON.stringify(runtime) }));

    const reset = page.getByRole('button', { name: /전체 초기화|Reset all|すべてリセット/ }).first();
    await expect(reset).toBeVisible();
    await reset.tap();
    await expect(page.locator('.toolbox-upload-focus'), 'reset must restore upload zone').toBeVisible();
    await expect(page.getByTestId('converter-file-card')).toHaveCount(0);
    await evidence(page, '11_RESET_RESTORES_INITIAL_STATE', async () => ({ pass: await page.locator('.toolbox-upload-focus').isVisible(), detail: 'upload zone restored; cards cleared' }));

    await pickFile(page, 'sample.jpg');
    await expect(page.getByTestId('converter-file-card').first(), 'same file reselect after reset must work').toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.toolbox-upload-focus')).toHaveCount(0);
    await evidence(page, '12_SAME_FILE_RESELECT_WORKS', async () => ({ pass: true, detail: 'same file selected again and state transitioned' }));

    const finalRuntime = await page.evaluate(() => (window as any).__tool001Runtime);
    expect(finalRuntime.changes, 'two successful selections should fire at least two change events').toBeGreaterThanOrEqual(2);
  });
});
