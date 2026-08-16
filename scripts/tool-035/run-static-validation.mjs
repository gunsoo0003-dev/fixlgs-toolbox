import { spawnSync } from 'node:child_process';
const scripts=['check-source.mjs','check-content.mjs','check-logic.mjs','check-harness.mjs','check-design.mjs','check-package.mjs','check-common-protection.mjs'];
let fail=0;
for(let i=0;i<scripts.length;i++){
  const script=scripts[i]; console.log(`\n[${i+1}/${scripts.length}] ${script}`);
  const result=spawnSync(process.execPath,[`scripts/tool-035/${script}`],{stdio:'inherit'});
  if(result.status!==0) fail++;
}
console.log(`\nTOOL035 STATIC VALIDATION: ${fail?'FAIL':'PASS'} | groups=${scripts.length} | fail=${fail}`);
process.exitCode=fail?1:0;
