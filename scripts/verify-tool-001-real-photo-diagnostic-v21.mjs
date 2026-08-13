#!/usr/bin/env node
import fs from 'fs';
const runner=fs.readFileSync(new URL('./run-tool-001-real-photo-diagnostic-v21.mjs',import.meta.url),'utf8');
const capture=fs.readFileSync(new URL('../lib/image-input-capture.ts',import.meta.url),'utf8');
const page=fs.readFileSync(new URL('../app/[locale]/[toolSlug]/page.tsx',import.meta.url),'utf8');
const checks={
  version:runner.includes('REAL USER PHOTO DIAGNOSTIC V21 FINAL-INTEGRATED'),
  no_synthetic_media:runner.includes('검수기가 테스트 사진을 만들지 않습니다')&&!runner.includes('makeTestPng('),
  manual_good_bad_cases:runner.includes('GOOD_1,BAD_1,GOOD_2,BAD_2'),
  v19_style_auto_commit:runner.includes('autoCommitManualSelection')&&runner.includes('photoPickerActionControls')&&runner.includes('pickerSelectionSignals'),
  commit_excludes_deselect:runner.includes('전체 선택 해제')&&runner.includes('deselect|unselect'),
  commit_excludes_preview_cancel:runner.includes('미리보기|preview|취소|cancel|닫기|close'),
  stable_picker_close:runner.includes('pickerClosedStable'),
  auto_close_change_supported:runner.includes('picker-auto-close-change'),
  no_change_after_commit_is_hard_fail:runner.includes('NO_FILE_CHANGE_AFTER_VERIFIED_COMMIT'),
  full_failure_evidence:runner.includes('failure-picker.xml')&&runner.includes('failure-evidence.json')&&runner.includes('failure-device.png'),
  trusted_change_metadata:runner.includes('trusted:e.isTrusted'),
  observer_non_invasive:!runner.includes('window.__TOOL001_REAL_PHOTO_V21__.arrayBuffer')&&!runner.includes('new FileReader()'),
  capture_diagnostics:capture.includes('tool001:capture-diagnostic')&&capture.includes('phase: "reader-start"')&&capture.includes('phase: "reader-pass"')&&capture.includes('phase: "reader-fail"'),
  byte_signature_diagnostic:capture.includes('phase: "capture-byte-signature"')&&capture.includes('hasExif')&&capture.includes('headHex'),
  product_limits_unchanged:capture.includes('IMAGE_INPUT_CAPTURE_MAX_FILE_BYTES = 20 * 1024 * 1024'),
  ui_limits_synced_ko:page.includes('파일당 20MB, 전체 60MB'),
  ui_limits_synced_en:page.includes('20 MB each, 60 MB total'),
  ui_limits_synced_ja:page.includes('1件20MB、合計60MB'),
  pc_direct_screenshot:runner.includes("adb',['exec-out','screencap','-p']"),
  desktop_result_zip:runner.includes('Compress-Archive')
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',version:'V21',checks,missing},null,2));
if(missing.length)process.exit(1);
