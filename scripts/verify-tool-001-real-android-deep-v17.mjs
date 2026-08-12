#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'run-tool-001-real-android-deep-v17.mjs');
const src=fs.readFileSync(target,'utf8');
const required=[
'runSelfCheck','photoPickerMediaCells','verifyAndCommitPhotoPickerSelection','photoPickerActionControls','pickerClosedStable','targetCellSelected',
'parseUiTree','findAndTapFile','stageDeviceFile','clickUploadButton',
'assertInteractiveUnlocked','pickerSignalSnapshot','waitForAttempt','main'
];
const defs=new Set([...src.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const missing=required.filter(x=>!defs.has(x));

const browserInitStart=src.indexOf('function browserInit()');
const browserInitEnd=src.indexOf('async function waitForAttempt', browserInitStart);
const browserInit=browserInitStart>=0&&browserInitEnd>browserInitStart?src.slice(browserInitStart,browserInitEnd):'';
const checks={
 version:/V17/.test(src),
 missing,
 drag_handle_guard:/w>=240/.test(src) && /h>=240/.test(src),
 square_cell_guard:/Math\.abs\(b\.w-b\.h\)<=90/.test(src),
 one_canonical_copy:/ONE canonical copy/.test(src),
 verified_clickable_parent:/CLICKABLE PARENT/.test(src) && /photoPickerActionControls/.test(src),
 excludes_deselect:/전체 선택 해제/.test(src) && /deselect/.test(src),
 exact_done_action:/완료\|추가\|열기\|확인/.test(src),
 stable_picker_close:/pickerClosedStable/.test(src) && /consecutive>=3/.test(src),
 no_selection_transition_false_pass:!src.includes("mode:'nonInvasive'"),
 no_retap_after_selected:/do NOT tap the media tile again/.test(src),
 longpress_verified_only:/long-press fallback on VERIFIED media cell/.test(src),
 outer_timeout_headroom:/findAndTapFile\(tf\.name,i,page,45000\),65000/.test(src),
 handoff_timeout_headroom:/waitForAttempt\(page,i,Math\.min\(waitChangeMs,45000\)\)/.test(src),
 pipeline_stage_evidence:/pipeline-stage\.json/.test(src),
 old_bad_recent_candidate:!src.includes('newest eligible Recent grid item'),
 non_invasive_product_observer:/originalFileReadAttempted:false/.test(browserInit) && /productCapturePass/.test(browserInit),
 no_original_file_arraybuffer_in_browser_observer:!browserInit.includes('file.arrayBuffer(') && !browserInit.includes('file.slice('),
 no_original_file_filereader_in_browser_observer:!browserInit.includes('new FileReader('),
 no_original_file_objecturl_in_browser_observer:!browserInit.includes('URL.createObjectURL(file)'),
 no_original_file_imagebitmap_in_browser_observer:!browserInit.includes('createImageBitmap(file)'),
 mb_size_sweep_default:/0\.5,3,8,15,19/.test(src),
 exact_target_size_png:/targetBytes-fixed/.test(src) && /pngChunk\('tEXt'/.test(src),
 no_tiny_only_comment:!src.includes('Small on purpose'),
 v17_cleanup:/TOOL001_V17_\*\.png/.test(src)
};
const ok=missing.length===0 && Object.entries(checks).filter(([k])=>k!=='missing').every(([,v])=>v===true);
console.log(JSON.stringify({STATIC_SELFTEST:ok?'PASS':'FAIL',...checks},null,2));
process.exit(ok?0:1);
