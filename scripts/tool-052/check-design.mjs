import fs from 'node:fs';
const css=fs.readFileSync('components/tool-052-world-time-tool.module.css','utf8');
const product=fs.readFileSync('components/tool-052-world-time-tool.tsx','utf8');
const page=fs.readFileSync('app/[locale]/world-time-timezone-converter/page.tsx','utf8');
let pass=0,fail=0;const check=(n,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${n}`);ok?pass++:fail++};
check('approved workspace pattern',product.includes('WORLD TIME WORKSPACE')&&css.includes('.workspace{')&&css.includes('.workspaceHead'));
check('common hero/body shell',page.includes('toolbox-tool-detail-hero')&&page.includes('toolbox-tool-detail-body'));
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
check('tool-only CSS module',product.includes('./tool-052-world-time-tool.module.css'));
check('mobile breakpoint',css.includes('@media(max-width:720px)'));
check('mobile city cards one column',css.includes('.cityGrid,.hoursGrid{grid-template-columns:1fr}'));
check('no fixed page width',!css.includes('width:1200px')&&!css.includes('min-width:900px'));
check('focus styling',css.includes(':focus'));
check('no protected/global direct imports',!/(globals\.css|global-base\.css|toolbox-common\.css|toolbox-detail-common\.css|legacy-site-sealed|legacy-tools-sealed)/.test(product+page));
check('localized FAQ heading',page.includes("'자주 묻는 질문'")&&page.includes("'よくある質問'")&&page.includes("'Frequently asked questions'"));
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
