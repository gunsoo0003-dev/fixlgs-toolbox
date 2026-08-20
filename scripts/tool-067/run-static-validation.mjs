import { spawnSync } from "node:child_process";
const checks = [
  ["check-source.mjs", []],
  ["check-protection.mjs", []],
  ["check-logic.mjs", ["--experimental-strip-types"]],
  ["check-harness.mjs", []],
  ["check-specs.mjs", []],
  ["check-design.mjs", []],
];
let pass=0;
for (const [file, flags] of checks) {
  console.log(`\n### ${file}`);
  const r=spawnSync(process.execPath,[...flags,`scripts/tool-067/${file}`],{stdio:"inherit",shell:false});
  if (r.status===0) pass++;
}
console.log(`\nTOOL067 STATIC VALIDATION: ${pass===checks.length?"PASS":"FAIL"} (${pass}/${checks.length})`);
if(pass!==checks.length) process.exit(1);
