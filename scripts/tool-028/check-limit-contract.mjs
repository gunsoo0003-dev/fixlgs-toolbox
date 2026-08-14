import fs from 'node:fs';
let fail=0; const check=(ok,msg)=>{console.log(`${ok?'[PASS]':'[FAIL]'} ${msg}`);if(!ok)fail++;};
const policy=fs.readFileSync('lib/tool-028-pdf-policy.ts','utf8');
const tool=fs.readFileSync('components/merge-pdf-tool.tsx','utf8');
const spec=fs.readFileSync('tests/tool-028-limit.spec.ts','utf8');
for(const [token,label] of [
  ['maxFiles: 20','maxFiles=20'],
  ['maxFileBytes: 30 * 1024 * 1024','maxFileBytes=30MiB'],
  ['maxTotalBytes: 100 * 1024 * 1024','maxTotalBytes=100MiB'],
  ['maxTotalPages: 300','maxTotalPages=300'],
  ['previewConcurrency: 1','previewConcurrency=1'],
]) check(policy.includes(token),`approved policy ${label}`);
for(const token of ['data-max-files','data-max-file-bytes','data-max-total-bytes','data-max-total-pages','data-preview-concurrency']) check(tool.includes(token),`live DOM limit contract ${token}`);
check(tool.includes('서비스 한도: 최대 20개 · 파일당 30MB · 총 100MB · 총 300페이지.'),'KO approved limit copy');
check(tool.includes('Service limits: 20 files · 30MB each · 100MB total · 300 pages total.'),'EN approved limit copy');
check(tool.includes('サービス上限: 最大20ファイル・1ファイル30MB・合計100MB・合計300ページ。'),'JA approved limit copy');
check(!/(후보 한도|candidate limits|候補上限|limit 검수 승인 후|limit-review approval)/.test(tool),'no pre-approval wording remains in product');
for(const token of ["data-max-files', '20'","30 * MiB","100 * MiB","'300'","data-preview-concurrency', '1'","accepts 20 files and rejects the 21st","exceed 100MiB total","accepts 300 total pages"]) check(spec.includes(token),`limit spec contract ${token}`);
process.exit(fail?1:0);
