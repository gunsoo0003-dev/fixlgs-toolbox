import fs from 'node:fs';
const files=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css'];let fail=0;
for(const p of files){if(!fs.existsSync(p))continue;const ok=!fs.readFileSync(p,'utf8').includes('tool037');console.log(`[${ok?'PASS':'FAIL'}] protected CSS ${p}`);if(!ok)fail++;}
process.exitCode=fail?1:0;
