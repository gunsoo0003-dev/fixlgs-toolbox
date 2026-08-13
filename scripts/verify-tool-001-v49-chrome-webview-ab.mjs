#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v49-chrome-webview-ab.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}

check('default-7-each',/args\.repeats\|\|7/.test(s) && /REPEATS_EACH/.test(s));
check('phase-a-chrome',/PHASE A: CHROME MINIMAL HTML \/ FRESH-PROCESS A-B DIAGNOSTICS/.test(s));
check('phase-b-webview',/PHASE B: ANDROID SYSTEM WEBVIEW MINIMAL WEB FILE BRIDGE/.test(s));
check('no-samsung',!/Samsung Internet PRECISION ROUND|connectSamsungCdp|runSamsungPrecision/i.test(s));
check('no-product-code',/No TOOL001 \/ React \/ Next\.js/.test(s) && /PRODUCT_CODE=NONE/.test(s));
check('chrome-visible-direct-input',/<input id="file" type="file"/.test(s) && /page\.locator\('#file'\)\.click/.test(s));
check('webview-fullscreen-direct-input',/<input id="file" type="file"[\s\S]*?position:fixed;inset:0;width:100vw;height:100vh/.test(s));
check('webview-real-touch-once',/tapWebViewFullscreenInputOnce\(\)/.test(s) && /adb\('shell','input','tap',String\(x\),String\(y\)\)/.test(s));
check('webview-no-ui-text-button-search',!/tapExactUiText|HARNESS_WEBVIEW_OPEN_BUTTON_NOT_FOUND/.test(s));
check('webview-input-ready-gate',/WEBVIEW_INPUT_READY/.test(s) && /HARNESS_WEBVIEW_INPUT_NOT_READY/.test(s));
check('webview-load-data-local',/webView\.loadData\(/.test(s) && !/loadDataWithBaseURL/.test(s));
check('two-arraybuffer-reads-total',((s.match(/await file\.arrayBuffer\(\)/g)||[]).length===2),`count=${(s.match(/await file\.arrayBuffer\(\)/g)||[]).length}`);
check('chrome-force-stop-before-round',/for\(let r=1;r<=repeats;r\+\+\)[\s\S]*?forceStopChromeAndVerify\(caseNo\)/.test(s));
check('webview-force-stop-before-round',/for\(let r=1;r<=repeats;r\+\+\)[\s\S]*?adb\('shell','am','force-stop',WEBVIEW_PACKAGE\)/.test(s));
check('webview-action-get-content',/Intent\(Intent\.ACTION_GET_CONTENT\)/.test(s) && /Intent\.CATEGORY_OPENABLE/.test(s));
check('webview-one-uri-return',/callback\.onReceiveValue\(arrayOf\(uri\)\)/.test(s));
const ktStart=s.indexOf('  const kt=`');
const ktEnd=s.indexOf("`;\n  fs.writeFileSync(path.join(ktDir,'MainActivity.kt')",ktStart);
const kt=ktStart>=0&&ktEnd>ktStart?s.slice(ktStart,ktEnd):'';
check('webview-no-direct-provider-read',!/contentResolver|openFileDescriptor|FileInputStream|InputStream|readBytes|arrayBuffer\(\)/i.test(kt.replace(/await file\.arrayBuffer\(\)/g,'')));
check('webview-js-only-byte-read',/await file\.arrayBuffer\(\)/.test(kt));
check('no-read-retry-or-reacquire',!/readRetry|retryRead|reacquire|getFile\(\)|readAsArrayBuffer/i.test(s));
check('one-photo01',/const c=candidates\[0\],b=c\.parsed;/.test(s) && /PHOTO_01/.test(s));
check('no-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('harness-separated',/HARNESS_WEBVIEW_RESULT_TIMEOUT/.test(s) && /row\.harnessFail/.test(s));
check('result-zip-before-apk-cleanup',/await makeZip\(\);\s*cleanupWebViewApk\(\);/.test(s));
check('fatal-zip-before-apk-cleanup',/await makeZip\(\);\s*try\{cleanupWebViewApk\(\)/.test(s));
check('apk-auto-delete',/adb\('uninstall',WEBVIEW_PACKAGE\)/.test(s));
check('temp-runtime-delete',/fs\.rmSync\(webviewRuntimeDir,\{recursive:true,force:true\}\)/.test(s));
check('desktop-result-zip',/TOOLBOX_001_V49_CHROME_WEBVIEW_AB_REAL_DEVICE_/.test(s) && /Compress-Archive/.test(s));
check('no-chrome-flag-injection',!/chrome-command-line|--enable-logging|--v=|set-debug-app|am set-debug-app/i.test(s));
check('webview-no-extra-cache-flags',!/LOAD_NO_CACHE|domStorageEnabled|setWebContentsDebuggingEnabled/.test(s));

check('v39-reference-count',refs.length===9,`count=${refs.length}`);
for(const f of refs){
  const ref=fs.readFileSync(path.join(refDir,f),'utf8');
  const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);
  check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);
}

console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
