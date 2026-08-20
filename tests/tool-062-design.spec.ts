import {expect,test} from '@playwright/test';
const locales=['ko','en','ja'] as const;
const expert={ko:'추가 할인은 더하지 않고 순서대로 적용합니다',en:'Stacked discounts multiply instead of simply adding',ja:'追加割引は足さずに順番に適用します'} as const;
const faqTitle={ko:'자주 묻는 질문',en:'Frequently asked questions',ja:'よくある質問'} as const;
const markers=['BASIC','STACKED','EFFECTIVE','REVERSE','RATE','BOUNDARY'];
for(const locale of locales)test(`TOOL062 design exact contract ${locale}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`/${locale}/discount-price-calculator`);
  const root=page.getByTestId('tool-062-root');await expect(root).toBeVisible();await expect(page.getByTestId('tool-062-final')).toBeVisible();
  await expect(page.locator('.toolbox-tool-detail-hero')).toHaveCount(1);await expect(page.locator('a.toolbox-subpage-back')).toHaveAttribute('href',`/${locale}/category/unit-calc`);
  const next=page.locator('.toolbox-next-work');await expect(next).toHaveCount(2);await expect(next.nth(0).getByText('NEXT WORK',{exact:true})).toBeVisible();await expect(next.nth(1).getByText('RELATED TOOLS',{exact:true})).toBeVisible();
  const how=page.locator('.toolbox-tool-guide.toolbox-tool-guide--five');const exp=page.locator('.toolbox-tool-format-guide.toolbox-tool-expert-post.toolbox-tool-expert-post--wide-head');
  const notes=page.locator('.toolbox-tool-info-band.toolbox-tool-info-band--section-start.toolbox-tool-info-band--bottom-gap.toolbox-tool-info-band--left-head.toolbox-tool-info-band--format-head');const faq=page.locator('.toolbox-tool-faq');
  for(const x of [how,exp,notes,faq])await expect(x).toHaveCount(1);const order=await page.locator('.toolbox-tool-guide.toolbox-tool-guide--five, .toolbox-tool-expert-post, .toolbox-tool-info-band--section-start, .toolbox-tool-faq').evaluateAll(es=>es.map(e=>e.className));
  expect(order).toHaveLength(4);expect(order[0]).toContain('toolbox-tool-guide');expect(order[1]).toContain('toolbox-tool-expert-post');expect(order[2]).toContain('toolbox-tool-info-band');expect(order[3]).toContain('toolbox-tool-faq');
  await expect(how.locator('ol > li')).toHaveCount(5);await expect(exp.locator('article')).toHaveCount(6);await expect(exp.getByRole('heading',{name:expert[locale]})).toBeVisible();for(const marker of markers)await expect(exp.getByText(marker,{exact:true})).toBeVisible();await expect(faq.getByRole('heading',{name:faqTitle[locale]})).toBeVisible();
  const layout=page.locator('[class*="layout"]').first();if(page.viewportSize()!.width<820)expect((await layout.evaluate(el=>getComputedStyle(el).gridTemplateColumns)).split(' ').length).toBe(1);
  expect(errors).toEqual([]);
});
