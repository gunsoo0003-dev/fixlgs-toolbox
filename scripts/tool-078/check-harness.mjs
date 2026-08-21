import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const ui=fs.readFileSync('components/tool-078-stock-average-cost-calculator.tsx','utf8');
const ids=["tool078-root", "tool078-workspace", "tool078-existing-qty", "tool078-existing-price", "tool078-add-row", "tool078-reset", "tool078-copy", "tool078-result", "tool078-average-cost", "tool078-total-shares", "tool078-total-cost", "tool078-break-even", "tool078-target-return", "tool078-target-sell", "tool078-error", "tool078-precision"];
for(const id of ids)check(`selector ${id}`,ui.includes(id));
check('browser spec exists',fs.existsSync('tests/tool-078/tool-078-main.spec.ts'));
if(fs.existsSync('tests/tool-078/tool-078-main.spec.ts')){
 const spec=fs.readFileSync('tests/tool-078/tool-078-main.spec.ts','utf8');
 check('runtime pageerror gate',spec.includes('pageerror'));
 check('runtime console error gate',spec.includes("m.type()==='error'"));
 check('error recovery/state matrix',spec.includes('recovers')||spec.includes('state transition'));
}
console.log(`RESULT TOOL078 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
