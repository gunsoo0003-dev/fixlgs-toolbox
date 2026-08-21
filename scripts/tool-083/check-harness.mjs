import fs from 'node:fs';
let pass=0,fail=0;const c=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
const ui=fs.readFileSync('components/tool-083-room-area-calculator.tsx','utf8');const spec='tests/tool-083/tool-083-state-matrix.spec.ts';
const ids=['tool083-root','tool083-width','tool083-length','tool083-height','tool083-floor','tool083-wall','tool083-ceiling','tool083-net-wall','tool083-total','tool083-error','tool083-opening-row'];
for(const id of ids)c(`product testid ${id}`,ui.includes(`data-testid="${id}"`)||ui.includes(`data-testid={\`${id}`));
c('state matrix spec exists',fs.existsSync(spec));if(fs.existsSync(spec)){const s=fs.readFileSync(spec,'utf8');c('browser route contract',s.includes('/room-wall-ceiling-area-calculator'));c('runtime pageerror gate',s.includes('pageerror'));c('runtime console error gate',s.includes("type()==='error'")||s.includes("type() === 'error'"));c('reference fixture assertions',s.includes('52.11')&&s.includes('28.11'));c('error recovery coverage',/recover|recovery|recovers/i.test(s));c('dynamic opening coverage',/opening|door|window/i.test(s));c('no previous tool selector residue',!s.includes('tool082-')&&!s.includes('tool080-'));}
c('fixture exists',fs.existsSync('tests/fixtures/tool-083/cases.json'));c('playwright config exists',fs.existsSync('playwright.tool083.config.ts'));
console.log(`RESULT TOOL083 HARNESS-STRUCTURE PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
