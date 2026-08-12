#!/usr/bin/env node
import fs from 'fs';
const component=fs.readFileSync(new URL('../components/image-converter-tool.tsx', import.meta.url),'utf8');
const capture=fs.readFileSync(new URL('../lib/image-input-capture.ts', import.meta.url),'utf8');
const checks={
  picker_handler_uses_immediate_capture:/void addPickerFiles\(selectedFiles\)/.test(component),
  capture_starts_before_queue:/const capturePromise = Promise\.allSettled\(captureCandidates\.map\(\(file\) => capturePickerFile\(file\)\)\);[\s\S]{0,500}const run = attachmentQueueRef\.current\.then/.test(component),
  captured_files_are_app_owned:/alreadyOwned: true/.test(component),
  no_second_provider_capture:/const ownedFile = options\?\.alreadyOwned \? file : await capturePickerFile\(file\)/.test(component),
  input_kept_alive_until_capture_finishes:/void addPickerFiles\(selectedFiles\)\.finally\(\(\) => \{[\s\S]{0,100}input\.value = ""/.test(component),
  multi_file_capture_concurrent:/Promise\.allSettled\(captureCandidates\.map/.test(component),
  picker_limits_prefiltered:/remainingSlots/.test(component)&&/remainingBytes/.test(component)&&/MAX_FILE_BYTES/.test(component),
  drag_drop_path_unchanged:/void addFiles\(event\.dataTransfer\.files\)/.test(component),
  provider_retry_rounds:/CAPTURE_RETRY_DELAYS_MS = \[0, 60, 140, 300, 650\]/.test(capture),
  provider_multi_primitive:/file\.arrayBuffer\(\)/.test(capture)&&/new Response\(file\)\.arrayBuffer\(\)/.test(capture)&&/readWithStream\(file\)/.test(capture)&&/readWithFileReader\(file\)/.test(capture),
  bounded_attempt_timeout:/CAPTURE_ATTEMPT_TIMEOUT_MS = 2_200/.test(capture),
  bounded_overall_timeout:/overallDeadline = Date\.now\(\) \+ captureTimeoutMs\(\)/.test(capture),
  validates_full_snapshot:/buffer\.byteLength !== file\.size/.test(capture),
  provider_not_used_after_snapshot:/const ownedBlob = new Blob\(\[buffer\]/.test(capture),
  diagnostic_error:/capture-provider-unreadable/.test(capture),
};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({STATIC_PRODUCT_SELFTEST:ok?'PASS':'FAIL',version:'V16',...checks},null,2));
process.exit(ok?0:1);
