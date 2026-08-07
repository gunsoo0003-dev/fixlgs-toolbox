import { expect, type Page } from '@playwright/test';
import fs from 'node:fs';

export const TOOL011 = {
  ko: '/ko/image-padding-background-tool',
  en: '/en/image-padding-background-tool',
  ja: '/ja/image-padding-background-tool',
};

export async function openTool011(page: Page, locale: 'ko'|'en'|'ja'='ko') {
  await page.goto(TOOL011[locale]);
  await expect(page.getByTestId('tool011-root')).toBeVisible();
}

export async function upload011(page: Page, fixture='test-fixtures/sample.jpg') {
  await page.getByTestId('tool011-file').setInputFiles(fixture);
  await expect(page.getByTestId('tool011-editor')).toBeVisible();
}

export async function canvasSize(page: Page) {
  const text = await page.getByTestId('tool011-result-size').textContent();
  const m = text?.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (!m) throw new Error(`result size unreadable: ${text}`);
  return { width:+m[1], height:+m[2] };
}

export async function downloadAndDecode(page: Page) {
  const dl = page.waitForEvent('download');
  await page.getByTestId('tool011-download').click();
  const download = await dl;
  const p = await download.path();
  expect(p).toBeTruthy();
  return { download, path:p! };
}

export async function decodeDownloadedImage(page: Page, path: string) {
  const base64=fs.readFileSync(path).toString('base64');
  return page.evaluate(async (encoded) => {
    const bin=atob(encoded); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const blob=new Blob([bytes]); const bitmap=await createImageBitmap(blob); const c=document.createElement('canvas'); c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(bitmap,0,0);
    const corner=Array.from(ctx.getImageData(0,0,1,1).data); const center=Array.from(ctx.getImageData(Math.floor(bitmap.width/2),Math.floor(bitmap.height/2),1,1).data); bitmap.close();
    return {width:c.width,height:c.height,corner,center};
  }, base64);
}

export async function dragCanvasPointer(page: Page, pointerType:'mouse'|'touch'='mouse') {
  const loc=page.getByTestId('tool011-canvas'); const b=await loc.boundingBox(); if(!b)throw new Error('canvas box missing');
  const start={x:b.x+b.width*.5,y:b.y+b.height*.5}, end={x:b.x+b.width*.62,y:b.y+b.height*.58};
  await loc.dispatchEvent('pointerdown',{pointerId:7,pointerType,clientX:start.x,clientY:start.y,buttons:1,isPrimary:true});
  await loc.dispatchEvent('pointermove',{pointerId:7,pointerType,clientX:end.x,clientY:end.y,buttons:1,isPrimary:true});
  await loc.dispatchEvent('pointerup',{pointerId:7,pointerType,clientX:end.x,clientY:end.y,buttons:0,isPrimary:true});
}
