import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const files=[
'app/[locale]/dday-anniversary-calculator/page.tsx',
'components/tool-047-dday-anniversary-tool.tsx',
'components/tool-047-dday-anniversary-tool.module.css',
'lib/tool-047-dday.ts',
'docs/tool-047/REQ_MASTER_047.md',
'scripts/tool-047/check-design.mjs'];
let pass=0,fail=0; const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
for(const f of files) check(`file:${f}`,fs.existsSync(path.join(root,f)));
const source=fs.readFileSync(path.join(root,'lib/tool-047-dday.ts'),'utf8');
for(const token of ['TOOL047_SERVICE_LIMITS','D-Day','D+','birthdayResult','anniversaryMilestones','anniversaryYears']) check(`logic:${token}`,source.includes(token));
const page=fs.readFileSync(path.join(root,'app/[locale]/dday-anniversary-calculator/page.tsx'),'utf8');
for(const token of ['ko','en','ja','canonical','languages','x-default','045','046','048']) check(`page:${token}`,page.includes(token));

const site=fs.readFileSync(path.join(root,'lib/site.ts'),'utf8');
for(const token of ['tool047Slug','tool047Titles','tool047Descriptions','dday-anniversary-calculator']) check(`site:${token}`,site.includes(token));
const sitemap=fs.readFileSync(path.join(root,'app/sitemap.ts'),'utf8');
check('sitemap:tool047',sitemap.includes('tool047Slug'));
const tool046=fs.readFileSync(path.join(root,'components/date-add-subtract-calculator-page.tsx'),'utf8');
check('regression:tool046-links-047-live',/n:"047"[^\n]*available:true/.test(tool046));
check('page:next-048-live',page.includes('href={`/${locale}/${related[2][2]}`}') && page.includes('<span>048</span>') && !page.includes('toolbox-next-work-card is-disabled'));

const product=fs.readFileSync(path.join(root,'components/tool-047-dday-anniversary-tool.tsx'),'utf8');
for(const id of ['tool047-root','tool047-workspace','tool047-mode-dday','tool047-mode-birthday','tool047-mode-anniversary','tool047-reset','tool047-result','tool047-copy'])
  check(`selector:${id}`,product.includes(`data-testid="${id}"`));
check('design:LOCAL notice',product.includes('className={styles.localNotice}'));
check('design:DATE WORKSPACE',product.includes('className={styles.workspaceHead}') && product.includes('{t.workspace}') && product.includes('{t.choose}'));
check('design:RESULT header',product.includes('className={styles.resultHead}') && product.includes('{t.result}'));
check('design:tab accessibility',product.includes('role="tablist"') && (product.match(/role="tab"/g)||[]).length===3);

const css=fs.readFileSync(path.join(root,'components/tool-047-dday-anniversary-tool.module.css'),'utf8');
check('css:mobile-breakpoint',css.includes('@media(max-width:720px)'));
check('css:selected-tab-blue',/\.modeButtonActive\{[^}]*background:var\(--blue\)[^}]*color:#fff/.test(css));
check('css:workspace-blue-contract',/\.workspace\{[^}]*var\(--blue\)/.test(css));
check('css:no-global-import',!css.includes('globals.css'));
console.log(`RESULT STATIC PASS=${pass} FAIL=${fail}`); if(fail) process.exit(1);
