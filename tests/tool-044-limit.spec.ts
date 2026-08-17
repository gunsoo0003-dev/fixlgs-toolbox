import {expect,test} from '@playwright/test';
import {injectText044,route044} from './helpers/tool-044';

for(const locale of ['en','ko','ja'] as const){
  test(`${locale} character over limit keeps source and blocks result`,async({page})=>{
    await page.goto(route044(locale));
    const text='a'.repeat(300001);
    await injectText044(page,text);
    await page.getByTestId('tool044-run').click();
    await expect(page.getByTestId('tool044-error')).toBeVisible();
    await expect(page.getByTestId('tool044-result')).toHaveCount(0);
    await expect(page.getByTestId('tool044-input')).toHaveValue(text);
  });
}

test('sentence over limit blocks result without clearing source',async({page})=>{
  await page.goto(route044('en'));
  const text='A. '.repeat(30001);
  await injectText044(page,text);
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-error')).toBeVisible();
  await expect(page.getByTestId('tool044-result')).toHaveCount(0);
  await expect(page.getByTestId('tool044-input')).toHaveValue(text);
});

test('unique keyword over limit blocks result without clearing source',async({page})=>{
  await page.goto(route044('en'));
  const text=Array.from({length:50001},(_,i)=>`word${i}`).join(' ');
  await injectText044(page,text);
  await page.getByTestId('tool044-run').click();
  await expect(page.getByTestId('tool044-error')).toBeVisible();
  await expect(page.getByTestId('tool044-result')).toHaveCount(0);
  await expect(page.getByTestId('tool044-input')).toHaveValue(text);
});
