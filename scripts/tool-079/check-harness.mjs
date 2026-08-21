import fs from 'node:fs';
let pass=0,fail=0;
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++};
const ui=fs.readFileSync('components/tool-079-dividend-yield-calculator.tsx','utf8');
const ids=["tool079-root", "tool079-share-price", "tool079-annual-dps", "tool079-shares", "tool079-dividend-yield", "tool079-expected-dividend", "tool079-annual-basis", "tool079-error"];
for(const id of ids)check(`selector ${id}`,ui.includes(id));
check('browser spec exists',fs.existsSync('tests/tool-079/tool-079-state-matrix.spec.ts'));
if(fs.existsSync('tests/tool-079/tool-079-state-matrix.spec.ts')){
 const spec=fs.readFileSync('tests/tool-079/tool-079-state-matrix.spec.ts','utf8');
 check('runtime pageerror gate',spec.includes('pageerror'));
 check('runtime console error gate',spec.includes("m.type()==='error'"));
 check('error recovery/state matrix',spec.includes('recovers')||spec.includes('state transition'));
}
console.log(`RESULT TOOL079 HARNESS PASS=${pass} FAIL=${fail}`);
process.exitCode=fail?1:0;
