import {readFile} from 'node:fs/promises';
import {test,expect,type Page} from '@playwright/test';
import {upload023,TOOL023_TESTIDS} from './helpers/tool-023';

const GENERATION_TIMEOUT_MS=20000;
async function waitForGenerationComplete(page:Page){
  await expect(page.getByTestId(TOOL023_TESTIDS.status)).toContainText(/완료|complete/i,{timeout:GENERATION_TIMEOUT_MS});
}

function pngSize(bytes:Buffer){
  expect(bytes.subarray(1,4).toString('ascii')).toBe('PNG');
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
function icoSizes(bytes:Buffer){
  expect(bytes.readUInt16LE(0)).toBe(0);
  expect(bytes.readUInt16LE(2)).toBe(1);
  const count=bytes.readUInt16LE(4);const out:number[]=[];
  for(let i=0;i<count;i++){const p=6+i*16;out.push(bytes[p]||256)}
  return out;
}
async function downloadFile(page:Page,path:string){
  const row=page.locator(`[data-file-path="${path}"]`);
  await expect(row).toBeVisible();
  const download=await Promise.all([page.waitForEvent('download',{timeout:30000}),row.getByRole('button').click()]).then(([d])=>d);
  const saved=await download.path();expect(saved).toBeTruthy();return readFile(saved!);
}

function storedZipEntries(bytes:Buffer){
  const out=new Map<string,Buffer>();let p=0;
  while(p+30<=bytes.length&&bytes.readUInt32LE(p)===0x04034b50){
    const method=bytes.readUInt16LE(p+8);expect(method).toBe(0);
    const size=bytes.readUInt32LE(p+18),nameLen=bytes.readUInt16LE(p+26),extraLen=bytes.readUInt16LE(p+28);
    const nameStart=p+30,dataStart=nameStart+nameLen+extraLen;
    const name=bytes.subarray(nameStart,nameStart+nameLen).toString('utf8');
    out.set(name,bytes.subarray(dataStart,dataStart+size));p=dataStart+size;
  }
  return out;
}
async function downloadAllZip(page:Page){
  const button=page.getByRole('button',{name:'전체 ZIP 다운로드'});
  await expect(button).toBeVisible();
  const download=await Promise.all([page.waitForEvent('download',{timeout:30000}),button.click()]).then(([d])=>d);
  const saved=await download.path();expect(saved).toBeTruthy();return readFile(saved!);
}

test('023 core upload and generation',async({page})=>{
  await upload023(page);await page.getByTestId(TOOL023_TESTIDS.generate).click();
  await waitForGenerationComplete(page);
  await expect(page.getByTestId('tool023-file-list')).toBeVisible();
});

test('023 exposes all platform tabs',async({page})=>{
  await upload023(page);
  await expect(page.getByRole('button',{name:'Android 아이콘'})).toBeVisible();
  await expect(page.getByRole('button',{name:'PWA 아이콘'})).toBeVisible();
  await expect(page.getByRole('button',{name:'파비콘'})).toBeVisible();
});

test('023 generated PNG dimensions match presets',async({page})=>{
  test.setTimeout(90000);
  await upload023(page);await page.getByTestId(TOOL023_TESTIDS.generate).click();
  await waitForGenerationComplete(page);
  const zip=storedZipEntries(await downloadAllZip(page));
  const cases:[string,number][]=[
    ['android/playstore-icon-512.png',512],
    ['android/mipmap-mdpi/ic_launcher.png',48],
    ['android/mipmap-hdpi/ic_launcher.png',72],
    ['android/mipmap-xhdpi/ic_launcher.png',96],
    ['android/mipmap-xxhdpi/ic_launcher.png',144],
    ['android/mipmap-xxxhdpi/ic_launcher.png',192],
    ['android/adaptive/foreground-432.png',432],
    ['pwa/pwa-192x192.png',192],['pwa/pwa-512x512.png',512],
    ['pwa/pwa-maskable-192x192.png',192],['pwa/pwa-maskable-512x512.png',512],
    ['favicon/favicon-16x16.png',16],['favicon/favicon-32x32.png',32],['favicon/favicon-48x48.png',48],
    ['favicon/apple-touch-icon-180x180.png',180],
  ];
  for(const [path,size] of cases){const bytes=zip.get(path);expect(bytes,`missing ${path}`).toBeTruthy();expect(pngSize(bytes!)).toEqual({width:size,height:size})}
});

test('023 favicon.ico contains 16 32 48 frames',async({page})=>{
  await upload023(page);await page.getByTestId(TOOL023_TESTIDS.generate).click();
  await waitForGenerationComplete(page);
  const bytes=await downloadFile(page,'favicon/favicon.ico');
  expect(icoSizes(bytes)).toEqual([16,32,48]);
});

test('023 settings reset keeps source while full reset returns to initial workspace',async({page})=>{
  await upload023(page);
  await page.getByLabel('확대·축소').fill('1.5');
  await page.getByTestId('tool023-reset-settings').click();
  await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toBeVisible();
  await expect(page.getByLabel('확대·축소')).toHaveValue('1');
  await page.getByTestId('tool023-reset-all').click();
  await expect(page.getByTestId('tool023-start-card')).toBeVisible();
  await expect(page.getByTestId(TOOL023_TESTIDS.preview)).toHaveCount(0);
});

test('023 safe-zone guide is Android-only and toggles on/off',async({page})=>{
  await upload023(page);
  const toggle=page.getByTestId('tool023-safe-toggle');
  await expect(toggle).toBeChecked();
  await expect(page.locator('[class*="safeAndroid"]')).toHaveCount(4);
  await toggle.uncheck();
  await expect(page.locator('[class*="safeAndroid"]')).toHaveCount(0);
  await page.getByRole('button',{name:'PWA 아이콘'}).click();
  await expect(page.getByTestId('tool023-safe-toggle')).toHaveCount(0);
  await expect(page.locator('[class*="safePwa"]')).toHaveCount(0);
  await page.getByRole('button',{name:'파비콘'}).click();
  await expect(page.getByTestId('tool023-safe-toggle')).toHaveCount(0);
});

test('023 generated output paths are unique',async({page})=>{
  await upload023(page);await page.getByTestId(TOOL023_TESTIDS.generate).click();
  await waitForGenerationComplete(page);
  const paths=await page.locator('[data-file-path]').evaluateAll(rows=>rows.map(r=>r.getAttribute('data-file-path')));
  expect(new Set(paths).size).toBe(paths.length);
});
