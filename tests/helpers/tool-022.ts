import { expect, type Download, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

export const tool022Path=(locale='ko')=>`/${locale}/blog-open-graph-image-maker`;
export async function openTool022(page:Page,locale='ko'){
  await page.goto(tool022Path(locale));
  await expect(page.getByTestId('tool-022-root')).toBeVisible();
}

export async function readDownload(download:Download){
  const path=await download.path();
  if(!path) throw new Error('download path unavailable');
  return fs.readFile(path);
}

export function imageDimensions(buf:Buffer){
  if(buf.length>=24 && buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
    return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
  }
  if(buf.length>=4 && buf[0]===0xff && buf[1]===0xd8){
    let i=2;
    while(i+9<buf.length){
      if(buf[i]!==0xff){i++;continue;}
      const marker=buf[i+1];
      if(marker===0xd8||marker===0xd9){i+=2;continue;}
      const len=buf.readUInt16BE(i+2);
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
        return {height:buf.readUInt16BE(i+5),width:buf.readUInt16BE(i+7)};
      }
      if(len<2) break;
      i+=2+len;
    }
  }
  throw new Error('unsupported image data');
}

export function storedZipEntries(buf:Buffer){
  const out:Array<{name:string;data:Buffer}>=[];
  let i=0;
  while(i+30<=buf.length && buf.readUInt32LE(i)===0x04034b50){
    const size=buf.readUInt32LE(i+18);
    const nameLen=buf.readUInt16LE(i+26);
    const extraLen=buf.readUInt16LE(i+28);
    const nameStart=i+30;
    const dataStart=nameStart+nameLen+extraLen;
    const name=buf.subarray(nameStart,nameStart+nameLen).toString('utf8');
    out.push({name,data:buf.subarray(dataStart,dataStart+size)});
    i=dataStart+size;
  }
  return out;
}
