#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'run-tool-001-real-android-deep-v12.mjs');
const src=fs.readFileSync(target,'utf8');

const required=[
'runSelfCheck','makeTestPng','prepareDeviceFiles','stageDeviceFile',
'configureStayAwake','restoreStayAwake','startDeviceWatchdog',
'secureLockSnapshot','assertInteractiveUnlocked','recoverToChrome',
'ensureDeviceReady','clickUploadButton','pickerSignalSnapshot','waitForPicker',
'findAndTapFile','tapPickerConfirm','dumpUi','pagePing','browserInit',
'waitForAttempt','zipOutput','main'
];
const defs=new Set([...src.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const missing=required.filter(x=>!defs.has(x));
const checks={
  version:/V12/.test(src),
  required_functions:`${required.length-required.length+required.filter(x=>defs.has(x)).length}/${required.length}`,
  missing,
  self_check_call:/validator self-check/.test(src),
  media_where_removed:!src.includes("'--where'"),
  secure_lock_guard:/assertInteractiveUnlocked/.test(src),
  watchdog:/startDeviceWatchdog/.test(src),
  bounded_cdp:/CDP_SESSION_TIMEOUT/.test(src),
  adb_tap:/ADB physical tap/.test(src),
  per_attempt_recovery:/recovered; continuing to next attempt/.test(src),
  final_restore:/restoreStayAwake/.test(src)
};
const ok=missing.length===0 && checks.version && checks.self_check_call &&
  checks.media_where_removed && checks.secure_lock_guard && checks.watchdog &&
  checks.bounded_cdp && checks.adb_tap && checks.per_attempt_recovery && checks.final_restore;
console.log(JSON.stringify({STATIC_SELFTEST:ok?'PASS':'FAIL',...checks},null,2));
process.exit(ok?0:1);
