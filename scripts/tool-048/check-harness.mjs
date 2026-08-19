import fs from 'node:fs';
const product=fs.readFileSync('components/age-life-calculator-tool.tsx','utf8');
const specs=['preflight','core','boundary','feature','regression','limit'];
let pass=0,fail=0; const check=(n,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${n}`);ok?pass++:fail++};
for(const spec of specs){
 const file=`tests/tool-048-${spec}.spec.ts`; check(`${spec} exists`,fs.existsSync(file));
 if(!fs.existsSync(file)) continue;
 const src=fs.readFileSync(file,'utf8');
 check(`${spec} no skip/fixme/only`,!/(test|describe)\.(skip|fixme|only)\s*\(/.test(src));
 for(const id of [...src.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)].map(m=>m[1])) check(`${spec} selector ${id} exists in product`,product.includes(`data-testid="${id}"`));
}
const pre=fs.readFileSync('tests/tool-048-preflight.spec.ts','utf8');
for(const id of ['tool048-root','tool048-workspace','tool048-dob','tool048-as-of','tool048-empty-result','tool048-result']) check(`preflight contract ${id}`,pre.includes(id));
check('preflight asserts result-only absent',pre.includes("toHaveCount(0)")&&pre.includes('tool048-result'));
check('product has reset/copy/error contracts',product.includes('tool048-reset')&&product.includes('tool048-copy')&&product.includes('tool048-error'));
const runner=fs.readFileSync('scripts/tool-048/run-validation-full.mjs','utf8');
for(const mode of ['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']) check(`runner supports ${mode}`,runner.includes(`'${mode}'`));
check('FINAL keeps independent stages',runner.includes("playwright('preflight')")&&runner.includes("playwright('core')")&&runner.includes("playwright('boundary')")&&runner.includes("playwright('feature')")&&runner.includes("playwright('regression')")&&runner.includes("playwright('limit')"));
check('spawn error evidence',runner.includes('SPAWN_ERROR=')); check('dependency preflight',runner.includes('dependencyPreflight'));
const cfg=fs.readFileSync('playwright.tool048.config.ts','utf8'); check('desktop project exists',cfg.includes('desktop-chromium')); check('mobile project exists',cfg.includes('mobile-chromium')); check('isolated port 41748',cfg.includes('41748')); check('retries disabled',cfg.includes('retries:0'));
const page=fs.readFileSync('components/age-life-calculator-page.tsx','utf8'); check('TOOL047 related link live',page.includes('dday-anniversary-calculator'));
const site=fs.readFileSync('lib/site.ts','utf8'); check('site registers tool048',site.includes('tool048Slug')&&site.includes('tool048Titles'));
const sitemap=fs.readFileSync('app/sitemap.ts','utf8'); check('sitemap emits tool048',sitemap.includes('tool048Slug'));
console.log(`RESULT HARNESS PASS=${pass} FAIL=${fail}`); if(fail) process.exit(1);
