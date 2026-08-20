import fs from 'node:fs';
const product=fs.readFileSync('components/tool-069-break-even-calculator.tsx','utf8');
const dynamicPrefixes=['tool069-mode-'];
for(const f of ['tests/tool-069-preflight.spec.ts','tests/tool-069-core.spec.ts','tests/tool-069-feature.spec.ts','tests/tool-069-boundary.spec.ts','tests/tool-069-limit.spec.ts']){
 const s=fs.readFileSync(f,'utf8');
 for(const m of s.matchAll(/getByTestId\('([^']+)'\)/g)){
  const id=m[1];
  const dynamic=dynamicPrefixes.some(p=>id.startsWith(p)&&product.includes('data-testid={`tool069-mode-${id}`}'));
  if(!product.includes(id)&&!dynamic){console.error('selector mismatch',f,id);process.exit(1)}
 }
}
console.log('PASS harness structure (literal + declared dynamic testids)');
