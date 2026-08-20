import {spawnSync} from 'node:child_process';
const checks=['check-source.mjs','check-logic.mjs','check-design.mjs','check-harness.mjs','check-secret-scan.mjs'];let fail=0;
for(const f of checks){const r=spawnSync(process.execPath,[`scripts/tool-060/${f}`],{stdio:'inherit'});if(r.status!==0)fail++}
console.log(`STATIC FINAL ${fail?'FAIL':'PASS'} · FAIL ${fail}`);process.exit(fail?1:0);
