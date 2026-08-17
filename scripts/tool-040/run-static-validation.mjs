import {spawnSync} from "node:child_process";
const steps=[
 ["source",["scripts/tool-040/check-source.mjs"]],
 ["common-protection",["scripts/tool-040/check-common-protection.mjs"]],
 ["functional-fixtures",["--experimental-strip-types","scripts/tool-040/check-functional-fixtures.mjs"]],
];
let fail=0;for(const [name,args] of steps){console.log(`\n=== ${name} ===`);const r=spawnSync(process.execPath,args,{stdio:"inherit"});if(r.status!==0)fail++;}
console.log(`\nTOOL040 STATIC ${fail?"FAIL":"PASS"} | failed_steps=${fail}`);process.exitCode=fail?1:0;
