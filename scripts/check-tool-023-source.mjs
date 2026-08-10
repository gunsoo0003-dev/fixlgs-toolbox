import fs from 'node:fs';
const files=['app/[locale]/app-icon-favicon-generator/page.tsx','components/app-icon-favicon-generator-page.tsx','components/app-icon-favicon-generator-tool.tsx','components/app-icon-favicon-generator-tool.module.css','lib/tool-023-icon-generator.ts'];
let fail=false; for(const f of files){const ok=fs.existsSync(f)&&fs.statSync(f).size>100;console.log(`${ok?'PASS':'FAIL'} ${f}`);if(!ok)fail=true;}
const tool=fs.readFileSync(files[2],'utf8'), lib=fs.readFileSync(files[4],'utf8'), site=fs.readFileSync('lib/site.ts','utf8'), sm=fs.readFileSync('app/sitemap.ts','utf8');
const checks={root:tool.includes('data-testid="tool023-root"'),android:lib.includes('ANDROID_SIZES'),pwa:lib.includes('PWA_SIZES'),ico:lib.includes('makeIco'),zip:lib.includes('makeZip'),limits:lib.includes('TOOL023_MAX_BYTES')&&lib.includes('TOOL023_MAX_PIXELS'),site:site.includes('tool023Slug')&&site.includes('app-icon-favicon-generator'),sitemap:sm.includes('tool023Slug')};
for(const [k,v] of Object.entries(checks)){console.log(`${v?'PASS':'FAIL'} ${k}`);if(!v)fail=true;}process.exit(fail?1:0);
