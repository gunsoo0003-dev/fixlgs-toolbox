import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const expected={
  'test:toolbox:021-preflight':'node scripts/tool-021/run-validation.mjs preflight',
  'test:toolbox:021-core-only':'node scripts/tool-021/run-validation.mjs core-only',
  'test:toolbox:021-boundary-only':'node scripts/tool-021/run-validation.mjs boundary-only',
  'test:toolbox:021-feature-only':'node scripts/tool-021/run-validation.mjs feature-only',
  'test:toolbox:021-regression-only':'node scripts/tool-021/run-validation.mjs regression-only',
  'test:toolbox:021-limit-only':'node scripts/tool-021/run-validation.mjs limit-only',
  'test:toolbox:021-final':'node scripts/tool-021/run-validation.mjs final',
};
const required=[
  'scripts/tool-021/run-validation.mjs','scripts/tool-021/runtime-workspace.mjs','playwright.tool021-runtime.config.ts',
  'tests/tool-021-core.spec.ts','tests/tool-021-boundary.spec.ts','tests/tool-021-design.spec.ts','tests/tool-021-regression.spec.ts','tests/tool-021-limit.spec.ts',
  'components/social-media-image-maker-tool.tsx'
];
let fail=0;
for(const [name,cmd] of Object.entries(expected)){
  const ok=pkg.scripts?.[name]===cmd;
  console.log(`${ok?'PASS':'FAIL'} npm-script ${name}${ok?'':` expected=${cmd} actual=${pkg.scripts?.[name]??'<missing>'}`}`);
  if(!ok) fail++;
}
for(const rel of required){ const ok=fs.existsSync(path.join(root,rel)); console.log(`${ok?'PASS':'FAIL'} file ${rel}`); if(!ok) fail++; }
const source=fs.readFileSync(path.join(root,'components/social-media-image-maker-tool.tsx'),'utf8');
for(const hook of ['tool021-root','tool021-start-blank','tool021-background-input','tool021-logo-input','tool021-scope-preset','tool021-title-x','tool021-background-x','tool021-download-current','tool021-download-zip']){
  const ok=source.includes(hook); console.log(`${ok?'PASS':'FAIL'} dom-hook ${hook}`); if(!ok) fail++;
}
const tests=['tests/tool-021-core.spec.ts','tests/tool-021-boundary.spec.ts','tests/tool-021-design.spec.ts','tests/tool-021-limit.spec.ts'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
for(const bad of ["locator('input[type=file]').first()","locator('input[type=file]').nth(1)"]){
  const ok=!tests.includes(bad); console.log(`${ok?'PASS':'FAIL'} fragile-selector ${bad}`); if(!ok) fail++;
}
console.log(`TOOL 021 runner contract: ${fail===0?'PASS':'FAIL'} (${fail} issue${fail===1?'':'s'})`);
process.exit(fail===0?0:1);
