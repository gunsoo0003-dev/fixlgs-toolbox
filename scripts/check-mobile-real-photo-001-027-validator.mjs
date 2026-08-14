#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
const root=process.cwd();
const scriptPath=process.env.MOBILE_VALIDATOR_SCRIPT || path.join(root,'scripts','run-mobile-real-photo-001-027.mjs');
const script=fs.readFileSync(scriptPath,'utf8');
const errors=[];
const must=[
  'A1 CHOOSER_OPEN','A2 MEDIA_ACTION_SELECTED','A3 GALLERY_SELECTED','A4 CAMERA_SELECTED','A5 CAMERA_GRID_READY','A6 PHOTO_SLOT_','A7 RETURN_TO_WEB',
  'W4 IMMEDIATE_SMALL_SCROLL','discoverPhotoGrid','snapshotNative','TOOL018_SPECIAL_FAIL','INPUT_NOT_APPLICABLE',
  'uploads:2','tool013-select','tool014-select','tool015-before-slot','tool015-after-slot','tool016-addbar','tool016-content','tool017-select','tool017-process-all','tool020-drop','tool023-generate','tool024-export-zip',
  'recoverToChrome','HARNESS_DOWNLOAD_FILE_NOT_OBSERVED','DOWNLOAD_BEFORE.json','DOWNLOAD_REDOWNLOAD_CONFIRM','TOOL005 CURRENT_RESULT_USE','TOOL003_UNSUPPORTED_INPUT',
  'tool023-dropzone','tool025-file-input','tool025-dropzone','tool025-workspace-dropzone','TOOL025_INDIVIDUAL_DOWNLOAD','TOOL025_A4_DOWNLOAD',
  'tool026-file-input','tool026-dropzone','tool026-create','tool026-result','tool026-download',
  'tool027-file-input','tool027-dropzone','tool027-convert','tool027-results','tool027-download',
  'resolveTool025Base','HARNESS_WEB_ROUTE_NOT_AVAILABLE','HARNESS_TOOL025_BASE_UNAVAILABLE','no server spawn','cleanupAndroidResources','ANDROID_DEVICE_CLOSE','[EXIT] NORMAL','BLOCKED_STEPS','archiveResultFolder','RESULT ZIP TARGET','RETEST_HARNESS_INVALID_ORIGINAL_PRODUCT_FAIL_PRESERVED'
];
for(const x of must)if(!script.includes(x))errors.push(`missing flow token: ${x}`);
if(/sleep\(5000\)|setTimeout\([^,]+,\s*5000/.test(script))errors.push('fixed 5 second wait found');
if(/\(완료\|추가\|열기|Done\|Add\|Open/.test(script))errors.push('Open/열기 found in picker commit action list');
if(!/adb\('shell',script\)/.test(script))errors.push('download snapshot must pass complete remote script directly to adb shell');
const toolNums=[...script.matchAll(/\bt\((\d+),/g)].map(m=>Number(m[1]));
if(toolNums.length!==27)errors.push(`tool definitions != 27 (${toolNums.length})`);
for(let i=1;i<=27;i++)if(!toolNums.includes(i))errors.push(`missing TOOL${String(i).padStart(3,'0')}`);
if(new Set(toolNums).size!==toolNums.length)errors.push('duplicate tool definition');
for(const x of ['TOOLBOX_MOBILE_REALPHOTO_001_027_${stamp}','fatal-harness.json','RESULT ZIP TARGET','archiveResultFolder(outDir,zipPath)']) if(!script.includes(x))errors.push(`missing result/archive contract: ${x}`);
if(!script.includes("kind:'id-passport'"))errors.push('TOOL025 id-passport workflow missing');
if(!script.includes("t(26,'image-to-pdf'"))errors.push('TOOL026 mobile definition missing');
if(!script.includes("kind:'click-result',click:'[data-testid=\"tool026-create\"]'"))errors.push('TOOL026 mobile create/download workflow missing');
if(!script.includes("t(27,'pdf-to-image-converter'"))errors.push('TOOL027 mobile definition missing');
if(!script.includes("kind:'click-result',click:'[data-testid=\"tool027-convert\"]'"))errors.push('TOOL027 mobile convert/download workflow missing');
if(!script.includes("inputKind:'pdf-document'"))errors.push('TOOL027 PDF document-input contract missing');
if(/nextCli|next\s+dev|next\/dist\/bin\/next/.test(script))errors.push('mobile runner must not start a new Next server; existing validator flow only');
const syntax=spawnSync(process.execPath,['--check',scriptPath],{encoding:'utf8'});
if(syntax.status!==0)errors.push(`runner syntax fail: ${syntax.stderr||syntax.stdout}`);
const representativeSource=path.join(root,'components','svg-bmp-tiff-converter-tool.tsx');
if(fs.existsSync(representativeSource)){
  const audit=spawnSync(process.execPath,[path.join(root,'scripts','audit-mobile-real-photo-source-map.mjs')],{cwd:root,encoding:'utf8'});
  process.stdout.write(audit.stdout||'');process.stderr.write(audit.stderr||'');
  if(audit.status!==0)errors.push('source workflow audit failed');
}else console.log('[SELF-CHECK] patch package only: source audit deferred until overlay on full project');
console.log(`[SELF-CHECK] tools=${toolNums.length} errors=${errors.length}`);
if(errors.length){for(const e of errors)console.error(`[FAIL] ${e}`);process.exit(1);}
console.log('[PASS] mobile real-photo 001~027 validator checklist/source/static self-check');
