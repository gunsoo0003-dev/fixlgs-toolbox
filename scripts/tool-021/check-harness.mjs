import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=[
 'tests/tool-021-core.spec.ts','tests/tool-021-boundary.spec.ts','tests/tool-021-regression.spec.ts','tests/tool-021-limit.spec.ts','tests/tool-021-design.spec.ts',
 'playwright.tool021-runtime.config.ts','scripts/tool-021/runtime-workspace.mjs','scripts/tool-021/run-validation.mjs','scripts/tool-021/check-source.mjs','scripts/tool-021/check-fixtures.py','scripts/tool-021/check-protected.mjs','scripts/tool-021/check-syntax.mjs','scripts/tool-021/check-render-math.mjs','scripts/tool-021/check-image-headers.mjs','scripts/tool-021/check-zip-engine.mjs','scripts/tool-021/check-browser-kernel.py','scripts/tool-021/check-browser-layout.py','scripts/tool-021/check-design-static.mjs',
 'components/social-media-image-maker-page.tsx','components/social-media-image-maker-tool.tsx','components/social-media-image-maker-tool.module.css',
 'lib/site.ts','app/[locale]/[toolSlug]/page.tsx','app/sitemap.ts'
];
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)));
const specs=required.filter(f=>f.startsWith('tests/') && fs.existsSync(path.join(root,f)));
let testCount=0;
for(const f of specs){ const src=fs.readFileSync(path.join(root,f),'utf8'); testCount+=(src.match(/\btest\s*\(/g)||[]).length; }
const result={required:required.length,missing,testCount,zeroTestsGuard:testCount>0};
console.log(JSON.stringify(result,null,2));
if(missing.length||testCount===0) process.exit(1);
