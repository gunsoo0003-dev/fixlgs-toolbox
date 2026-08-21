import fs from 'node:fs';import crypto from 'node:crypto';
const expected={
'app/globals.css':'ebd10ed663d6',
'components/toolbox-subpage-shell.tsx':'8c5aa76d11ba',
'components/toolbox-faq-list.tsx':'f285eba69e8d',
'components/tool-081-area-price-calculator.tsx':'1469ac5d0434',
'components/tool-081-area-price-calculator-page.tsx':'b64ada0a652d',
'components/tool-081-area-price-calculator.module.css':'788e69f431e8',
'lib/tool-081-area-price.ts':'a5d96c726282'};
let fail=0;for(const [file,prefix] of Object.entries(expected)){if(!fs.existsSync(file)){console.log('FAIL missing protected',file);fail++;continue}const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');const ok=hash.startsWith(prefix);console.log(`${ok?'PASS':'FAIL'} protected ${file} ${hash.slice(0,12)}`);if(!ok)fail++;}console.log(`RESULT PROTECTION FAIL=${fail}`);process.exitCode=fail?1:0;
