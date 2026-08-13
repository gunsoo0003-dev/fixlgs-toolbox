#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
const root=process.cwd();
const scriptPath=process.env.MOBILE_VALIDATOR_SCRIPT || path.join(root,'scripts','run-mobile-real-photo-001-024.mjs');
const script=fs.readFileSync(scriptPath,'utf8');
const errors=[];
const must=[
  'A1 CHOOSER_OPEN','A2 MEDIA_ACTION_SELECTED','A3 GALLERY_SELECTED','A4 CAMERA_SELECTED','A5 CAMERA_GRID_READY','A6 PHOTO_SLOT_','A7 RETURN_TO_WEB',
  'W4 IMMEDIATE_SMALL_SCROLL','discoverPhotoGrid','snapshotNative','TOOL018_SPECIAL_FAIL','INPUT_NOT_APPLICABLE',
  'uploads:2','tool013-select','tool014-select','tool015-before-slot','tool015-after-slot','tool016-content','tool017-select','tool017-process-all','tool020-drop','tool023-generate','tool024-export-zip',
  'recoverToChrome','HARNESS_DOWNLOAD_FILE_NOT_OBSERVED','DOWNLOAD_BEFORE.json','DOWNLOAD_REDOWNLOAD_CONFIRM','TOOL005 CURRENT_RESULT_USE','TOOL003_UNSUPPORTED_INPUT','tool023-dropzone','cleanupAndroidResources','ANDROID_DEVICE_CLOSE','[EXIT] NORMAL','BLOCKED_STEPS','archiveResultFolder','RESULT ZIP TARGET','RETEST_HARNESS_INVALID_ORIGINAL_PRODUCT_FAIL_PRESERVED'
];
for(const x of must)if(!script.includes(x))errors.push(`missing flow token: ${x}`);
if(/sleep\(5000\)|setTimeout\([^,]+,\s*5000/.test(script))errors.push('fixed 5 second wait found');
if(/\(완료\|추가\|열기|Done\|Add\|Open/.test(script))errors.push('Open/열기 found in picker commit action list');
if(!/adb\('shell',script\)/.test(script))errors.push('download snapshot must pass complete remote script directly to adb shell');
const toolNums=[...script.matchAll(/\bt\((\d+),/g)].map(m=>Number(m[1]));
if(toolNums.length!==24)errors.push(`tool definitions != 24 (${toolNums.length})`);
for(let i=1;i<=24;i++)if(!toolNums.includes(i))errors.push(`missing TOOL${String(i).padStart(3,'0')}`);
if(new Set(toolNums).size!==toolNums.length)errors.push('duplicate tool definition');
const syntax=spawnSync(process.execPath,['--check',scriptPath],{encoding:'utf8'});
if(syntax.status!==0)errors.push(`runner syntax fail: ${syntax.stderr||syntax.stdout}`);
const representativeSource=path.join(root,'components','svg-bmp-tiff-converter-tool.tsx');
if(fs.existsSync(representativeSource)){
  const audit=spawnSync(process.execPath,[path.join(root,'scripts','audit-mobile-real-photo-source-map.mjs')],{cwd:root,encoding:'utf8'});
  process.stdout.write(audit.stdout||'');process.stderr.write(audit.stderr||'');
  if(audit.status!==0)errors.push('source workflow audit failed');
}else{
  console.log('[SELF-CHECK] patch package only: source audit deferred until overlay on full project');
}
console.log(`[SELF-CHECK] tools=${toolNums.length} errors=${errors.length}`);
if(errors.length){for(const e of errors)console.error(`[FAIL] ${e}`);process.exit(1);}
console.log('[PASS] mobile real-photo validator checklist/source/static self-check');
