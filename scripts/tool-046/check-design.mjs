import fs from 'node:fs';let fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);if(!o)fail++};
const css=fs.readFileSync('components/date-add-subtract-calculator-tool.module.css','utf8');
for(const token of ['var(--tb-line)','var(--tb-panel)','var(--blue)','@media(max-width:720px)','.workspace','.inputGrid','.resultCard','.presetGrid','.actionRow','.localNotice'])check(`CSS ${token}`,css.includes(token));
check('mobile input grid one column',css.includes('.inputGrid{grid-template-columns:1fr}'));
check('mobile preset grid remains usable',/@media\(max-width:720px\)[\s\S]*\.presetGrid/.test(css));
check('44px mobile actions',css.includes('min-height:44px'));
const page=fs.readFileSync('components/date-add-subtract-calculator-page.tsx','utf8');
const ordered=['toolbox-tool-detail-hero--single-line-description','toolbox-tool-detail-body','toolbox-next-work','toolbox-tool-guide','toolbox-tool-format-guide','toolbox-tool-info-band','toolbox-tool-faq'];
for(const token of ordered)check(`TOOL045 structure ${token}`,page.includes(token));
let cursor=-1;let orderOk=true;for(const token of ordered){const next=page.indexOf(token,cursor+1);if(next<0||next<cursor){orderOk=false;break;}cursor=next;}check('detail sections keep TOOL045 vertical order',orderOk);
check('next TOOL047 remains disabled before release',page.includes('toolbox-next-work-card is-disabled')&&page.includes('{related[1].name}'));
check('TOOL045 related link remains live',page.includes('date-difference-calculator')&&page.includes('available:true'));
for(const f of ['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css']){const s=fs.readFileSync(f,'utf8');check(`protected ${f} has no TOOL046 selector`,!/tool046|date-add-subtract-calculator/i.test(s));}
process.exitCode=fail?1:0;
