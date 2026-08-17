import fs from "node:fs";
const s=fs.readFileSync("docs/tool-042/REQ_MASTER_042.md","utf8");
const ids=Array.from({length:12},(_,i)=>`REQ-042-${String(i+1).padStart(3,"0")}`);let fail=0;
for(const id of ids){const ok=s.includes(id);console.log(`[${ok?"PASS":"FAIL"}] ${id}`);if(!ok)fail++}
process.exitCode=fail?1:0;
