import { spawnSync } from "node:child_process";
const scripts=["check-source.mjs","check-content.mjs","check-logic.mjs","check-harness.mjs","check-design-transplant.mjs","check-package.mjs"];
let fail=0;
for(let i=0;i<scripts.length;i++){
  const s=scripts[i]; console.log(`\n[${i+1}/${scripts.length}] ${s}`);
  const r=spawnSync(process.execPath,[`scripts/tool-030/${s}`],{stdio:"inherit"});
  if(r.status!==0) fail++;
}
console.log(`\nTOOL030 STATIC VALIDATION: ${fail?"FAIL":"PASS"} | groups=${scripts.length} | fail=${fail}`);
process.exitCode=fail?1:0;
