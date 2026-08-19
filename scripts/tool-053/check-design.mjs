import fs from 'node:fs';
let pass=0,fail=0;const check=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++};
const main=fs.readFileSync('components/tool-047-dday-anniversary-tool.module.css','utf8');
const css=fs.readFileSync('components/tool-053-unix-timestamp-tool.module.css','utf8');
const product=fs.readFileSync('components/tool-053-unix-timestamp-tool.tsx','utf8');
const page=fs.readFileSync('app/[locale]/unix-timestamp-converter/page.tsx','utf8');
for(const token of ['.localNotice','.modeRow','.workspace','.workspaceHead','.fields','.field','.result'])check(`approved MAIN047 ${token}`,main.includes(token)&&css.includes(token));
check('common hero/body/next shell',page.includes('toolbox-tool-detail-hero')&&page.includes('toolbox-tool-detail-body')&&page.includes('toolbox-next-work'));
check('common HOW TO five-step shell',page.includes('toolbox-tool-guide toolbox-tool-guide--five'));
const lower=[
 'toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head',
 'toolbox-tool-format-guide-head','toolbox-tool-format-body','toolbox-tool-format-grid',
 'toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head',
 'toolbox-tool-info-band-head','toolbox-tool-info-band-list','toolbox-tool-faq','toolbox-tool-faq-list'
];
for(const token of lower)check(`shared lower exact ${token}`,page.includes(token));
const expert=page.indexOf('toolbox-tool-format-guide toolbox-tool-expert-post');
const notes=page.indexOf('toolbox-tool-info-band toolbox-tool-info-band--section-start');
const faq=page.indexOf('toolbox-tool-faq');
check('lower DOM order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf('toolbox-tool-guide toolbox-tool-guide--five')<expert&&expert<notes&&notes<faq);
check('2-mode',product.includes('role="tablist"')&&(product.match(/role="tab"/g)||[]).length===2);
check('2-unit',product.includes('tool053-unit-seconds')&&product.includes('tool053-unit-milliseconds'));
check('mobile single fields',/@media\(max-width:720px\)[\s\S]*\.fields\{grid-template-columns:1fr\}/.test(css));
check('long strings wrap',css.includes('overflow-wrap:anywhere'));
check('localized FAQ heading',page.includes("'자주 묻는 질문'")&&page.includes("'よくある質問'")&&page.includes("'Frequently asked questions'"));
check('no protected/global direct imports',!/(globals\.css|global-base\.css|toolbox-common\.css|toolbox-detail-common\.css|legacy-site-sealed|legacy-tools-sealed)/.test(product+page));
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
