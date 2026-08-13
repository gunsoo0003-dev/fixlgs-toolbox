import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { openTool016, upload016, TOOL016_TESTIDS } from './helpers/tool-016';

const LIMITS = {
  fileBytes: 15 * 1024 * 1024,
  pixels: 20_000_000,
  side: 6_000,
  layers: 20,
  textChars: 2_000,
  history: 30,
} as const;

const FILE_FIXTURE_DIR = resolve(tmpdir(), 'fixlgs-toolbox-tool016-limit-fixtures');
const fileFixture = (name: string) => resolve(FILE_FIXTURE_DIR, name);

const PIXEL_FIXTURE_DIR = resolve(tmpdir(), 'fixlgs-toolbox-tool016-pixel-fixtures');
type PngChunk={type:string,data:Buffer};
function crc32(buf:Buffer){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function chunk({type,data}:PngChunk){const t=Buffer.from(type,'ascii');const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc])}
function solidPng(width:number,height:number){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=0;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  const rows=Buffer.alloc((width+1)*height);const stride=width+1;for(let y=0;y<height;y++)rows[y*stride]=0;
  return Buffer.concat([sig,chunk({type:'IHDR',data:ihdr}),chunk({type:'IDAT',data:deflateSync(rows,{level:9})}),chunk({type:'IEND',data:Buffer.alloc(0)})]);
}
function pixelFixture(width:number,height:number,name:string){mkdirSync(PIXEL_FIXTURE_DIR,{recursive:true});const file=resolve(PIXEL_FIXTURE_DIR,name);writeFileSync(file,solidPng(width,height));return file}


test.afterEach(()=>rmSync(PIXEL_FIXTURE_DIR,{recursive:true,force:true}));

test.describe('016 limit-only service boundary checks', () => {
  test('exposes the applied service limits in the actual tool DOM', async ({ page }) => {
    await openTool016(page);
    const root = page.getByTestId(TOOL016_TESTIDS.root);
    await expect(root).toHaveAttribute('data-max-file-bytes', String(LIMITS.fileBytes));
    await expect(root).toHaveAttribute('data-max-pixels', String(LIMITS.pixels));
    await expect(root).toHaveAttribute('data-max-side', String(LIMITS.side));
    await expect(root).toHaveAttribute('data-max-layers', String(LIMITS.layers));
    await expect(root).toHaveAttribute('data-max-text-chars', String(LIMITS.textChars));
    await expect(root).toHaveAttribute('data-max-history', String(LIMITS.history));
  });

  test('accepts just below and exactly 15 MiB, then rejects one byte over', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles(fileFixture('file-before.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(fileFixture('file-limit.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(fileFixture('file-over.jpg'));
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('15MB');
  });

  test('accepts just below and exactly 20,000,000 pixels, then rejects over', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles(pixelFixture(5000,3999,'pixels-before.png'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(pixelFixture(5000,4000,'pixels-limit.png'));
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles(pixelFixture(5000,4001,'pixels-over.png'));
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('2,000만 픽셀');
  });

  test('accepts 5,999px and exactly 6,000px, then rejects 6,001px', async ({ page }) => {
    await openTool016(page);
    const input = page.getByTestId(TOOL016_TESTIDS.fileInput);
    await input.setInputFiles('test-fixtures/tool016-side-before.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-side-limit.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.previewCanvas)).toBeVisible();
    await input.setInputFiles('test-fixtures/tool016-side-over.png');
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('6,000px');
  });

  test('allows 19 and exactly 20 text layers, then rejects the 21st', async ({ page }) => {
    await upload016(page);
    const add = page.getByRole('button', { name: '글자 추가' });
    for (let i = 0; i < LIMITS.layers - 1; i += 1) await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers - 1);
    await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers);
    await add.click();
    await expect(page.getByTestId('tool016-layer')).toHaveCount(LIMITS.layers);
    await expect(page.getByTestId(TOOL016_TESTIDS.error)).toContainText('최대 20개');
  });

  test('allows 1,999 and exactly 2,000 characters, then rejects 2,001', async ({ page }) => {
    await upload016(page);
    await page.getByRole('button', { name: '본문 추가' }).click();
    const input = page.getByTestId(TOOL016_TESTIDS.content);
    const before = '가'.repeat(LIMITS.textChars - 1);
    const exact = '가'.repeat(LIMITS.textChars);
    await input.fill(before);
    await expect(input).toHaveValue(before);
    await input.fill(exact);
    await expect(input).toHaveValue(exact);
    await input.fill(exact + '나');
    await expect(input).toHaveValue(exact);
  });

  test('keeps undo history capped at 30 completed edits', async ({ page }) => {
    await upload016(page);
    await page.getByRole('button', { name: '제목 추가' }).click();
    const bold = page.getByRole('button', { name: '굵게' });
    for (let i = 0; i < LIMITS.history + 5; i += 1) await bold.click();
    const undo = page.getByRole('button', { name: '실행 취소' });
    for (let i = 0; i < LIMITS.history; i += 1) await undo.click();
    await expect(undo).toBeDisabled();
  });
});
