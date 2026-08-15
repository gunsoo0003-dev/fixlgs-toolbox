#!/usr/bin/env node
import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('package.json','utf8')); const lock=fs.readFileSync('package-lock.json','utf8'); const errors=[];
if(p.dependencies?.['pdf-lib']!=='1.17.1')errors.push('package pdf-lib 1.17.1 missing'); if(!lock.includes('node_modules/pdf-lib'))errors.push('lock pdf-lib missing');
for(const k of ['test:toolbox:031-preflight','test:toolbox:031-core-only','test:toolbox:031-boundary-only','test:toolbox:031-feature-only','test:toolbox:031-regression-only','test:toolbox:031-limit-only','test:toolbox:031-final','check:toolbox:mobile-real-photo-001-031','test:toolbox:031-mobile-real']) if(!p.scripts?.[k])errors.push(`script missing ${k}`);
if(errors.length){for(const e of errors)console.error('[FAIL]',e);process.exit(1)} console.log('[PASS] TOOL031 package/scripts contract');
