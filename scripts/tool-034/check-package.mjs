import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));const fail=[];const need=(v,m)=>{if(!v)fail.push(m)};
const nextConfig=fs.readFileSync('next.config.ts','utf8');
need(pkg.dependencies?.['qpdf-wasm-esm-embedded']==='1.1.1','package dependency must pin qpdf-wasm-esm-embedded 1.1.1');
need(lock.packages?.['']?.dependencies?.['qpdf-wasm-esm-embedded']==='1.1.1','lock root dependency missing');
need(lock.packages?.['node_modules/qpdf-wasm-esm-embedded']?.version==='1.1.1','lock package entry missing');
need(nextConfig.includes('fs: { browser: "./lib/browser-empty-module.ts" }'),'qpdf fs alias must be browser-conditional');
need(nextConfig.includes('path: { browser: "./lib/browser-empty-module.ts" }'),'qpdf path alias must be browser-conditional');
need(!/fs:\s*["']\.\/lib\/browser-empty-module\.ts["']/.test(nextConfig),'global fs alias is forbidden');
need(!/path:\s*["']\.\/lib\/browser-empty-module\.ts["']/.test(nextConfig),'global path alias is forbidden');

for(const p of ['components/pdf-password-metadata-tool.tsx','components/pdf-password-metadata-tool.module.css','components/pdf-password-metadata-page.tsx','app/[locale]/pdf-password-metadata/page.tsx','lib/tool-034-pdf-policy.ts','lib/tool-034-qpdf.ts','lib/tool-034-metadata.ts','types/qpdf-wasm-esm-embedded.d.ts','docs/tool-034/original/FIXLGS_TOOLBOX_034_PDF_비밀번호_메타데이터_도구_최종제작전달서.pdf','scripts/tool-034/run-validation.mjs','tests/tool-034-preflight.spec.ts','tests/tool-034-core.spec.ts','tests/tool-034-boundary.spec.ts','tests/tool-034-feature.spec.ts','tests/tool-034-regression.spec.ts','tests/tool-034-limit.spec.ts','tests/fixtures/tool-034/protected-known-password.pdf','docs/tool-034/HANDOFF.txt','docs/tool-034/PACKAGE_MANIFEST_034.txt'])need(fs.existsSync(p),`missing ${p}`);
if(fail.length){console.error('TOOL034 PACKAGE FAIL');fail.forEach(x=>console.error(' -',x));process.exit(1)}console.log('TOOL034 PACKAGE PASS');
