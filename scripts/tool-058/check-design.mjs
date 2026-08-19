import fs from 'node:fs';
let pass=0,fail=0;const c=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++;};const read=p=>fs.readFileSync(p,'utf8');
const page=read('components/tool-058-data-cooking-unit-converter-page.tsx'),tool=read('components/tool-058-data-cooking-unit-converter.tsx'),css=read('components/tool-058-data-cooking-unit-converter.module.css');
const how='toolbox-tool-guide toolbox-tool-guide--five', expert='toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head', notes='toolbox-tool-info-band toolbox-tool-info-band--section-start', faq='toolbox-tool-faq';
for(const token of ['ToolboxSubpageShell','toolbox-tool-detail-hero','toolbox-tool-detail-body','toolbox-next-work',how,expert,notes,faq])c(`shared contract ${token}`,page.includes(token));
c('lower DOM exact order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf(how)>=0&&page.indexOf(how)<page.indexOf(expert)&&page.indexOf(expert)<page.indexOf(notes)&&page.indexOf(notes)<page.indexOf(faq));
c('expert exact common classes',page.includes('toolbox-tool-format-guide-head')&&page.includes('toolbox-tool-format-body')&&page.includes('toolbox-tool-format-grid'));
c('expert cards expanded to six',/\.map\(\(\[k,h,p\]\)=>/.test(page)&&true);
for(const heading of ['1000·1024와 요리 계량 기준을 숨기지 않습니다', 'Keep decimal, binary, and cooking references explicit', '1000・1024と料理計量の基準を明示します'])c(`locale expert heading ${heading}`,page.includes(heading));
for(const marker of ['BIT / BYTE', 'WHY DIFFER', '1000 기준', '1024 기준'])c(`expert content marker ${marker}`,page.includes(marker));
c('FAQ locale headings exact',page.includes('자주 묻는 질문')&&page.includes('Frequently asked questions')&&page.includes('よくある質問'));
c('no legacy/global override',!/(legacy-(site|tools)-sealed|!important)/i.test(page+tool+css));
// Source-level six-card guard: each locale expert array contains six article tuples before .map.
const articleLabels=[...page.matchAll(/\['(?:DECIMAL|BINARY|BIT \/ BYTE|WHY DIFFER|COOKING|QUICK REF)'/g)];
c('expert content density source guard',articleLabels.length>=18);
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail} TOOL=058`);if(fail)process.exit(1);
