import { diffDays, ddayStatus, anniversaryMilestones, birthdayResult } from '../../lib/tool-047-dday.ts';
const eq=(name,a,b)=>{if(a!==b){console.error(`FAIL ${name}: ${a} !== ${b}`);process.exitCode=1}else console.log(`PASS ${name}`)};
eq('D-DAY',ddayStatus('2026-08-17','2026-08-17').label,'D-Day');
eq('D-1',ddayStatus('2026-08-17','2026-08-18').label,'D-1');
eq('D+1',ddayStatus('2026-08-17','2026-08-16').label,'D+1');
eq('100th-day',anniversaryMilestones('2026-01-01',[100])[0].date,'2026-04-10');
eq('birthday',birthdayResult('2026-08-17','05-21').date,'2027-05-21');
console.log(process.exitCode? 'RESULT LOGIC FAIL':'RESULT LOGIC PASS');
