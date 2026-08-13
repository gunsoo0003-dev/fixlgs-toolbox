#!/usr/bin/env node
import fs from 'fs';
const file=new URL('./run-tool-001-v39-failure-trace.mjs',import.meta.url);
const s=fs.readFileSync(file,'utf8');
const checks=[
 ['v39_output_name',/TOOLBOX_001_V39_FAILURE_TRACE_REAL_DEVICE_/],
 ['independent_picker_hook',/showOpenFilePicker-call/],
 ['independent_getfile_hook',/getFile-call/],
 ['independent_arraybuffer_hook',/api:'arrayBuffer'/],
 ['independent_filereader_hook',/api:'FileReader'/],
 ['independent_stream_hook',/api:'stream'/],
 ['image_load_hook',/phase:'img-load'/],
 ['image_error_hook',/phase:'img-error'/],
 ['user_visible_pass_rule',/r\.pass=r\.newCards>0&&r\.previewCount>0/],
 ['last_success_step',/LAST_SUCCESS_STEP=/],
 ['first_fail_step',/FIRST_FAIL_STEP=/],
 ['error_name',/ERROR_NAME=/],
 ['notreadable_count',/NOTREADABLE_EVENTS=/],
 ['per_case_failure_trace',/case-\$\{caseNo\}-failure-trace\.txt/],
 ['fail_step_aggregation',/FAIL_STEP_COUNTS=/],
 ['strict_100_percent',/PASS_100_PERCENT/],
 ['no_extra_provider_read_comment',/Passive read observers: never initiate a read themselves/],
];
let bad=0;for(const [name,re] of checks){const ok=re.test(s);console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++;}
console.log(bad===0?'STATIC_SELFTEST=PASS':`STATIC_SELFTEST=FAIL count=${bad}`);process.exitCode=bad?1:0;
