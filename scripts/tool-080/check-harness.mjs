import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const ui=fs.readFileSync('components/tool-080-rental-yield-calculator.tsx','utf8');
const ids=["tool080-root", "tool080-purchase", "tool080-deposit", "tool080-rent", "tool080-management", "tool080-interest", "tool080-interest-unit", "tool080-gross", "tool080-net", "tool080-capital", "tool080-error", "tool080-annual-interest"];
for(const id of ids)check(`selector ${id}`,ui.includes(id));
check('browser spec exists',fs.existsSync('tests/tool-080/tool-080-state-matrix.spec.ts'));
if(fs.existsSync('tests/tool-080/tool-080-state-matrix.spec.ts')){
 const spec=fs.readFileSync('tests/tool-080/tool-080-state-matrix.spec.ts','utf8');
 check('runtime pageerror gate',spec.includes('pageerror'));
 check('runtime console error gate',spec.includes("m.type()==='error'"));
 check('error recovery/state matrix',spec.includes('recovers')||spec.includes('state transition'));
}
console.log(`RESULT TOOL080 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
