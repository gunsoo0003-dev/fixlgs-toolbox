import fs from 'node:fs';
const files=['lib/tool-088-concrete-volume.ts','components/tool-088-concrete-volume-calculator.tsx','components/tool-088-concrete-volume-calculator-page.tsx','components/tool-088-concrete-volume-calculator.module.css','app/[locale]/concrete-volume-calculator/page.tsx'];
let pass=0,fail=0;for(const f of files){if(fs.existsSync(f)){console.log('PASS source',f);pass++}else{console.log('FAIL source',f);fail++}}
const joined=files.filter(fs.existsSync).map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['tool088-root','tool088-workspace','ConcreteVolume','concrete-volume-calculator','m³','extraRate','referenceDeliveries']){if(joined.includes(token)){console.log('PASS token',token);pass++}else{console.log('FAIL token',token);fail++}}
for(const forbidden of ['tool087-','MasonryQuantityEngine','RoofAreaEngine']){if(joined.includes(forbidden)){console.log('FAIL forbidden',forbidden);fail++}else{console.log('PASS no-forbidden',forbidden);pass++}}
console.log(`SOURCE PASS=${pass} FAIL=${fail}`);process.exit(fail?1:0);
