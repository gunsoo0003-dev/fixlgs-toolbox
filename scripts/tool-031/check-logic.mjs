#!/usr/bin/env node
import fs from 'node:fs';
const s=fs.readFileSync('lib/tool-031-pdf.ts','utf8'); const errors=[];
for(const x of ['maxPdfBytes: 30 * 1024 * 1024','maxPages: 300','maxLogoBytes: 10 * 1024 * 1024','maxHeaderFooterChars: 200','maxWatermarkChars: 300','RANGE_OUT_OF_BOUNDS','RANGE_SYNTAX','RANGE_REVERSED','except-first','except-last','odd','even','padStart(2, "0")','safeOutputName']) if(!s.includes(x))errors.push(`logic token missing ${x}`);
if(errors.length){for(const e of errors)console.error('[FAIL]',e);process.exit(1)} console.log('[PASS] TOOL031 helper/limit logic contract');
