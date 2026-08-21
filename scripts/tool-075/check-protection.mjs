import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const zip='/mnt/data/FIXLGS_TOOLBOX_066_다음작업용_20260820(8).zip';
const protectedFiles=['app/globals.css','styles/global-base.css','styles/toolbox-common.css','styles/toolbox-detail-common.css','styles/theme.css','styles/toolbox-compat.css','styles/legacy-site-sealed.css','styles/legacy-tools-sealed.css','lib/site.ts','package.json','package-lock.json','components/tool-066-vat-calculator.tsx','components/tool-066-vat-calculator-page.tsx','components/tool-066-vat-calculator.module.css','lib/tool-066-vat.ts'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const changed=[];
for(const file of protectedFiles){
 if(!fs.existsSync(file)) continue;
 let original;
 try{original=execFileSync('unzip',['-p',zip,`fixlgs-toolbox/${file}`]);}catch{continue;}
 const current=fs.readFileSync(file);
 if(hash(original)!==hash(current))changed.push(file);
}
if(changed.length)throw new Error(`protected file changed: ${changed.join(', ')}`);
console.log('TOOL075 COMMON FILE PROTECTION PASS');
