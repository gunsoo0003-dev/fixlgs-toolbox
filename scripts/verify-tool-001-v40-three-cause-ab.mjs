#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root=process.cwd();
const runner=fs.readFileSync(path.join(root,'scripts','run-tool-001-v40-three-cause-ab.mjs'),'utf8');
const capture=fs.readFileSync(path.join(root,'lib','image-input-capture.ts'),'utf8');
const checks=[
 ['three_modes_defined',/CAUSE_A_FIRST_REFERENCE/.test(runner)&&/CAUSE_B_FRESH_REACQUIRE/.test(runner)&&/CAUSE_C_STABILIZED_REACQUIRE/.test(runner)],
 ['ten_each_default',/Number\(args\.repeats\|\|10\)/.test(runner)],
 ['interleaved_round_plan',/for\(let round=1;round<=REPEATS;round\+\+\)for\(const mode of MODES\)/.test(runner)],
 ['same_photo01',/PHOTO_01 select/.test(runner)&&/PHOTO=PHOTO_01/.test(runner)],
 ['user_visible_success',/r\.pass=r\.newCards>0&&r\.previewCount>0/.test(runner)],
 ['mode_global_set',/__TOOL001_V40_CAPTURE_MODE__/.test(runner)],
 ['first_reference_mode',/FIRST_GETFILE_IMMEDIATE/.test(capture)&&/mode === "FIRST_GETFILE_IMMEDIATE"/.test(capture)],
 ['fresh_reacquire_mode',/FRESH_REACQUIRE_IMMEDIATE/.test(capture)&&/sequence: 2/.test(capture)],
 ['stabilized_mode',/STABILIZED_REACQUIRE/.test(capture)&&/delayMs: 500/.test(capture)],
 ['single_read_per_mode',/phase: "v40-read-start"/.test(capture)&&/phase: "v40-read-pass"/.test(capture)&&/phase: "v40-read-fail"/.test(capture)],
 ['owned_snapshot_after_read',/phase: "v40-owned-pass"/.test(capture)],
 ['default_v38_preserved',/if \(v40Mode\) return captureTool001V40DiagnosticHandle\(handle, v40Mode\);[\s\S]*const delays = \[0, 80, 240\]/.test(capture)],
 ['mode_summary_output',/v40-three-cause-summary\.txt/.test(runner)&&/WINNER_COUNT/.test(runner)],
 ['notreadable_logged',/NOTREADABLE_EVENTS/.test(runner)],
];
let fail=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
console.log(fail===0?'STATIC_SELFTEST=PASS':`STATIC_SELFTEST=FAIL count=${fail}`);
process.exitCode=fail?1:0;
