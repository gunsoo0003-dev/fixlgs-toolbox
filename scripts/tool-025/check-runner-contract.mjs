import fs from 'node:fs';
const required=['components/id-passport-photo-maker-page.tsx','components/id-passport-photo-maker-tool.tsx','components/id-passport-photo-maker-tool.module.css','lib/tool-025-id-photo-policy.ts','app/[locale]/id-passport-photo-maker/page.tsx','tests/tool-025-core.spec.ts','tests/tool-025-boundary.spec.ts','tests/tool-025-feature.spec.ts','tests/tool-025-design-state.spec.ts','tests/tool-025-regression.spec.ts','tests/tool-025-limit.spec.ts','playwright.tool025-runtime.config.ts','scripts/tool-025/runtime-workspace.mjs','scripts/tool-025/run-validation.mjs','scripts/tool-025/check-final-checklist.mjs','scripts/tool-025/check-source.mjs','scripts/tool-025/check-harness.mjs','scripts/tool-025/check-integration.mjs','scripts/tool-025/check-syntax.mjs','docs/tool-025/HANDOFF_025.md','docs/tool-025/REQ_025.md','docs/tool-025/FINAL_VALIDATION_CHECKLIST_025.md'];
const missing=required.filter(p=>!fs.existsSync(p));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const scripts=['test:toolbox:025-preflight','test:toolbox:025-core-only','test:toolbox:025-boundary-only','test:toolbox:025-feature-only','test:toolbox:025-regression-only','test:toolbox:025-limit-only','test:toolbox:025-final'];
for(const s of scripts)if(!pkg.scripts?.[s])missing.push(`package.json script ${s}`);
const runner=fs.existsSync('scripts/tool-025/run-validation.mjs')?fs.readFileSync('scripts/tool-025/run-validation.mjs','utf8'):'';
if(runner.includes("node_modules','.bin','tsc.cmd")||runner.includes('tsc.cmd'))missing.push('Windows-unsafe direct .cmd spawn remains in run-validation.mjs');
if(!runner.includes("node_modules', 'typescript', 'lib', 'tsc.js"))missing.push('TypeScript CLI is not launched through node_modules/typescript/lib/tsc.js');
if(!runner.includes('const node = process.execPath'))missing.push('Node child commands are not pinned to process.execPath');
if(!runner.includes('try {\n      // Windows-safe contract: never spawn .cmd/.bat directly.'))missing.push('spawn synchronous exception guard missing');
if(!runner.includes('VALIDATOR_INTERNAL_FAIL'))missing.push('validator internal failure capture missing');
if(!runner.includes('025_${mode}_검수결과.zip'))missing.push('Desktop result ZIP contract missing');
if(missing.length){console.error('RUNNER CONTRACT FAIL\n'+missing.join('\n'));process.exit(1)}
console.log('RUNNER CONTRACT PASS');
