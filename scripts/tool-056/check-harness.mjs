import fs from 'node:fs';let pass=0,fail=0;const c=(n,v)=>{console.log(`${v?'PASS':'FAIL'} ${n}`);v?pass++:fail++;};const read=p=>fs.readFileSync(p,'utf8');
const tool=read('components/tool-056-weight-temperature-pressure-converter.tsx');const specs=['preflight','design','core','feature','temperature','pressure','mass','boundary','regression','limit'];
for(const s of specs){const p=`tests/tool-056-${s}.spec.ts`;c(`spec ${s}`,fs.existsSync(p));if(fs.existsSync(p))c(`spec ${s} no skip/fixme/only`,!/(test|describe)\.(skip|fixme|only)\s*\(/.test(read(p)))}
for(const id of ['tool056-root','tool056-workspace','tool056-value','tool056-from','tool056-to','tool056-swap','tool056-reset','tool056-copy','tool056-precision','tool056-result','tool056-main-result','tool056-summary'])c(`selector ${id}`,tool.includes(`data-testid="${id}"`));
c('fixture source independent',read('tests/fixtures/tool-056/cases.json').includes('NIST')&&!read('tests/fixtures/tool-056/cases.json').includes('import'));
c('no prior tool residue outside intentional regression',specs.filter(s=>!['regression','design'].includes(s)).every(s=>!/tool055-|TOOL055/.test(read(`tests/tool-056-${s}.spec.ts`))));
console.log(`RESULT HARNESS_STRUCTURE PASS=${pass} FAIL=${fail}`);if(fail)process.exit(1);
