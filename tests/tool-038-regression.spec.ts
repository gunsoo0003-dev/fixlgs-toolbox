import { expect, test } from '@playwright/test';
import { route038 } from './helpers/tool-038';

for(const locale of ['ko','en','ja'] as const){
  test(`TOOL038 ${locale} route renders without horizontal overflow`,async({page})=>{
    await page.goto(route038(locale));
    await expect(page.getByTestId('tool038-root')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('TOOL038 Japanese mobile stays within viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(route038('ja'));
  await page.getByTestId('tool038-options').locator('summary').click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBeFalsy();
});

test('Text category shows 036/037/038 and 038 is LIVE',async({page})=>{
  await page.goto('/ko/category/text');
  for(const n of ['036','037','038']) await expect(page.getByText(n,{exact:true})).toBeVisible();
  const card=page.locator('a.toolbox-subpage-card').filter({hasText:'038'});
  await expect(card).toHaveAttribute('href','/ko/case-sentence-format-converter');
  await expect(card).toContainText('LIVE');
});

test('TOOL037 next-work points to TOOL038',async({page})=>{
  await page.goto('/en/text-whitespace-linebreak-cleaner');
  const card=page.locator('.toolbox-next-work-card').filter({hasText:'038'});
  await expect(card).toContainText('Text Case & Sentence Converter');
});
