#!/usr/bin/env node
import fs from 'fs';
const p=new URL('./run-tool-001-v38-real-device.mjs',import.meta.url);
const s=fs.readFileSync(p,'utf8');
const checks=[
 ['same_photo_10x',/args\.repeats\|\|10/],
 ['stable_picker_feature_check',/showOpenFilePicker/],
 ['stable_picker_selected_observed',/stable-picker-selected/],
 ['handle_getfile_observed',/stable-handle-getfile-start/],
 ['handle_read_observed',/stable-handle-read-pass/],
 ['owned_file_observed',/stable-handle-owned-pass/],
 ['notreadable_counted',/NotReadableError/],
 ['card_preview_required',/ownedPass>0&&r\.newCards>0&&r\.previewCount>0/],
 ['hundred_percent_gate',/FAIL_NOT_100_PERCENT/],
 ['desktop_zip',/Compress-Archive/],
 ['progress_output',/\[PROGRESS/],
];
let ok=true;
for(const [name,re] of checks){const pass=re.test(s);console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)ok=false;}
console.log(`STATIC_SELFTEST=${ok?'PASS':'FAIL'}`);
process.exit(ok?0:1);
