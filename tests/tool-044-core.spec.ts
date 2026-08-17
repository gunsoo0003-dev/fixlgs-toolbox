import {expect,test} from '@playwright/test';
import {route044,setText044} from './helpers/tool-044';

test('EN frequency density exact',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'apple banana apple');
  await expect(page.getByTestId('tool044-run')).toBeEnabled();
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-result')).toBeVisible();
  await expect(page.getByTestId('tool044-keyword-table')).toContainText('66.67%');
});

test('KO exact',async({page})=>{
  await page.goto(route044('ko'));
  await setText044(page,'사과 배 사과');
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-keyword-table')).toContainText('사과');
});

test('JA duplicate sentence',async({page})=>{
  await page.goto(route044('ja'));
  await setText044(page,'猫が好きです。犬も好きです。猫が好きです。');
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-duplicates')).toContainText('猫が好きです。');
});

test('TXT file input loads and analyzes',async({page})=>{
  await page.goto(route044('en'));
  await page.getByTestId('tool044-file-input').setInputFiles('tests/fixtures/tool-044/sample.txt');
  await expect(page.getByTestId('tool044-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool044-input')).toHaveValue(/apple banana apple/i);
  await page.getByTestId('tool044-run').click();
  const table=page.getByTestId('tool044-keyword-table');
  await expect(table).toContainText('apple');
  await expect(table).toContainText('2');
  await expect(table).toContainText('28.57%');
  await expect(table).toContainText('banana');
});

test('drag and drop TXT loads selected file',async({page})=>{
  await page.goto(route044('en'));
  const payload=Buffer.from('apple banana apple','utf8').toString('base64');
  await page.getByTestId('tool044-workspace').evaluate((el,data)=>{
    const dt=new DataTransfer();
    const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
    dt.items.add(new File([bytes],'drag.txt',{type:'text/plain'}));
    for(const type of ['dragenter','dragover','drop']) el.dispatchEvent(new DragEvent(type,{bubbles:true,dataTransfer:dt}));
  },payload);
  await expect(page.getByTestId('tool044-file-info')).toContainText('drag.txt');
  await expect(page.getByTestId('tool044-input')).toHaveValue('apple banana apple');
});

test('file replacement cancel keeps current text',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'keep this text');
  await page.getByTestId('tool044-file-input').setInputFiles('tests/fixtures/tool-044/sample.txt');
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'Cancel'}).click();
  await expect(page.getByTestId('tool044-input')).toHaveValue('keep this text');
  await expect(dialog).toHaveCount(0);
});

test('file replacement confirm loads new file and clears prior result',async({page})=>{
  await page.goto(route044('en'));
  await setText044(page,'apple apple');
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-result')).toBeVisible();
  await page.getByTestId('tool044-file-input').setInputFiles('tests/fixtures/tool-044/sample.txt');
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Continue'}).click();
  await expect(page.getByTestId('tool044-file-info')).toContainText('sample.txt');
  await expect(page.getByTestId('tool044-result')).toHaveCount(0);
});
