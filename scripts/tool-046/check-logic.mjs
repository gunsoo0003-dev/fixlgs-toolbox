import fs from 'node:fs';import {calculateDate,weekdayIndex} from '../../lib/tool-046-date-arithmetic.ts';
let fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);if(!o)fail++};
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-046/cases.json','utf8'));
for(const x of fixture){let got='';try{got=calculateDate(x.start,x.direction,x.unit,x.quantity)}catch(e){got=`ERROR:${e?.message}`};check(`${x.start} ${x.direction} ${x.quantity} ${x.unit} => ${x.expected}`,got===x.expected);if(got===x.expected)check(`weekday valid ${got}`,weekdayIndex(got)>=0&&weekdayIndex(got)<=6);}
for(const q of [-1,1.5,100001]){let threw=false;try{calculateDate('2026-08-16','add','day',q)}catch{threw=true}check(`invalid quantity ${q} throws`,threw)}
process.exitCode=fail?1:0;
