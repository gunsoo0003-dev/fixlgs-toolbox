import fs from 'node:fs';
const files=['lib/tool-069-break-even-point.ts','components/tool-069-break-even-point-calculator.tsx','components/tool-069-break-even-point-calculator-page.tsx','app/[locale]/break-even-point-calculator/page.tsx'].filter(fs.existsSync);
const text=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const patterns=[/sk-[A-Za-z0-9_-]{20,}/,/AIza[0-9A-Za-z_-]{20,}/,/BEGIN PRIVATE KEY/,/api[_-]?key\s*[:=]\s*['"][^'"]+/i,/Bearer\s+[A-Za-z0-9._-]{20,}/];
const hits=patterns.filter(p=>p.test(text));
console.log(hits.length?`FAIL secret-like token (${hits.length})`:'PASS no secret-like token');
process.exitCode=hits.length?1:0;
