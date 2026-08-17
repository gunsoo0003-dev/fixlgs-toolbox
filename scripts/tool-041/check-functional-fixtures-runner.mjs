import fs from 'node:fs';
import { extractTool041 } from '../../lib/tool-041-text-extractor.ts';
const cases=JSON.parse(fs.readFileSync('tests/fixtures/tool-041/cases.json','utf8'));let fail=0;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const check=(label,got,expected)=>{if(eq(got,expected))console.log(`[PASS] ${label}`);else{console.error(`[FAIL] ${label} got=${JSON.stringify(got)} expected=${JSON.stringify(expected)}`);fail++;}};
for(const [name,c] of Object.entries(cases)){
 const r=extractTool041(c.input);
 if(name==='mixed-basic'||name==='unicode'){for(const [type,expected] of Object.entries(c.expected))check(`${name} ${type}`,r[type].map(x=>x.value),expected);continue;}
 const type=name.startsWith('email')?'emails':name.startsWith('url')?'urls':name.startsWith('phone')?'phones':name.startsWith('hashtag')?'hashtags':name.startsWith('number')?'numbers':null;
 check(name,r[type].map(x=>x.value),c.expected);
}
check('empty input',Object.values(extractTool041('')).flat().length,0);
process.exitCode=fail?1:0;
