#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const libPath = path.join(root, "lib", "image-input-capture.ts");
const toolPath = path.join(root, "components", "image-converter-tool.tsx");
const checks = [];

function add(name, pass, detail = "") {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

const lib = fs.readFileSync(libPath, "utf8");
const tool = fs.readFileSync(toolPath, "utf8");

add("android_stable_picker_feature_gate",
  /canUseTool001StableAndroidPicker/.test(lib) &&
  /Android/i.test(lib) &&
  /showOpenFilePicker/.test(lib));

add("file_system_access_picker_present",
  /showTool001StableAndroidPicker/.test(lib) &&
  /excludeAcceptAllOption:\s*true/.test(lib) &&
  /image\/jpeg/.test(lib) &&
  /image\/png/.test(lib) &&
  /image\/webp/.test(lib));

add("handle_reacquire_present",
  /captureTool001FileHandle/.test(lib) &&
  /handle\.getFile\(\)/.test(lib) &&
  /delays\s*=\s*\[0,\s*80,\s*240\]/.test(lib));

add("owned_snapshot_after_handle_read",
  /source\.arrayBuffer\(\)/.test(lib) &&
  /new Blob\(\[buffer\]/.test(lib) &&
  /new File\(\[ownedBlob\]/.test(lib));

add("no_overlapping_timeout_on_handle_path",
  /No timeout race here/.test(lib) &&
  !/stable-handle-read-start[\s\S]{0,800}Promise\.race/.test(lib));

add("mobile_button_uses_stable_route",
  /const openImagePicker = async/.test(tool) &&
  /canUseTool001StableAndroidPicker\(\)/.test(tool) &&
  /showTool001StableAndroidPicker\(remainingSlots\)/.test(tool));

add("desktop_legacy_input_fallback_preserved",
  /if \(!canUseTool001StableAndroidPicker\(\)\)\s*\{\s*fileInputRef\.current\?\.click\(\)/s.test(tool));

add("user_cancel_does_not_reopen_picker",
  /if \(name === "AbortError"\) return;/.test(tool));

add("captured_handle_files_skip_provider_reread",
  /addFilesInternal\(ownedFiles,\s*\{\s*alreadyOwned:\s*true/.test(tool));

add("both_upload_buttons_use_route",
  (tool.match(/void openImagePicker\(\)/g) || []).length >= 2);

const failed = checks.filter((x) => !x.pass);
console.log(`STATIC_SELFTEST=${failed.length ? "FAIL" : "PASS"}`);
if (failed.length) process.exit(1);
