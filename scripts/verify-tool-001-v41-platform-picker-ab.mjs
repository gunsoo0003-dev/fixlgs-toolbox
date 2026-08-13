#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lib=read('lib/image-input-capture.ts');
const comp=read('components/image-converter-tool.tsx');
const run=read('scripts/run-tool-001-v41-platform-picker-ab.mjs');
const checks=[
 ['v41_modes_present',/FS_IMAGE_FILTERED/.test(lib)&&/FS_ACCEPT_ALL/.test(lib)&&/LEGACY_IMAGE_INPUT/.test(lib)],
 ['accept_all_picker_options',/excludeAcceptAllOption:\s*false/.test(lib)&&/v41-picker-options/.test(lib)],
 ['legacy_input_route',/v41PickerMode === "LEGACY_IMAGE_INPUT"/.test(comp)&&/fileInputRef\.current\?\.click\(\)/.test(comp)],
 ['stable_fs_route_preserved',/showTool001StableAndroidPicker/.test(comp)&&/captureTool001FileHandle/.test(comp)],
 ['three_paths_x10',/PATH_A_FS_IMAGE_FILTERED/.test(run)&&/PATH_B_FS_ACCEPT_ALL/.test(run)&&/PATH_C_LEGACY_IMAGE_INPUT/.test(run)&&/repeats\|\|10/.test(run)],
 ['picker_package_logging',/PICKER_PACKAGES/.test(run)&&/pickerEnv/.test(run)],
 ['real_preview_required',/r\.pass=r\.newCards>0&&r\.previewCount>0/.test(run)],
 ['notreadable_logged',/NOTREADABLE_EVENTS/.test(run)],
 ['summary_file',/v41-platform-picker-summary\.txt/.test(run)],
 ['documentsui_candidate_support',/documentsui\|myfiles\|filepicker/.test(run)],
];
let ok=true;for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)ok=false;}
console.log(`STATIC_SELFTEST=${ok?'PASS':'FAIL'}`);process.exit(ok?0:1);
