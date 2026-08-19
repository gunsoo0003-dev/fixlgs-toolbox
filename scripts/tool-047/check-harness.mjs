import fs from 'node:fs';
const product=fs.readFileSync('components/tool-047-dday-anniversary-tool.tsx','utf8');
const specs=['preflight','core','boundary','feature','regression','limit'];
let pass=0,fail=0; const check=(n,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${n}`);ok?pass++:fail++};
for(const spec of specs){
 const file=`tests/tool-047-${spec}.spec.ts`; check(`${spec} exists`,fs.existsSync(file));
 if(!fs.existsSync(file)) continue;
 const src=fs.readFileSync(file,'utf8');
 check(`${spec} no skip/fixme/only`,!/(test|describe)\.(skip|fixme|only)\s*\(/.test(src));
 for(const id of [...src.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)].map(m=>m[1])) check(`${spec} selector ${id} exists in product`,product.includes(`data-testid="${id}"`));
}
for(const id of ['tool047-root','tool047-workspace','tool047-mode-dday','tool047-mode-birthday','tool047-mode-anniversary','tool047-reference','tool047-target','tool047-event','tool047-reset','tool047-result','tool047-copy']) check(`preflight contract ${id}`,fs.readFileSync('tests/tool-047-preflight.spec.ts','utf8').includes(id));
const runner=fs.readFileSync('scripts/tool-047/run-validation-full.mjs','utf8');
for(const mode of ['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']) check(`runner supports ${mode}`,runner.includes(`'${mode}'`));
check('FINAL keeps independent stages',runner.includes("playwright('preflight')")&&runner.includes("playwright('core')")&&runner.includes("playwright('boundary')")&&runner.includes("playwright('feature')")&&runner.includes("playwright('regression')")&&runner.includes("playwright('limit')"));
check('spawn error evidence',runner.includes('SPAWN_ERROR='));
check('dependency preflight',runner.includes('dependencyPreflight'));
const cfg=fs.readFileSync('playwright.tool047.config.ts','utf8');
check('desktop project exists',cfg.includes('desktop-chromium')); check('mobile project exists',cfg.includes('mobile-chromium')); check('isolated port 41747',cfg.includes('41747')); check('retries disabled',cfg.includes('retries:0'));
console.log(`RESULT HARNESS PASS=${pass} FAIL=${fail}`); if(fail) process.exit(1);
