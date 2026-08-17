import {spawnSync} from "node:child_process";import fs from "node:fs";
const mode=process.argv[2]||"final";const dir="docs/tool-042/results";fs.mkdirSync(dir,{recursive:true});
const map={
preflight:[["source","check-source"],["harness","check-harness"]],
core:[["logic","check-logic"],["req","check-req"]],
boundary:[["limit","check-limit-static"]],
regression:[["css","check-css-protection"],["design","check-design-static"]],
limit:[["logic","check-logic"],["limits","check-limit-static"]],
final:[["source","check-source"],["logic","check-logic"],["harness","check-harness"],["css","check-css-protection"],["design","check-design-static"],["req","check-req"],["limits","check-limit-static"]]
};
const steps=map[mode]||map.final;let fail=0;
for(const [name,base] of steps){const r=spawnSync("node",[`scripts/tool-042/${base}.mjs`],{cwd:process.cwd(),encoding:"utf8"});fs.writeFileSync(`${dir}/${mode}_${name}.log`,(r.stdout||"")+(r.stderr||""));console.log(`[${r.status===0?"PASS":"FAIL"}] ${name}`);if(r.status!==0)fail++}
const summary=`TOOL042 ${mode.toUpperCase()} ${fail?"FAIL":"PASS"}\nsteps=${steps.length}\nfailed=${fail}\n`;
fs.writeFileSync(`${dir}/${mode}_summary.txt`,summary);console.log(summary.trim());process.exitCode=fail?1:0;
