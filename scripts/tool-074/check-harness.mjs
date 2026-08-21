import fs from 'node:fs';
let pass=0,fail=0;const c=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
for(const s of ['core','feature','boundary','regression','limit']){const p=`tests/tool-074-${s}.spec.ts`;c(`exists ${p}`,fs.existsSync(p))}
c('fixture',fs.existsSync('tests/fixtures/tool-074/cases.json'));
const core=fs.readFileSync('tests/tool-074-core.spec.ts','utf8');
const boundary=fs.readFileSync('tests/tool-074-boundary.spec.ts','utf8');
const limit=fs.readFileSync('tests/tool-074-limit.spec.ts','utf8');
c('browser rounded expected matches engine display',core.includes('44,174,941')&&!core.includes('44,174,942'));
c('boundary asserts visible result message',boundary.includes("getByTestId('tool074-result')")&&boundary.includes('0~100%')&&boundary.includes('12의 배수'));
c('limit asserts actual generic limit message',limit.includes("getByTestId('tool074-result')")&&limit.includes('Enter a valid number.'));
console.log(`TOOL074 HARNESS-STRUCTURE PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
