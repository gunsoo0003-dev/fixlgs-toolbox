#!/usr/bin/env node
import fs from 'fs';
const runner=fs.readFileSync(new URL('./run-tool-001-real-photo-diagnostic-v20.mjs',import.meta.url),'utf8');
const capture=fs.readFileSync(new URL('../lib/image-input-capture.ts',import.meta.url),'utf8');
const checks={
  version:runner.includes('REAL USER PHOTO DIAGNOSTIC V20'),
  no_synthetic_media:runner.includes('사진을 만들지 않습니다') && !runner.includes('makeTestPng('),
  manual_good_bad_cases:runner.includes('GOOD_1,BAD_1,GOOD_2,BAD_2'),
  trusted_change_metadata:runner.includes('trusted:e.isTrusted'),
  no_original_file_read_in_observer:!runner.includes('.arrayBuffer()')&&!runner.includes('FileReader(')&&!runner.includes('createObjectURL('),
  capture_diagnostic_event:capture.includes('tool001:capture-diagnostic'),
  reader_start_event:capture.includes('phase: "reader-start"'),
  reader_pass_event:capture.includes('phase: "reader-pass"'),
  reader_fail_event:capture.includes('phase: "reader-fail"'),
  picker_file_pass_fail:capture.includes('phase: "picker-file-pass"')&&capture.includes('phase: "picker-file-fail"'),
  pc_direct_screenshot:runner.includes("adb',['exec-out','screencap','-p']"),
  desktop_result_zip:runner.includes('Compress-Archive')
};
const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
console.log(JSON.stringify({STATIC_SELFTEST:missing.length?'FAIL':'PASS',version:'V20',checks,missing},null,2));
if(missing.length)process.exit(1);
