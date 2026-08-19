import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const css=fs.readFileSync('components/tool-050-business-day-calculator.module.css','utf8');
const product=fs.readFileSync('components/tool-050-business-day-calculator.tsx','utf8');
const page=fs.readFileSync('components/tool-050-business-day-calculator-page.tsx','utf8');
const main=fs.readFileSync('components/date-add-subtract-calculator-tool.module.css','utf8');
const sub=fs.readFileSync('components/date-difference-calculator-tool.module.css','utf8');

const baselineMap={
  '.localNotice':'.localNotice', '.workspace':'.workspace', '.card':'.inputCard',
  '.resultCard':'.resultCard', '.inputGrid':'.inputGrid', '.field':'.field',
  '.actionRow':'.actionRow', '.primaryButton':'.primaryButton', '.button':'.button'
};
for(const [token,baseline] of Object.entries(baselineMap))
  check(`MAIN046 contract ${token}`,css.includes(token) && main.includes(baseline));
check('SUB045 two-date structure available',sub.includes('.inputGrid')||sub.includes('.field'));
check('mode two-column',css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
check('mobile one column',/@media\(max-width:720px\)[\s\S]*\.inputGrid\{grid-template-columns:1fr\}/.test(css));
check('blue selected state',/\.modeButtonActive\{[^}]*background:var\(--blue\)[^}]*color:#fff/.test(css));
check('tab semantics',product.includes('role="tablist"')&&(product.match(/role="tab"/g)||[]).length===2);
const lower=[
 'toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head',
 'toolbox-tool-format-guide-head','toolbox-tool-format-body','toolbox-tool-format-grid',
 'toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head',
 'toolbox-tool-info-band-head','toolbox-tool-info-band-list','toolbox-tool-faq','toolbox-tool-faq-list'
];
for(const token of lower) check(`shared lower exact ${token}`,page.includes(token));
const expert=page.indexOf('toolbox-tool-format-guide toolbox-tool-expert-post');
const notes=page.indexOf('toolbox-tool-info-band toolbox-tool-info-band--section-start');
const faq=page.indexOf('toolbox-tool-faq');
check('lower DOM order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf('toolbox-tool-guide toolbox-tool-guide--five')<expert && expert<notes && notes<faq);
check('049 related live slug',page.includes('employment-tenure-calculator')&&!page.includes('employment-duration-calculator'));
check('no sealed/global refs',!/(legacy-|globals\.css|toolbox-common\.css|toolbox-detail-common\.css)/.test(css+product));
check('localized FAQ heading',page.includes("'자주 묻는 질문'")&&page.includes("'よくある質問'")&&page.includes("'Frequently asked questions'"));
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
