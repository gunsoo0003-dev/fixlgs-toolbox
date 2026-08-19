import fs from 'node:fs';
const product=fs.readFileSync('components/employment-tenure-calculator-tool.tsx','utf8');
const specs=['preflight','core','boundary','feature','regression','limit'];
let pass=0,fail=0; const check=(n,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${n}`);ok?pass++:fail++};
for(const spec of specs){
 const file=`tests/tool-049-${spec}.spec.ts`; check(`${spec} exists`,fs.existsSync(file));
 if(!fs.existsSync(file)) continue; const src=fs.readFileSync(file,'utf8');
 check(`${spec} no skip/fixme/only`,!/(test|describe)\.(skip|fixme|only)\s*\(/.test(src));
 for(const id of [...src.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)].map(m=>m[1])) { const dynamic=id.match(/^(tool049-(?:row|remove|row-start|row-end|row-result))-\d+$/); const ok=dynamic?product.includes('`'+dynamic[1]+'-${'):product.includes(`data-testid="${id}"`); check(`${spec} selector ${id} exists in product`,ok); }
}
const pre=fs.readFileSync('tests/tool-049-preflight.spec.ts','utf8');
for(const id of ['tool049-root','tool049-workspace','tool049-start','tool049-current','tool049-result']) check(`preflight contract ${id}`,pre.includes(id));
check('preflight result initially absent',pre.includes('toHaveCount(0)'));
const runner=fs.readFileSync('scripts/tool-049/run-validation-full.mjs','utf8');
for(const mode of ['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']) check(`runner supports ${mode}`,runner.includes(`'${mode}'`));
check('FINAL keeps independent stages',runner.includes("playwright('preflight')")&&runner.includes("playwright('core')")&&runner.includes("playwright('boundary')")&&runner.includes("playwright('feature')")&&runner.includes("playwright('regression')")&&runner.includes("playwright('limit')"));
check('spawn error evidence',runner.includes('SPAWN_ERROR=')); check('dependency preflight',runner.includes('dependencyPreflight'));
const cfg=fs.readFileSync('playwright.tool049.config.ts','utf8'); check('desktop project exists',cfg.includes('desktop-chromium')); check('mobile project exists',cfg.includes('mobile-chromium')); check('isolated port 41749',cfg.includes('41749')); check('retries disabled',cfg.includes('retries:0'));
const page=fs.readFileSync('components/employment-tenure-calculator-page.tsx','utf8'); check('NEXT TOOL050 disabled',page.includes('NEXT WORK')&&page.includes('<span>050</span>')&&page.includes('is-disabled'));
const prev=fs.readFileSync('components/age-life-calculator-page.tsx','utf8'); check('TOOL048 next link 049 live',prev.includes('employment-tenure-calculator'));
const site=fs.readFileSync('lib/site.ts','utf8'); check('site registers tool049',site.includes('tool049Slug')&&site.includes('tool049Titles'));
const sitemap=fs.readFileSync('app/sitemap.ts','utf8'); check('sitemap emits tool049',sitemap.includes('tool049Slug'));
console.log(`RESULT HARNESS PASS=${pass} FAIL=${fail}`); if(fail) process.exit(1);
