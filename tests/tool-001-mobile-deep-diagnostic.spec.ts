import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const root = process.cwd();
const fixturePath = (name: string) => path.join(root, 'test-fixtures', name);

type Probe = {
  label: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  lastModified: number;
  arrayBuffer: string;
  firstBytes: string;
  lastBytes: string;
  objectUrl: string;
  imageElement: string;
  imageNatural: string;
  fileReaderDataUrl: string;
  dataUrlImage: string;
  createImageBitmap: string;
  bitmapSize: string;
  canvasDraw: string;
  canvasReadback: string;
  toBlobPng: string;
  toBlobJpeg: string;
  toBlobWebp: string;
  productAccepted: boolean;
  productMessage: string;
  previewLoaded: boolean;
  previewNatural: string;
  conversionStatus: string;
  runtimeErrors: string[];
};

function bytesHex(bytes: Uint8Array) {
  return Array.from(bytes).map(x => x.toString(16).padStart(2, '0')).join(' ');
}

async function installCapture(page: Page) {
  await page.evaluate(() => {
    const w = window as any;
    w.__tool001Diag = { file: null, changes: [], errors: [] };
    document.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
      const file = input.files?.[0] || null;
      w.__tool001Diag.file = file;
      w.__tool001Diag.changes.push(file ? {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      } : null);
    }, true);
    window.addEventListener('error', (event) => w.__tool001Diag.errors.push(`window.error:${event.message}`));
    window.addEventListener('unhandledrejection', (event) => w.__tool001Diag.errors.push(`unhandledrejection:${String(event.reason)}`));
  });
}

async function lowLevelProbe(page: Page, label: string) {
  return await page.evaluate(async (probeLabel) => {
    const w = window as any;
    const file = w.__tool001Diag?.file as File | null;
    const result: any = {
      label: probeLabel,
      fileName: file?.name || '', fileType: file?.type || '', fileSize: file?.size || 0, lastModified: file?.lastModified || 0,
      arrayBuffer: 'NOT_RUN', firstBytes: '', lastBytes: '', objectUrl: 'NOT_RUN', imageElement: 'NOT_RUN', imageNatural: '0x0',
      fileReaderDataUrl: 'NOT_RUN', dataUrlImage: 'NOT_RUN', createImageBitmap: 'NOT_RUN', bitmapSize: '0x0',
      canvasDraw: 'NOT_RUN', canvasReadback: 'NOT_RUN', toBlobPng: 'NOT_RUN', toBlobJpeg: 'NOT_RUN', toBlobWebp: 'NOT_RUN',
      runtimeErrors: [...(w.__tool001Diag?.errors || [])],
    };
    if (!file) return result;

    let bytes: Uint8Array | null = null;
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
      result.arrayBuffer = `PASS:${bytes.byteLength}`;
      result.firstBytes = Array.from(bytes.slice(0, 16)).map(x => x.toString(16).padStart(2,'0')).join(' ');
      result.lastBytes = Array.from(bytes.slice(Math.max(0, bytes.length - 16))).map(x => x.toString(16).padStart(2,'0')).join(' ');
    } catch (e) { result.arrayBuffer = `FAIL:${String(e)}`; }

    let objectUrl = '';
    let image: HTMLImageElement | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
      result.objectUrl = objectUrl.startsWith('blob:') ? 'PASS:BLOB_URL' : `PASS:${objectUrl}`;
      image = new Image();
      const state = await new Promise<string>((resolve) => {
        const timer = window.setTimeout(() => resolve('FAIL:TIMEOUT'), 5000);
        image!.onload = () => { clearTimeout(timer); resolve('PASS:ONLOAD'); };
        image!.onerror = () => { clearTimeout(timer); resolve('FAIL:ONERROR'); };
        image!.src = objectUrl;
      });
      result.imageElement = state;
      result.imageNatural = `${image.naturalWidth || 0}x${image.naturalHeight || 0}`;
    } catch (e) { result.objectUrl = `FAIL:${String(e)}`; result.imageElement = 'SKIP'; }

    let dataUrl = '';
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
      result.fileReaderDataUrl = dataUrl.startsWith('data:') ? `PASS:${dataUrl.slice(0, 40)}` : 'FAIL:NOT_DATA_URL';
      const img = new Image();
      result.dataUrlImage = await new Promise<string>((resolve) => {
        const timer = window.setTimeout(() => resolve('FAIL:TIMEOUT'), 5000);
        img.onload = () => { clearTimeout(timer); resolve(`PASS:${img.naturalWidth}x${img.naturalHeight}`); };
        img.onerror = () => { clearTimeout(timer); resolve('FAIL:ONERROR'); };
        img.src = dataUrl;
      });
    } catch (e) { result.fileReaderDataUrl = `FAIL:${String(e)}`; result.dataUrlImage = 'SKIP'; }

    let drawSource: CanvasImageSource | null = image;
    let bitmap: ImageBitmap | null = null;
    if ('createImageBitmap' in window) {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        result.createImageBitmap = 'PASS';
        result.bitmapSize = `${bitmap.width}x${bitmap.height}`;
        drawSource = bitmap;
      } catch (e) { result.createImageBitmap = `FAIL:${String(e)}`; }
    } else result.createImageBitmap = 'NA:UNSUPPORTED';

    try {
      const width = bitmap?.width || image?.naturalWidth || 0;
      const height = bitmap?.height || image?.naturalHeight || 0;
      if (!drawSource || !width || !height) throw new Error('NO_DECODED_SOURCE');
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(width, 64); canvas.height = Math.min(height, 64);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('NO_2D_CONTEXT');
      ctx.drawImage(drawSource, 0, 0, canvas.width, canvas.height);
      result.canvasDraw = 'PASS';
      try { const px = ctx.getImageData(0,0,1,1).data; result.canvasReadback = `PASS:${Array.from(px).join(',')}`; }
      catch (e) { result.canvasReadback = `FAIL:${String(e)}`; }
      const toBlob = (mime: string) => new Promise<string>((resolve) => canvas.toBlob(blob => resolve(blob ? `PASS:${blob.type}:${blob.size}` : 'FAIL:NULL'), mime, 0.9));
      result.toBlobPng = await toBlob('image/png');
      result.toBlobJpeg = await toBlob('image/jpeg');
      result.toBlobWebp = await toBlob('image/webp');
    } catch (e) { result.canvasDraw = `FAIL:${String(e)}`; }

    try { bitmap?.close(); } catch {}
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    return result;
  }, label);
}

async function selectScenario(page: Page, scenario: { label: string; fixture: string; name?: string; mimeType?: string }) {
  await page.goto('/ko/jpg-png-webp-image-converter', { waitUntil: 'domcontentloaded' });
  await installCapture(page);
  const trigger = page.locator('.toolbox-upload-focus button').first();
  await expect(trigger).toBeVisible();
  const chooserPromise = page.waitForEvent('filechooser');
  await trigger.tap();
  const chooser = await chooserPromise;
  const original = fs.readFileSync(fixturePath(scenario.fixture));
  if (scenario.name !== undefined || scenario.mimeType !== undefined) {
    await chooser.setFiles({ name: scenario.name ?? scenario.fixture, mimeType: scenario.mimeType ?? (scenario.fixture.endsWith('.png') ? 'image/png' : 'image/jpeg'), buffer: original });
  } else {
    await chooser.setFiles(fixturePath(scenario.fixture));
  }
  await page.waitForTimeout(100);
  const low = await lowLevelProbe(page, scenario.label);
  await page.waitForTimeout(800);
  const card = page.locator('[data-testid="converter-file-card"]');
  const productAccepted = await card.count() > 0;
  const productMessage = await page.locator('.toolbox-tool-workflow').innerText().catch(() => '');
  let previewLoaded = false;
  let previewNatural = '0x0';
  let conversionStatus = 'NOT_RUN';
  if (productAccepted) {
    const img = card.first().locator('img').first();
    previewLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0).catch(() => false);
    previewNatural = await img.evaluate((el: HTMLImageElement) => `${el.naturalWidth}x${el.naturalHeight}`).catch(() => '0x0');
    await page.getByTestId('converter-run').click();
    await expect(card.first()).toHaveAttribute('data-status', /done|error/, { timeout: 15_000 }).catch(() => {});
    conversionStatus = await card.first().getAttribute('data-status') || 'UNKNOWN';
  }
  return { ...low, productAccepted, productMessage: productMessage.replace(/\s+/g,' ').slice(0,500), previewLoaded, previewNatural, conversionStatus } as Probe;
}

test.describe('TOOL 001 mobile deep diagnostic', () => {
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  test.skip('all locally reproducible mobile image failure candidates in one run', async ({ page }) => {
    test.setTimeout(420_000);
    page.setDefaultTimeout(7_000);
    page.setDefaultNavigationTimeout(7_000);
    const scenarios = [
      { label: 'NORMAL_JPG_PATH_FILE', fixture: 'sample.jpg' },
      { label: 'NORMAL_PNG_PATH_FILE', fixture: 'square.png' },
      { label: 'EXIF_ROTATED_JPG', fixture: 'exif-rotated.jpg' },
      { label: 'KOREAN_FILENAME_JPG', fixture: '한국어-파일명.jpg' },
      { label: 'JAPANESE_FILENAME_JPG', fixture: '日本語-ファイル名.jpg' },
      { label: 'BLANK_MIME_JPG', fixture: 'sample.jpg', name: 'mobile-photo.jpg', mimeType: '' },
      { label: 'BLANK_MIME_PNG', fixture: 'square.png', name: 'mobile-shot.png', mimeType: '' },
      { label: 'NO_EXTENSION_JPEG', fixture: 'sample.jpg', name: 'mobile-photo', mimeType: 'image/jpeg' },
      { label: 'NO_EXTENSION_PNG', fixture: 'square.png', name: 'mobile-shot', mimeType: 'image/png' },
      { label: 'UPPERCASE_EXTENSION_JPG', fixture: 'sample.jpg', name: 'MOBILE.JPG', mimeType: 'image/jpeg' },
      { label: 'GENERIC_OCTET_STREAM_JPG', fixture: 'sample.jpg', name: 'mobile-photo.jpg', mimeType: 'application/octet-stream' },
      { label: 'MIME_EXTENSION_DISAGREE_BUT_JPEG_BYTES', fixture: 'sample.jpg', name: 'mobile-photo.jpg', mimeType: 'image/png' },
      { label: 'JPEG_BYTES_NAMED_PNG', fixture: 'sample.jpg', name: 'mobile-photo.png', mimeType: 'image/png' },
      { label: 'PNG_BYTES_NAMED_JPG', fixture: 'square.png', name: 'mobile-shot.jpg', mimeType: 'image/jpeg' },
      { label: 'CMYK_JPEG', fixture: 'tool011-cmyk.jpg' },
      { label: 'TRANSPARENT_PNG', fixture: 'transparent.png' },
    ];

    const outDir = path.join(root, 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    const results: Probe[] = [];
    const api: Record<string, unknown> = {};

    const persist = (phase: string) => {
      const report = { generatedAt: new Date().toISOString(), phase, expectedScenarios: scenarios.length, api, results };
      fs.writeFileSync(path.join(outDir, 'tool001-mobile-deep-diagnostic.json'), JSON.stringify(report, null, 2));
      const lines = ['TOOL 001 MOBILE DEEP DIAGNOSTIC V14', `phase=${phase}`, `scenarios=${results.length}/${scenarios.length}`, JSON.stringify(api), ''];
      for (const r of results) {
        lines.push([r.label, `name=${JSON.stringify(r.fileName)}`, `type=${JSON.stringify(r.fileType)}`, `size=${r.fileSize}`, `arrayBuffer=${r.arrayBuffer}`, `objectURL=${r.objectUrl}`, `img=${r.imageElement}/${r.imageNatural}`, `FileReader=${r.fileReaderDataUrl}`, `dataImg=${r.dataUrlImage}`, `bitmap=${r.createImageBitmap}/${r.bitmapSize}`, `canvas=${r.canvasDraw}`, `readback=${r.canvasReadback}`, `png=${r.toBlobPng}`, `jpg=${r.toBlobJpeg}`, `webp=${r.toBlobWebp}`, `accepted=${r.productAccepted}`, `preview=${r.previewLoaded}/${r.previewNatural}`, `conversion=${r.conversionStatus}`, `runtimeErrors=${JSON.stringify(r.runtimeErrors)}`].join('\t'));
      }
      fs.writeFileSync(path.join(outDir, 'tool001-mobile-deep-diagnostic.txt'), lines.join('\n'));
    };

    persist('STARTED');
    await page.goto('/ko/jpg-png-webp-image-converter', { waitUntil: 'domcontentloaded' });
    Object.assign(api, await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      secureContext: window.isSecureContext,
      fileArrayBuffer: typeof Blob.prototype.arrayBuffer === 'function',
      fileReader: typeof FileReader !== 'undefined',
      createObjectURL: typeof URL.createObjectURL === 'function',
      createImageBitmap: typeof createImageBitmap === 'function',
      imageDecode: typeof HTMLImageElement.prototype.decode === 'function',
      canvas2d: !!document.createElement('canvas').getContext('2d'),
      cryptoRandomUUID: typeof crypto.randomUUID === 'function',
    })));
    persist('API_CAPTURED');

    for (const scenario of scenarios) {
      console.log(`\n[001 DEEP V14] ${scenario.label}`);
      const index = scenarios.indexOf(scenario) + 1;
      const prefix = `[${String(index).padStart(2, '0')}/${scenarios.length}]`;
      console.log(`\n${prefix} ${scenario.label} START`);
      try {
        const r = await Promise.race([
          selectScenario(page, scenario),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SCENARIO_TIMEOUT_25000')), 25_000)),
        ]);
        results.push(r);
        const stages = [
          ['file', r.fileSize > 0 ? `PASS:${r.fileSize}` : 'FAIL:EMPTY'],
          ['arrayBuffer', r.arrayBuffer],
          ['objectURL', r.objectUrl],
          ['Image.onload', `${r.imageElement}/${r.imageNatural}`],
          ['FileReader', r.fileReaderDataUrl],
          ['dataURL Image', r.dataUrlImage],
          ['createImageBitmap', `${r.createImageBitmap}/${r.bitmapSize}`],
          ['canvasDraw', r.canvasDraw],
          ['canvasReadback', r.canvasReadback],
          ['toBlob PNG', r.toBlobPng],
          ['toBlob JPEG', r.toBlobJpeg],
          ['toBlob WebP', r.toBlobWebp],
          ['tool001 accept', r.productAccepted ? 'PASS' : `FAIL:${r.productMessage.slice(0, 180)}`],
          ['preview', r.previewLoaded ? `PASS:${r.previewNatural}` : `FAIL:${r.previewNatural}`],
          ['conversion', r.conversionStatus],
        ];
        for (const [name, value] of stages) console.log(`${prefix}   ${String(name).padEnd(18)} ${value}`);
        const scenarioPass = r.fileSize > 0 && /^PASS/.test(r.arrayBuffer) && /^PASS/.test(r.objectUrl) && /^PASS/.test(r.imageElement);
        console.log(`${prefix} ${scenario.label} ${scenarioPass ? 'LOW_LEVEL_PASS' : 'LOW_LEVEL_FAIL'} | product=${r.productAccepted ? 'ACCEPT' : 'REJECT'} | conversion=${r.conversionStatus}`);
      } catch (error) {
        const message = String((error as Error)?.stack || error);
        const failed: Probe = {
          label: scenario.label,
          fileName: scenario.name ?? scenario.fixture,
          fileType: scenario.mimeType ?? '',
          fileSize: 0,
          lastModified: 0,
          arrayBuffer: 'NOT_REACHED', firstBytes: '', lastBytes: '', objectUrl: 'NOT_REACHED', imageElement: 'NOT_REACHED', imageNatural: '0x0',
          fileReaderDataUrl: 'NOT_REACHED', dataUrlImage: 'NOT_REACHED', createImageBitmap: 'NOT_REACHED', bitmapSize: '0x0',
          canvasDraw: 'NOT_REACHED', canvasReadback: 'NOT_REACHED', toBlobPng: 'NOT_REACHED', toBlobJpeg: 'NOT_REACHED', toBlobWebp: 'NOT_REACHED',
          productAccepted: false, productMessage: `SCENARIO_EXCEPTION:${message.slice(0, 1000)}`, previewLoaded: false, previewNatural: '0x0',
          conversionStatus: 'SCENARIO_EXCEPTION', runtimeErrors: [message.slice(0, 2000)],
        };
        results.push(failed);
        console.error(`${prefix} ${scenario.label} EXCEPTION/TIMEOUT - continuing\n${message}`);
        if (message.includes('SCENARIO_TIMEOUT_25000')) await page.goto('about:blank').catch(() => {});
      }
      persist(`AFTER_${scenario.label}`);
      const acceptedCount = results.filter(x => x.productAccepted).length;
      const decodedCount = results.filter(x => /^PASS/.test(x.imageElement)).length;
      const exceptionCount = results.filter(x => x.conversionStatus === 'SCENARIO_EXCEPTION').length;
      console.log(`${prefix} PROGRESS ${results.length}/${scenarios.length} | decoded=${decodedCount} | accepted=${acceptedCount} | exceptions=${exceptionCount}`);
    }

    persist('COMPLETE');
    console.log(`\n[001 DEEP V14] ALL SCENARIOS COMPLETE ${results.length}/${scenarios.length}`);
    console.log(`[001 DEEP V14] decoded=${results.filter(x => /^PASS/.test(x.imageElement)).length}/${results.length}`);
    console.log(`[001 DEEP V14] accepted=${results.filter(x => x.productAccepted).length}/${results.length}`);
    console.log(`[001 DEEP V14] converted=${results.filter(x => x.conversionStatus === 'done').length}/${results.length}`);

    // 정상 JPG/PNG는 전체 체인이 반드시 살아야 한다. 모든 시나리오 저장 후에만 assertion 한다.
    expect(results.length, 'all diagnostic scenarios must execute').toBe(scenarios.length);
    for (const label of ['NORMAL_JPG_PATH_FILE', 'NORMAL_PNG_PATH_FILE']) {
      const r = results.find(x => x.label === label)!;
      expect(r, `${label}: result exists`).toBeTruthy();
      expect(r.arrayBuffer, `${label}: File.arrayBuffer`).toMatch(/^PASS/);
      expect(r.objectUrl, `${label}: object URL`).toMatch(/^PASS/);
      expect(r.imageElement, `${label}: Image element decode`).toMatch(/^PASS/);
      expect(r.canvasDraw, `${label}: canvas draw`).toBe('PASS');
      expect(r.productAccepted, `${label}: product acceptance`).toBeTruthy();
      expect(r.previewLoaded, `${label}: preview`).toBeTruthy();
      expect(r.conversionStatus, `${label}: full conversion`).toBe('done');
    }
  });
});
