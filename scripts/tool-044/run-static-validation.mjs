import {spawnSync} from 'node:child_process';

const steps=[
  ['static','scripts/tool-044/check-static.mjs'],
  ['logic','scripts/tool-044/check-logic.mjs'],
  ['harness','scripts/tool-044/check-harness.mjs'],
];
let fail=0;
for(const [name,file] of steps){
  console.log(`\nSTART ${name}`);
  const args=file.endsWith('check-logic.mjs')?['--experimental-strip-types',file]:[file];
  const r=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(r.status===0) console.log('PASS',name);
  else {console.log('FAIL',name);fail++;}
}
console.log(`\nTOOL044 SELF-CHECK ${fail?'FAIL':'PASS'} | FAIL=${fail}`);
process.exitCode=fail?1:0;
