import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { route037 } from './helpers/tool-037';

const fixture=(name:string)=>path.resolve('tests/fixtures/tool-037',name);

test('TOOL037 five fixed controls remain independently controllable',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-options').locator('summary').click();
  await expect(page.getByTestId('tool037-collapse-spaces')).toBeChecked();
  await expect(page.getByTestId('tool037-trim-lines')).toBeChecked();
  await expect(page.getByTestId('tool037-remove-tabs')).toBeChecked();
  await expect(page.getByTestId('tool037-remove-blank-lines')).toBeChecked();
  await expect(page.getByTestId('tool037-eol-lf')).toHaveAttribute('aria-pressed','true');
});

test('TOOL037 CRLF selection changes actual downloaded TXT bytes',async({page})=>{
  await page.goto(route037('en'));
  await page.getByTestId('tool037-options').locator('summary').click();
  await page.getByTestId('tool037-eol-crlf').click();
  await page.getByTestId('tool037-input').fill('A\nB');
  await page.getByTestId('tool037-clean').click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByTestId('tool037-download').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('cleaned-text.txt');
  const saved=path.resolve('tests/fixtures/tool-037/.download-check.txt');
  await download.saveAs(saved);
  const bytes=await fs.readFile(saved);
  expect(bytes.equals(Buffer.from('A\r\nB','utf8'))).toBeTruthy();
  await fs.rm(saved,{force:true});
});

test('TOOL037 result remains editable before copy or download',async({page})=>{
  await page.goto(route037());
  await page.getByTestId('tool037-input').fill('A  B');
  await page.getByTestId('tool037-clean').click();
  await page.getByTestId('tool037-result').fill('Edited result');
  await expect(page.getByTestId('tool037-result')).toHaveValue('Edited result');
  await expect(page.getByTestId('tool037-copy')).toBeEnabled();
  await expect(page.getByTestId('tool037-download')).toBeEnabled();
});

test('TOOL037 file choose loads TXT and unsupported file preserves work',async({page})=>{
  await page.goto(route037('en'));
  await page.getByTestId('tool037-file-input').setInputFiles(fixture('sample.txt'));
  await expect(page.getByTestId('tool037-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool037-input')).toContainText('Hello');
  await page.getByTestId('tool037-file-input').setInputFiles(fixture('invalid.json'));
  await expect(page.getByTestId('tool037-error')).toContainText('TXT, MD, and CSV');
  await expect(page.getByTestId('tool037-file-info')).toContainText('sample.txt');
});

test('TOOL037 entire active workspace owns drag and replacement confirmation',async({page})=>{
  await page.goto(route037('ko'));
  await page.getByTestId('tool037-input').fill('기존 작업');
  await page.getByTestId('tool037-workspace').evaluate((el)=>{
    const dt=new DataTransfer();dt.items.add(new File(['replacement'], 'replacement.md',{type:'text/markdown'}));
    el.dispatchEvent(new DragEvent('dragenter',{bubbles:true,dataTransfer:dt}));
    el.dispatchEvent(new DragEvent('dragover',{bubbles:true,dataTransfer:dt}));
    el.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));
  });
  await expect(page.getByTestId('tool037-replace-dialog')).toBeVisible();
  await page.getByTestId('tool037-replace-cancel').click();
  await expect(page.getByTestId('tool037-input')).toHaveValue('기존 작업');
  await expect(page.locator('[data-testid="tool037-workspace"]')).toHaveCount(1);
});
