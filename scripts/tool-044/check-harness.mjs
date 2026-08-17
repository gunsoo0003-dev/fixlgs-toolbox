import fs from 'node:fs';

const product=fs.readFileSync('components/keyword-frequency-duplicate-tool.tsx','utf8');
const helper=fs.readFileSync('tests/helpers/tool-044.ts','utf8');
const specs=[
  'tests/tool-044-preflight.spec.ts',
  'tests/tool-044-core.spec.ts',
  'tests/tool-044-boundary.spec.ts',
  'tests/tool-044-regression.spec.ts',
  'tests/tool-044-limit.spec.ts'
];
const config=fs.readFileSync('playwright.tool044.config.ts','utf8');
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`[${ok?'PASS':'FAIL'}] ${name}`);ok?pass++:fail++};

const productIds=new Set([...product.matchAll(/data-testid="([^"]+)"/g)].map(x=>x[1]));
const selectorIds=new Set();
for(const file of specs){
  check(`exists ${file}`,fs.existsSync(file));
  if(!fs.existsSync(file)) continue;
  const s=fs.readFileSync(file,'utf8');
  for(const m of s.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)) selectorIds.add(m[1]);
  check(`${file} no skip/fixme/only`,!/\.skip\(|\.fixme\(|test\.only\(/.test(s));
}
for(const id of selectorIds) check(`selector mounted contract ${id}`,productIds.has(id));
check('state-aware native injection waits for input',helper.includes("await expect(input).toBeVisible()")&&helper.includes("TEXTAREA_NATIVE_SETTER_MISSING"));
check('replacement dialog uses runtime role not stale testid',fs.readFileSync('tests/tool-044-core.spec.ts','utf8').includes("getByRole('dialog')"));
check('initial run disabled contract',fs.readFileSync('tests/tool-044-preflight.spec.ts','utf8').includes("toBeDisabled()"));
check('run enabled after direct input contract',fs.readFileSync('tests/tool-044-core.spec.ts','utf8').includes("toBeEnabled()"));
check('drag runtime test present',fs.readFileSync('tests/tool-044-core.spec.ts','utf8').includes("drag and drop TXT loads selected file"));
check('file fixture expected matches actual 7-token sample',fs.readFileSync('tests/tool-044-core.spec.ts','utf8').includes("28.57%")&&!fs.readFileSync('tests/tool-044-core.spec.ts','utf8').includes("file input loads and analyzes (66.67%)"));
check('file replace cancel/confirm tests present',/replacement cancel/.test(fs.readFileSync('tests/tool-044-core.spec.ts','utf8'))&&/replacement confirm/.test(fs.readFileSync('tests/tool-044-core.spec.ts','utf8')));
check('desktop project',config.includes("desktop-chromium"));
check('mobile project',config.includes("mobile-chromium"));
check('no TOOL043 stale selector',![...selectorIds].some(x=>x.startsWith('tool043-')));
check('no TOOL042 stale selector',![...selectorIds].some(x=>x.startsWith('tool042-')));

const runner=fs.readFileSync('scripts/tool-044/run-validation-full.mjs','utf8');
check('Windows Playwright shell launch contract',runner.includes("if(isWin)")&&runner.includes("npx playwright test")&&runner.includes("{shell:true}"));
check('runner preserves spawn error evidence',runner.includes("SPAWN_ERROR=")&&runner.includes("r.error"));
check('boundary NaN/Infinity scope is result-only',fs.readFileSync('tests/tool-044-boundary.spec.ts','utf8').includes("const result=page.getByTestId('tool044-result')")&&!fs.readFileSync('tests/tool-044-boundary.spec.ts','utf8').includes("page.locator('body')).not.toContainText('NaN')"));
console.log(`TOOL044 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
