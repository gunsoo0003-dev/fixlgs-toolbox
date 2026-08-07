import { expect, test, type Browser, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPORT_PATH = path.join(process.cwd(), 'test-results', 'tool-012-limit-report.json');
const ROUTE = '/ko/image-border-rounded-corners-tool';
const SERVICE_LIMIT = { maxPixels: 80_000_000, maxSide: 16_000 } as const;

type Evidence = {
  name: string;
  deviceClass: 'desktop' | 'mobile-emulation';
  input: { width: number; height: number; pixels: number };
  output: { width: number; height: number; pixels: number } | null;
  expected: 'download' | 'blocked';
  passed: boolean;
  elapsedMs: number;
  bytes: number | null;
  error: string | null;
};

async function makeSolidJpeg(page: Page, width: number, height: number): Promise<Buffer> {
  const base64 = await page.evaluate(async ({ width, height }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    ctx.fillStyle = '#d8e8f6';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#111111';
    ctx.fillRect(Math.floor(width * .1), Math.floor(height * .1), Math.max(1, Math.floor(width * .8)), Math.max(1, Math.floor(height * .8)));
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', .8));
    if (!blob) throw new Error(`fixture generation failed at ${width}x${height}`);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return btoa(binary);
  }, { width, height });
  return Buffer.from(base64, 'base64');
}

async function prepare(page: Page, width: number, height: number) {
  const buffer = await makeSolidJpeg(page, width, height);
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tool012-file').setInputFiles({ name: `limit-${width}x${height}.jpg`, mimeType: 'image/jpeg', buffer });
  await expect(page.getByTestId('tool012-root')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: '단색', exact: true }).click();
  await page.getByTestId('tool012-output-format').selectOption('jpg');
}

async function outputSize(page: Page) {
  const text = (await page.getByTestId('tool012-output-size').textContent()) ?? '';
  const match = text.match(/([\d,]+)\s*×\s*([\d,]+)px/);
  if (!match) throw new Error(`cannot parse output size: ${text}`);
  const width = Number(match[1].replace(/,/g, ''));
  const height = Number(match[2].replace(/,/g, ''));
  return { width, height, pixels: width * height };
}

async function downloadBytes(page: Page) {
  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
  await page.getByTestId('tool012-download').click();
  const download = await downloadPromise;
  await expect(page.getByTestId('tool012-status')).toContainText('다운로드 준비 완료', { timeout: 120_000 });
  const stream = await download.createReadStream();
  if (!stream) throw new Error('download stream unavailable');
  let bytes = 0;
  for await (const chunk of stream) bytes += chunk.length;
  if (bytes <= 0) throw new Error('downloaded file is empty');
  return bytes;
}

async function verifyProbe(browser: Browser, name: string, deviceClass: Evidence['deviceClass'], viewport: { width: number; height: number }, width: number, height: number, expected: Evidence['expected']): Promise<Evidence> {
  const started = Date.now();
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await prepare(page, width, height);
    const output = await outputSize(page);
    const limitText = page.getByTestId('tool012-service-limit');
    await expect(limitText).toContainText('16,000px');
    await expect(limitText).toContainText('80,000,000');
    if (expected === 'download') {
      await expect(page.getByTestId('tool012-download')).toBeEnabled();
      const bytes = await downloadBytes(page);
      return { name, deviceClass, input:{width,height,pixels:width*height}, output, expected, passed:true, elapsedMs:Date.now()-started, bytes, error:null };
    }
    await expect(page.getByTestId('tool012-download')).toBeDisabled();
    await expect(page.locator('.padding-limit-warning')).toContainText('16,000px');
    await expect(page.locator('.padding-limit-warning')).toContainText('80,000,000');
    return { name, deviceClass, input:{width,height,pixels:width*height}, output, expected, passed:true, elapsedMs:Date.now()-started, bytes:null, error:null };
  } catch (error) {
    return { name, deviceClass, input:{width,height,pixels:width*height}, output:await outputSize(page).catch(()=>null), expected, passed:false, elapsedMs:Date.now()-started, bytes:null, error:error instanceof Error?error.message:String(error) };
  } finally {
    await context.close().catch(()=>{});
  }
}

async function verifyEffectExpansion(browser: Browser): Promise<Evidence> {
  const width = 8000, height = 6000;
  const started = Date.now();
  const context = await browser.newContext({ viewport:{width:1440,height:900} });
  const page = await context.newPage();
  try {
    await prepare(page, width, height);
    await page.getByTestId('tool012-border-toggle').check();
    await page.getByTestId('tool012-border-width').fill('200');
    await page.getByRole('button', { name:'바깥쪽', exact:true }).click();
    await page.getByTestId('tool012-shadow-toggle').check();
    await page.getByTestId('tool012-shadow-x').fill('100');
    await page.getByTestId('tool012-shadow-y').fill('100');
    await page.getByTestId('tool012-shadow-blur').fill('150');
    await page.getByTestId('tool012-shadow-spread').fill('100');
    await page.getByTestId('tool012-shadow-opacity').fill('100');
    await page.getByTestId('tool012-extra-padding').fill('500');
    const output = await outputSize(page);
    expect(output.pixels).toBeGreaterThan(SERVICE_LIMIT.maxPixels);
    await expect(page.getByTestId('tool012-download')).toBeDisabled();
    await expect(page.locator('.padding-limit-warning')).toContainText('80,000,000');
    return { name:'effect-expanded-result-blocked', deviceClass:'desktop', input:{width,height,pixels:width*height}, output, expected:'blocked', passed:true, elapsedMs:Date.now()-started, bytes:null, error:null };
  } catch (error) {
    return { name:'effect-expanded-result-blocked', deviceClass:'desktop', input:{width,height,pixels:width*height}, output:await outputSize(page).catch(()=>null), expected:'blocked', passed:false, elapsedMs:Date.now()-started, bytes:null, error:error instanceof Error?error.message:String(error) };
  } finally {
    await context.close().catch(()=>{});
  }
}

test('verifies the adopted 012 general-user service ceiling without destruction-limit exploration', async ({ browser }) => {
  test.setTimeout(600_000);
  const evidence: Evidence[] = [];
  evidence.push(await verifyProbe(browser, 'pixel-ceiling-pass', 'desktop', {width:1440,height:900}, 10000, 8000, 'download'));
  evidence.push(await verifyProbe(browser, 'pixel-ceiling-first-over-block', 'desktop', {width:1440,height:900}, 10001, 8000, 'blocked'));
  evidence.push(await verifyProbe(browser, 'side-ceiling-pass', 'desktop', {width:1440,height:900}, 16000, 4000, 'download'));
  evidence.push(await verifyProbe(browser, 'side-ceiling-first-over-block', 'desktop', {width:1440,height:900}, 16001, 4000, 'blocked'));
  evidence.push(await verifyProbe(browser, 'mobile-realistic-24mp-pass', 'mobile-emulation', {width:390,height:844}, 6000, 4000, 'download'));
  evidence.push(await verifyEffectExpansion(browser));

  for (const item of evidence) expect(item.passed, `${item.name}: ${item.error ?? 'failed'}`).toBe(true);
  const report = {
    schemaVersion: 4,
    kind: 'tool-012-general-user-service-ceiling-verification',
    generatedAt: new Date().toISOString(),
    auxiliaryCandidate: { maxPixels:80_000_000, maxSide:16_000 },
    finalServiceCeiling: { maxPixels:80_000_000, maxSide:16_000 },
    decision: 'auxiliary candidate adopted unchanged',
    rationale: {
      targetUsers: 'general and light users on ordinary PCs, smartphones, and browsers',
      technicalMaximumSearched: false,
      reasonToStop: '80MP / 16,000px is already sufficient for ordinary use; higher technical values add little user value and reduce safety margin',
      professionalRange: 'ultra-high-resolution and professional/hardcore workloads are outside the current basic service ceiling',
    },
    evidence,
    allPassed: evidence.every((item)=>item.passed),
  };
  await mkdir(path.dirname(REPORT_PATH), { recursive:true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  expect(report.allPassed).toBe(true);
});
