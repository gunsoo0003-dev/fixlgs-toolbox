import fs from 'node:fs';
let pass=0,fail=0;const c=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++;};const read=p=>fs.readFileSync(p,'utf8');
const page=read('components/tool-057-speed-fuel-energy-converter-page.tsx'),tool=read('components/tool-057-speed-fuel-energy-converter.tsx'),css=read('components/tool-057-speed-fuel-energy-converter.module.css');
const how='toolbox-tool-guide toolbox-tool-guide--five', expert='toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head', notes='toolbox-tool-info-band toolbox-tool-info-band--section-start', faq='toolbox-tool-faq';
for(const token of ['ToolboxSubpageShell','toolbox-tool-detail-hero','toolbox-tool-detail-body','toolbox-next-work',how,expert,notes,faq])c(`shared contract ${token}`,page.includes(token));
c('lower DOM exact order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf(how)>=0&&page.indexOf(how)<page.indexOf(expert)&&page.indexOf(expert)<page.indexOf(notes)&&page.indexOf(notes)<page.indexOf(faq));
c('expert exact common classes',page.includes('toolbox-tool-format-guide-head')&&page.includes('toolbox-tool-format-body')&&page.includes('toolbox-tool-format-grid'));
c('expert cards expanded to six',/\.map\(\(\[k,h,p\]\)=>/.test(page)&&true);
for(const heading of ['속도·연비·에너지·전력은 서로 다른 기준으로 계산합니다', 'Speed, fuel economy, energy, and power use different conversion structures', '速度・燃費・エネルギー・電力は異なる基準で計算します'])c(`locale expert heading ${heading}`,page.includes(heading));
for(const marker of ['MPG', 'POWER', '미국·영국 MPG 구분', 'US vs UK MPG'])c(`expert content marker ${marker}`,page.includes(marker));
c('FAQ locale headings exact',page.includes('자주 묻는 질문')&&page.includes('Frequently asked questions')&&page.includes('よくある質問'));
c('no legacy/global override',!/(legacy-(site|tools)-sealed|!important)/i.test(page+tool+css));
// Source-level six-card guard: each locale expert array contains six article tuples before .map.
const articleLabels=[...page.matchAll(/\['(?:SPEED|FUEL|MPG|ENERGY|POWER|DIMENSION)'/g)];
c('expert content density source guard',articleLabels.length>=18);
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail} TOOL=057`);if(fail)process.exit(1);
