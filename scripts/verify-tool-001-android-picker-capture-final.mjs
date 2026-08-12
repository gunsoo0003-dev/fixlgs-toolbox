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
  size_aware_timeout:/sizeAwareAttemptTimeoutMs/.test(capture)&&/IMAGE_INPUT_CAPTURE_PER_MB_TIMEOUT_MS/.test(capture),
  max_attempt_timeout_32s:/IMAGE_INPUT_CAPTURE_MAX_ATTEMPT_TIMEOUT_MS = 32_000/.test(capture),
  max_overall_timeout_45s:/IMAGE_INPUT_CAPTURE_MAX_OVERALL_TIMEOUT_MS = 45_000/.test(capture),
  abortable_filereader:/reader\.abort\(\)/.test(capture)&&/capture-filereader-timeout/.test(capture),
  cancellable_stream:/reader\.cancel\("capture-stream-timeout"\)/.test(capture),
  no_non_cancellable_arraybuffer_probe:!capture.includes('file.arrayBuffer()'),
  no_response_probe:!capture.includes('new Response(file).arrayBuffer()'),
  provider_reads_sequential:/for \(const \[name, read\] of readers\)/.test(capture),
  validates_full_snapshot:/buffer\.byteLength !== file\.size/.test(capture),
  provider_not_used_after_snapshot:/const ownedBlob = new Blob\(\[buffer\]/.test(capture),
  product_file_limit_20mb:/const MAX_FILE_BYTES = 20 \* 1024 \* 1024/.test(component),
  product_total_limit_60mb:/const MAX_TOTAL_BYTES = 60 \* 1024 \* 1024/.test(component),
  diagnostic_error:/capture-provider-unreadable/.test(capture),
};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({STATIC_PRODUCT_SELFTEST:ok?'PASS':'FAIL',version:'V17_MB_CAPTURE',...checks},null,2));
process.exit(ok?0:1);
