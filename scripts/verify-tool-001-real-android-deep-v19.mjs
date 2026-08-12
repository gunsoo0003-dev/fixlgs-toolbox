#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'run-tool-001-real-android-deep-v19.mjs');
const src=fs.readFileSync(target,'utf8');
const required=[
  'runSelfCheck','photoPickerMediaCells','verifyAndCommitPhotoPickerSelection','photoPickerActionControls','pickerClosedStable','targetCellSelected',
  'parseUiTree','findAndTapFile','stageDeviceFile','clickUploadButton','assertInteractiveUnlocked','pickerSignalSnapshot','waitForAttempt','main',
  'saveDeviceScreen','parseMediaStoreRows','queryImageMediaStore','mediaStoreTargetProof','deviceFileSize','waitForMediaStoreTarget','makeTestPng'
];
const defs=new Set([...src.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const missing=required.filter(x=>!defs.has(x));
const browserInitStart=src.indexOf('function browserInit()');
const browserInitEnd=src.indexOf('async function waitForAttempt',browserInitStart);
const browserInit=browserInitStart>=0&&browserInitEnd>browserInitStart?src.slice(browserInitStart,browserInitEnd):'';
const checks={
  version:/V19/.test(src),
  missing,
  adaptive_mediastore_projection:/_size:relative_path/.test(src)&&/queryProfile/.test(src)&&/profile:'unavailable'/.test(src),
  invalid_size_column_removed:!/date_added:size/.test(src),
  mediastore_query_soft_fallback:/continuing with device-size \+ picker \+ exact Chrome File\.size hard gates/.test(src),
  device_exact_size_gate:/DEVICE_FILE_SIZE_MISMATCH/.test(src)&&/deviceFileSize/.test(src),
  scanner_multi_path:/MEDIA_SCANNER_SCAN_FILE/.test(src)&&/file:\/\/\/sdcard\/Pictures\//.test(src),
  no_mediastore_hard_timeout:/waitForMediaStoreTarget/.test(src)&&!/MEDIASTORE_INDEX_TIMEOUT/.test(src),
  picker_rank_aware:/targetRank=/.test(src)&&/candidateOffset/.test(src)&&/chosenIndex/.test(src),
  wrong_media_retry:/wrong media only; retrying next validated Photo Picker cell/.test(src)&&/pickTry<3/.test(src),
  exact_received_size_gate:/WRONG_MEDIA_SELECTED/.test(src)&&/Number\(a\.fileSize\)!==Number\(expectedBytes\)/.test(src),
  case_isolation:/reset TOOL001 page/.test(src)&&/sizeCaseResults/.test(src),
  realistic_geometry:/const width=720, height=1600/.test(src)&&/naturalWidth===720&&d\.naturalHeight===1600/.test(src),
  realistic_mb_sweep:/0\.5,3,8,15,19/.test(src),
  visual_preview_hard_gate:/visualPreviewPass/.test(src)&&/cardPreviewDims/.test(src)&&/card-and-realistic-preview/.test(src),
  non_invasive_product_observer:/originalFileReadAttempted:false/.test(browserInit),
  no_original_file_arraybuffer:!browserInit.includes('file.arrayBuffer(')&&!browserInit.includes('file.slice('),
  no_original_file_filereader:!browserInit.includes('new FileReader('),
  no_original_file_objecturl:!browserInit.includes('URL.createObjectURL(file)'),
  no_original_file_imagebitmap:!browserInit.includes('createImageBitmap(file)'),
  pc_direct_screenshot:/exec-out','screencap','-p/.test(src)&&/mediaStoreTouched:false/.test(src),
  stale_test_cleanup:/rm -f \/sdcard\/Pictures\/TOOL001_V1\*\.png/.test(src),
  continue_all_sizes:/one failure must not stop evidence collection/.test(src),
  summary_size_cases:/REALISTIC_MB_SIZE_SWEEP/.test(src)&&/SIZE_CASES_PASS/.test(src),
  desktop_zip_output:/TOOLBOX_001_REAL_ANDROID_DEEP_V19_/.test(src),
  progress_steps:/OVERALL_STEPS = 18/.test(src)&&/\[PROGRESS /.test(src),
  heartbeat:/\[RUNNING\]/.test(src)&&/TIMEOUT after/.test(src)
};
const ok=missing.length===0&&Object.entries(checks).filter(([k])=>k!=='missing').every(([,v])=>v===true);
console.log(JSON.stringify({STATIC_SELFTEST:ok?'PASS':'FAIL',...checks},null,2));
process.exit(ok?0:1);
