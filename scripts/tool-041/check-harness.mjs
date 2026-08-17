import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const productFiles=['components/text-extractor-tool.tsx','components/text-extractor-page.tsx','app/[locale]/text-extractor/page.tsx'];
const specFiles=['tests/tool-041-preflight.spec.ts','tests/tool-041-core.spec.ts','tests/tool-041-boundary.spec.ts','tests/tool-041-feature.spec.ts','tests/tool-041-regression.spec.ts','tests/tool-041-limit.spec.ts'];
const requiredScripts=['scripts/tool-041/check-source.mjs','scripts/tool-041/check-design-static.mjs','scripts/tool-041/check-main-integration.mjs','scripts/tool-041/check-localization.mjs','scripts/tool-041/check-functional-fixtures.mjs','scripts/tool-041/run-static-validation.mjs','scripts/tool-041/run-validation.mjs'];
let fail=0;
const pass=(m)=>console.log(`[PASS] ${m}`); const bad=(m)=>{console.error(`[FAIL] ${m}`);fail++;};
for(const f of [...productFiles,...specFiles,...requiredScripts,'playwright.tool041.config.ts','tests/fixtures/tool-041/cases.json']) fs.existsSync(path.join(root,f))?pass(`exists ${f}`):bad(`missing ${f}`);
if(fail){process.exitCode=1;} else {
  const product=productFiles.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
  const specs=specFiles.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
  const testids=[...specs.matchAll(/getByTestId\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
  const dynamicTypes=['numbers','korean','english','emails','urls','phones','hashtags'];
  for(const id of [...new Set(testids)]){
    const dynamic=id.startsWith('tool041-type-')||id.startsWith('tool041-result-');
    const exists=product.includes(`data-testid="${id}"`) || (dynamic && dynamicTypes.some(t=>id===`tool041-type-${t}`||id===`tool041-result-${t}`));
    exists?pass(`selector ${id}`):bad(`stale selector ${id}`);
  }
  const totalTests=specFiles.reduce((n,f)=>n+(fs.readFileSync(path.join(root,f),'utf8').match(/\btest\s*\(/g)||[]).length,0);
  totalTests>0?pass(`tests discovered statically=${totalTests}`):bad('0 tests discovered');
  /\btest\.skip\s*\(|\btest\.fixme\s*\(|\btest\.fail\s*\(/.test(specs)?bad('skip/fixme/fail marker exists'):pass('no skip/fixme/fail markers');
  const limit=fs.readFileSync(path.join(root,'tests/tool-041-limit.spec.ts'),'utf8');
  /Object\.getOwnPropertyDescriptor\(HTMLTextAreaElement\.prototype,['"]value['"]\)/.test(limit)&&/dispatchEvent\(new Event\(['"]input['"]/.test(limit)?pass('limit uses bounded native setter + input event'):bad('limit injection contract missing');
  /\.fill\([^\n]*repeat\(|\.fill\([^\n]*Array\.from/.test(limit)?bad('limit uses giant physical fill'):pass('no giant physical fill in limit');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const wanted=['tool041:static','tool041:final'];
  for(const s of wanted) pkg.scripts?.[s]?pass(`package script ${s}`):bad(`package script missing ${s}`);
  const cfg=fs.readFileSync(path.join(root,'playwright.tool041.config.ts'),'utf8');
  /Desktop Chrome/.test(cfg)&&/Pixel 5/.test(cfg)?pass('desktop + mobile projects'):bad('desktop/mobile project missing');
  /timeout:45_000/.test(cfg)?pass('per-test timeout 45s'):bad('unexpected per-test timeout');
  const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/tool-041/cases.json'),'utf8'));
  Object.keys(fixture).length>=7?pass(`fixture cases=${Object.keys(fixture).length}`):bad('fixture coverage too small');
}
console.log(`TOOL041_HARNESS_SELF_CHECK ${fail?'FAIL':'PASS'} fail=${fail}`);
process.exitCode=fail?1:0;
