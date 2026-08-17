import fs from 'node:fs';
const protectedFiles=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];
let fail=0; for(const f of protectedFiles){const text=fs.readFileSync(f,'utf8'); const dirty=/tool040|delimiter-list-converter/i.test(text); if(dirty){console.error(`[FAIL] TOOL040 marker found in protected style/global file ${f}`);fail++;}else console.log(`[PASS] protected global unchanged by TOOL040 marker ${f}`)}
const site=fs.readFileSync('lib/site.ts','utf8'), sitemap=fs.readFileSync('app/sitemap.ts','utf8');
for(const [label,ok] of [['site intentional integration',/tool040Slug\s*=\s*"delimiter-list-converter"/.test(site)],['sitemap intentional integration',/\$\{tool040Slug\}/.test(sitemap)]]){if(ok)console.log(`[PASS] ${label}`);else{console.error(`[FAIL] ${label}`);fail++;}}
process.exitCode=fail?1:0;
