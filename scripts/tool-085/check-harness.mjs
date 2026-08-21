import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tool-085/cases.json','utf8'));
const spec=fs.readFileSync('tests/tool-085/tool-085-state-matrix.spec.ts','utf8');
const comp=fs.readFileSync('components/tool-085-floor-material-calculator.tsx','utf8');
const selectors=['tool085-root','tool085-floor-area','tool085-required-units','tool085-box-count','tool085-reset'];
let f=0,total=0;
for(const s of selectors){total++;const ok=comp.includes(s)&&spec.includes(s);console.log(ok?'PASS':'FAIL','selector',s);if(!ok)f++;}
total++;const dynamicMaterial=comp.includes('tool085-material-${m}')&&spec.includes('tool085-material-tile');console.log(dynamicMaterial?'PASS':'FAIL','dynamic material selector contract');if(!dynamicMaterial)f++;
for(const k of ['tile','wood','vinyl','errors','limits']){total++;const ok=Object.hasOwn(fixture,k);console.log(ok?'PASS':'FAIL','fixture',k);if(!ok)f++;}
total++;const stale=/tool0(?:6[1-9]|7\d|8[0-4])-/.test(spec);console.log(!stale?'PASS':'FAIL','no stale prior selector');if(stale)f++;
console.log(`HARNESS PASS=${total-f} FAIL=${f}`);process.exitCode=f?1:0;
