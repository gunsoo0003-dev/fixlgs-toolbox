import fs from 'node:fs';
const files=['lib/tool-020-youtube-banner.ts','tests/helpers/tool-020.ts','tests/tool-020-preflight.spec.ts','tests/tool-020-core.spec.ts','tests/tool-020-boundary.spec.ts','tests/tool-020-regression.spec.ts','tests/tool-020-limit.spec.ts'];
let ok=true;
for(const f of files){if(!fs.existsSync(f)){console.error(`[HARNESS_ERROR] TOOL020 VALIDATOR missing ${f}`);ok=false}}
if(!ok){console.log('TOOL020 VALIDATOR FAIL');process.exit(1)}
const policy=fs.readFileSync('lib/tool-020-youtube-banner.ts','utf8');
for(const token of ['2560','1440','2048','1152','1235','338','6 * 1024 * 1024','backgroundMaxBytes: 20 * 1024 * 1024','logoMaxBytes: 5 * 1024 * 1024','maxSourcePixels: 40_000_000','maxTitleChars: 120','maxHistoryStates: 24']){
  if(!policy.includes(token)){console.error(`[HARNESS_ERROR] TOOL020 validator policy expectation drift: ${token}`);ok=false}
}
const helper=fs.readFileSync('tests/helpers/tool-020.ts','utf8');
for(const token of ['PRODUCT_FAIL','HARNESS_ERROR','initial-state selector','editor-state selector','TOOL020_PREVIEW_MODES']){
  if(!helper.includes(token)){console.error(`[HARNESS_ERROR] TOOL020 helper missing classification/state contract: ${token}`);ok=false}
}
console.log(ok?'TOOL020 VALIDATOR PASS':'TOOL020 VALIDATOR FAIL');process.exit(ok?0:1);
