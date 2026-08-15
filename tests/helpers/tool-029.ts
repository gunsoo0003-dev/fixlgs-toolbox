import type { Page, Download } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

export const TOOL029_ROUTE = '/ko/split-extract-pdf';
export const FIXTURE_10 = 'tests/fixtures/tool-029/tool029-10p.pdf';

export async function uploadTool029(page: Page, file = FIXTURE_10) {
  await page.goto(TOOL029_ROUTE);
  await page.getByTestId('tool029-file-input').setInputFiles(file);
  await page.getByTestId('tool029-settings').waitFor({ state: 'visible' });
}

export async function readDownloadedPdf(download: Download) {
  const path = await download.path();
  if (!path) throw new Error('DOWNLOAD_PATH_MISSING');
  const bytes = await import('node:fs').then((fs) => fs.readFileSync(path));
  return PDFDocument.load(bytes);
}

export function parseStoredZip(bytes:Buffer){
  const out:Array<{name:string;data:Buffer}>=[];
  let offset=0;
  while(offset+30<=bytes.length && bytes.readUInt32LE(offset)===0x04034b50){
    const method=bytes.readUInt16LE(offset+8);
    const compressed=bytes.readUInt32LE(offset+18);
    const nameLen=bytes.readUInt16LE(offset+26);
    const extraLen=bytes.readUInt16LE(offset+28);
    if(method!==0) throw new Error(`UNEXPECTED_ZIP_METHOD:${method}`);
    const nameStart=offset+30, dataStart=nameStart+nameLen+extraLen;
    const name=bytes.subarray(nameStart,nameStart+nameLen).toString('utf8');
    out.push({name,data:bytes.subarray(dataStart,dataStart+compressed)});
    offset=dataStart+compressed;
  }
  return out;
}
