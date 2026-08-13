import fs from 'node:fs';
const capture = fs.readFileSync(new URL('../lib/image-input-capture.ts', import.meta.url), 'utf8');
const component = fs.readFileSync(new URL('../components/image-converter-tool.tsx', import.meta.url), 'utf8');
const checks = {
  primary_single_arraybuffer: /reader:\s*"arrayBuffer"/.test(capture) && /readPrimaryArrayBuffer\(file\)/.test(capture),
  no_filreader_provider_retry: !/new FileReader\(\)/.test(capture),
  no_provider_stream_retry: !/file\.stream\(\)\.getReader\(\)/.test(capture),
  decoder_fallback_present: /captureThroughImageDecoder/.test(capture) && /image-decoder-snapshot/.test(capture),
  app_owned_file_preserved: /new File\(\[ownedBlob\]/.test(capture),
  picker_captures_before_queue: /const capturePromise = Promise\.allSettled\(captureCandidates\.map\(\(file\) => capturePickerFile\(file\)\)\)/.test(component),
  input_kept_until_capture_done: /void addPickerFiles\(selectedFiles\)\.finally\(\(\) => \{\s*input\.value = ""/.test(component),
  product_uses_owned_file: /alreadyOwned \? file : await capturePickerFile\(file\)/.test(component),
};
let failed = 0;
for (const [name, ok] of Object.entries(checks)) {
  console.log(`${name}=${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed += 1;
}
console.log(`STATIC_SELFTEST=${failed === 0 ? 'PASS' : 'FAIL'}`);
process.exitCode = failed ? 1 : 0;
