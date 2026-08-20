import {test,expect} from '@playwright/test';

const route='unit-price-comparison-calculator';
const koHeadline='같은 기준의 단가로 비교합니다';
for(const locale of ['ko','en','ja'] as const){
  test(`TOOL070 completed design contract ${locale}`,async({page})=>{
    const errors:string[]=[]; page.on('pageerror',e=>errors.push(`pageerror:${e.message}`)); page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    await page.goto(`/${locale}/${route}`);
    await expect(page.locator('.toolbox-tool-detail-hero')).toBeVisible();
    const how=page.locator('.toolbox-tool-guide.toolbox-tool-guide--five');
    const expert=page.locator('.toolbox-tool-format-guide.toolbox-tool-expert-post.toolbox-tool-expert-post--wide-head');
    const notes=page.locator('.toolbox-tool-info-band.toolbox-tool-info-band--section-start.toolbox-tool-info-band--format-head');
    const faq=page.locator('.toolbox-tool-faq');
    await expect(how).toBeVisible(); await expect(expert).toBeVisible(); await expect(notes).toBeVisible(); await expect(faq).toBeVisible();
    await expect(expert.locator('.toolbox-tool-format-grid article')).toHaveCount(6);
    if(locale==='ko') await expect(expert.locator('.toolbox-tool-format-guide-head h2')).toHaveText(koHeadline);
    const expertStyle=await expert.locator('.toolbox-tool-format-guide-head h2').evaluate(el=>{const s=getComputedStyle(el);return {whiteSpace:s.whiteSpace,overflowWrap:s.overflowWrap}});
    expect(expertStyle.whiteSpace).toBe('normal'); expect(expertStyle.overflowWrap).toBe('anywhere');
    const divider=await notes.evaluate(el=>{const s=getComputedStyle(el,'::before');return {width:parseFloat(s.width),border:s.borderTopWidth}});
    expect(divider.border).toBe('1px'); expect(divider.width).toBeGreaterThanOrEqual((await page.evaluate(()=>innerWidth))-2);
    const faqHead=faq.locator('.toolbox-tool-guide-head'); await expect(faqHead).toHaveCount(1);
    await expect(faqHead.locator('p')).toHaveText('FAQ');
    const expectedHeading=locale==='ko'?'자주 묻는 질문':locale==='ja'?'よくある質問':'Frequently asked questions';
    await expect(faqHead.locator('h2')).toHaveText(expectedHeading);
    await expect(faq.locator('.toolbox-tool-faq-list details')).toHaveCount(4);
    await expect(faq.locator('.toolbox-tool-faq-list details').first()).toHaveAttribute('open','');
    const more=faq.locator('.toolbox-faq-actions button'); await expect(more).toBeVisible(); await more.click();
    await expect(faq.locator('.toolbox-tool-faq-list details')).toHaveCount(6); await more.click(); await expect(faq.locator('.toolbox-tool-faq-list details')).toHaveCount(4);
    await expect(page.locator('.toolbox-tool-faq-head')).toHaveCount(0);
    const order=await page.locator('.toolbox-tool-guide--five, .toolbox-tool-expert-post, .toolbox-tool-info-band--section-start, .toolbox-tool-faq').evaluateAll(els=>els.map(e=>e.className));
    expect(order).toHaveLength(4); expect(order[0]).toContain('toolbox-tool-guide--five'); expect(order[1]).toContain('toolbox-tool-expert-post'); expect(order[2]).toContain('toolbox-tool-info-band--section-start'); expect(order[3]).toContain('toolbox-tool-faq');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}
