import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const fixturePath = (name: string) => path.join(root, 'test-fixtures', name);

type StressResult = {
  label: string;
  expected: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  retainedRead: string;
  fileReader: string;
  objectUrlImage: string;
  bitmap: string;
  concurrentReads: string;
  sliceRead: string;
  productAccepted: boolean;
  previewLoaded: boolean;
  conversionStatus: string;
  changeCount: number;
  notes: string[];
  runtimeErrors: string[];
};

async function installCapture(page: Page) {
  await page.evaluate(() => {
    const w = window as any;
    w.__tool001Stress = { file: null, changes: [], errors: [], restores: [] };
    document.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
      const file = input.files?.[0] || null;
      w.__tool001Stress.file = file;
      w.__tool001Stress.changes.push(file ? { name: file.name, type: file.type, size: file.size } : null);
    }, true);
    window.addEventListener('error', (event) => w.__tool001Stress.errors.push(`window.error:${event.message}`));
    window.addEventListener('unhandledrejection', (event) => w.__tool001Stress.errors.push(`unhandledrejection:${String(event.reason)}`));
  });
}

async function applyFault(page: Page, mode: string) {
  await page.evaluate((faultMode) => {
    const w = window as any;
    const state = w.__tool001Stress;
    if (!state) return;
    const restores: Array<() => void> = state.restores;

    if (faultMode === 'ARRAYBUFFER_FAIL_ONCE') {
      const original = Blob.prototype.arrayBuffer;
      let count = 0;
      Blob.prototype.arrayBuffer = function(this: Blob) {
        count += 1;
        if (count === 1) return Promise.reject(new DOMException('Injected transient Android-style read failure', 'NotReadableError'));
        return original.call(this);
      };
      restores.push(() => { Blob.prototype.arrayBuffer = original; });
    }
    if (faultMode === 'ARRAYBUFFER_DELAY_1500') {
      const original = Blob.prototype.arrayBuffer;
      Blob.prototype.arrayBuffer = async function(this: Blob) {
        await new Promise(r => setTimeout(r, 1500));
        return original.call(this);
      };
      restores.push(() => { Blob.prototype.arrayBuffer = original; });
    }
    if (faultMode === 'CREATE_BITMAP_FAIL') {
      const original = window.createImageBitmap;
      (window as any).createImageBitmap = async () => { throw new DOMException('Injected bitmap failure', 'InvalidStateError'); };
      restores.push(() => { (window as any).createImageBitmap = original; });
    }
    if (faultMode === 'CREATE_BITMAP_DELAY_1800') {
      const original = window.createImageBitmap;
      (window as any).createImageBitmap = async (...args: any[]) => {
        await new Promise(r => setTimeout(r, 1800));
        return original(...(args as Parameters<typeof createImageBitmap>));
      };
      restores.push(() => { (window as any).createImageBitmap = original; });
    }
    if (faultMode === 'BITMAP_AND_OBJECTURL_FAIL') {
      const originalBitmap = window.createImageBitmap;
      const originalUrl = URL.createObjectURL;
      (window as any).createImageBitmap = async () => { throw new DOMException('Injected bitmap failure', 'InvalidStateError'); };
      URL.createObjectURL = () => { throw new DOMException('Injected objectURL failure', 'NotReadableError'); };
      restores.push(() => { (window as any).createImageBitmap = originalBitmap; URL.createObjectURL = originalUrl; });
    }
  }, mode);
}

async function restoreFaults(page: Page) {
  await page.evaluate(() => {
    const state = (window as any).__tool001Stress;
    if (!state) return;
    for (const fn of [...state.restores].reverse()) { try { fn(); } catch {} }
    state.restores = [];
  });
}

async function retainedProbe(page: Page, delayMs = 0) {
  return await page.evaluate(async (delay) => {
    const w = window as any;
    const file = w.__tool001Stress?.file as File | null;
    const result: any = { retainedRead: 'NO_FILE', fileReader: 'NO_FILE', objectUrlImage: 'NO_FILE', bitmap: 'NO_FILE', concurrentReads: 'NO_FILE', sliceRead: 'NO_FILE' };
    if (!file) return result;
    if (delay) await new Promise(r => setTimeout(r, delay));
    try { const b = await file.arrayBuffer(); result.retainedRead = `PASS:${b.byteLength}`; } catch (e) { result.retainedRead = `FAIL:${String(e)}`; }
    try {
      result.fileReader = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(`PASS:${String(r.result || '').length}`);
        r.onerror = () => resolve(`FAIL:${String(r.error)}`);
        r.readAsArrayBuffer(file);
      });
    } catch (e) { result.fileReader = `FAIL:${String(e)}`; }
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      result.objectUrlImage = await new Promise<string>((resolve) => {
        const t = setTimeout(() => resolve('FAIL:TIMEOUT'), 5000);
        img.onload = () => { clearTimeout(t); resolve(`PASS:${img.naturalWidth}x${img.naturalHeight}`); };
        img.onerror = () => { clearTimeout(t); resolve('FAIL:ONERROR'); };
        img.src = url;
      });
      URL.revokeObjectURL(url);
    } catch (e) { result.objectUrlImage = `FAIL:${String(e)}`; }
    try {
      const bm = await createImageBitmap(file, { imageOrientation: 'from-image' });
      result.bitmap = `PASS:${bm.width}x${bm.height}`;
      bm.close();
    } catch (e) { result.bitmap = `FAIL:${String(e)}`; }
    try {
      const [a,b,c,d] = await Promise.all([
        file.arrayBuffer(),
        file.slice(0, Math.min(file.size, 4096)).arrayBuffer(),
        new Promise<ArrayBuffer>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as ArrayBuffer); r.onerror = () => reject(r.error); r.readAsArrayBuffer(file); }),
        createImageBitmap(file).then(bm => { const x = new ArrayBuffer(bm.width > 0 ? 1 : 0); bm.close(); return x; }),
      ]);
      result.concurrentReads = `PASS:${a.byteLength}/${b.byteLength}/${c.byteLength}/${d.byteLength}`;
    } catch (e) { result.concurrentReads = `FAIL:${String(e)}`; }
    try { const s = await file.slice(0, Math.min(file.size, 8192)).arrayBuffer(); result.sliceRead = `PASS:${s.byteLength}`; } catch (e) { result.sliceRead = `FAIL:${String(e)}`; }
    return result;
  }, delayMs);
}

async function selectFile(page: Page, fixture: string) {
  const trigger = page.locator('.toolbox-upload-focus button').first();
  await expect(trigger).toBeVisible();
  const chooserPromise = page.waitForEvent('filechooser');
  await trigger.tap();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixturePath(fixture));
}

async function productState(page: Page) {
  const card = page.locator('[data-testid="converter-file-card"]');
  const productAccepted = await card.count() > 0;
  let previewLoaded = false;
  let conversionStatus = 'NOT_RUN';
  if (productAccepted) {
    const img = card.first().locator('img').first();
    previewLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0).catch(() => false);
    await page.getByTestId('converter-run').click();
    await expect(card.first()).toHaveAttribute('data-status', /done|error/, { timeout: 20_000 }).catch(() => {});
    conversionStatus = await card.first().getAttribute('data-status') || 'UNKNOWN';
  }
  return { productAccepted, previewLoaded, conversionStatus };
}

const scenarios = [
  { label: 'RETAIN_FILE_250MS_JPG', fixture: 'sample.jpg', mode: 'NONE', delay: 250, expected: 'retain File reference remains readable' },
  { label: 'RETAIN_FILE_1500MS_JPG', fixture: 'sample.jpg', mode: 'NONE', delay: 1500, expected: 'delayed provider-like read remains readable' },
  { label: 'RETAIN_FILE_4000MS_PNG', fixture: 'square.png', mode: 'NONE', delay: 4000, expected: 'long delayed File reference remains readable' },
  { label: 'INPUT_CLEAR_IMMEDIATE_JPG', fixture: 'sample.jpg', mode: 'CLEAR_INPUT', delay: 500, expected: 'captured File survives input.value reset' },
  { label: 'INPUT_REMOVE_IMMEDIATE_PNG', fixture: 'square.png', mode: 'REMOVE_INPUT', delay: 500, expected: 'captured File survives input DOM removal' },
  { label: 'WINDOW_BLUR_FOCUS_JPG', fixture: 'sample.jpg', mode: 'BLUR_FOCUS', delay: 500, expected: 'picker-like focus transitions do not break read' },
  { label: 'ARRAYBUFFER_FAIL_ONCE_JPG', fixture: 'sample.jpg', mode: 'ARRAYBUFFER_FAIL_ONCE', delay: 0, expected: 'diagnose whether product has alternate byte-read path' },
  { label: 'ARRAYBUFFER_DELAY_1500_PNG', fixture: 'square.png', mode: 'ARRAYBUFFER_DELAY_1500', delay: 0, expected: 'slow byte read should still complete' },
  { label: 'CREATE_BITMAP_FAIL_JPG', fixture: 'sample.jpg', mode: 'CREATE_BITMAP_FAIL', delay: 0, expected: 'objectURL Image fallback should keep product alive' },
  { label: 'CREATE_BITMAP_DELAY_1800_PNG', fixture: 'square.png', mode: 'CREATE_BITMAP_DELAY_1800', delay: 0, expected: 'slow decoder should still complete' },
  { label: 'BITMAP_AND_OBJECTURL_FAIL_JPG', fixture: 'sample.jpg', mode: 'BITMAP_AND_OBJECTURL_FAIL', delay: 0, expected: 'expected reject when both decode paths fail' },
  { label: 'SAME_FILE_RESELECT_JPG', fixture: 'sample.jpg', mode: 'RESELECT', delay: 0, expected: 'same file can be selected again after reset' },
] as const;

test.describe('TOOL 001 Android file lifecycle stress', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  test('Android-provider-like lifecycle and fault matrix', async ({ browser }) => {
    test.setTimeout(420_000);
    const outDir = path.join(root, 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    const results: StressResult[] = [];

    const persist = (phase: string) => {
      fs.writeFileSync(path.join(outDir, 'tool001-mobile-android-lifecycle.json'), JSON.stringify({ generatedAt: new Date().toISOString(), phase, expectedScenarios: scenarios.length, results }, null, 2));
      const lines = ['TOOL 001 ANDROID FILE LIFECYCLE STRESS V15', `phase=${phase}`, `scenarios=${results.length}/${scenarios.length}`, ''];
      for (const r of results) lines.push([r.label, `expected=${r.expected}`, `file=${r.fileName}/${r.fileType}/${r.fileSize}`, `retained=${r.retainedRead}`, `FileReader=${r.fileReader}`, `objectURL=${r.objectUrlImage}`, `bitmap=${r.bitmap}`, `concurrent=${r.concurrentReads}`, `slice=${r.sliceRead}`, `accepted=${r.productAccepted}`, `preview=${r.previewLoaded}`, `conversion=${r.conversionStatus}`, `changes=${r.changeCount}`, `notes=${JSON.stringify(r.notes)}`, `errors=${JSON.stringify(r.runtimeErrors)}`].join('\t'));
      fs.writeFileSync(path.join(outDir, 'tool001-mobile-android-lifecycle.txt'), lines.join('\n'));
    };

    persist('STARTED');
    for (let i = 0; i < scenarios.length; i++) {
      const s = scenarios[i];
      const prefix = `[A${String(i + 1).padStart(2,'0')}/${scenarios.length}]`;
      console.log(`\n${prefix} ${s.label} START`);
      let context: any = null; let page: any = null;
      try {
        await Promise.race([
          (async () => {
      context = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
      page = await context.newPage(); page.setDefaultTimeout(7_000); page.setDefaultNavigationTimeout(7_000);
      await page.goto('/ko/jpg-png-webp-image-converter', { waitUntil: 'domcontentloaded' });
      await installCapture(page);
      if (['ARRAYBUFFER_FAIL_ONCE','ARRAYBUFFER_DELAY_1500','CREATE_BITMAP_FAIL','CREATE_BITMAP_DELAY_1800','BITMAP_AND_OBJECTURL_FAIL'].includes(s.mode)) await applyFault(page, s.mode);

      await selectFile(page, s.fixture);
      if (s.mode === 'CLEAR_INPUT') await page.locator('input[type=file]').first().evaluate((el: HTMLInputElement) => { el.value = ''; });
      if (s.mode === 'REMOVE_INPUT') await page.locator('input[type=file]').first().evaluate((el: HTMLInputElement) => { el.remove(); });
      if (s.mode === 'BLUR_FOCUS') await page.evaluate(() => { window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('focus')); });
      if (s.mode === 'RESELECT') {
        await page.waitForTimeout(800);
        const input = page.getByTestId('converter-file-input');
        await input.setInputFiles([]);
        await input.setInputFiles(fixturePath(s.fixture));
      }

      // 제품 처리에 적용된 fault는 이 시점까지 유지하고, 이후 probe에서는 복원하여 원본 File 자체의 생존 여부를 분리한다.
      await page.waitForTimeout(s.mode.startsWith('ARRAYBUFFER_DELAY') || s.mode.startsWith('CREATE_BITMAP_DELAY') ? 2200 : 1000);
      const prod = await productState(page).catch(() => ({ productAccepted: false, previewLoaded: false, conversionStatus: 'STATE_EXCEPTION' }));
      await restoreFaults(page);
      const probe = await retainedProbe(page, s.delay);
      const meta = await page.evaluate(() => {
        const st = (window as any).__tool001Stress;
        const f = st?.file as File | null;
        return { name: f?.name || '', type: f?.type || '', size: f?.size || 0, changes: st?.changes?.length || 0, errors: [...(st?.errors || [])] };
      });
      const notes: string[] = [];
      if (s.mode === 'ARRAYBUFFER_FAIL_ONCE' && !prod.productAccepted && /^PASS/.test(probe.fileReader)) notes.push('PRODUCT_REJECTS_TRANSIENT_ARRAYBUFFER_FAILURE_WHILE_FILEREADER_CAN_READ');
      if (s.mode === 'CREATE_BITMAP_FAIL' && prod.productAccepted) notes.push('OBJECTURL_FALLBACK_CONFIRMED');
      if (s.mode === 'RESELECT' && meta.changes >= 2) notes.push('SAME_FILE_RESELECT_CHANGE_CONFIRMED');
      if (s.mode === 'BITMAP_AND_OBJECTURL_FAIL' && !prod.productAccepted) notes.push('EXPECTED_BOTH_DECODE_PATHS_FAILED');
      const r: StressResult = { label: s.label, expected: s.expected, fileName: meta.name, fileType: meta.type, fileSize: meta.size, ...probe, ...prod, changeCount: meta.changes, notes, runtimeErrors: meta.errors };
      results.push(r);
      console.log(`${prefix} retained=${r.retainedRead} FileReader=${r.fileReader} objectURL=${r.objectUrlImage} bitmap=${r.bitmap}`);
      console.log(`${prefix} product=${r.productAccepted ? 'ACCEPT' : 'REJECT'} preview=${r.previewLoaded} conversion=${r.conversionStatus} changes=${r.changeCount}`);
      if (notes.length) console.log(`${prefix} FINDING ${notes.join(' | ')}`);
      console.log(`${prefix} PROGRESS ${results.length}/${scenarios.length}`);
      persist(`AFTER_${s.label}`);
          })(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SCENARIO_TIMEOUT_25000')), 25_000)),
        ]);
      } catch (error) {
        const message = String((error as Error)?.stack || error);
        console.error(`${prefix} EXCEPTION/TIMEOUT - continuing\n${message}`);
        const fallback: StressResult = {
          label: s.label, expected: s.expected, fileName: '', fileType: '', fileSize: 0,
          retainedRead: 'NOT_REACHED', fileReader: 'NOT_REACHED', objectUrlImage: 'NOT_REACHED', bitmap: 'NOT_REACHED',
          concurrentReads: 'NOT_REACHED', sliceRead: 'NOT_REACHED', productAccepted: false, previewLoaded: false,
          conversionStatus: message.includes('SCENARIO_TIMEOUT_25000') ? 'SCENARIO_TIMEOUT' : 'SCENARIO_EXCEPTION',
          changeCount: 0, notes: [message.includes('SCENARIO_TIMEOUT_25000') ? 'SCENARIO_TIMEOUT_25000' : 'SCENARIO_EXCEPTION'],
          runtimeErrors: [message.slice(0, 2000)],
        };
        results.push(fallback);
        persist(`AFTER_${s.label}`);
      } finally {
        if (context) await context.close().catch(() => {});
      }
    }
    persist('COMPLETE');
    console.log(`\n[001 ANDROID V15] ALL SCENARIOS COMPLETE ${results.length}/${scenarios.length}`);
    expect(results.length).toBe(scenarios.length);
    for (const label of ['RETAIN_FILE_250MS_JPG','RETAIN_FILE_1500MS_JPG','RETAIN_FILE_4000MS_PNG']) {
      const r = results.find(x => x.label === label)!;
      expect(r.retainedRead, `${label} retained arrayBuffer`).toMatch(/^PASS/);
      expect(r.fileReader, `${label} FileReader`).toMatch(/^PASS/);
      expect(r.objectUrlImage, `${label} objectURL`).toMatch(/^PASS/);
    }
  });
});
