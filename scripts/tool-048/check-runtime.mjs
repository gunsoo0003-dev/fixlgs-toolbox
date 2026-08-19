import fs from 'node:fs';
import { calculateTool048, formatTool048Date } from '../../lib/tool-048-age-life.ts';
const cases=JSON.parse(fs.readFileSync('tests/fixtures/tool-048/cases.json','utf8'));
const fail=[];
for(const c of cases){
  try{
    const r=calculateTool048(c.dob,c.asOf);
    if(c.error){fail.push(`${c.name}: expected ${c.error}, got result`);continue;}
    if(c.age&&JSON.stringify(r.age)!==JSON.stringify(c.age))fail.push(`${c.name}: age ${JSON.stringify(r.age)} != ${JSON.stringify(c.age)}`);
    for(const key of ['yearAge','elapsedDays','nextBirthdayDays'])if(c[key]!==undefined&&r[key]!==c[key])fail.push(`${c.name}: ${key} ${r[key]} != ${c[key]}`);
    if(c.nextBirthday&&formatTool048Date(r.nextBirthday)!==c.nextBirthday)fail.push(`${c.name}: nextBirthday ${formatTool048Date(r.nextBirthday)} != ${c.nextBirthday}`);
  }catch(e){if(!c.error||e.message!==c.error)fail.push(`${c.name}: unexpected error ${e.message}`)}
}
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log(`TOOL048 RUNTIME FIXTURE PASS (${cases.length} cases)`);
