import {spawnSync} from 'node:child_process';
const scripts=['check-finalized-design.mjs','check-value-content.mjs','check-source.mjs','check-design.mjs','check-harness.mjs','check-logic.mjs','check-secret-scan.mjs'];
let failed=0;
for(const script of scripts){const p=spawnSync(process.execPath,[`scripts/tool-066/${script}`],{encoding:'utf8'});process.stdout.write(`\n### ${script}\n${p.stdout}`);if(p.stderr)process.stderr.write(p.stderr);if(p.status!==0)failed++}
console.log(`\nTOOL066 STATIC VALIDATION: ${failed===0?'PASS':'FAIL'} (${scripts.length-failed}/${scripts.length})`);
process.exitCode=failed?1:0;
