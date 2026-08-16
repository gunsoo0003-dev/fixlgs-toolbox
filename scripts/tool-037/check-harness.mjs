import fs from 'node:fs';
const files=['tests/helpers/tool-037.ts','tests/tool-037-preflight.spec.ts','tests/tool-037-core.spec.ts','tests/tool-037-boundary.spec.ts','tests/tool-037-feature.spec.ts','tests/tool-037-regression.spec.ts','tests/tool-037-limit.spec.ts','playwright.tool037.config.ts','scripts/tool-037/run-validation.mjs'];let fail=0;const need=(v,m)=>{console.log(`[${v?'PASS':'FAIL'}] ${m}`);if(!v)fail++;};
for(const p of files)need(fs.existsSync(p),`exists ${p}`);
const all=files.filter(x=>x.endsWith('.spec.ts')).map(x=>fs.readFileSync(x,'utf8')).join('\n');
for(const id of ['tool037-root','tool037-workspace','tool037-file-input','tool037-input','tool037-result','tool037-clean','tool037-reset','tool037-copy','tool037-download','tool037-replace-dialog'])need(all.includes(id),`checker selector ${id}`);
need(all.includes('NBSP')&&all.includes('zero-width'),'unicode boundary');need(all.includes("['ko','en','ja']"),'locale regression');need(all.includes('1_000_000')||fs.readFileSync('tests/helpers/tool-037.ts','utf8').includes('1_000_000'),'limit expected');need(all.includes('waitForEvent(\'download\')')||all.includes('waitForEvent("download")'),'actual TXT download test');
process.exitCode=fail?1:0;
