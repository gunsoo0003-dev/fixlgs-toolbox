import path from 'node:path';
import { test, expect } from '@playwright/test';
import { openTool022 } from './helpers/tool-022';
const fx=(name:string)=>path.join(process.cwd(),'tests','fixtures','tool-022',name);

test('no output selection reports recoverable error',async({page})=>{
  await openTool022(page);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  for(const id of ['naver','blogger','website','og']){
    await page.getByTestId(`tool022-preset-${id}`).click();
    await page.getByTestId('tool022-select-current').uncheck();
  }
  await page.getByTestId('tool022-download-zip').click();
  await expect(page.getByTestId('tool022-error')).toContainText(/하나 이상|at least one|1つ以上/);
  await page.getByTestId('tool022-select-current').check();
  await expect(page.getByTestId('tool022-download-zip')).toBeEnabled();
});

test('corrupted image is rejected without page reset',async({page})=>{
  await openTool022(page);
  await page.locator('input[type=file][accept*="image/jpeg"]').first().setInputFiles(fx('corrupted.jpg'));
  await expect(page.getByTestId('tool022-error')).toContainText(/손상|unsupported|破損/);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  await expect(page.getByTestId('tool022-download-current')).toBeVisible();
});

test('long Japanese text does not create horizontal overflow on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openTool022(page,'ja');
  await page.getByRole('button',{name:/空のデザイン/}).click();
  await page.getByText('EDIT',{exact:true}).click();
  await page.locator('textarea').first().fill('ブログ・オープングラフ画像作成ツール長い日本語タイトル文字列文字列文字列文字列文字列文字列文字列');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
