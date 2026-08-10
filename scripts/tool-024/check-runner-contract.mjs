import fs from 'node:fs';
const required=[
 'components/app-store-screenshot-maker-page.tsx','components/app-store-screenshot-maker-tool.tsx','components/app-store-screenshot-maker-tool.module.css',
 'lib/tool-024-store-policy.ts','tests/tool-024-core.spec.ts','tests/tool-024-boundary.spec.ts','tests/tool-024-regression.spec.ts','tests/tool-024-limit.spec.ts','tests/tool-024-feature.spec.ts',
 'playwright.tool024-runtime.config.ts','scripts/tool-024/runtime-workspace.mjs','scripts/tool-024/run-validation.mjs'
];
const missing=required.filter((p)=>!fs.existsSync(p));
if(missing.length){console.error('RUNNER CONTRACT FAIL\n'+missing.join('\n'));process.exit(1)}
console.log('RUNNER CONTRACT PASS');
