import crypto from "node:crypto";
import fs from "node:fs";
const baseline = JSON.parse(fs.readFileSync("scripts/tool-069/baseline-protected-hashes.json","utf8"));
const diff=[];
for (const [file, expected] of Object.entries(baseline)) {
  if (!fs.existsSync(file)) { diff.push(`${file}:MISSING`); continue; }
  const actual=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if(actual!==expected) diff.push(file);
}
if(diff.length){console.error("PROTECTED CHANGED",diff);process.exit(1)}
console.log(`PASS protected baseline unchanged (${Object.keys(baseline).length})`);
