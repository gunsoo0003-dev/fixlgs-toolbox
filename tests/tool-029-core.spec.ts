import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { uploadTool029, readDownloadedPdf, parseStoredZip } from './helpers/tool-029';

test('029 selected pages -> one PDF keeps page count and source order', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-mode-selected').click();
  await page.getByTestId('tool029-selection-input').fill('1,3,5-8');
  await page.getByTestId('tool029-process').click();
  await expect(page.getByTestId('tool029-results')).toBeVisible();
  const promise = page.waitForEvent('download');
  await page.getByTestId('tool029-result-row').first().getByRole('button').click();
  const pdf = await readDownloadedPdf(await promise);
  expect(pdf.getPageCount()).toBe(6);
  expect(pdf.getPages().map((p)=>Math.round(p.getWidth()))).toEqual([507,521,535,542,549,556]);
});

test('029 range mode creates three independent PDFs in the planned order', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-range-input').fill('1-3 / 4-7 / 8-10');
  await page.getByTestId('tool029-process').click();
  await expect(page.getByTestId('tool029-result-row')).toHaveCount(3);
  const expected=[[507,514,521],[528,535,542,549],[556,563,570]];
  for(let i=0;i<3;i+=1){
    const promise=page.waitForEvent('download');
    await page.getByTestId('tool029-result-row').nth(i).getByRole('button').click();
    const pdf=await readDownloadedPdf(await promise);
    expect(pdf.getPages().map((p)=>Math.round(p.getWidth()))).toEqual(expected[i]);
  }
});

test('029 one-PDF-per-page ZIP contains 10 PDFs, pageCount=1, original order', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-mode-individual').click();
  await page.getByTestId('tool029-process').click();
  await expect(page.getByTestId('tool029-result-row')).toHaveCount(10);
  const promise=page.waitForEvent('download');
  await page.getByTestId('tool029-download-all').click();
  const download=await promise; const path=await download.path(); if(!path)throw new Error('ZIP_PATH_MISSING');
  const entries=parseStoredZip(fs.readFileSync(path));
  expect(entries).toHaveLength(10);
  for(let i=0;i<entries.length;i+=1){
    expect(entries[i].name).toMatch(new RegExp(`page-${String(i+1).padStart(3,'0')}\\.pdf$`));
    const pdf=await PDFDocument.load(entries[i].data);
    expect(pdf.getPageCount()).toBe(1);
    expect(Math.round(pdf.getPage(0).getWidth())).toBe(507+(i*7));
  }
});

test('029 odd/even outputs contain only their 1-based page groups', async ({ page }) => {
  await uploadTool029(page);
  await page.getByTestId('tool029-mode-odd-even').click();
  await page.getByTestId('tool029-process').click();
  await expect(page.getByTestId('tool029-result-row')).toHaveCount(2);
  for(const [index,widths] of [[0,[507,521,535,549,563]],[1,[514,528,542,556,570]]] as const){
    const promise=page.waitForEvent('download');
    await page.getByTestId('tool029-result-row').nth(index).getByRole('button').click();
    const pdf=await readDownloadedPdf(await promise);
    expect(pdf.getPages().map((p)=>Math.round(p.getWidth()))).toEqual(widths);
  }
});
