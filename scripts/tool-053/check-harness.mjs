import fs from 'node:fs';
let pass=0,fail=0;
const c=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'} ${name}`);ok?pass++:fail++;};
const specs=["preflight", "core", "feature", "timezone", "boundary", "regression", "limit"];
for(const s of specs){
  const f=`tests/tool-053-${s}.spec.ts`;
  c(`spec ${s}`,fs.existsSync(f));
  if(fs.existsSync(f)){
    const src=fs.readFileSync(f,'utf8');
    c(`spec ${s} no skip/fixme/only`,!/(test|describe)\.(skip|fixme|only)\s*\(/.test(src));
  }
}
c('secret scan exists',fs.existsSync('scripts/tool-053/check-secret-scan.mjs'));
const staticRunner=fs.readFileSync('scripts/tool-053/run-static-validation.mjs','utf8');
c('secret scan in static runner',staticRunner.includes('check-secret-scan.mjs'));
const fullRunner=fs.readFileSync('scripts/tool-053/run-validation-full.mjs','utf8');
c('secret scan in full final',fullRunner.includes("run('secret-scan'")&&fullRunner.includes('check-secret-scan.mjs'));
for(const m of ["preflight", "core-only", "feature-only", "timezone-only", "boundary-only", "regression-only", "limit-only", "final"])c(`runner ${m}`,fullRunner.includes(`'${m}'`)||fullRunner.includes(`\"${m}\"`));
const cfg=fs.readFileSync('playwright.tool053.config.ts','utf8');
c('desktop project',cfg.includes('desktop-chromium'));
c('mobile project',cfg.includes('mobile-chromium'));
c('isolated port 41753',cfg.includes('41753'));
c('route exists',fs.existsSync('app/[locale]/unix-timestamp-converter/page.tsx'));
console.log(`RESULT HARNESS PASS=${pass} FAIL=${fail}`);
if(fail)process.exit(1);
