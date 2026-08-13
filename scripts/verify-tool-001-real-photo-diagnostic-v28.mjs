#!/usr/bin/env node
import fs from 'fs';
const runner=fs.readFileSync(new URL('./run-tool-001-real-photo-diagnostic-v28.mjs',import.meta.url),'utf8');
const component=fs.readFileSync(new URL('../components/image-converter-tool.tsx',import.meta.url),'utf8');
const capture=fs.readFileSync(new URL('../lib/image-input-capture.ts',import.meta.url),'utf8');
const checks={
  version:/REAL_PHOTO_V28|DIAGNOSTIC_V28|version:'V28'/.test(runner),
  broad_default_cases:/KNOWN_GOOD_1,KNOWN_GOOD_REPEAT,KNOWN_BAD_1,KNOWN_BAD_REPEAT,CAMERA_PHOTO,SCREENSHOT,DOWNLOADED_OR_EDITED,KNOWN_BAD_REPEAT_2/.test(runner),
  no_synthetic_media:/REAL_USER_PHOTO_NO_SYNTHETIC_MEDIA/.test(runner)&&!/MediaStore.*insert/i.test(runner),
  upload_button_testid:/converter-upload-button/.test(component)&&/converter-add-button/.test(component),
  no_keycode_menu:!/adb\([^\n]*KEYCODE_MENU/.test(runner),
  legacy_live_button_fallback:/UPLOAD_BUTTON_NOT_FOUND/.test(runner)&&/이미지 선택/.test(runner),
  strict_overflow_menu_detection:/strictChromeOverflowMenuOpen/.test(runner)&&/matched.length>=2/.test(runner)&&/새 탭.*MUST NEVER/.test(runner),
  native_button_benchmark:/playwright-native-button/.test(runner),
  target_page_guard:/ensureExpectedToolPage/.test(runner)&&/TARGET_PAGE_NOT_ACTIVE/.test(runner),
  picker_current_ui_only:/uiIsPicker/.test(runner)&&/resumedIsPicker/.test(runner)&&/resumedPackageFromForeground/.test(runner),
  no_stale_picker_history_signal:!/pickerPackages\.length>0/.test(runner),
  upload_whitelist:/UPLOAD_TARGET_WHITELIST_FAIL/.test(runner)&&/cdp-whitelisted-button/.test(runner),
  no_visual_viewport_adb_fallback:!/adb-visual-viewport/.test(runner),
  wrong_target_navigation_guard:/WRONG_TARGET_CLICK_NAVIGATION/.test(runner),
  picker_stable_gate:/waitStablePickerOpen/.test(runner)&&/consecutive>=3/.test(runner),
  expanded_selection_signal:/actionControls/.test(runner)&&/selectedByText/.test(runner),
  short_selection_timeout:/const deadline=Date\.now\(\)\+45000/.test(runner),
  picker_closed_no_change:/PICKER_CLOSED_NO_CHANGE/.test(runner),
  browser_lifecycle:/visibilitychange/.test(runner)&&/pageshow/.test(runner)&&/pagehide/.test(runner),
  trusted_change_metadata:/lastModified/.test(runner)&&/fileCount/.test(runner),
  product_provider_received:/picker-selection-received/.test(component),
  product_limit_diagnostics:/product-limit-reject/.test(component)&&/picker-prefilter-reject/.test(component),
  product_inspection_diagnostics:/product-inspection-pass/.test(component)&&/aboveMaxPixels/.test(component),
  product_preview_diagnostics:/product-preview-url-pass/.test(component),
  capture_reader_diagnostics:/reader-start/.test(capture)&&/reader-pass/.test(capture)&&/reader-fail/.test(capture),
  signature_exif:/capture-byte-signature/.test(capture)&&/hasExif/.test(capture),
  safety_20mb:/MAX_FILE_BYTES = 20 \* 1024 \* 1024/.test(component),
  safety_60mb:/MAX_TOTAL_BYTES = 60 \* 1024 \* 1024/.test(component),
  safety_40mp:/MAX_PIXELS = 40_000_000/.test(component),
  first_divergence:/GOOD_BAD_FIRST_DIVERGENCE/.test(runner)&&/firstDivergence/.test(runner),
  timing_race:/TIMING_RACE_EVIDENCE/.test(runner)&&/repeatRaceEvidence/.test(runner),
  root_cause_classes:/PICKER_RESULT_RETURN/.test(runner)&&/PROVIDER_READ/.test(runner)&&/FORMAT_OR_INSPECTION/.test(runner)&&/PREVIEW_OR_DOM/.test(runner),
  desktop_zip:/Compress-Archive/.test(runner)&&/Desktop/.test(runner),
  progress_heartbeat:/\[PROGRESS /.test(runner)&&/\[RUNNING\]/.test(runner)
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',version:'V28',missing,...checks},null,2));
if(missing.length)process.exit(1);
