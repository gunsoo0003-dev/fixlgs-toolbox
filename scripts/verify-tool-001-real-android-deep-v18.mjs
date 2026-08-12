#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'run-tool-001-real-android-deep-v18.mjs');
const src=fs.readFileSync(target,'utf8');
const required=[
  'runSelfCheck','photoPickerMediaCells','verifyAndCommitPhotoPickerSelection','photoPickerActionControls','pickerClosedStable','targetCellSelected',
  'parseUiTree','findAndTapFile','stageDeviceFile','clickUploadButton','assertInteractiveUnlocked','pickerSignalSnapshot','waitForAttempt','main',
  'saveDeviceScreen','parseMediaStoreRows','queryImageMediaStore','assertMediaStoreTargetNewest'
];
const defs=new Set([...src.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const missing=required.filter(x=>!defs.has(x));
const browserInitStart=src.indexOf('function browserInit()');
const browserInitEnd=src.indexOf('async function waitForAttempt',browserInitStart);
const browserInit=browserInitStart>=0&&browserInitEnd>browserInitStart?src.slice(browserInitStart,browserInitEnd):'';
const checks={
  version:/V18/.test(src),
  missing,
  drag_handle_guard:/w>=240/.test(src)&&/h>=240/.test(src),
  square_cell_guard:/Math\.abs\(b\.w-b\.h\)<=90/.test(src),
  one_canonical_copy:/ONE canonical copy/.test(src),
  verified_clickable_parent:/CLICKABLE PARENT/.test(src)&&/photoPickerActionControls/.test(src),
  excludes_deselect:/전체 선택 해제/.test(src)&&/deselect/.test(src),
  stable_picker_close:/pickerClosedStable/.test(src)&&/consecutive>=3/.test(src),
  no_retap_after_selected:/do NOT tap the media tile again/.test(src),
  longpress_verified_only:/long-press fallback on VERIFIED media cell/.test(src),
  non_invasive_product_observer:/originalFileReadAttempted:false/.test(browserInit)&&/productCapturePass/.test(browserInit),
  no_original_file_arraybuffer_in_browser_observer:!browserInit.includes('file.arrayBuffer(')&&!browserInit.includes('file.slice('),
  no_original_file_filereader_in_browser_observer:!browserInit.includes('new FileReader('),
  no_original_file_objecturl_in_browser_observer:!browserInit.includes('URL.createObjectURL(file)'),
  no_original_file_imagebitmap_in_browser_observer:!browserInit.includes('createImageBitmap(file)'),
  mb_size_sweep_default:/0\.5,3,8,15,19/.test(src),
  pc_direct_screenshot:/exec-out','screencap','-p/.test(src)&&/mediaStoreTouched:false/.test(src),
  no_device_diagnostic_screenshot:!src.includes("const remote='/sdcard/tool001-v18-screen.png'"),
  mediastore_newest_hard_gate:/assertMediaStoreTargetNewest/.test(src)&&/MEDIASTORE_TARGET_NOT_NEWEST/.test(src),
  after_stage_newest_proof:/after-stage/.test(src),
  pre_activation_newest_proof:/prove target remains newest before picker/.test(src),
  picker_pre_tap_reproof:/picker-pre-tap/.test(src),
  wrong_media_hard_fail:/WRONG_MEDIA_SELECTED/.test(src),
  exact_received_size_gate:/Number\(a\.fileSize\)!==Number\(expectedBytes\)/.test(src),
  expected_bytes_passed_to_wait:/waitForAttempt\(page,i,Math\.min\(waitChangeMs,45000\),tf\.testBytes\)/.test(src),
  stale_screen_cleanup:/tool001-v17-screen\.png/.test(src)&&/tool001-v18-screen\.png/.test(src),
  desktop_zip_output:/TOOLBOX_001_REAL_ANDROID_DEEP_V18_/.test(src),
  progress_steps:/\[PROGRESS /.test(src)&&/OVERALL_STEPS = 18/.test(src),
  heartbeat:/\[RUNNING\]/.test(src)&&/TIMEOUT after/.test(src)
};
const ok=missing.length===0&&Object.entries(checks).filter(([k])=>k!=='missing').every(([,v])=>v===true);
console.log(JSON.stringify({STATIC_SELFTEST:ok?'PASS':'FAIL',...checks},null,2));
process.exit(ok?0:1);
