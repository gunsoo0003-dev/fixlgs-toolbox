#!/usr/bin/env node
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
const root=process.cwd();
const baseline=process.argv[2];
if(!baseline){console.error('usage: node scripts/tool-031/check-common-protection.mjs <baseline-project-root>');process.exit(2)}
const files=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css','package.json','package-lock.json'];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let fail=0;
for(const f of files){const a=path.join(root,f),b=path.join(baseline,f);if(!fs.existsSync(a)||!fs.existsSync(b)){console.log('[N/A]',f);continue}const same=hash(a)===hash(b);console.log(same?'[PASS]':'[FAIL]',f,same?'unchanged':'changed');if(!same)fail++}
process.exit(fail?1:0);
