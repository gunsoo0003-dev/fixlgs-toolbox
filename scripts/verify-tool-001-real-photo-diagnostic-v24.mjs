#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const run=path.join(root,'scripts','run-tool-001-real-photo-diagnostic-v24.mjs');
const src=fs.readFileSync(run,'utf8');
const mainLoop=(src.match(/for\(let i=0;i<labels\.length;i\+\+\)[\s\S]*?results\.push\(result\)/)||[''])[0];
const browser=(src.match(/function browserInit\(\)[\s\S]*?async function domSnapshot/)||[''])[0];
const checks={
  version:/REAL USER PHOTO DIAGNOSTIC V24/.test(src),
  no_synthetic_media:/REAL_USER_PHOTO_NO_SYNTHETIC_MEDIA/.test(src),
  real_uiautomator_button_tap:/uiautomator-real-button/.test(src)&&/chromeUploadActionControls/.test(src),
  stable_picker_gate:/waitStablePickerOpen/.test(src)&&/consecutive>=3/.test(src),
  no_premature_user_prompt:!/\[ACTION REQUIRED\][\s\S]{0,500}waitForSelectionAndCommit/.test(mainLoop)&&/\[PICKER READY\]/.test(src),
  user_prompt_only_after_picker:/\[PICKER READY\][\s\S]{0,500}\[ACTION REQUIRED\]/.test(src),
  picker_lost_auto_reopen:/picker-lost-before-selection-after-retries/.test(src)&&/선택 전에 Photo Picker가 닫혔습니다/.test(src),
  activation_rounds:/for\(let round=1;round<=3;round\+\+\)/.test(src),
  visual_viewport_fallback:/adb-visual-viewport/.test(src)&&/visualOffsetTop/.test(src),
  cdp_fallback:/cdp-mouse/.test(src),
  playwright_fallback:/playwright-force/.test(src),
  chrome_recovery_guard:/ensureChromeInteractive/.test(src)&&/KEYCODE_WAKEUP/.test(src)&&/dismiss-keyguard/.test(src),
  picker_strong_signal:/com\\\.google\\\.android\\\.photopicker/.test(src)&&/pickerPackages/.test(src),
  v19_commit_logic:/photoPickerActionControls/.test(src)&&/pickerClosedStable/.test(src),
  commit_excludes_deselect:/전체 선택 해제|deselect/.test(src),
  good_bad_cases:/GOOD_1,BAD_1,GOOD_2,BAD_2/.test(src),
  capture_diagnostics:/tool001:capture-diagnostic/.test(src)&&/readerTimeline/.test(src),
  no_original_file_read_in_observer:!/(\.arrayBuffer\(|new FileReader\(|createObjectURL\(|createImageBitmap\()/.test(browser),
  full_failure_evidence:/failure-evidence\.json/.test(src)&&/activation-failed-ui\.xml/.test(src)&&/activation-failed-device\.png/.test(src),
  commit_live_rescan:/commit control rescan started/.test(src)&&/Date\.now\(\)-selectionAt>12000/.test(src),
  picker_closed_no_change:/PICKER_CLOSED_NO_CHANGE/.test(src),
  url_guard:/URL_GUARD/.test(src)&&/unexpected-navigation/.test(src),
  short_commit_timeout:/COMMIT_CONTROL_NOT_EXPOSED/.test(src)&&/90000/.test(src),
  file_input_state_capture:/fileCount/.test(src)&&/activeElement/.test(src),
  desktop_zip:/Compress-Archive/.test(src)&&/Desktop/.test(src)
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',version:'V24',missing,...checks},null,2));
if(missing.length)process.exit(1);
