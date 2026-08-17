import fs from 'node:fs';
import { calculateTool045 } from '../../lib/tool-045-date-difference.ts';
const cases=JSON.parse(fs.readFileSync('tests/fixtures/tool-045/cases.json','utf8'));let fail=0;
for(const c of cases){const r=calculateTool045(c.start,c.end,c.includeStart);for(const k of ['elapsedDays','appliedDays','weekdays','weekends','weeks','remainderDays'])if(k in c&&r[k]!==c[k]){console.error(`FAIL ${c.name} ${k}: ${r[k]} != ${c[k]}`);fail++;}if(c.calendar)for(const k of ['years','months','days'])if(r.calendar[k]!==c.calendar[k]){console.error(`FAIL ${c.name} calendar.${k}: ${r.calendar[k]} != ${c.calendar[k]}`);fail++;}if(r.weekdays+r.weekends!==r.appliedDays){console.error(`FAIL ${c.name} invariant`);fail++;}if(c.includeStart){const base=calculateTool045(c.start,c.end,false);if(r.appliedDays-base.appliedDays!==1){console.error(`FAIL ${c.name} include delta`);fail++;}}console.log(`PASS fixture ${c.name}`)}
try{calculateTool045('2026-02-01','2026-01-31',false);console.error('FAIL reverse did not throw');fail++;}catch{console.log('PASS reverse order error')}
console.log(fail?`LOGIC FAIL=${fail}`:'LOGIC PASS');process.exitCode=fail?1:0;
