import fs from 'node:fs';
const files=['lib/tool-073-deposit-savings.ts','components/tool-073-deposit-savings-calculator.tsx','components/tool-073-deposit-savings-calculator-page.tsx'];
const patterns=[/api[_-]?key\s*[:=]/i,/secret\s*[:=]/i,/bearer\s+[a-z0-9._-]{12,}/i,/https?:\/\/[^'"`\s]+\/api\//i];const hits=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(const p of patterns)if(p.test(text))hits.push(`${file}:${p}`)}console.log(JSON.stringify({check:'TOOL073 secret/network scan',hits},null,2));process.exitCode=hits.length?1:0;
