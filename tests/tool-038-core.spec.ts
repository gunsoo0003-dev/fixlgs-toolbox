import { expect, test } from '@playwright/test';
import { convert038, route038 } from './helpers/tool-038';

test('TOOL038 uppercase and lowercase are exact',async({page})=>{
  await page.goto(route038());
  await convert038(page,'Hello WORLD!','upper');
  await expect(page.getByTestId('tool038-result')).toHaveValue('HELLO WORLD!');
  await page.getByTestId('tool038-options').locator('summary').click();
  await page.getByTestId('tool038-mode-lower').check();
  await page.getByTestId('tool038-convert').click();
  await expect(page.getByTestId('tool038-result')).toHaveValue('hello world!');
});

test('TOOL038 title and sentence cases are exact',async({page})=>{
  await page.goto(route038('en'));
  await page.getByTestId('tool038-input').fill('hello WORLD. next LINE!');
  await page.getByTestId('tool038-options').locator('summary').click();
  await page.getByTestId('tool038-mode-title').check();
  await page.getByTestId('tool038-convert').click();
  await expect(page.getByTestId('tool038-result')).toHaveValue('Hello World. Next Line!');
  await page.getByTestId('tool038-mode-sentence').check();
  await page.getByTestId('tool038-convert').click();
  await expect(page.getByTestId('tool038-result')).toHaveValue('Hello world. Next line!');
});

test('TOOL038 first-cased-character mode preserves remaining source',async({page})=>{
  await page.goto(route038());
  await convert038(page,'안녕 fixlgs TOOLBOX','first');
  await expect(page.getByTestId('tool038-result')).toHaveValue('안녕 Fixlgs TOOLBOX');
});
