import fs from 'node:fs';
const specs=['tests/tool-022-preflight.spec.ts','tests/tool-022-core.spec.ts','tests/tool-022-boundary.spec.ts','tests/tool-022-regression.spec.ts','tests/tool-022-limit.spec.ts'];
const fixtures=['landscape.jpg','portrait.jpg','square.jpg','transparent.png','tiny.jpg','corrupted.jpg','logo.png'];
let fail=false;
for(const f of specs){const ok=fs.existsSync(f)&&fs.statSync(f).size>100;console.log(`${ok?'PASS':'FAIL'} ${f}`);if(!ok)fail=true;}
for(const n of fixtures){const f=`tests/fixtures/tool-022/${n}`,ok=fs.existsSync(f)&&fs.statSync(f).size>0;console.log(`${ok?'PASS':'FAIL'} ${f}`);if(!ok)fail=true;}
const core=fs.readFileSync('tests/tool-022-core.spec.ts','utf8');
for(const token of ['1200,height:630','storedZipEntries','tool022-download-zip','title x']){const ok=core.includes(token);console.log(`${ok?'PASS':'FAIL'} core:${token}`);if(!ok)fail=true;}
process.exit(fail?1:0);
