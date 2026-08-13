#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const run=path.join(root,'scripts','run-tool-001-real-photo-diagnostic-v22.mjs');
const src=fs.readFileSync(run,'utf8');
const checks={
  version:/REAL USER PHOTO DIAGNOSTIC V22/.test(src),
  no_synthetic_media:/REAL_USER_PHOTO_NO_SYNTHETIC_MEDIA/.test(src),
  multi_activation_strategies:['cdp-mouse','adb-visual-viewport','playwright-force','dom-click','fresh-cdp-retry'].every(x=>src.includes(x)),
  visual_viewport_mapping:/visualOffsetTop/.test(src)&&/topInset/.test(src)&&/cssScale/.test(src),
  element_from_point:/elementFromPoint/.test(src),
  foreground_multi_signal:/dumpsys','window','windows/.test(src)&&/dumpsys','activity','activities/.test(src),
  chrome_recovery_guard:/ensureChromeInteractive/.test(src)&&/KEYCODE_WAKEUP/.test(src)&&/dismiss-keyguard/.test(src),
  picker_multi_signal:/pickerSignalSnapshot/.test(src)&&/waitForPickerRobust/.test(src),
  activation_retry:/fresh-cdp-retry/.test(src),
  pointer_click_event_trace:/pointerdown/.test(src)&&/file-change/.test(src),
  v19_auto_commit:/autoCommitManualSelection/.test(src)&&/photoPickerActionControls/.test(src),
  commit_excludes_deselect:/전체 선택 해제|deselect/.test(src),
  full_failure_evidence:/failure-evidence\.json/.test(src)&&/activation-failed-ui\.xml/.test(src)&&/activation-failed-device\.png/.test(src),
  good_bad_cases:/GOOD_1,BAD_1,GOOD_2,BAD_2/.test(src),
  capture_diagnostics:/tool001:capture-diagnostic/.test(src)&&/readerTimeline/.test(src),
  no_original_file_read_in_observer:!/(\.arrayBuffer\(|new FileReader\(|createObjectURL\(|createImageBitmap\()/.test((src.match(/function browserInit\(\)[\s\S]*?async function domSnapshot/)||[''])[0]),
  desktop_zip:/Compress-Archive/.test(src)&&/Desktop/.test(src)
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',version:'V22',missing,...checks},null,2));
if(missing.length)process.exit(1);
