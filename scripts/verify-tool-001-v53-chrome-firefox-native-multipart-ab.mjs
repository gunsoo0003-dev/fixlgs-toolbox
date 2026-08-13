#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const here=path.dirname(fileURLToPath(import.meta.url));
const runner=path.join(here,'run-tool-001-v53-chrome-firefox-native-multipart-ab.mjs');
const s=fs.readFileSync(runner,'utf8');
const refDir=path.join(here,'reference');
const refs=fs.readdirSync(refDir).filter(x=>/^v39-.*\.txt$/.test(x)).sort();
let ok=true;
function check(name,pass,detail=''){console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+detail:''}`);if(!pass)ok=false;}

check('default-7-each',/args\.repeats\|\|7/.test(s) && /REPEATS_PER_BROWSER/.test(s));
check('chrome-firefox-only',/const CHROME_PKG='com\.android\.chrome'/.test(s) && /const FIREFOX_PKG='org\.mozilla\.firefox'/.test(s));
check('strict-firefox-stable-package',/FIREFOX_NOT_INSTALLED_PACKAGE/.test(s) && !/firefox_beta|fenix\.nightly|org\.mozilla\.fenix'/.test(s));
check('product-code-none',/PRODUCT_CODE=NONE/.test(s) && /No TOOL001 \/ React \/ Next\.js/.test(s));
check('same-adb-browser-flow',/BROWSER_CONTROL=ADB_IDENTICAL_FLOW/.test(s) && /runPhase\(\{label:'CHROME'/.test(s) && /runPhase\(\{label:'FIREFOX'/.test(s));
check('remote-shell-url-quoted',/function adbShellQuote/.test(s) && /adb\('shell',cmd\)/.test(s) && /-d \${adbShellQuote\(url\)} -p \${adbShellQuote\(pkg\)}/.test(s));
check('foreground-package-guard',/waitExpectedBrowserForeground/.test(s) && /WRONG_FOREGROUND_PACKAGE/.test(s) && /resumedPackageFromForeground\(last\)===pkg/.test(s));
check('native-html-form',/enctype="multipart\/form-data"/.test(s) && /f\.submit\(\)/.test(s));
check('one-file-input',/<input id="file" name="file" type="file"/.test(s));
check('single-center-tap-no-selector-fallback',/tapBrowserFileInputOnce/.test(s) && /adb\('shell','input','tap',String\(x\),String\(y\)\)/.test(s) && !/tapAlternatePhoto|pickerFallbackPoints|PHOTO_GRID_COORDINATE_FALLBACK|screen-grid-fallback/i.test(s));
check('no-playwright-browser-control',!/from 'playwright'|launchBrowser|newPage\(/.test(s.replace(/launchBrowserUrl/g,'')));
check('no-js-byte-read',!/await\s+file\.arrayBuffer\(|new\s+FileReader\s*\(|\.readAsArrayBuffer\s*\(|file\.stream\s*\(|new\s+Blob\s*\(/.test(s));
check('adb-reverse-local-server',/adb\('reverse',`tcp:\$\{port\}`,`tcp:\$\{port\}`\)/.test(s) && /createUploadServer/.test(s));
check('server-byte-count',/fileBytes:data\.length/.test(s) && /457776/.test(s));
check('fresh-browser-before-round',/forceStopBrowserAndVerify\(caseNo,pkg,label\)/.test(s));
check('one-photo01',/const c=candidates\[0\],b=c\.parsed;/.test(s) && /PHOTO_01/.test(s));
check('no-grid-fallback',!/screen-grid-fallback|PHOTO_GRID_COORDINATE_FALLBACK|tapAlternatePhoto|pickerFallbackPoints/.test(s));
check('harness-separated',/row\.harnessFail/.test(s) && /INCONCLUSIVE_HARNESS_FAILURE/.test(s));
check('desktop-result-zip',/TOOLBOX_001_V53R2_CHROME_FIREFOX_NATIVE_MULTIPART_AB_REAL_DEVICE_/.test(s) && /Compress-Archive/.test(s));
check('reverse-cleanup',/adb\('reverse','--remove',`tcp:\$\{port\}`\)/.test(s));
check('v39-reference-count',refs.length===9,`count=${refs.length}`);
for(const f of refs){const ref=fs.readFileSync(path.join(refDir,f),'utf8');const hash=crypto.createHash('sha256').update(ref).digest('hex').slice(0,12);check(`V39_SOURCE_EXACT:${f}`,s.includes(ref),`sha256=${hash}`);}
console.log(ok?'STATIC_SELFTEST=PASS':'STATIC_SELFTEST=FAIL');
process.exit(ok?0:1);
