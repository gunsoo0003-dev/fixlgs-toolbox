#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'run-tool-001-real-android-deep-v13.mjs');
const src=fs.readFileSync(target,'utf8');
const required=[
'runSelfCheck','photoPickerMediaCells','verifyAndCommitPhotoPickerSelection',
'parseUiTree','findAndTapFile','stageDeviceFile','clickUploadButton',
'assertInteractiveUnlocked','pickerSignalSnapshot','waitForAttempt','main'
];
const defs=new Set([...src.matchAll(/(?:^|\n)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const missing=required.filter(x=>!defs.has(x));
const checks={
 version:/V13/.test(src),
 missing,
 drag_handle_guard:/w>=240/.test(src) && /h>=240/.test(src),
 square_cell_guard:/Math\.abs\(b\.w-b\.h\)<=90/.test(src),
 one_canonical_copy:/ONE canonical copy/.test(src),
 selection_verification:/PHOTO_PICKER_SELECTION_NOT_COMMITTED/.test(src),
 top_right_retry:/top-right/.test(src),
 longpress_fallback:/long-press fallback/.test(src),
 post_commit_timeout:/Math\.min\(waitChangeMs,30000\)/.test(src),
 old_bad_recent_candidate:!src.includes('newest eligible Recent grid item')
};
const ok=missing.length===0 && Object.entries(checks).filter(([k])=>k!=='missing').every(([,v])=>v===true);
console.log(JSON.stringify({STATIC_SELFTEST:ok?'PASS':'FAIL',...checks},null,2));
process.exit(ok?0:1);
