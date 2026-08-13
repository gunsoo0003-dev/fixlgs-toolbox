#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v54-squoosh-chrome-baseline.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}
check('default-7',/args\.repeats\|\|7/.test(s));
check('squoosh-production-target',/const SQUOOSH_URL='https:\/\/squoosh\.app\/'/.test(s));
check('chrome-only',/const CHROME_PKG='com\.android\.chrome'/.test(s)&&!/org\.mozilla\.firefox|com\.sec\.android\.app\.sbrowser/.test(s));
check('product-code-none',/PRODUCT_CODE=NONE/.test(s)&&/External Squoosh production site only/.test(s));
check('visible-squoosh-open-one-click',/input\[type=file\] ~ div button/.test(s)&&/await btn\.click\(\{timeout:5000\}\)/.test(s)&&!/await btn\.tap\(/.test(s));
check('no-hidden-input-bypass',!/setInputFiles\s*\(|showPicker\s*\(|querySelector\([^)]*input\[type=file\][^)]*\)\.click\s*\(/.test(s));
check('intent-resolver-exact-photos-videos-once',/com\.android\.intentresolver/.test(s)&&/사진 및 동영상/.test(s)&&/CHOOSER TAP/.test(s));
check('photo01-one-selection',/autoSelectPickerMediaV38\(caseNo,'PHOTO_01',1,null\)/.test(s)&&/PHOTO01_FILENAME/.test(s));
check('documentsui-exact-name-only',/HARNESS_DOCUMENTSUI_PHOTO01_EXACT_NOT_VISIBLE/.test(s)&&/label\.includes\(PHOTO01_FILENAME\)/.test(s)&&!/input','swipe|searchPhoto|alternatePhoto|tapAlternatePhoto|pickerFallbackPoints|PHOTO_GRID_COORDINATE_FALLBACK/i.test(s));
check('no-provider-byte-read',!/new\s+FileReader\s*\(|\.readAsArrayBuffer\s*\(|\.arrayBuffer\s*\(|\.stream\s*\(|setInputFiles\s*\(|new\s+Blob\s*\(/.test(s));
check('passive-cdp-no-browser-launch',/chromium\.connectOverCDP/.test(s)&&!/chromium\.launch\(|device\.launchBrowser|_android as android/.test(s));
check('preview-ground-truth',/two-up canvas/.test(s)&&/getImageData/.test(s)&&/c\.alpha>0/.test(s)&&/last\.pathname==='\/editor'/.test(s));
check('final-device-screenshot',/case-\$\{caseNo\}-device\.png/.test(s));
check('single-round-no-recovery-functions',!/tapAlternatePhoto|pickerFallbackPoints|PHOTO_GRID_COORDINATE_FALLBACK|searchPhoto|retryRead|retryUpload/i.test(s));
check('harness-separated',/row\.harnessFail=true/.test(s)&&/INCONCLUSIVE_HARNESS_FAILURE/.test(s));
check('fresh-chrome-round',/forceStopChromeAndVerify\(caseNo\)/.test(s));
check('desktop-result-zip',/TOOLBOX_001_V54R1_SQUOOSH_CHROME_BASELINE_REAL_DEVICE_/.test(s)&&/Compress-Archive/.test(s));
check('v39-reference-count',refs.length===9,`count=${refs.length}`);
for(const f of refs){const ref=fs.readFileSync(path.join(refDir,f),'utf8');const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);}
console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
