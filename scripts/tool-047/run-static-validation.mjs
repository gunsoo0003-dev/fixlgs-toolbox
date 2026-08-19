import {spawnSync} from 'node:child_process';
const steps=['check-static.mjs','check-design.mjs','check-harness.mjs','check-logic.mjs','check-boundary.mjs'];
let fail=0;
for(const f of steps){
  console.log(`\n=== ${f} ===`);
  const args=(f==='check-logic.mjs'||f==='check-boundary.mjs')?['--experimental-strip-types',`scripts/tool-047/${f}`]:[`scripts/tool-047/${f}`];
  const r=spawnSync(process.execPath,args,{stdio:'inherit'}); if(r.status!==0) fail++;
}
console.log(`\nTOOL047 STATIC ${fail?'FAIL':'PASS'} | fail=${fail}`); process.exitCode=fail?1:0;
