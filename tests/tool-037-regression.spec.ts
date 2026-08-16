import { expect, test } from '@playwright/test';
import { route037 } from './helpers/tool-037';

for(const locale of ['ko','en','ja'] as const){
  test(`TOOL037 ${locale} route renders without horizontal overflow`,async({page})=>{
    await page.goto(route037(locale));
    await expect(page.getByTestId('tool037-root')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('TOOL037 Japanese mobile stays within viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(route037('ja'));
  await page.getByTestId('tool037-options').locator('summary').click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBeFalsy();
});

test('TOOL037 text category shows 036/037/038 and 037 is LIVE',async({page})=>{
  await page.goto('/ko/category/text');
  await expect(page.getByText('036',{exact:true})).toBeVisible();
  await expect(page.getByText('037',{exact:true})).toBeVisible();
  await expect(page.getByText('038',{exact:true})).toBeVisible();
  const card=page.locator('a.toolbox-subpage-card').filter({hasText:'037'});
  await expect(card).toHaveAttribute('href','/ko/text-whitespace-linebreak-cleaner');
  await expect(card).toContainText('LIVE');
});

test('TOOL036 next-work now links to TOOL037',async({page})=>{
  await page.goto('/en/character-document-counter');
  const link=page.locator('a.toolbox-next-work-card').filter({hasText:'037'});
  await expect(link).toHaveAttribute('href','/en/text-whitespace-linebreak-cleaner');
});
