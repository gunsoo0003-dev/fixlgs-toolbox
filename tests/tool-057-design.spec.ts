import {expect,test} from '@playwright/test';

const locales=[
  ['ko','속도·연비·에너지·전력은 서로 다른 기준으로 계산합니다','자주 묻는 질문'],
  ['en','Speed, fuel economy, energy, and power use different conversion structures','Frequently asked questions'],
  ['ja','速度・燃費・エネルギー・電力は異なる基準で計算します','よくある質問'],
] as const;

for(const [locale,expertHeading,faqHeading] of locales){
  test(`TOOL057 design exact contract ${locale}`,async({page})=>{
    const runtimeErrors:string[]=[];
    page.on('pageerror',e=>runtimeErrors.push(`pageerror:${e.message}`));
    page.on('console',m=>{if(m.type()==='error')runtimeErrors.push(`console:${m.text()}`)});
    await page.goto(`/${locale}/speed-fuel-energy-converter`);
    await expect(page.locator('.toolbox-tool-detail-hero')).toBeVisible();
    const how=page.locator('.toolbox-tool-guide.toolbox-tool-guide--five');
    const expert=page.locator('.toolbox-tool-format-guide.toolbox-tool-expert-post.toolbox-tool-expert-post--wide-head');
    const notes=page.locator('.toolbox-tool-info-band.toolbox-tool-info-band--section-start');
    const faq=page.locator('.toolbox-tool-faq');
    await expect(how).toBeVisible();await expect(expert).toBeVisible();await expect(notes).toBeVisible();await expect(faq).toBeVisible();
    await expect(expert.locator('.toolbox-tool-format-guide-head h2')).toHaveText(expertHeading);
    await expect(expert.locator('.toolbox-tool-format-grid article')).toHaveCount(6);
    await expect(faq.locator('.toolbox-tool-guide-head h2')).toHaveText(faqHeading);
    const order=await page.locator('section').evaluateAll((nodes)=>{
      const idx=(sel:string)=>nodes.findIndex(n=>n.matches(sel));
      return [idx('.toolbox-tool-guide.toolbox-tool-guide--five'),idx('.toolbox-tool-format-guide.toolbox-tool-expert-post'),idx('.toolbox-tool-info-band.toolbox-tool-info-band--section-start'),idx('.toolbox-tool-faq')];
    });
    expect(order.every(x=>x>=0)).toBeTruthy();expect(order[0]).toBeLessThan(order[1]);expect(order[1]).toBeLessThan(order[2]);expect(order[2]).toBeLessThan(order[3]);
    await page.waitForTimeout(150);expect(runtimeErrors).toEqual([]);
  });
}
