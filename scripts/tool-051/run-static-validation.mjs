import {spawnSync} from 'node:child_process';
const steps=["check-secret-scan.mjs", "check-source.mjs", "check-design.mjs", "check-harness.mjs", "check-logic.mjs", "check-boundary.mjs"];
let fail=0;
for(const f of steps){
  console.log(`\n=== ${f} ===`);
  const strip=(f==='check-logic.mjs'||f==='check-boundary.mjs');
  const args=strip?['--experimental-strip-types',`scripts/tool-051/${f}`]:[`scripts/tool-051/${f}`];
  const r=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(r.status!==0)fail++;
}
console.log(`\nTOOL051 STATIC ${fail?'FAIL':'PASS'} | fail=${fail}`);
process.exitCode=fail?1:0;
