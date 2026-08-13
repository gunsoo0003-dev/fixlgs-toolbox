#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v47-chrome-fresh-process-ab.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}

check('default-7',/args\.repeats\|\|7/.test(s));
check('chrome-only-phase',/PHASE A: CHROME MINIMAL HTML \/ FRESH-PROCESS A-B DIAGNOSTICS/.test(s));
check('native-removed',!/runNativeMode|prepareNativeApk|installNativeApk|runNative|native-template/i.test(s));
check('samsung-removed',!/Samsung Internet PRECISION ROUND|connectSamsungCdp|runSamsungPrecision/i.test(s));
check('minimal-no-product',/No TOOL001 \/ React \/ Next\.js/.test(s) && /page\.setContent\(MINIMAL_HTML/.test(s));
check('visible-direct-input',/<input id="file" type="file"/.test(s) && /page\.locator\('#file'\)\.click/.test(s));
check('one-arraybuffer-read',((s.match(/await file\.arrayBuffer\(\)/g)||[]).length===1));
check('force-stop-every-round',/for\(let r=1;r<=repeats;r\+\+\)[\s\S]*?forceStopChromeAndVerify\(caseNo\)/.test(s));
check('force-stop-command',/adb\('shell','am','force-stop','com\.android\.chrome'\)/.test(s));
check('force-stop-verified',/HARNESS_CHROME_FORCE_STOP_FAILED/.test(s) && /while\(after && Date\.now\(\)<deadline\)/.test(s));
check('fresh-browser-context-per-round',/for\(let r=1;r<=repeats;r\+\+\)[\s\S]*?context=await device\.launchBrowser\(\{\}\)/.test(s));
check('context-closed-per-round',/if\(context\)await context\.close\(\)\.catch/.test(s));
check('fresh-process-identity-recorded',/chromeMainProcessIdentity/.test(s) && /startTicks/.test(s) && /freshProcessVersusPrevious/.test(s));
check('same-process-is-harness-fail',/HARNESS_CHROME_PROCESS_IDENTITY_REUSED/.test(s));
check('logcat-clear-after-stop',/forceStopChromeAndVerify\(caseNo\)[\s\S]*?adb\('logcat','-b','all','-c'\)[\s\S]*?device\.launchBrowser/.test(s));
check('picker-timeout-call-only',/waitStablePickerOpen\(caseNo,'v39-source-exact',pickerStableTimeoutMs\)/.test(s));
check('picker-timeout-default-12s',/picker-timeout-ms'\]\|\|12000/.test(s));
check('one-photo01',/const c=candidates\[0\],b=c\.parsed;/.test(s) && /PHOTO_01/.test(s));
check('no-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('no-read-retry-or-reacquire',!/readRetry|retryRead|reacquire|getFile\(\)/i.test(s));
check('no-failure-recovery-force-stop',!/if\s*\([^\n]*read_fail[^\n]*\)[\s\S]{0,240}force-stop/i.test(s));
check('all-buffer-logcat-passive',/logcat','-b','all','-d','-v','threadtime'/.test(s));
check('cdp-passive-events',/newCDPSession/.test(s) && /Runtime\.exceptionThrown/.test(s) && /Runtime\.consoleAPICalled/.test(s) && /Log\.entryAdded/.test(s));
check('page-passive-events',/page\.on\('console'/.test(s) && /page\.on\('pageerror'/.test(s) && /page\.on\('crash'/.test(s));
check('uri-grant-snapshot',/uriGrantSnapshot/.test(s) && /dumpsys','activity','providers/.test(s));
check('no-chrome-flag-injection',!/chrome-command-line|--enable-logging|--v=|set-debug-app|am set-debug-app/i.test(s));
check('harness-separated',/row\.harnessFail/.test(s) && /HARNESS_DIAG_RESULT_TIMEOUT/.test(s));
check('desktop-result-zip',/TOOLBOX_001_V47_CHROME_DEEP_DIAG_REAL_DEVICE_/.test(s) && /Compress-Archive/.test(s));
check('no-apk-lifecycle',!/prepareNativeApk|installNativeApk|cleanupNativeApk|cmdOk\('flutter'|adb\('uninstall'/i.test(s));

check('v39-reference-count',refs.length===9,`count=${refs.length}`);
for(const f of refs){
  const ref=fs.readFileSync(path.join(refDir,f),'utf8');
  const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);
  check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);
}

console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
