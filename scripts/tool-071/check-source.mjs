import fs from 'node:fs';
const required=['lib/tool-071-ad-sales-performance.ts','components/tool-071-ad-sales-performance-calculator.tsx','components/tool-071-ad-sales-performance-calculator-page.tsx','components/tool-071-ad-sales-performance-calculator.module.css','app/[locale]/ad-sales-performance-calculator/page.tsx','tests/fixtures/tool-071/cases.json','playwright.tool071.config.ts'];let pass=0,fail=0;
function check(name,ok){console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++}
for(const f of required)check(`exists ${f}`,fs.existsSync(f));
const engine=fs.readFileSync(required[0],'utf8');for(const token of ["'ctr'|'cpc'|'cpm'|'cvr'|'cac'|'roas'|'roi'|'aov'",'ZERO_DENOMINATOR','maxAmount:1e15','maxCount:1e12','maxDisplayPrecision:8','clicks / impressions × 100','ad spend / clicks','ad spend / impressions × 1,000','conversions / clicks × 100','acquisition spend / new customers','attributed revenue / ad spend','(return - cost) / cost × 100','revenue / orders'])check(`engine ${token}`,engine.includes(token));
const ui=fs.readFileSync(required[1],'utf8');for(const token of ['tool071-root','tool071-input-a','tool071-input-b','tool071-result','tool071-denominator','tool071-error','tool071-compare-${prefix}-result','tool071-precision','navigator.clipboard'])check(`ui ${token}`,ui.includes(token));
const route=fs.readFileSync(required[4],'utf8');for(const token of ['canonical','x-default','/ko/ad-sales-performance-calculator','/en/ad-sales-performance-calculator','/ja/ad-sales-performance-calculator'])check(`route ${token}`,route.includes(token));
check('no network API',!ui.includes('fetch(')&&!ui.includes('axios')&&!ui.includes('XMLHttpRequest'));
console.log(`RESULT SOURCE PASS=${pass} FAIL=${fail} TOOL=071`);process.exitCode=fail?1:0;
