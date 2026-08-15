#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const reg=JSON.parse(fs.readFileSync(path.join(root,'scripts/tool-031/mobile-runner-registration.json'),'utf8'));
const errors=[];
for(const [k,v] of Object.entries({number:'031',slug:'pdf-page-number-watermark',fileInput:'[data-testid="tool031-file-input"]',create:'[data-testid="tool031-create"]',result:'[data-testid="tool031-result"]',download:'[data-testid="tool031-download"]'})) if(reg[k]!==v) errors.push(`${k} mismatch`);
const src=fs.readFileSync(path.join(root,'components/pdf-page-number-watermark-tool.tsx'),'utf8');
for(const selector of [reg.fileInput,reg.create,reg.result,reg.download]){const id=selector.match(/"([^"]+)"/)?.[1];if(!id||!src.includes(id))errors.push(`selector absent: ${selector}`)}
if(errors.length){for(const e of errors)console.error('[FAIL]',e);process.exit(1)}
console.log('[PASS] TOOL031 HARNESS STRUCTURE READY');
