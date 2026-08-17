import fs from 'node:fs';

const product=fs.readFileSync('components/date-difference-calculator-tool.tsx','utf8');
const page=fs.readFileSync('components/date-difference-calculator-page.tsx','utf8');
const config=fs.readFileSync('playwright.tool045.config.ts','utf8');
const runner=fs.readFileSync('scripts/tool-045/run-validation-full.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

const specs=['preflight','core','boundary','feature','regression','limit'];
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`[${ok?'PASS':'FAIL'}] ${name}`);ok?pass++:fail++};

const productIds=new Set([...product.matchAll(/data-testid="([^"]+)"/g)].map(x=>x[1]));
const selectorIds=new Set();
for(const file of specs.map(x=>`tests/tool-045-${x}.spec.ts`)){
  check(`exists ${file}`,fs.existsSync(file));
  if(!fs.existsSync(file)) continue;
  const s=fs.readFileSync(file,'utf8');
  for(const m of s.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)) selectorIds.add(m[1]);
  check(`${file} no skip/fixme/only`,!/\.skip\(|\.fixme\(|test\.only\(/.test(s));
  check(`${file} uses canonical KO/EN/JA/date route`,s.includes('date-difference-calculator'));
}
for(const id of selectorIds)check(`selector mounted contract ${id}`,productIds.has(id));

const pre=fs.readFileSync('tests/tool-045-preflight.spec.ts','utf8');
const core=fs.readFileSync('tests/tool-045-core.spec.ts','utf8');
const boundary=fs.readFileSync('tests/tool-045-boundary.spec.ts','utf8');
const feature=fs.readFileSync('tests/tool-045-feature.spec.ts','utf8');
const regression=fs.readFileSync('tests/tool-045-regression.spec.ts','utf8');
const limit=fs.readFileSync('tests/tool-045-limit.spec.ts','utf8');

check('initial reset disabled contract',pre.includes("getByTestId('tool045-reset')).toBeDisabled()"));
check('initial include unchecked contract',pre.includes("getByTestId('tool045-include-start')).not.toBeChecked()"));
check('initial result absent + empty state',pre.includes('tool045-empty-result')&&pre.includes("tool045-result')).toHaveCount(0"));
check('core enables applied result',core.includes("tool045-total-days")&&core.includes("tool045-include-start"));
check('boundary error is result-scoped',boundary.includes("tool045-error")&&boundary.includes("tool045-result')).toHaveCount(0"));
check('feature reset clears dates',feature.includes("tool045-reset")&&feature.includes("tool045-start")&&feature.includes("tool045-end"));
check('regression covers all locales',regression.includes("['ko','en','ja']"));
check('limit covers supported long span',limit.includes('1900-01-01')&&limit.includes('2100-12-31'));
check('runner includes feature-only mode',runner.includes("'feature-only'"));
check('FINAL runs feature before regression',runner.lastIndexOf("playwright('feature')")>-1&&runner.lastIndexOf("playwright('feature')")<runner.lastIndexOf("playwright('regression')"));
check('runner has dependency preflight',runner.includes('dependencyPreflight'));
check('runner preserves SPAWN_ERROR evidence',runner.includes('SPAWN_ERROR=')&&runner.includes('r.error'));
check('package exposes feature-only command',pkg.scripts['test:toolbox:045-feature-only']==='node scripts/tool-045/run-validation-full.mjs feature-only');
check('desktop project',config.includes('desktop-chromium'));
check('mobile project',config.includes('mobile-chromium'));
check('page has expert modifier',page.includes('toolbox-tool-expert-post--045'));

const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-045/cases.json','utf8'));
for(const name of ['same','same-included','year-boundary','leap','common-year','month-end','one-week','weekend-span']){
  check(`fixture ${name}`,fixture.some(x=>x.name===name));
}
console.log(`TOOL045 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
