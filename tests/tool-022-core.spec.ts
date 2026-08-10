import path from 'node:path';
import { test, expect } from '@playwright/test';
import { imageDimensions, openTool022, readDownload, storedZipEntries } from './helpers/tool-022';

const fx=(name:string)=>path.join(process.cwd(),'tests','fixtures','tool-022',name);

test('blank design exposes required presets and export controls',async({page})=>{
  await openTool022(page);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  for(const id of ['naver','blogger','website','og']) await expect(page.getByTestId(`tool022-preset-${id}`)).toBeVisible();
  await expect(page.getByTestId('tool022-preset-og')).toContainText('1200×630');
  await expect(page.getByTestId('tool022-download-current')).toBeVisible();
  await expect(page.getByTestId('tool022-download-zip')).toBeVisible();
});

test('actual JPG and PNG export use real 1200x630 OG dimensions',async({page})=>{
  await openTool022(page);
  const chooser=page.locator('input[type=file][accept*="image/jpeg"]').first();
  await chooser.setInputFiles(fx('landscape.jpg'));
  await page.getByTestId('tool022-preset-og').click();
  const [jpg]=await Promise.all([page.waitForEvent('download'),page.getByTestId('tool022-download-current').click()]);
  expect(imageDimensions(await readDownload(jpg))).toEqual({width:1200,height:630});
  await page.getByLabel(/파일 형식|File Format|ファイル形式/).selectOption('png');
  const [png]=await Promise.all([page.waitForEvent('download'),page.getByTestId('tool022-download-current').click()]);
  expect(imageDimensions(await readDownload(png))).toEqual({width:1200,height:630});
});

test('selected ZIP contains four ordered files with real dimensions',async({page})=>{
  await openTool022(page);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  await page.getByLabel(/파일 형식|File Format|ファイル形式/).selectOption('png');
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByTestId('tool022-download-zip').click()]);
  const entries=storedZipEntries(await readDownload(download));
  expect(entries.map(e=>e.name)).toEqual([
    'blank-design-naver-blog.png','blank-design-blogger.png','blank-design-website-featured.png','blank-design-open-graph.png',
  ]);
  expect(entries.map(e=>imageDimensions(e.data))).toEqual([
    {width:1200,height:675},{width:1200,height:675},{width:1200,height:630},{width:1200,height:630},
  ]);
});


test('ZIP always regenerates all currently selected presets after an individual download',async({page})=>{
  await openTool022(page);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  await page.getByLabel(/파일 형식|File Format|ファイル形式/).selectOption('png');
  const [single]=await Promise.all([page.waitForEvent('download'),page.getByTestId('tool022-download-current').click()]);
  expect(imageDimensions(await readDownload(single))).toEqual({width:1200,height:630});
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByTestId('tool022-download-zip').click()]);
  const entries=storedZipEntries(await readDownload(download));
  expect(entries.map(e=>e.name)).toEqual([
    'blank-design-naver-blog.png','blank-design-blogger.png','blank-design-website-featured.png','blank-design-open-graph.png',
  ]);
});

test('title description logo positioning controls exist and react to preset-only mode',async({page})=>{
  await openTool022(page);
  await page.getByRole('button',{name:/빈 디자인 시작|Start Blank|空のデザイン/}).click();
  await expect(page.getByLabel('title x')).toBeVisible();
  await expect(page.getByLabel('description x')).toBeVisible();
  await expect(page.getByLabel('logo x')).toBeVisible();
  await page.getByRole('button',{name:/이 규격만 조정|Adjust This Size Only|このサイズのみ調整/}).click();
  await page.getByLabel('title x').fill('33');
  await page.getByTestId('tool022-preset-naver').click();
  await expect(page.getByLabel('title x')).not.toHaveValue('33');
  await page.getByTestId('tool022-preset-og').click();
  await expect(page.getByLabel('title x')).toHaveValue('33');
});

test('languages render',async({page})=>{for(const l of ['ko','en','ja']){await openTool022(page,l);await expect(page.locator('h1')).toBeVisible()}});
