#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v44-root-cause-isolation.mjs');
const s=fs.readFileSync(runner,'utf8');
const kt=fs.readFileSync(path.join(here,'tool-001-v44-native-template','MainActivity.kt'),'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}

check('default-7-each',/args\.repeats\|\|7/.test(s));
check('three-way-phases',
  /PHASE A: CHROME MINIMAL HTML/.test(s) &&
  /PHASE B: ANDROID NATIVE GET_CONTENT/.test(s) &&
  /PHASE C: ANDROID NATIVE PICK_IMAGES/.test(s));
check('samsung-removed',!/Samsung Internet PRECISION ROUND|connectSamsungCdp|runSamsungPrecision/i.test(s));
check('chrome-minimal-no-product',/No TOOL001 \/ React \/ Next\.js/.test(s) && /page\.setContent\(MINIMAL_HTML/.test(s));
check('chrome-visible-direct-input',/<input id="file" type="file"/.test(s) && /page\.locator\('#file'\)\.click/.test(s));
check('chrome-one-arraybuffer-read',((s.match(/file\.arrayBuffer\(\)/g)||[]).length===1));
check('chrome-fresh-page-per-round',/for\(let r=1;r<=repeats;r\+\+\)[\s\S]*?page=await context\.newPage\(\)/.test(s));
check('native-get-content',/Intent\(Intent\.ACTION_GET_CONTENT\)/.test(kt) && /EXTRA_MIME_TYPES/.test(kt));
check('native-pick-images',/Intent\(MediaStore\.ACTION_PICK_IMAGES\)/.test(kt));
check('native-direct-contentresolver',/openFileDescriptor\(uri, "r"\)/.test(kt));
check('native-single-byte-read-loop',/FileInputStream\(descriptor\.fileDescriptor\)/.test(kt));
check('native-no-read-retry',!/retry|reacquire|getFile\(\)/i.test(kt));
check('native-task-reset',/--activity-clear-task/.test(s) && /--activity-new-task/.test(s));
check('native-start-observed',/HARNESS_NATIVE_APP_START_NOT_OBSERVED/.test(s));
check('timeouts-are-harness',/HARNESS_DIAG_RESULT_TIMEOUT/.test(s) && /HARNESS_NATIVE_RESULT_TIMEOUT/.test(s));
check('harness-blocks-classification',/valid!==repeats\|\|g\.valid!==repeats\|\|p\.valid!==repeats/.test(s));
check('picker-timeout-call-only',/waitStablePickerOpen\(caseNo,'v39-source-exact',pickerStableTimeoutMs\)/.test(s));
check('picker-timeout-default-12s',/picker-timeout-ms'\]\|\|12000/.test(s));
check('one-photo01',/const c=candidates\[0\],b=c\.parsed;/.test(s) && /PHOTO_01 -> 사진첩 1번/.test(s));
check('no-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('per-round-full-logcat',/logcat-full\.txt/.test(s) && /logcat-filtered\.txt/.test(s));
check('uri-wm-lock-evidence',/uriPermissionWmLockErrors/.test(s));
check('three-way-classification',
  /CHROME_FILE_BRIDGE_STRONGLY_SUSPECTED/.test(s) &&
  /GET_CONTENT_URI_GRANT_OR_COMPAT_PATH_STRONGLY_SUSPECTED/.test(s) &&
  /ANDROID_PROVIDER_OR_LOWER_NATIVE_BOUNDARY_STRONGLY_SUSPECTED/.test(s));

for(const f of refs){
  const ref=fs.readFileSync(path.join(refDir,f),'utf8');
  const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);
  check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);
}

console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
