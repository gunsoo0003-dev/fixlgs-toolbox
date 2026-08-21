import fs from 'node:fs';
const paths=[
 'lib/tool-079-dividend-yield.ts',
 'components/tool-079-dividend-yield-calculator.tsx',
 'components/tool-079-dividend-yield-calculator-page.tsx',
 'app/[locale]/dividend-yield-calculator/page.tsx'
];
const pattern=/(api[_-]?key|secret|password\s*=|bearer\s+[a-z0-9._-]{12,})/i;
let scanned=0;
for(const p of paths){
 const s=fs.readFileSync(p,'utf8'); scanned++;
 if(pattern.test(s))throw new Error(`secret-like token ${p}`);
}
console.log(`TOOL079 SECRET SCAN PASS scanned=${scanned} findings=0`);
