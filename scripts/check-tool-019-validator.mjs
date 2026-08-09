import { readFileSync } from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
const limits=read('lib/tool-019-service-limits.ts');
const tool=read('components/youtube-thumbnail-maker-tool.tsx');
const core=read('tests/tool-019-core.spec.ts');
const boundary=read('tests/tool-019-boundary.spec.ts');
const limit=read('tests/tool-019-limit.spec.ts');
const regression=read('tests/tool-019-regression.spec.ts');
const helper=read('tests/helpers/tool-019.ts');
let failed=false;
const requireToken=(name,text,token,kind='HARNESS_ERROR')=>{if(!text.includes(token)){console.error(`[${kind}] ${name} missing: ${token}`);failed=true;}};
for(const token of ['maxFileBytes: 20 * 1024 * 1024','maxPixels: 40_000_000','maxSide: 10000','maxTitleChars: 120','maxSubtitleChars: 200','maxHistory: 25']) requireToken('service limit',limits,token,'PRODUCT_FAIL');
for(const token of ['20*1024*1024','40_000_000','10000','120','200']) requireToken('limit spec',limit,token);
for(const token of ['tool019Root','tool019TextPanel','TOOL019_TESTIDS']) requireToken('helper',helper,token);
for(const token of ['actual output contains title/subtitle/outline/shadow pixels','background crop and zoom alter actual downloaded pixels','high resolution output is actual 3840x2160']) requireToken('core coverage',core,token);
for(const token of ['test-fixtures/corrupt.jpg','MIME mismatch','animated WebP','multilingual filenames']) requireToken('boundary coverage',boundary,token);
for(const token of ['protected existing routes still respond','new KO EN JA routes respond','content image category links to 019','related tool links point only to existing protected tools']) requireToken('regression coverage',regression,token);
for(const [name,text] of [['core',core],['boundary',boundary],['limit',limit]]){
  if(/\.first\(\)/.test(text)){console.error(`[HARNESS_ERROR] ${name} still uses .first() selector workaround`);failed=true;}
}
if(/page\.getByRole\(['"]alert['"]/.test(boundary)){console.error('[HARNESS_ERROR] boundary alert selector is not scoped to tool019 root');failed=true;}
if(/page\.getByText\(/.test(core+boundary)){console.error('[HARNESS_ERROR] unscoped page.getByText remains in core/boundary');failed=true;}
if(!tool.includes('data-max-file-bytes={TOOL019_SERVICE_LIMITS.maxFileBytes}')||!tool.includes('data-max-pixels={TOOL019_SERVICE_LIMITS.maxPixels}')){console.error('[PRODUCT_FAIL] UI service-limit metadata does not derive from TOOL019_SERVICE_LIMITS');failed=true;}
console.log(`019 VALIDATOR CHECK: ${failed?'FAIL':'PASS'}`);
process.exit(failed?2:0);
