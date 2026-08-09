import fs from 'node:fs';
const required=[
  'app/tool020-harness/page.tsx','tests/helpers/tool-020.ts',
  'tests/tool-020-preflight.spec.ts','tests/tool-020-core.spec.ts','tests/tool-020-boundary.spec.ts','tests/tool-020-regression.spec.ts','tests/tool-020-limit.spec.ts'
];
let ok=true;
for(const f of required){if(!fs.existsSync(f)){console.error(`[HARNESS_ERROR] missing ${f}`);ok=false}}
if(!ok){console.log('TOOL020 HARNESS CHECK FAIL');process.exit(1)}
const helper=fs.readFileSync('tests/helpers/tool-020.ts','utf8');
const tool=fs.readFileSync('components/youtube-channel-banner-tool.tsx','utf8');
const testIds=[...helper.matchAll(/(?:root|backgroundInput|drop|startBlank|preview|title|logoInput|error|output|fileSize|download|checkSize|fitLimit|bgZoom):'([^']+)'/g)].map(m=>m[1]);
for(const id of testIds){
  if(!tool.includes(`data-testid="${id}"`)){
    // preview mode ids are generated dynamically and are checked separately.
    console.error(`[HARNESS_ERROR] selector contract drift: ${id} is declared by helper but missing from current TOOL020 DOM source`);ok=false;
  }
}
for(const token of ['tool020-preview-${id}']){if(!tool.includes(token)){console.error(`[HARNESS_ERROR] dynamic selector contract drift: ${token}`);ok=false}}
for(const f of required.filter(x=>x.endsWith('.spec.ts'))){const s=fs.readFileSync(f,'utf8');if(!s.includes('test(')&&!s.includes('test.describe')){console.error(`[HARNESS_ERROR] no test discovery in ${f}`);ok=false}}
console.log(ok?'TOOL020 HARNESS CHECK PASS':'TOOL020 HARNESS CHECK FAIL');process.exit(ok?0:1);
