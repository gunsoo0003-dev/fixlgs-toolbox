import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const capturePath = path.join(root, "lib", "image-input-capture.ts");
const componentPath = path.join(root, "components", "image-converter-tool.tsx");
const capture = fs.readFileSync(capturePath, "utf8");
const component = fs.readFileSync(componentPath, "utf8");

const checks = {
  size_aware_timeout: capture.includes("sizeAwareAttemptTimeoutMs") && capture.includes("IMAGE_INPUT_CAPTURE_PER_MB_TIMEOUT_MS"),
  max_attempt_at_least_30s: /IMAGE_INPUT_CAPTURE_MAX_ATTEMPT_TIMEOUT_MS\s*=\s*32_000/.test(capture),
  max_overall_at_least_40s: /IMAGE_INPUT_CAPTURE_MAX_OVERALL_TIMEOUT_MS\s*=\s*45_000/.test(capture),
  abortable_filereader: capture.includes("reader.abort()") && capture.includes("capture-filereader-timeout"),
  cancellable_stream: capture.includes("reader.cancel(\"capture-stream-timeout\")"),
  no_provider_arraybuffer_probe: !capture.includes("file.arrayBuffer()"),
  no_response_provider_probe: !capture.includes("new Response(file).arrayBuffer()"),
  sequential_provider_readers: capture.includes("for (const [name, read] of readers)"),
  app_owned_snapshot: capture.includes("const ownedBlob = new Blob([buffer]") && capture.includes("return new File([ownedBlob]"),
  product_file_limit_20mb_unchanged: /const MAX_FILE_BYTES\s*=\s*20\s*\*\s*1024\s*\*\s*1024/.test(component),
  product_total_limit_60mb_unchanged: /const MAX_TOTAL_BYTES\s*=\s*60\s*\*\s*1024\s*\*\s*1024/.test(component),
  immediate_picker_capture_preserved: component.includes("Promise.allSettled(captureCandidates.map((file) => capturePickerFile(file)))"),
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
const result = { STATIC_MB_CAPTURE_SELFTEST: missing.length ? "FAIL" : "PASS", ...checks, missing };
console.log(JSON.stringify(result, null, 2));
if (missing.length) process.exit(1);
