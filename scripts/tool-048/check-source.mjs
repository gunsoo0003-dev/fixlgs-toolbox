import fs from 'node:fs';
const required=['app/[locale]/age-life-calculator/page.tsx','components/age-life-calculator-page.tsx','components/age-life-calculator-tool.tsx','components/age-life-calculator-tool.module.css','lib/tool-048-age-life.ts'];
const fail=[];for(const f of required){if(!fs.existsSync(f))fail.push(`missing ${f}`)}
const combined=required.filter(f=>fs.existsSync(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['tool048-root','tool048-dob','tool048-as-of','tool048-age','tool048-year-age','tool048-elapsed-days','tool048-next-days','age-life-calculator'])if(!combined.includes(token))fail.push(`missing token ${token}`);
if(/fetch\(|axios|XMLHttpRequest|localStorage|sessionStorage/.test(combined))fail.push('unexpected network/storage primitive');
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log('TOOL048 SOURCE PASS');
