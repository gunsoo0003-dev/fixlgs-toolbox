import {spawnSync} from 'node:child_process';
const scripts=["check-source.mjs", "check-design.mjs", "check-harness.mjs", "check-browser-ready.mjs", "check-logic.mjs", "check-secret-scan.mjs", "check-syntax.mjs"];
let failed=0;
for(const script of scripts){
 const r=spawnSync(process.execPath,[`scripts/tool-077/${script}`],{encoding:'utf8'});
 process.stdout.write(`\n### ${script}\n${r.stdout||''}`);
 if(r.stderr)process.stderr.write(r.stderr);
 if(r.status!==0)failed++;
}
console.log(`\nTOOL077 STATIC VALIDATION: ${failed===0?'PASS':'FAIL'} (${scripts.length-failed}/${scripts.length})`);
process.exitCode=failed?1:0;
