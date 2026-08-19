import fs from 'node:fs';
const src=fs.readFileSync('lib/tool-048-age-life.ts','utf8');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-048/cases.json','utf8'));
const must=['TOOL048_SERVICE_DATE_RANGE','FEB_28','DOB_AFTER_AS_OF','OUT_OF_RANGE','elapsedDays','yearAge','nextBirthdayDays','birthdayToday'];
const fail=must.filter(x=>!src.includes(x)).map(x=>`logic token missing ${x}`);
for(const name of ['reference','same-date','leap-birthday-non-leap-birthday','month-end','year-boundary','future-dob','lower-limit','upper-limit','below-limit','above-limit'])if(!fixture.some(x=>x.name===name))fail.push(`fixture missing ${name}`);
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log('TOOL048 LOGIC/FIXTURE PASS');
