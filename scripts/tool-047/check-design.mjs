import fs from 'node:fs';

let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};

const product=fs.readFileSync('components/tool-047-dday-anniversary-tool.tsx','utf8');
const css=fs.readFileSync('components/tool-047-dday-anniversary-tool.module.css','utf8');
const tool045Css=fs.existsSync('components/date-difference-calculator-tool.module.css')
  ? fs.readFileSync('components/date-difference-calculator-tool.module.css','utf8')
  : '';

// TOOL045-series visual contract adopted after design review.
for(const token of [
  '.localNotice','.modeRow','.modeButton','.modeButtonActive','.workspace','.workspaceHead',
  '.resetButton','.fields','.field','.presets','.preset','.result','.resultHead','.copyButton',
  '.resultHero','.resultLabel','.resultValue','.resultDate','.milestones','.milestone'
]) check(`css contract ${token}`,css.includes(token));

for(const token of ['var(--tb-line)','var(--tb-panel)','var(--tb-text)','var(--tb-muted)','var(--blue)'])
  check(`shared css variable ${token}`,css.includes(token));

check('selected mode uses FIXLGS blue background',/\.modeButtonActive\{[^}]*background:var\(--blue\)[^}]*color:#fff[^}]*border-color:var\(--blue\)/.test(css));
check('workspace has blue-series border',/\.workspace\{[^}]*border:1px solid color-mix\(in srgb,var\(--blue\)/.test(css));
check('workspace uses blue-series soft background',/\.workspace\{[^}]*background:color-mix\(in srgb,var\(--blue\)/.test(css));
check('LOCAL badge uses blue',/\.localNotice strong\{[^}]*color:var\(--blue\)/.test(css));
check('result label uses blue',/\.resultHead>span\{[^}]*color:var\(--blue\)/.test(css));
check('mobile breakpoint 720',css.includes('@media(max-width:720px)'));
check('mobile fields collapse to one column',/@media\(max-width:720px\)[\s\S]*\.fields\{grid-template-columns:1fr\}/.test(css));
check('mobile 3 mode tabs remain grid',css.includes('.modeRow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'));
check('mobile controls keep 44px action target',/@media\(max-width:720px\)[\s\S]*\.modeButton\{[^}]*min-height:44px/.test(css) && /\.resetButton,\.copyButton\{min-height:44px\}/.test(css));
check('no common/global css import',!/(globals\.css|global-base\.css|toolbox-common\.css|toolbox-detail-common\.css)/.test(css));

for(const id of [
  'tool047-root','tool047-workspace','tool047-mode-dday','tool047-mode-birthday','tool047-mode-anniversary',
  'tool047-reference','tool047-target','tool047-event','tool047-reset','tool047-result','tool047-copy'
]) check(`product selector ${id}`,product.includes(`data-testid="${id}"`));

check('mode controls use tab semantics',product.includes('role="tablist"') && (product.match(/role="tab"/g)||[]).length===3);
check('mode controls expose aria-selected',product.includes('aria-selected={mode === "dday"}') && product.includes('aria-selected={mode === "birthday"}') && product.includes('aria-selected={mode === "anniversary"}'));
check('active mode class is state-driven',(product.match(/styles\.modeButtonActive/g)||[]).length===3);
check('LOCAL notice precedes mode tabs',product.indexOf('styles.localNotice') < product.indexOf('styles.modeRow'));
check('mode tabs precede DATE WORKSPACE',product.indexOf('styles.modeRow') < product.indexOf('styles.workspace'));
check('reset is inside workspace header',/className=\{styles\.workspaceHead\}[\s\S]*data-testid="tool047-reset"/.test(product));
check('RESULT has common header and copy action',/data-testid="tool047-result"[\s\S]*className=\{styles\.resultHead\}[\s\S]*data-testid="tool047-copy"/.test(product));
check('large D-Day result preserved',product.includes('className={styles.resultValue}'));

// When TOOL045 baseline CSS is present, confirm the shared visual vocabulary still exists there too.
if(tool045Css){
  for(const token of ['.localNotice','.workspace','var(--blue)','@media(max-width:720px)'])
    check(`TOOL045 baseline shares ${token}`,tool045Css.includes(token));
}

console.log(`RESULT DESIGN PASS=${pass} FAIL=${fail}`);
if(fail) process.exit(1);
