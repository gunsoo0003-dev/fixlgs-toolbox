import fs from 'node:fs';
import path from 'node:path';
const required = [
  'playwright.tool028-runtime.config.ts','scripts/tool-028/runtime-workspace.mjs','scripts/tool-028/run-validation.mjs',
  'tests/tool-028-preflight.spec.ts','tests/tool-028-core.spec.ts','tests/tool-028-feature.spec.ts','tests/tool-028-design-state.spec.ts','tests/tool-028-boundary.spec.ts','tests/tool-028-regression.spec.ts','tests/tool-028-limit.spec.ts',
  'tests/fixtures/tool-028/A-2pages.pdf','tests/fixtures/tool-028/B-3pages.pdf','tests/fixtures/tool-028/C-mixed-pages.pdf',
  'tests/fixtures/tool-028/encrypted.pdf','tests/fixtures/tool-028/corrupt.pdf','tests/fixtures/tool-028/fake.pdf',
  'types/pdfjs-dist-webpack.d.ts'
];
let fail=0; const pass=(ok,msg)=>{console.log(`${ok?'[PASS]':'[FAIL]'} ${msg}`);if(!ok)fail++;};
for(const f of required) pass(fs.existsSync(path.resolve(f)),`harness file ${f}`);
const cfg=fs.readFileSync('playwright.tool028-runtime.config.ts','utf8');
for(const token of ['3028','reuseExistingServer: false','desktop-028','mobile-028','runtime-workspace.mjs']) pass(cfg.includes(token),`config ${token}`);
const runtime=fs.readFileSync('scripts/tool-028/runtime-workspace.mjs','utf8');
pass(runtime.includes("'types'"),'isolated runtime copies custom types');
const runner=fs.readFileSync('scripts/tool-028/run-validation.mjs','utf8');
for(const token of ['tests/tool-028-preflight.spec.ts','tests/tool-028-core.spec.ts','tests/tool-028-boundary.spec.ts','tests/tool-028-feature.spec.ts','tests/tool-028-design-state.spec.ts','tests/tool-028-regression.spec.ts','tests/tool-028-limit.spec.ts','playwright.tool028-runtime.config.ts']) pass(runner.includes(token),`runner exact 028 link ${token}`);
pass(!/tool-02[0-7]-.*\.spec/.test(runner),'runner has no previous TOOL spec link');
const allTests=['tests/tool-028-preflight.spec.ts','tests/tool-028-core.spec.ts','tests/tool-028-feature.spec.ts','tests/tool-028-design-state.spec.ts','tests/tool-028-boundary.spec.ts','tests/tool-028-regression.spec.ts','tests/tool-028-limit.spec.ts'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['tool028-root','tool028-file-input','tool028-file-count','tool028-page-count','tool028-result','tool028-preview-dialog','tool028-workspace','data-drag-active']) pass(allTests.includes(token),`selector contract ${token}`);
pass((allTests.match(/test\(/g)||[]).length>=10,'test declarations >= 10 before locale/project expansion');
process.exit(fail?1:0);
