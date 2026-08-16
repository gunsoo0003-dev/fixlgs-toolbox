import {spawnSync} from "node:child_process";
const checks=["check-source.mjs","check-harness.mjs","check-design-static.mjs","check-css-protection.mjs","check-localization.mjs","check-functional-fixtures.mjs","check-main-integration.mjs"];let failed=0;
for(const check of checks){console.log(`\n[STEP] ${check}`);const args=check==="check-functional-fixtures.mjs"?["--experimental-strip-types",`scripts/tool-036/${check}`]:[`scripts/tool-036/${check}`];const result=spawnSync(process.execPath,args,{stdio:"inherit"});if(result.status!==0)failed++;}
console.log(`\n[SUMMARY] TOOL036 static validation: ${failed===0?"PASS":"FAIL"} | failed=${failed}/${checks.length}`);process.exitCode=failed?1:0;
