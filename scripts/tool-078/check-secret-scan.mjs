import fs from 'node:fs';
const paths=['lib/tool-078-stock-average-cost.ts','components/tool-078-stock-average-cost-calculator.tsx','components/tool-078-stock-average-cost-calculator-page.tsx','app/[locale]/stock-average-cost-calculator/page.tsx'];
const pattern=/(api[_-]?key|secret|password\s*=|bearer\s+[a-z0-9._-]{12,})/i;
for(const p of paths){const s=fs.readFileSync(p,'utf8');if(pattern.test(s))throw new Error(`secret-like token ${p}`)}
console.log('TOOL078 SECRET SCAN PASS');
