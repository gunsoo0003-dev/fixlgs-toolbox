import fs from 'node:fs';
const page=fs.readFileSync('app/[locale]/category/[categorySlug]/page.tsx','utf8');
let pass=0,fail=0;const check=(n,o)=>{console.log(`${o?'PASS':'FAIL'} ${n}`);o?pass++:fail++};
check('business offset starts at 066',page.includes('categorySlug === "business-finance" ? index + 66 : index + 1'));
check('business uses three-digit label',page.includes('categorySlug === "business-finance") ? String(toolNumber).padStart(3, "0")'));
console.log(`RESULT BUSINESS CATEGORY NUMBERING PASS=${pass} FAIL=${fail}`);process.exitCode=fail?1:0;
