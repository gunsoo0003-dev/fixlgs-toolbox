#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v42-browser-boundary-ab.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}
check('default-7',/args\.repeats\|\|7/.test(s));
check('browser-targets',/Chrome/.test(s)&&/Samsung Internet/.test(s));
check('old-photo01-cell-logic-removed',!s.includes('HARNESS_FAIL:PHOTO01_CELL_NOT_FOUND'));
check('v39-wrapper-calls-exact-functions',/waitStablePickerOpen\(caseNo,'v39-source-exact',6500\)/.test(s)&&/autoSelectPickerMediaV38\(caseNo,'PHOTO_01',1,null\)/.test(s));
for(const f of refs){
  const ref=fs.readFileSync(path.join(refDir,f),'utf8');
  const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);
  check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);
}
check('one-photo-selection-function',/const c=candidates\[0\],b=c\.parsed;/.test(s)&&/PHOTO_01 -> 사진첩 1번/.test(s));
check('no-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('user-preview-ground-truth',/naturalWidth>0&&i\.naturalHeight>0/.test(s));
console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
