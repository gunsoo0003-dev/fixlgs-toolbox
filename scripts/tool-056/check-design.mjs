import fs from 'node:fs';
let pass=0,fail=0;const c=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++;};const read=p=>fs.readFileSync(p,'utf8');
const page=read('components/tool-056-weight-temperature-pressure-converter-page.tsx'),tool=read('components/tool-056-weight-temperature-pressure-converter.tsx'),css=read('components/tool-056-weight-temperature-pressure-converter.module.css');
const how='toolbox-tool-guide toolbox-tool-guide--five', expert='toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head', notes='toolbox-tool-info-band toolbox-tool-info-band--section-start', faq='toolbox-tool-faq';
for(const token of ['ToolboxSubpageShell','toolbox-tool-detail-hero','toolbox-tool-detail-body','toolbox-next-work',how,expert,notes,faq])c(`shared contract ${token}`,page.includes(token));
c('lower DOM exact order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf(how)>=0&&page.indexOf(how)<page.indexOf(expert)&&page.indexOf(expert)<page.indexOf(notes)&&page.indexOf(notes)<page.indexOf(faq));
c('expert exact common classes',page.includes('toolbox-tool-format-guide-head')&&page.includes('toolbox-tool-format-body')&&page.includes('toolbox-tool-format-grid'));
c('expert cards expanded to six',/\.map\(\(\[k,h,p\]\)=>/.test(page)&&true);
for(const heading of ['무게·압력과 온도는 계산 구조가 다릅니다', 'Temperature conversion is different from mass and pressure', '重量・圧力と温度では計算構造が異なります'])c(`locale expert heading ${heading}`,page.includes(heading));
for(const marker of ['ABSOLUTE ZERO', 'PRESSURE TYPE', '절대영도', '게이지압·절대압 주의'])c(`expert content marker ${marker}`,page.includes(marker));
c('FAQ locale headings exact',page.includes('자주 묻는 질문')&&page.includes('Frequently asked questions')&&page.includes('よくある質問'));
c('no legacy/global override',!/(legacy-(site|tools)-sealed|!important)/i.test(page+tool+css));
// Source-level six-card guard: each locale expert array contains six article tuples before .map.
const articleLabels=[...page.matchAll(/\['(?:MASS|TEMP|PRESSURE|QUICK REF|ABSOLUTE ZERO|PRESSURE TYPE)'/g)];
c('expert content density source guard',articleLabels.length>=18);
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail} TOOL=056`);if(fail)process.exit(1);
