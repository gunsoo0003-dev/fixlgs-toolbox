#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v43-root-cause-isolation.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}
check('default-7',/args\.repeats\|\|7/.test(s));
check('samsung-removed',!/Samsung Internet PRECISION ROUND|connectSamsungCdp|runSamsungPrecision/.test(s));
check('chrome-minimal-no-product-url',/PHASE A: CHROME MINIMAL HTML BYTE READ/.test(s)&&/page\.setContent\(MINIMAL_HTML/.test(s)&&/One picker selection, one arrayBuffer read/.test(s));
check('chrome-single-read',(/file\.arrayBuffer\(\)/g.test(s))&&((s.match(/file\.arrayBuffer\(\)/g)||[]).length===1));
check('native-contentresolver-direct',/openFileDescriptor\(uri, "r"\)/.test(fs.readFileSync(path.join(here,'tool-001-v43-native-template','MainActivity.kt'),'utf8')));
check('native-single-picker',/launchPickerOnce/.test(fs.readFileSync(path.join(here,'tool-001-v43-native-template','MainActivity.kt'),'utf8')));
check('native-no-read-retry',!/retry|reacquire|getFile\(\)/i.test(fs.readFileSync(path.join(here,'tool-001-v43-native-template','MainActivity.kt'),'utf8')));
check('harness-separated',/HARNESS_FAIL is never counted/.test(s)&&/harnessFail/.test(s));
check('same-v39-photo01-wrapper',/waitStablePickerOpen\(caseNo,'v39-source-exact',6500\)/.test(s)&&/autoSelectPickerMediaV38\(caseNo,'PHOTO_01',1,null\)/.test(s));
for(const f of refs){
  const ref=fs.readFileSync(path.join(refDir,f),'utf8');
  const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);
  check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);
}
check('one-photo-selection-function',/const c=candidates\[0\],b=c\.parsed;/.test(s)&&/PHOTO_01 -> 사진첩 1번/.test(s));
check('no-photo-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('logcat-per-round',/logcat-full\.txt/.test(s)&&/logcat-filtered\.txt/.test(s));
check('classification',/CHROME_ANDROID_FILE_BRIDGE_STRONGLY_SUSPECTED/.test(s)&&/ANDROID_PROVIDER_OR_LOWER_NATIVE_BOUNDARY_STRONGLY_SUSPECTED/.test(s));
console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
