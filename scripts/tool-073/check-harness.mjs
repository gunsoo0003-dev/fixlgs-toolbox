import fs from 'node:fs';
const specs=['preflight','core','feature','deposit','savings','aftertax','term','boundary','regression','limit'];
const failures=[];for(const s of specs){const p=`tests/tool-073-${s}.spec.ts`;if(!fs.existsSync(p))failures.push(`missing:${p}`)}
const fixturePath='tests/fixtures/tool-073/cases.json';if(!fs.existsSync(fixturePath))failures.push('missing:fixture');
else{const f=JSON.parse(fs.readFileSync(fixturePath,'utf8'));if(f.core?.find(x=>x.id==='deposit-10m-3pct-12m')?.grossInterest!==300000)failures.push('fixture:deposit');if(f.core?.find(x=>x.id==='savings-500k-3pct-12m')?.grossInterest!==97500)failures.push('fixture:savings');if(f.afterTax?.afterTaxInterest!==270000)failures.push('fixture:aftertax');if(f.limits?.maxMonths!==1200)failures.push('fixture:limit')}

const regression=fs.readFileSync('tests/tool-073-regression.spec.ts','utf8');if(!regression.includes('percentage-percent-change-calculator')||regression.includes("'percentage-change-calculator'"))failures.push('regression:stale-tool061-slug');
console.log(JSON.stringify({check:'TOOL073 harness-structure',specs:specs.length,failures},null,2));process.exitCode=failures.length?1:0;
