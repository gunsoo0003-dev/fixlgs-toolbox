import fs from 'node:fs';
const files=['lib/tool-078-stock-average-cost.ts','components/tool-078-stock-average-cost-calculator.tsx','components/tool-078-stock-average-cost-calculator.module.css','components/tool-078-stock-average-cost-calculator-page.tsx','app/[locale]/stock-average-cost-calculator/page.tsx'];
for(const f of files){if(!fs.existsSync(f))throw new Error(`missing ${f}`)}
const all=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['tool078-root','tool078-average-cost','tool078-target-sell','stock-average-cost-calculator','Average Cost = Total Cost ÷ Total Shares','078 · BUSINESS & FINANCE'])if(!all.includes(token))throw new Error(`missing token ${token}`);
for(const forbidden of ['fetch(','axios','http://','https://api.'])if(all.includes(forbidden))throw new Error(`external/network token ${forbidden}`);
console.log('TOOL078 SOURCE PASS');
