import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const ui=fs.readFileSync('components/tool-077-investment-return-calculator.tsx','utf8');
const ids=["tool077-root", "tool077-purchase", "tool077-current", "tool077-period", "tool077-period-unit", "tool077-error", "tool077-total-return", "tool077-annualized-return", "tool077-precision"];
for(const id of ids)check(`selector ${id}`,ui.includes(id));
check('browser spec exists',fs.existsSync('tests/tool-077/tool-077-state-matrix.spec.ts'));
if(fs.existsSync('tests/tool-077/tool-077-state-matrix.spec.ts')){
 const spec=fs.readFileSync('tests/tool-077/tool-077-state-matrix.spec.ts','utf8');
 check('runtime pageerror gate',spec.includes('pageerror'));
 check('runtime console error gate',spec.includes("m.type()==='error'"));
 check('error recovery/state matrix',spec.includes('recovers')||spec.includes('state transition'));
}
console.log(`RESULT TOOL077 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
