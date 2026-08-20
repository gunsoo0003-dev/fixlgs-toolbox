import {expect,test} from '@playwright/test';

const locales=['ko','en','ja'] as const;
const faqTitle={ko:'자주 묻는 질문',en:'Frequently asked questions',ja:'よくある質問'} as const;

for(const locale of locales)test(`TOOL064 design exact contract ${locale}`,async({page},testInfo)=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console.error: ${m.text()}`)});
  await page.goto(`/${locale}/statistics-calculator`,{waitUntil:'domcontentloaded'});

  const root=page.getByTestId('tool064-root');
  const workspace=page.getByTestId('tool064-workspace');
  const result=page.getByTestId('tool064-result');
  const sorted=page.getByTestId('tool064-sorted');
  for(const x of [root,workspace,result,sorted])await expect(x).toHaveCount(1);
  await expect(root).toBeVisible();
  await expect(workspace).toBeVisible();
  await expect(page.getByTestId('tool064-input')).toBeVisible();
  await expect(page.getByTestId('tool064-reset')).toBeVisible();
  await expect(page.getByTestId('tool064-copy')).toBeVisible();
  await expect(page.locator('a.toolbox-subpage-back')).toHaveAttribute('href',`/${locale}/category/unit-calc`);

  const next=page.locator('.toolbox-next-work');
  await expect(next).toHaveCount(2);
  await expect(next.nth(0).getByText('NEXT WORK',{exact:true})).toBeVisible();
  await expect(next.nth(1).getByText('RELATED TOOLS',{exact:true})).toBeVisible();

  const how=page.locator('.toolbox-tool-guide.toolbox-tool-guide--five');
  const exp=page.locator('.toolbox-tool-format-guide.toolbox-tool-expert-post.toolbox-tool-expert-post--wide-head');
  const notes=page.locator('.toolbox-tool-info-band.toolbox-tool-info-band--section-start.toolbox-tool-info-band--bottom-gap.toolbox-tool-info-band--left-head.toolbox-tool-info-band--format-head');
  const faq=page.locator('.toolbox-tool-faq');
  for(const x of [how,exp,notes,faq])await expect(x).toHaveCount(1);

  const order=await page.locator('.toolbox-tool-guide.toolbox-tool-guide--five, .toolbox-tool-expert-post, .toolbox-tool-info-band--section-start, .toolbox-tool-faq').evaluateAll(es=>es.map(e=>e.className));
  expect(order).toHaveLength(4);
  expect(order[0]).toContain('toolbox-tool-guide');
  expect(order[1]).toContain('toolbox-tool-expert-post');
  expect(order[2]).toContain('toolbox-tool-info-band');
  expect(order[3]).toContain('toolbox-tool-faq');
  await expect(how.locator('ol > li')).toHaveCount(5);
  await expect(exp.locator('article')).toHaveCount(6);
  await expect(faq.getByRole('heading',{name:faqTitle[locale],exact:true})).toBeVisible();

  // Completed product contract: no per-tool divider opt-in. The common IMPORTANT NOTES structure owns it.
  await expect(notes).not.toHaveClass(/toolbox-tool-info-band--full-divider/);
  const divider=await notes.evaluate(el=>{const s=getComputedStyle(el,'::before');return{width:parseFloat(s.width),border:parseFloat(s.borderTopWidth),viewport:innerWidth,content:s.content}});
  expect(Math.abs(divider.width-divider.viewport)).toBeLessThanOrEqual(2);
  expect(divider.border).toBeGreaterThanOrEqual(1);
  expect(divider.content).not.toBe('none');

  // Default data renders the completed statistics layout: 3 primary + 5 secondary result cards.
  await expect(result.locator('[data-testid="tool064-mean"]')).toBeVisible();
  await expect(result.locator('[data-testid="tool064-median"]')).toBeVisible();
  await expect(result.locator('[data-testid="tool064-mode"]')).toBeVisible();
  for(const id of ['tool064-count','tool064-sum','tool064-min','tool064-max','tool064-range'])await expect(page.getByTestId(id)).toBeVisible();

  const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(geometry.scroll-geometry.viewport,`${testInfo.project.name} horizontal overflow`).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
