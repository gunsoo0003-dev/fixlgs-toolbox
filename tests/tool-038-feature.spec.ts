import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { route038 } from './helpers/tool-038';
const fixture=(name:string)=>path.resolve('tests/fixtures/tool-038',name);

test('TOOL038 five modes are independently selectable',async({page})=>{
  await page.goto(route038());
  await page.getByTestId('tool038-options').locator('summary').click();
  for(const mode of ['upper','lower','title','sentence','first']) await expect(page.getByTestId(`tool038-mode-${mode}`)).toBeVisible();
  await expect(page.getByTestId('tool038-mode-upper')).toBeChecked();
});

test('TOOL038 result remains editable and TXT download uses edited result',async({page})=>{
  await page.goto(route038('en'));
  await page.getByTestId('tool038-input').fill('hello');
  await page.getByTestId('tool038-convert').click();
  await page.getByTestId('tool038-result').fill('Edited result');
  const downloadPromise=page.waitForEvent('download');
  await page.getByTestId('tool038-download').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('converted-text.txt');
  const saved=path.resolve('tests/fixtures/tool-038/.download-check.txt');
  await download.saveAs(saved);
  expect(await fs.readFile(saved,'utf8')).toBe('Edited result');
  await fs.rm(saved,{force:true});
});

test('TOOL038 file choose loads TXT and unsupported file preserves work',async({page})=>{
  await page.goto(route038('en'));
  await page.getByTestId('tool038-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool038-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool038-input')).toContainText('Hello');
  await page.getByTestId('tool038-file-input').setInputFiles(fixture('invalid.json'));
  await expect(page.getByTestId('tool038-error')).toContainText('TXT, MD, and CSV');
  await expect(page.getByTestId('tool038-file-info')).toContainText('sample.txt');
});

test('TOOL038 entire active workspace owns drag and replacement confirmation',async({page})=>{
  await page.goto(route038('ko'));
  await page.getByTestId('tool038-input').fill('기존 작업');
  await page.getByTestId('tool038-workspace').evaluate((el)=>{
    const dt=new DataTransfer();dt.items.add(new File(['replacement'], 'replacement.md',{type:'text/markdown'}));
    el.dispatchEvent(new DragEvent('dragenter',{bubbles:true,dataTransfer:dt}));
    el.dispatchEvent(new DragEvent('dragover',{bubbles:true,dataTransfer:dt}));
    el.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));
  });
  await expect(page.getByTestId('tool038-replace-dialog')).toBeVisible();
  await page.getByTestId('tool038-replace-cancel').click();
  await expect(page.getByTestId('tool038-input')).toHaveValue('기존 작업');
  await expect(page.locator('[data-testid="tool038-workspace"]')).toHaveCount(1);
});
