import fs from 'node:fs';
const files=['lib/tool-089-roof-area.ts','components/tool-089-roof-area-calculator.tsx','components/tool-089-roof-area-calculator.module.css','components/tool-089-roof-area-calculator-page.tsx','app/[locale]/roof-area-slope-calculator/page.tsx'];
let fail=0,pass=0;for(const f of files){if(fs.existsSync(f)){console.log('PASS file',f);pass++}else{console.log('FAIL missing',f);fail++}}
const joined=files.filter(f=>fs.existsSync(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');for(const token of ['tool089-root','roof-area-slope-calculator','Actual = (Length × Width) ÷ cos(θ)','089 · REAL ESTATE & BUILD']){if(joined.includes(token)){console.log('PASS token',token);pass++}else{console.log('FAIL token',token);fail++}}
console.log(`SOURCE PASS ${pass} FAIL ${fail}`);process.exitCode=fail?1:0;
