import { existsSync, readFileSync } from 'node:fs';
const product = readFileSync('lib/image-metadata.ts','utf8');
const ui = readFileSync('components/image-metadata-checker-tool.tsx','utf8');
const config = readFileSync('tests/config/tool-018-limit-candidates.ts','utf8');
const extract = (text,key) => {
  const m = new RegExp(`${key}:\\s*([0-9_ *]+)`).exec(text);
  if (!m) return null;
  try { return Function(`return (${m[1].replaceAll('_','')})`)(); } catch { return null; }
};
const keys=['maxFiles','maxFileBytes','maxTotalBytes','maxPixels'];
let failed=false;
for(const key of keys){
  const a=extract(product,key),b=extract(config,key);
  if(a==null||b==null||a!==b){console.error(`[HARNESS_ERROR] limit expectation mismatch ${key}: product=${a} test=${b}`);failed=true;}
  else console.log(`${key}=${a} - product/test static cross-check PASS`);
}
// UI must derive service-limit display/error values from product constants, not duplicate 15/100/48 literals.
for (const token of [
  'const MAX_FILE_MB = TOOL018_LIMITS.maxFileBytes / 1024 / 1024',
  'const MAX_TOTAL_MB = TOOL018_LIMITS.maxTotalBytes / 1024 / 1024',
  'const MAX_MP = TOOL018_LIMITS.maxPixels / 1_000_000',
  '${MAX_FILE_MB}', '${MAX_TOTAL_MB}', '${MAX_MP}',
]) if (!ui.includes(token)) { console.error(`[HARNESS_ERROR] UI limit derivation missing: ${token}`); failed=true; }
if (/['"`]([^'"`]*\b(?:15\s*MB|100\s*MB|48\s*MP)\b[^'"`]*)['"`]/i.test(ui.replace(/\$\{MAX_(?:FILE_MB|TOTAL_MB|MP)\}/g,''))) {
  console.error('[HARNESS_ERROR] direct service-limit numeric hardcode remains in tool UI source'); failed=true;
}
const sourceMap = readFileSync('tests/config/tool-018-limit-candidates.ts','utf8');
for (const key of keys) if (!sourceMap.includes(`${key}:`)) { console.error(`[HARNESS_ERROR] limit source missing: ${key}`); failed=true; }

const core=readFileSync('tests/tool-018-core.spec.ts','utf8');
for(const v of ['36.01900000','129.34350000','-36.01900000','-129.34350000','300.00 × 300.00 PPI','DPI·PPI 정보 없음','2.54 × 2.03 cm','1/250 s','0.07 MP','5:4','2026-08-08','24–70 mm · f/2.8–2.8','Pattern','data-clean-gps','data-clean-exif-orientation','data-clean-icc','data-clean-xmp','없음 → 없음']) if(!core.includes(v)){console.error(`[HARNESS_ERROR] core expectation missing: ${v}`);failed=true;}
const boundary=readFileSync('tests/tool-018-boundary.spec.ts','utf8');
for(const v of ['malformedExif','EXIF IFD offset is outside the file','headerOnlyCorrupt','PPI는 1~2400 사이의 값을 입력해 주세요.','duplicate-clean-2.jpg','tool018-download-zip']) if(!boundary.includes(v)){console.error(`[HARNESS_ERROR] boundary expectation missing: ${v}`);failed=true;}
const limit=readFileSync('tests/tool-018-limit.spec.ts','utf8');
for(const v of ['maxFiles - 1','maxFiles + 1','maxFileBytes','exactErrors','maxTotalBytes - 1','maxTotalBytes + 1','TOTAL_TOO_LARGE','candidateWidth - 1','candidateWidth + 1','48.00 MP','이미지 해상도가 기본 서비스 범위를 넘었습니다.']) if(!limit.includes(v)){console.error(`[HARNESS_ERROR] limit expectation missing: ${v}`);failed=true;}
const regression=readFileSync('tests/tool-018-regression.spec.ts','utf8');
for(const v of ['canonical','hreflang','x-default','image-edit category','/ko/image-metadata-checker','BreadcrumbList','/ko/web-image-optimizer','/ko/image-compressor','/ko/image-resizer']) if(!regression.includes(v)){console.error(`[HARNESS_ERROR] regression expectation missing: ${v}`);failed=true;}
for (const file of ['test-fixtures/tool-018/header-only-corrupt.jpg','test-fixtures/tool-018/extended-exif.jpg','test-fixtures/tool-018/ppi-cm.jpg','test-fixtures/tool-018/metadata-icc.png','test-fixtures/tool-018/metadata-icc.webp']) if(!existsSync(file)){console.error(`[HARNESS_ERROR] fixture missing: ${file}`);failed=true;}
console.log(`018 VALIDATOR CHECK: ${failed?'FAIL':'PASS'}`);
process.exit(failed?2:0);
