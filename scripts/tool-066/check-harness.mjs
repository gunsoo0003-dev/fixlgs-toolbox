import fs from 'node:fs';
const specs=['preflight','core','feature','rate','inclusive','roundtrip','legal-warning','boundary','regression','limit'];
const failures=[];
for(const s of specs){const p=`tests/tool-066-${s}.spec.ts`;if(!fs.existsSync(p))failures.push(`missing:${p}`)}
if(!fs.existsSync('tests/fixtures/tool-066/cases.json'))failures.push('missing:fixture');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-066/cases.json','utf8'));
if(fixture.core?.find(x=>x.id==='exclusive-10')?.vat!==10000)failures.push('fixture:exclusive-10');
if(fixture.core?.find(x=>x.id==='inclusive-10')?.supply!==100000)failures.push('fixture:inclusive-10');
if(fixture.reverseRate?.rate!==10)failures.push('fixture:reverse-rate');
console.log(JSON.stringify({check:'TOOL066 harness-structure',specs:specs.length,failures},null,2));
process.exitCode=failures.length?1:0;
