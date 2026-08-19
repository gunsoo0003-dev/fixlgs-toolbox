import fs from 'node:fs';
let pass=0,fail=0;const check=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++};
const css=fs.readFileSync('components/timer-stopwatch-tool.module.css','utf8');
const page=fs.readFileSync('components/timer-stopwatch-page.tsx','utf8');
for(const token of ['toolbox-tool-detail-hero','toolbox-tool-detail-body','toolbox-next-work','toolbox-tool-guide toolbox-tool-guide--five'])check(`common shell ${token}`,page.includes(token));
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
check('mobile breakpoint',css.includes('@media(max-width:720px)'));
check('no !important',!css.includes('!important'));
check('approved local expert text-balance override only',css.includes('.expertPost54 :global(.toolbox-tool-format-grid h3){text-wrap:balance}'));
check('no legacy/global direct reference',!/(legacy-(site|tools)-sealed|globals\.css|global-base\.css|toolbox-common\.css|toolbox-detail-common\.css)/.test(page));
check('localized FAQ heading',page.includes('faq:"자주 묻는 질문"')&&page.includes('faq:"よくある質問"')&&page.includes('faq:"Frequently asked questions"'));
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
