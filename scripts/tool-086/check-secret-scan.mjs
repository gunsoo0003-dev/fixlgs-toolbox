import fs from 'node:fs';

const files=[
  'app/[locale]/deck-plywood-sheet-quantity-calculator/page.tsx',
  'components/tool-086-sheet-material-calculator.tsx',
  'components/tool-086-sheet-material-calculator-page.tsx',
  'lib/tool-086-sheet-material.ts',
  'tests/tool-086/tool-086-state-matrix.spec.ts',
  'tests/fixtures/tool-086/cases.json',
];
const secret=/(?:AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]{8,}['"])/i;
const findings=[];
for(const file of files){
  if(!fs.existsSync(file)) continue;
  const text=fs.readFileSync(file,'utf8');
  text.split(/\r?\n/).forEach((line,i)=>{
    if(secret.test(line)) findings.push(`${file}:${i+1}`);
  });
}
console.log(`SECRET_SCAN_FINDINGS=${findings.length}`);
for(const finding of findings) console.log(`FAIL ${finding}`);
process.exitCode=findings.length?1:0;
