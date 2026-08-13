import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { openTool015, fixture, TOOL015_TESTIDS } from './helpers/tool-015';
import { TOOL015_LIMIT_CANDIDATES as L } from './config/tool-015-limit-candidates';

const TMP=path.resolve(process.cwd(),'.tmp-tool-015-limit');

type PngChunk={type:string,data:Buffer};
function crc32(buf:Buffer){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function chunk({type,data}:PngChunk){const t=Buffer.from(type,'ascii');const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc])}
function solidPng(width:number,height:number){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=0;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  const rows=Buffer.alloc((width+1)*height);const stride=width+1;for(let y=0;y<height;y++)rows[y*stride]=0;
  return Buffer.concat([sig,chunk({type:'IHDR',data:ihdr}),chunk({type:'IDAT',data:deflateSync(rows,{level:9})}),chunk({type:'IEND',data:Buffer.alloc(0)})]);
}
function paddedValidJpeg(targetBytes:number,name:string){
  mkdirSync(TMP,{recursive:true});
  const src=readFileSync(path.resolve(process.cwd(),'test-fixtures/sample.jpg'));
  if(targetBytes<src.length)throw new Error('[HARNESS_ERROR] targetBytes smaller than base JPEG');
  // JPEG decoders ignore bytes after EOI, so this preserves a normal decodable image
  // while exercising the real File.size service boundary.
  const out=Buffer.concat([src,Buffer.alloc(targetBytes-src.length,65)]);
  const file=path.join(TMP,name);writeFileSync(file,out);return file;
}
function pixelFixture(width:number,height:number,name:string){mkdirSync(TMP,{recursive:true});const file=path.join(TMP,name);writeFileSync(file,solidPng(width,height));return file}
async function assertReadyPair(page:Page){const state=page.getByTestId(TOOL015_TESTIDS.state);await expect(state).toHaveAttribute('data-before-ready','1');await expect(state).toHaveAttribute('data-after-ready','1')}

test.afterEach(()=>rmSync(TMP,{recursive:true,force:true}));

test.describe('015 limit-only — confirmed general-user service limits',()=>{
  test('exactly two image contract accepts 2 images',async({page})=>{const root=await openTool015(page);const bothInput=page.getByTestId(TOOL015_TESTIDS.bothInput);const before=path.resolve(process.cwd(),'test-fixtures/sample.jpg');const after=path.resolve(process.cwd(),'test-fixtures/target-large.png');await bothInput.setInputFiles([before,after]);await assertReadyPair(page)});
  test('3-image selection is explicitly rejected instead of silently using first two',async({page})=>{const root=await openTool015(page);const bothInput=page.getByTestId(TOOL015_TESTIDS.bothInput);await bothInput.setInputFiles([fixture(1),fixture(2),fixture(3)]);await expect(page.getByTestId(TOOL015_TESTIDS.error)).toBeVisible();await expect(page.getByTestId(TOOL015_TESTIDS.error)).toContainText('두 장');const state=page.getByTestId(TOOL015_TESTIDS.state);await expect(state).toHaveAttribute('data-before-ready','0');await expect(state).toHaveAttribute('data-after-ready','0')});

  for(const bytes of [L.perFileBytes.before,L.perFileBytes.candidate]) test(`per-file service candidate is decodable at ${Math.round(bytes/1024/1024)}MiB`,async({page})=>{const root=await openTool015(page);const inputs=root.locator('input[type=file]');const a=paddedValidJpeg(bytes,`per-file-${bytes}-a.jpg`);await inputs.nth(0).setInputFiles(a);await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-before-ready','1');console.log(`[SERVICE_LIMIT] perFileBytesAccepted=${bytes}`)});
  test(`per-file above-candidate observation ${Math.round(L.perFileBytes.above/1024/1024)}MiB`,async({page})=>{const root=await openTool015(page);const inputs=root.locator('input[type=file]');const a=paddedValidJpeg(L.perFileBytes.above,'per-file-above-a.jpg');await inputs.nth(0).setInputFiles(a);await expect(page.getByTestId(TOOL015_TESTIDS.error)).toContainText('15 MiB');await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-before-ready','0')});

  test(`total-size service candidate ${Math.round(L.totalBytes.candidate/1024/1024)}MiB loads as two files`,async({page})=>{const root=await openTool015(page);const inputs=root.locator('input[type=file]');const each=Math.floor(L.totalBytes.candidate/2);await inputs.nth(0).setInputFiles(paddedValidJpeg(each,'total-a.jpg'));await inputs.nth(1).setInputFiles(paddedValidJpeg(L.totalBytes.candidate-each,'total-b.jpg'));await assertReadyPair(page);console.log(`[SERVICE_LIMIT] totalBytesAccepted=${L.totalBytes.candidate}`)});
  test(`total-size above-candidate observation ${Math.round(L.totalBytes.above/1024/1024)}MiB`,async({page})=>{const root=await openTool015(page);const inputs=root.locator('input[type=file]');const first=15*1024*1024;await inputs.nth(0).setInputFiles(paddedValidJpeg(first,'total-above-a.jpg'));await inputs.nth(1).setInputFiles(paddedValidJpeg(L.totalBytes.above-first,'total-above-b.jpg'));await expect(page.getByTestId(TOOL015_TESTIDS.error)).toBeVisible();await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-before-ready','1');await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-after-ready','0')});

  test('20MP source service limit decodes in both slots',async({page})=>{const root=await openTool015(page);const bothInput=page.getByTestId(TOOL015_TESTIDS.bothInput);await bothInput.setInputFiles([pixelFixture(5000,4000,'20mp-a.png'),pixelFixture(5000,4000,'20mp-b.png')]);await assertReadyPair(page);console.log(`[CANDIDATE_OBSERVATION] sourcePixels=${L.sourcePixels.candidate}`)});
  test('20.1MP source above service limit is rejected',async({page})=>{await openTool015(page);const beforeInput=page.getByTestId(TOOL015_TESTIDS.beforeInput);await beforeInput.setInputFiles(pixelFixture(5000,4020,'20_1mp-a.png'));await expect(page.getByTestId(TOOL015_TESTIDS.error)).toContainText('20MP');await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-before-ready','0')});

  for(const side of [L.outputMaxSide.before,L.outputMaxSide.candidate]) test(`output-side service limit accepts ${side}px`,async({page})=>{await openTool015(page);const w=page.getByTestId(TOOL015_TESTIDS.width),h=page.getByTestId(TOOL015_TESTIDS.height);await w.fill(String(side));await h.fill(String(side));await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-width',String(side));await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-height',String(side))});
  test(`output-side above service limit clamps to ${L.outputMaxSide.candidate}px`,async({page})=>{await openTool015(page);const w=page.getByTestId(TOOL015_TESTIDS.width);await w.fill(String(L.outputMaxSide.above));await expect(page.getByTestId(TOOL015_TESTIDS.state)).toHaveAttribute('data-width',String(L.outputMaxSide.candidate))});
  for(const length of [L.labelLength.before,L.labelLength.candidate]) test(`label service limit accepts ${length} chars`,async({page})=>{await openTool015(page);const input=page.getByTestId('tool015-before-label');const value='A'.repeat(length);await input.fill(value);await expect(input).toHaveValue(value)});
  test(`label above service limit is capped at ${L.labelLength.candidate} chars`,async({page})=>{await openTool015(page);const input=page.getByTestId('tool015-before-label');await input.fill('A'.repeat(L.labelLength.above));await expect(input).toHaveValue('A'.repeat(L.labelLength.candidate))});
});
