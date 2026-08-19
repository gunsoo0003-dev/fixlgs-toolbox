import fs from 'node:fs';
const product=fs.readFileSync('components/tool-051-time-calculator.tsx','utf8');
const css=fs.readFileSync('components/tool-051-time-calculator.module.css','utf8');
const page=fs.readFileSync('app/[locale]/time-calculator/page.tsx','utf8');
const mainCss=fs.readFileSync('components/tool-050-business-day-calculator.module.css','utf8');
let pass=0,fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
for(const token of ['.localNotice','.modeRow','.modeButton','.modeButtonActive','.workspace','.card','.resultCard','.inputGrid','.field','.actionRow','.button'])
  check(`MAIN050 shared workspace contract ${token}`,css.includes(token)&&mainCss.includes(token));
check('workspace DOM matches approved card/result structure',product.includes('className={styles.workspace}')&&product.includes('className={styles.card}')&&product.includes('className={styles.inputGrid}')&&product.includes('className={styles.actionRow}')&&product.includes('className={styles.resultCard}'));
check('no legacy workspace header shell',!product.includes('workspaceHead'));
check('three-mode control exists',product.includes('role="tablist"')&&product.includes('["arithmetic","difference","convert"]'));
check('selected mode blue',/\.modeButtonActive\{[^}]*background:var\(--blue\)[^}]*color:#fff/.test(css));
check('workspace shell blue contract',/\.workspace\{[^}]*var\(--blue\)/.test(css));
check('mobile input single column',/@media\(max-width:720px\)[\s\S]*\.inputGrid\{grid-template-columns:1fr\}/.test(css));
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
check('lower DOM order HOWTO -> EXPERT -> NOTES -> FAQ',page.indexOf('toolbox-tool-guide toolbox-tool-guide--five')<expert&&expert<notes&&notes<faq);
check('localized FAQ heading',page.includes("'자주 묻는 질문'")&&page.includes("'よくある質問'")&&page.includes("'Frequently asked questions'"));
check('no global selector',!css.includes('.tool051-'));
console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
