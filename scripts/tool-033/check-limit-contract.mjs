import fs from 'node:fs'; const p=fs.readFileSync('lib/tool-033-pdf-compressor.ts','utf8'); const t=fs.readFileSync('components/pdf-compressor-tool.tsx','utf8');let fail=0;
for(const [x,re] of [['single file',/maxFiles:\s*1/],['50 MiB approved',/maxFileBytes:\s*50 \* 1024 \* 1024/],['200 pages approved',/maxPages:\s*200/],['sequential render',/renderConcurrency:\s*1/]]){if(re.test(p))console.log('[PASS]',x);else{console.error('[FAIL]',x);fail++;}}
if(/TOOL033_SERVICE_LIMITS\.maxFileBytes/.test(t)&&/TOOL033_SERVICE_LIMITS\.maxPages/.test(t))console.log('[PASS] product uses policy constants');else{console.error('[FAIL] product limit policy link');fail++;}
console.log('[INFO] Approved TOOL033 limits: 50 MiB / 200 pages / render concurrency 1.');process.exitCode=fail?1:0;
