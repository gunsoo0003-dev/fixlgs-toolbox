import {expect,test} from '@playwright/test';

const locales=['ko','en','ja'] as const;

for(const locale of locales)test(`TOOL055 ${locale} completed design contract`,async({page})=>{
  await page.goto(`/${locale}/length-area-volume-converter`);
  await expect(page.getByTestId('tool055-root')).toBeVisible();
  await expect(page.locator('.toolbox-tool-detail-hero')).toBeVisible();
  await expect(page.locator('.toolbox-subpage-eyebrow')).toHaveText(/055\s*·\s*UNIT & CALCULATOR/);
  await expect(page.locator(`a.toolbox-subpage-back[href="/${locale}/category/unit-calc"]`)).toBeVisible();

  const viewport=page.viewportSize();
  expect(viewport).not.toBeNull();
  const tabBoxes=await Promise.all(['length','area','volume'].map(async d=>page.getByTestId(`tool055-tab-${d}`).boundingBox()));
  expect(tabBoxes.every(Boolean)).toBeTruthy();
  const ys=tabBoxes.map(b=>Math.round(b!.y));
  expect(Math.max(...ys)-Math.min(...ys)).toBeLessThanOrEqual(2);

  const value=page.getByTestId('tool055-value');
  const from=page.getByTestId('tool055-from');
  const swap=page.getByTestId('tool055-swap');
  const to=page.getByTestId('tool055-to');
  await expect(value).toBeVisible();await expect(from).toBeVisible();await expect(swap).toBeVisible();await expect(to).toBeVisible();

  const vb=await value.boundingBox(),fb=await from.boundingBox(),sb=await swap.boundingBox(),tb=await to.boundingBox();
  expect(vb&&fb&&sb&&tb).toBeTruthy();
  if(viewport!.width>820){
    const rowY=[vb!,fb!,sb!,tb!].map(b=>Math.round(b.y));
    expect(Math.max(...rowY)-Math.min(...rowY)).toBeLessThanOrEqual(4);
  }else if(viewport!.width<=520){
    expect(vb!.y).toBeLessThan(fb!.y);
    expect(fb!.y).toBeLessThan(sb!.y);
    expect(sb!.y).toBeLessThan(tb!.y);
    expect(Math.abs(sb!.width-vb!.width)).toBeLessThanOrEqual(4);
  }

  await expect(page.getByTestId('tool055-summary').locator('[data-unit]')).toHaveCount(6);
  const items=page.getByTestId('tool055-summary').locator('[data-unit]');
  const first=await items.nth(0).boundingBox();const second=await items.nth(1).boundingBox();
  expect(first&&second).toBeTruthy();
  if(viewport!.width<=520)expect(second!.y).toBeGreaterThan(first!.y);
  else expect(Math.abs(second!.y-first!.y)).toBeLessThanOrEqual(3);

  if(locale==='en'&&viewport!.width>900){
    await expect(page.locator('.toolbox-tool-detail-hero')).not.toHaveClass(/toolbox-tool-detail-hero--single-line-description/);
    const whiteSpace=await page.locator('.toolbox-tool-detail-heading > p').evaluate(el=>getComputedStyle(el).whiteSpace);
    expect(whiteSpace).not.toBe('nowrap');
    const noteItems=page.locator('.toolbox-tool-info-band-list li');
    await expect(noteItems).toHaveCount(5);
    const noteWhiteSpaces=await noteItems.evaluateAll(items=>items.map(el=>getComputedStyle(el).whiteSpace));
    expect(noteWhiteSpaces.every(v=>v!=='nowrap'),JSON.stringify(noteWhiteSpaces)).toBeTruthy();
    const expertHeading=page.locator('.toolbox-tool-expert-post .toolbox-tool-format-guide-head h2');
    await expect(expertHeading).toBeVisible();
    const expertWhiteSpace=await expertHeading.evaluate(el=>getComputedStyle(el).whiteSpace);
    expect(expertWhiteSpace).not.toBe('nowrap');
    const expertWidths=await expertHeading.evaluate(el=>({clientWidth:(el as HTMLElement).clientWidth,scrollWidth:(el as HTMLElement).scrollWidth}));
    expect(expertWidths.scrollWidth,JSON.stringify(expertWidths)).toBeLessThanOrEqual(expertWidths.clientWidth+1);
  }
  const overflowReport=await page.evaluate(()=>{
    const clientWidth=document.documentElement.clientWidth;
    const overflow=document.documentElement.scrollWidth-clientWidth;
    const offenders=[...document.querySelectorAll<HTMLElement>('body *')]
      .map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:el.className?.toString?.()||'',testid:el.dataset?.testid||'',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,whiteSpace:getComputedStyle(el).whiteSpace};})
      .filter(x=>x.right>clientWidth+1||x.left<-1||x.scrollWidth>x.clientWidth+1)
      .slice(0,20);
    return {overflow,offenders};
  });
  expect(overflowReport.overflow,JSON.stringify(overflowReport.offenders)).toBeLessThanOrEqual(1);
});

test('TOOL055 category visual identity keeps 055 card',async({page})=>{
  for(const locale of locales){
    await page.goto(`/${locale}/category/unit-calc`);
    const card=page.locator(`a.toolbox-subpage-card[href="/${locale}/length-area-volume-converter"]`);
    await expect(card).toBeVisible();
    await expect(card.locator('.toolbox-subpage-card-top > span')).toHaveText('055');
    await expect(card.locator('.toolbox-subpage-card-top > small')).toHaveText('LIVE');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
