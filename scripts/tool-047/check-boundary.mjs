import { anniversaryMilestones, birthdayResult, addDays } from '../../lib/tool-047-dday.ts';
const expect=(name,a,b)=>{if(a!==b){console.error(`FAIL ${name}: ${a} !== ${b}`);process.exitCode=1}else console.log(`PASS ${name}`)};
expect('leap birthday next valid',birthdayResult('2026-08-17','02-29').date,'2028-02-29');
expect('leap birthday after leap',birthdayResult('2028-03-01','02-29').date,'2032-02-29');
expect('100-day at upper range becomes bounded',anniversaryMilestones('2100-12-31',[100])[0].date,null);
expect('10000 allowed',anniversaryMilestones('2000-01-01',[10000])[0].date,'2027-05-18');
try { addDays('1899-12-31',1); console.error('FAIL lower bound'); process.exitCode=1; } catch { console.log('PASS lower bound'); }
console.log(process.exitCode?'RESULT BOUNDARY FAIL':'RESULT BOUNDARY PASS');
