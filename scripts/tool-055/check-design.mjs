import fs from 'node:fs';
let pass=0,fail=0;
const c=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++;};
const read=(p)=>fs.readFileSync(p,'utf8');
const page=read('components/tool-055-length-area-volume-converter-page.tsx');
const product=read('components/tool-055-length-area-volume-converter.tsx');
const css=read('components/tool-055-length-area-volume-converter.module.css');
const category=read('app/[locale]/category/[categorySlug]/page.tsx');

// A. detail-page common contract
for(const t of [
  'toolbox-tool-detail-hero',
  'toolbox-tool-detail-body','toolbox-next-work','toolbox-tool-guide toolbox-tool-guide--five'
]) c(`common shell ${t}`,page.includes(t));
c('hero TOOL055 eyebrow',page.includes('055 · UNIT & CALCULATOR'));
c('unit-calc backlink',page.includes('href={`/${locale}/category/unit-calc`}'));
c('LOCAL detail badge',page.includes('toolbox-tool-detail-badge')&&page.includes('<strong>LOCAL</strong>'));
c('English hero description can wrap on desktop',page.includes("locale==='en'?'':' toolbox-tool-detail-hero--single-line-description'"));
c('English IMPORTANT NOTES scoped wrap class',page.includes("locale==='en'?`${styles.notesWrap} `:''")&&/\.notesWrap :global\(\.toolbox-tool-info-band-list li\)\{[^}]*white-space:normal[^}]*overflow-wrap:anywhere[^}]*word-break:normal/.test(css));
c('English EXPERT H2 scoped wrap class',page.includes("locale==='en'?`${styles.expertWrap} `:''")&&/\.expertWrap :global\(\.toolbox-tool-format-guide-head h2\)\{[^}]*white-space:normal[^}]*overflow-wrap:anywhere[^}]*word-break:normal/.test(css));

// B. completed TOOL055 workspace DOM/state contract
for(const t of [
  'styles.root','styles.localNotice','styles.tabs','styles.tab','styles.tabActive','styles.workspace','styles.card',
  'styles.inputGrid','styles.field','styles.valueField','styles.swap','styles.quickRow','styles.preset','styles.presetActive',
  'styles.actionRow','styles.button','styles.primaryButton','styles.advanced','styles.precisionRow','styles.resultCard',
  'styles.resultHead','styles.resultValue','styles.summaryGrid','styles.summaryItem'
]) c(`workspace class ${t}`,product.includes(t));
c('three dimension tabs',product.includes("(['length','area','volume'] as Tool055Dimension[])"));
c('tablist semantics',product.includes('role="tablist"')&&product.includes('role="tab"')&&product.includes('aria-selected={dimension===d}'));
c('result live region',product.includes('aria-live="polite"')&&product.includes('data-testid="tool055-result"'));
c('error alert region',product.includes('role="alert"')&&product.includes('data-testid="tool055-error"'));
c('copy status region',product.includes('role="status"'));
c('decimal input mode',product.includes('inputMode="decimal"'));
c('summary capped six',product.includes('.summary.slice(0,6)'));
c('advanced precision details',product.includes('<details className={styles.advanced}')&&product.includes('data-testid="tool055-precision"'));

// C. exact CSS responsive design contract
c('desktop tabs three columns',/\.tabs\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css));
c('desktop input four-part row',/\.inputGrid\{[^}]*grid-template-columns:minmax\(0,1\.3fr\) minmax\(0,1fr\) auto minmax\(0,1fr\)/.test(css));
c('desktop summary three columns',/\.summaryGrid\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css));
c('selected tab blue',/\.tabActive\{[^}]*background:var\(--blue\)[^}]*border-color:var\(--blue\)[^}]*color:#fff/.test(css));
c('workspace blue-tint contract',/\.workspace\{[^}]*color-mix\(in srgb,var\(--blue\) 38%,var\(--tb-line\)\)/.test(css));
c('result value responsive type',/\.resultValue\{[^}]*font-size:clamp\(30px,5vw,52px\)/.test(css));
c('desktop grid items allow English select shrink',/\.field\{[^}]*min-width:0/.test(css)&&/\.field input,\.field select\{[^}]*min-width:0[^}]*max-width:100%/.test(css));
c('tablet breakpoint 820',/@media\(max-width:820px\)/.test(css));
c('tablet input two columns',/@media\(max-width:820px\)\{[\s\S]*?\.inputGrid\{grid-template-columns:1fr 1fr\}/.test(css));
c('tablet summary two columns',/@media\(max-width:820px\)\{[\s\S]*?\.summaryGrid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/.test(css));
c('mobile breakpoint 520',/@media\(max-width:520px\)/.test(css));
c('mobile input one column',/@media\(max-width:520px\)\{[\s\S]*?\.inputGrid\{grid-template-columns:1fr\}/.test(css));
c('mobile summary one column',/@media\(max-width:520px\)\{[\s\S]*?\.summaryGrid\{grid-template-columns:1fr\}/.test(css));
c('mobile action two columns',/@media\(max-width:520px\)\{[\s\S]*?\.actionRow\{display:grid;grid-template-columns:1fr 1fr\}/.test(css));
c('mobile swap full width',/@media\(max-width:520px\)\{[\s\S]*?\.swap\{width:100%\}/.test(css));
c('mobile buttons touch height',/@media\(max-width:520px\)\{[\s\S]*?\.primaryButton,\.button\{min-height:44px\}/.test(css));
c('focus-visible contract',css.includes('.tab:focus-visible')&&css.includes('.swap:focus-visible')&&css.includes('.primaryButton:focus-visible'));
c('no important overrides',!css.includes('!important'));
c('no sealed/global direct references',!/(legacy-(site|tools)-sealed|globals\.css|global-base\.css|toolbox-common\.css|toolbox-detail-common\.css)/.test(page+product+css));

// D. lower common exact contract
const lower=[
  'toolbox-tool-format-guide toolbox-tool-expert-post toolbox-tool-expert-post--wide-head',
  'toolbox-tool-format-guide-head','toolbox-tool-format-body','toolbox-tool-format-grid',
  'toolbox-tool-info-band toolbox-tool-info-band--section-start toolbox-tool-info-band--bottom-gap toolbox-tool-info-band--left-head toolbox-tool-info-band--format-head',
  'toolbox-tool-info-band-head','toolbox-tool-info-band-list','toolbox-tool-faq','toolbox-tool-faq-list'
];
for(const t of lower)c(`shared lower exact ${t}`,page.includes(t));
const how=page.indexOf('toolbox-tool-guide toolbox-tool-guide--five');
const expert=page.indexOf('toolbox-tool-format-guide toolbox-tool-expert-post');
const notes=page.indexOf('toolbox-tool-info-band toolbox-tool-info-band--section-start');
const faq=page.indexOf('toolbox-tool-faq');
c('lower DOM order HOWTO -> EXPERT -> NOTES -> FAQ',how>=0&&how<expert&&expert<notes&&notes<faq);
c('localized FAQ heading',page.includes("'자주 묻는 질문'")&&page.includes("'よくある質問'")&&page.includes("'Frequently asked questions'"));
c('related numbering 056-059',['056','057','058','059'].every(n=>page.includes(`['${n}'`)));

// E. category numbering/design regression contract
c('unit-calc category start 55',/categorySlug\s*===\s*["']unit-calc["']\s*\?\s*index\s*\+\s*55/.test(category));
c('unit-calc uses three-digit card number',category.includes('categorySlug === "unit-calc"')&&category.includes('padStart(3, "0")'));
c('category card top class retained',category.includes('toolbox-subpage-card-top'));

console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);
if(fail)process.exit(1);
