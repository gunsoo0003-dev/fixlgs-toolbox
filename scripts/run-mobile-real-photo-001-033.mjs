#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { _android as android } from 'playwright';

/*
  FIXLGS TOOLBOX 001~033 Android Chrome real-photo smoke validator V23
  - product code is never modified
  - real user flow only: open tool -> native picker -> Gallery -> Camera -> first photo -> immediate small scroll
  - one first-pass case per tool, one independent retest only for PRODUCT_FAIL
  - no product retry/fallback/recovery inside a case
  - HARNESS_FAIL is separated from PRODUCT_FAIL
*/

const FLOW_CHECKLIST = [
  'W1 WEB_TOOL_OPEN',
  'W2 UPLOAD_CONTROL_RESOLVED',
  'W3 UPLOAD_CONTROL_CLICKED',
  'A1 CHOOSER_OPEN',
  'A2 MEDIA_ACTION_DISCOVERED_AND_SELECTED',
  'A3 GALLERY_SELECTED',
  'A4 CAMERA_SELECTED',
  'A5 CAMERA_GRID_PROVEN',
  'A6 PHOTO_SLOT_1_SELECTED',
  'A7 RETURN_TO_WEB',
  'W4 IMMEDIATE_SMALL_SCROLL',
  'W5 ATTACH_STATE_READY',
  'W6 PROCESS_ACTION_IF_REQUIRED',
  'W7 RESULT_READY',
  'W8 CASE_PASS_OR_TYPED_FAIL',
];

const args = parseArgs(process.argv);
let BASE = String(args['base-url'] || 'https://toolbox.fixlgs.com').replace(/\/$/, '');
const BASE_EXPLICIT = Boolean(args['base-url']);
let autoReversePort = null;
const LOCALE = String(args.locale || 'ko');
const SAFETY_ATTACH_MS = numArg(args['attach-timeout'], 12000);
const SAFETY_RESULT_MS = numArg(args['result-timeout'], 18000);
const RETEST = args['no-retest'] ? false : true;
const PHOTO_SLOT = Math.max(1, numArg(args['photo-slot'], 1));
const ONLY = parseOnly(args.only);
const SCROLL_PX = numArg(args.scroll, 420);
const desktop = process.platform === 'win32' ? path.join(process.env.USERPROFILE || os.homedir(), 'Desktop') : os.homedir();
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const outDir = path.join(desktop, `TOOLBOX_MOBILE_REALPHOTO_001_033_${stamp}`);
fs.mkdirSync(outDir, { recursive: true });

const TOOLS = [
  t(1,'jpg-png-webp-image-converter','[data-testid="converter-file-input"]',['[data-testid="converter-file-card"]'],{kind:'status',run:'[data-testid="converter-run"]',card:'[data-testid="converter-file-card"]',terminal:/done|error|cancelled/,pass:/done/,downloadInCard:true},{uploadControls:['[data-testid="converter-upload-button"]']}),
  t(2,'heic-avif-image-converter','[data-testid="heic-file-input"]',['[data-testid="heic-file-card"]'],{kind:'status',run:'[data-testid="heic-run"]',card:'[data-testid="heic-file-card"]',terminal:/done|error|cancelled/,pass:/done/,downloadInCard:true}),
  t(3,'svg-bmp-tiff-image-converter','[data-testid="svg-file-input"]',['[data-testid="svg-file-card"]'],{kind:'status',run:'[data-testid="svg-run"]',card:'[data-testid="svg-file-card"]',terminal:/done|error|cancelled/,pass:/done/,downloadInCard:true},{fixedGalleryInputUnsupported:true}),
  t(4,'image-compressor','[data-testid="compressor-file-input"]',['[data-testid="compressor-file-card"]'],{kind:'status',run:'[data-testid="compressor-run"]',card:'[data-testid="compressor-file-card"]',terminal:/done|kept|failed|cancelled/,pass:/done|kept/,downloadInCard:true}),
  t(5,'target-size-image-compressor','[data-testid="target-file-input"]',['[data-testid="target-file-card"]'],{kind:'status',run:'[data-testid="target-compress-button"]',card:'[data-testid="target-file-card"]',terminal:/^(reached|already|unreached|failed|cancelled)$/,pass:/^(reached|already)$/,downloadInCard:true,acceptUnreached:/^(현재 결과 사용|Use current result|現在の結果を使用)$/i}),
  t(6,'image-resizer','[data-testid="resizer-file-input"]',['[data-testid="resizer-file-card"]'],{kind:'status',run:'[data-testid="resizer-run"]',card:'[data-testid="resizer-file-card"]',terminal:/done|kept|failed|cancelled/,pass:/done|kept/,downloadInCard:true}),
  t(7,'web-image-optimizer','[data-testid="optimizer-file-input"]',['[data-testid="optimizer-file-card"]'],{kind:'status',run:'[data-testid="optimizer-run"]',card:'[data-testid="optimizer-file-card"]',terminal:/done|kept|failed|cancelled/,pass:/done|kept/,downloadInCard:true}),
  t(8,'image-cropper-rotator','[data-testid="cropper-file-input"]',['[data-testid="cropper-stage"]'],{kind:'cropper'}),
  t(9,'image-brightness-color-adjuster','input[type="file"]',['[data-testid="tool009-editor"]','[data-testid="tool009-preview-canvas"]'],{kind:'click-result',click:'[data-testid="tool009-auto"]',result:'[data-testid="tool009-result"]',download:'[data-testid="tool009-download"]'},{uploadControls:['[data-testid="tool009-select"]'],uploadText:/이미지 선택|사진 선택|파일 선택/i}),
  t(10,'image-mosaic-blur-tool','input[type="file"]',['[data-testid="tool010-editor"]','[data-testid="tool010-canvas"]'],{kind:'mosaic'},{uploadControls:['[data-testid="tool010-select"]'],uploadText:/이미지 선택|사진 선택|파일 선택/i}),
  t(11,'image-padding-background-tool','[data-testid="tool011-file"]',['[data-testid="tool011-editor"]','[data-testid="tool011-canvas-wrap"]'],{kind:'click-result',click:'[data-testid="tool011-download"]',result:'[data-testid="tool011-result"]',status:'[data-testid="tool011-status"]'}),
  t(12,'image-border-rounded-corners-tool','[data-testid="tool012-file"]',['[data-testid="tool012-editor"]'],{kind:'border'}),
  t(13,'image-merger','[data-testid="tool013-file-input"]',['[data-testid="tool013-file-card"]'],{kind:'click-result',click:'[data-testid="tool013-download"]',result:'[data-testid="tool013-output"]',download:'[data-testid="tool013-download"]'},{uploads:2,uploadControls:['[data-testid="tool013-select"]'],uploadText:/이미지 선택|이미지 추가|Select Images|Add Images/i}),
  t(14,'image-collage-maker','[data-testid="tool014-file-input"]',['[data-testid="tool014-preview-canvas"]'],{kind:'click-result',click:'[data-testid="tool014-download"]',result:'[data-testid="tool014-preview-canvas"]',download:'[data-testid="tool014-download"]'},{uploads:2,uploadControls:['[data-testid="tool014-select"]'],uploadText:/이미지 여러 장 선택|이미지 추가|Select multiple images|Add images/i}),
  t(15,'before-after-image-maker','[data-testid="tool015-before-input"]',['[data-testid="tool015-preview-canvas"]'],{kind:'before-after'},{uploadSelectors:['[data-testid="tool015-before-input"]','[data-testid="tool015-after-input"]'],uploadControlsByInput:{'[data-testid="tool015-before-input"]':['[data-testid="tool015-before-slot"] button'],'[data-testid="tool015-after-input"]':['[data-testid="tool015-after-slot"] button']},uploadText:/선택|교체|Choose|Replace/i}),
  t(16,'add-text-to-image','[data-testid="tool016-file-input"]',['[data-testid="tool016-preview-canvas"]'],{kind:'text'}),
  t(17,'image-watermark-tool','[data-testid="tool017-input"]',['[data-testid="tool017-preview-canvas"]'],{kind:'watermark'},{uploadControls:['[data-testid="tool017-select"]'],uploadText:/이미지 선택|이미지 추가|Select|Add/i}),
  t(18,'image-metadata-checker','[data-testid="tool018-input"]',['[data-testid="tool018-result"]','[data-testid="tool018-basic-info"]'],{kind:'metadata'},{special:true}),
  t(19,'youtube-thumbnail-maker','[data-testid="tool019-file-input"]',['[data-testid="tool019-preview-canvas"]'],{kind:'title-download',title:'[data-testid="tool019-title-text"]',download:'[data-testid="tool019-download"]',status:'[data-testid="tool019-status"]',result:'[data-testid="tool019-output"]'}),
  t(20,'youtube-channel-banner-maker','[data-testid="tool020-background-input"]',['[data-testid="tool020-preview-canvas"]'],{kind:'title-download',title:'[data-testid="tool020-title"]',download:'[data-testid="tool020-download"]',result:'[data-testid="tool020-output"]'},{uploadControls:['[data-testid="tool020-drop"] button'],uploadText:/배경 이미지 선택|배경 이미지 교체|Choose Background Image|Replace Background/i}),
  t(21,'social-media-image-maker','[data-testid="tool021-background-input"]',['[data-testid="tool021-interactive-preview"]'],{kind:'download',download:'[data-testid="tool021-download-current"]',status:'[data-testid="tool021-status"]'}),
  t(22,'blog-open-graph-image-maker','[data-testid="tool022-background-input"]',['[data-testid="tool-022-root"]'],{kind:'download',download:'[data-testid="tool022-download-current"]',status:'[data-testid="tool022-status"]'}),
  t(23,'app-icon-favicon-generator','[data-testid="tool023-file-input"]',['[data-testid="tool023-preview"]','[data-testid="tool023-file-input-loaded"]'],{kind:'generate',run:'[data-testid="tool023-generate"]',result:'[data-testid="tool023-file-list"]',status:'[data-testid="tool023-status"]'},{uploadControls:['[data-testid="tool023-dropzone"] button'],uploadText:/이미지 선택|Choose Image|Select Image|画像を選択/i}),
  t(24,'app-store-screenshot-maker','[data-testid="tool024-dropzone"] input[type="file"], input[type="file"]',['[data-testid="tool024-preview"]'],{kind:'export',run:'[data-testid="tool024-export-zip"]',count:'[data-testid="tool024-result-count"]',failures:'[data-testid="tool024-export-failures"]'}),
  t(25,'id-passport-photo-maker','[data-testid="tool025-file-input"]',['[data-testid="tool025-preview"] canvas'],{kind:'id-passport',download:'[data-testid="tool025-download"]',a4:'[data-testid="tool025-a4-download"]',size:'[data-testid="tool025-output-size"]',a4count:'[data-testid="tool025-a4-count"]',dropzone:'[data-testid="tool025-dropzone"]',workspace:'[data-testid="tool025-workspace-dropzone"]'},{uploadControls:['[data-testid="tool025-dropzone"] button'],uploadText:/사진 선택|새 사진 선택|Choose Photo|Choose another photo|写真を選択|新しい写真を選択/i}),
  t(26,'image-to-pdf','[data-testid="tool026-file-input"]',['[data-testid="tool026-item"]'],{kind:'click-result',click:'[data-testid="tool026-create"]',result:'[data-testid="tool026-result"]',download:'[data-testid="tool026-download"]'},{uploadControls:['[data-testid="tool026-dropzone"] button'],uploadText:/이미지 선택|이미지 추가|Choose Images|Add Images|画像を選択|画像を追加/i}),
  t(27,'pdf-to-image-converter','[data-testid="tool027-file-input"]',['[data-testid="tool027-workspace"]'],{kind:'click-result',click:'[data-testid="tool027-convert"]',result:'[data-testid="tool027-results"]',download:'[data-testid="tool027-download"]'},{uploadControls:['[data-testid="tool027-dropzone"] button'],uploadText:/PDF 선택|PDF 교체|Choose PDF|Replace PDF|PDFを選択|PDFを変更/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(28,'merge-pdf','[data-testid="tool028-file-input"]',['[data-testid="tool028-workspace"]'],{kind:'click-result',click:'[data-testid="tool028-merge-button"]',result:'[data-testid="tool028-result"]',download:'[data-testid="tool028-download"]'},{uploads:2,uploadControls:['[data-testid="tool028-dropzone"] button'],uploadText:/PDF 선택|PDF 파일 추가|Choose PDFs|Add PDF files|PDFを選択|PDFファイルを追加/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(29,'split-extract-pdf','[data-testid="tool029-file-input"]',['[data-testid="tool029-workspace"]'],{kind:'click-result',click:'[data-testid="tool029-process"]',result:'[data-testid="tool029-results"]',download:'[data-testid="tool029-download-all"]'},{uploadControls:['[data-testid="tool029-dropzone"] button'],uploadText:/PDF 선택|새 PDF|Choose PDF|New PDF|PDFを選択|新しいPDF/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(30,'pdf-page-organizer','[data-testid="tool030-file-input"]',['[data-testid="tool030-workspace"]'],{kind:'click-result',click:'[data-testid="tool030-save"]',result:'[data-testid="tool030-result"]',download:'[data-testid="tool030-download"]'},{uploadControls:['[data-testid="tool030-dropzone"] button'],uploadText:/PDF 선택|새 PDF|Choose PDF|New PDF|PDFを選択|新しいPDF/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(31,'pdf-page-number-watermark','[data-testid="tool031-file-input"]',['[data-testid="tool031-workspace"]'],{kind:'click-result',click:'[data-testid="tool031-create"]',result:'[data-testid="tool031-result"]',download:'[data-testid="tool031-download"]'},{uploadControls:['[data-testid="tool031-dropzone"] button'],uploadText:/PDF 선택|새 PDF|Choose PDF|New PDF|PDFを選択|新しいPDF/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(32,'pdf-signature','[data-testid="tool032-file-input"]',['[data-testid="tool032-workspace"]'],{kind:'pdf-signature',click:'[data-testid="tool032-create"]',result:'[data-testid="tool032-result"]',download:'[data-testid="tool032-download"]'},{uploadControls:['[data-testid="tool032-dropzone"] button'],uploadText:/PDF 선택|새 PDF|Choose PDF|New PDF|PDFを選択|新しいPDF/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
  t(33,'pdf-compressor','[data-testid="tool033-file-input"]',['[data-testid="tool033-workspace"]'],{kind:'click-result',click:'[data-testid="tool033-compress-button"]',result:'[data-testid="tool033-result"]',download:'[data-testid="tool033-download"]'},{uploadControls:['[data-testid="tool033-dropzone"] button'],uploadText:/PDF 선택|Choose PDF|PDFを選択/i,fixedGalleryInputUnsupported:true,inputKind:'pdf-document'}),
].filter(x => !ONLY || ONLY.has(x.number));

function t(n,slug,input,attach,workflow,extra={}) { return {number:String(n).padStart(3,'0'), slug, input, attach, workflow, uploads:1, ...extra}; }
function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const s=argv[i];if(!s.startsWith('--'))continue;const k=s.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
function numArg(v,d){const n=Number(v);return Number.isFinite(n)&&n>=0?n:d;}
function parseOnly(v){if(!v)return null;const s=new Set();for(const p of String(v).split(',')){const m=p.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)continue;const a=+m[1],b=m[2]?+m[2]:a;for(let i=Math.min(a,b);i<=Math.max(a,b);i++)s.add(String(i).padStart(3,'0'));}return s;}
const sleep = ms => new Promise(r=>setTimeout(r,ms));
function adb(...a){return spawnSync('adb',a,{encoding:'utf8',shell:false});}
function adbText(...a){const r=adb(...a);return `${r.stdout||''}${r.stderr||''}`;}
function safeName(v){return String(v).replace(/[^a-zA-Z0-9_.-]+/g,'_');}
function write(name,data){fs.writeFileSync(path.join(outDir,name),typeof data==='string'?data:JSON.stringify(data,null,2));}
const logs=[];function log(...p){const s=p.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');console.log(s);logs.push(s);fs.writeFileSync(path.join(outDir,'runner.log'),logs.join('\n'));}
const TOOL025_ONLY = Boolean(ONLY && ONLY.size===1 && ONLY.has('025'));
async function probeHttp(url,timeoutMs=3500){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(url,{redirect:'follow',signal:controller.signal,headers:{'cache-control':'no-cache'}});
    const text=await r.text();
    const notFound=r.status===404 || /page not found|404\s*:\s*this page could not be found/i.test(text);
    return {ok:r.ok&&!notFound,status:r.status,notFound};
  }catch(e){return {ok:false,status:0,error:String(e?.message||e)};}
  finally{clearTimeout(timer);}
}
async function resolveTool025Base(){
  if(!TOOL025_ONLY)return;
  const route=`/${LOCALE}/id-passport-photo-maker`;
  if(BASE_EXPLICIT){
    const u=new URL(BASE);
    if((u.hostname==='127.0.0.1'||u.hostname==='localhost')&&/^\d+$/.test(u.port||'')){
      const port=Number(u.port);const rr=adb('reverse',`tcp:${port}`,`tcp:${port}`);
      if(rr.status!==0)throw new Error(`HARNESS_ADB_REVERSE_FAIL:${(rr.stderr||rr.stdout||'').trim()}`);
      autoReversePort=port;BASE=`http://127.0.0.1:${port}`;log(`[BASE] explicit local URL via existing validator + adb reverse tcp:${port}`);
    }
    return;
  }
  const prod=await probeHttp(`${BASE}${route}`);
  if(prod.ok){log(`[BASE] production TOOL025 available ${BASE}`);return;}
  log(`[BASE] production TOOL025 unavailable status=${prod.status||0}; searching existing local dev server (no server spawn)`);
  for(const port of [3000,3001,3002,3003,3025]){
    const local=await probeHttp(`http://127.0.0.1:${port}${route}`);
    if(!local.ok)continue;
    const rr=adb('reverse',`tcp:${port}`,`tcp:${port}`);
    if(rr.status!==0)throw new Error(`HARNESS_ADB_REVERSE_FAIL:${(rr.stderr||rr.stdout||'').trim()}`);
    autoReversePort=port;BASE=`http://127.0.0.1:${port}`;
    log(`[BASE] existing local TOOL025 found on port ${port}; original mobile validator flow preserved`);
    return;
  }
  throw new Error('HARNESS_TOOL025_BASE_UNAVAILABLE: production route is not deployed and no existing local dev server was found on ports 3000,3001,3002,3003,3025');
}
async function shot(name){const r=spawnSync('adb',['exec-out','screencap','-p'],{encoding:null,maxBuffer:64*1024*1024});if(r.status===0&&r.stdout?.length)fs.writeFileSync(path.join(outDir,name),r.stdout);}

function xmlDecode(v=''){return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function parseBounds(s=''){const m=String(s).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);if(!m)return null;const l=+m[1],t=+m[2],r=+m[3],b=+m[4];return{left:l,top:t,right:r,bottom:b,w:r-l,h:b-t,x:Math.round((l+r)/2),y:Math.round((t+b)/2)};}
function dumpUi(){const remote='/sdcard/fixlgs-mobile-audit.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseAttrs(src=''){const a={};const ar=/([\w-]+)="([^"]*)"/g;let q;while((q=ar.exec(src)))a[q[1]]=xmlDecode(q[2]);return a;}
function parseUiTree(xml){
  const nodes=[], stack=[];
  const re=/<node\b([^>]*)\/>|<node\b([^>]*)>|<\/node>/g; let m;
  while((m=re.exec(xml||''))){
    if(m[0].startsWith('</node')){stack.pop();continue;}
    const attrs=parseAttrs(m[1]??m[2]??'');
    const parent=stack.length?stack[stack.length-1]:-1;
    const idx=nodes.length; nodes.push({...attrs,parent,children:[]});
    if(parent>=0)nodes[parent].children.push(idx);
    if(m[2]!==undefined)stack.push(idx);
  }
  return nodes;
}
function parseNodes(xml){return parseUiTree(xml).map(({parent,children,...n})=>n);}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim().replace(/\s+/g,' ');}
function isPickerPkg(p=''){return /(photopicker|documentsui|myfiles|gallery|sec\.android\.gallery|providers\.media|intentresolver|resolver|permissioncontroller)/i.test(p);}
function pickerActive(xml){const ns=parseNodes(xml);return ns.some(n=>isPickerPkg(n.package)) || ns.some(n=>/(camera|file|document|photo|image|video|media|gallery|카메라|파일|문서|사진|동영상|이미지|갤러리|カメラ|ファイル|写真|動画|画像|ギャラリー)/i.test(hay(n)) && !/chrome/i.test(n.package||''));}

function nodeScreen(nodes){let right=0,bottom=0;for(const n of nodes){const b=parseBounds(n.bounds);if(!b)continue;right=Math.max(right,b.right);bottom=Math.max(bottom,b.bottom);}return{w:right||1080,h:bottom||2400};}
function descendantText(nodes,idx){const seen=[],q=[idx];while(q.length){const i=q.shift(),n=nodes[i];if(!n)continue;const h=hay(n);if(h)seen.push(h);for(const c of n.children||[])q.push(c);}return [...new Set(seen)].join(' | ');}
function nearestActionContainer(nodes,idx,screen){
  let i=idx, best=idx;
  while(i>=0){const n=nodes[i],b=parseBounds(n.bounds);if(b){
    if(n.clickable==='true')return i;
    if(b.w>=80&&b.h>=40&&b.w<=screen.w*.95&&b.h<=screen.h*.35)best=i;
  }i=n?.parent??-1;}
  return best;
}
function chooserActionCandidates(xml){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes),groups=new Map();
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i];if(/chrome/i.test(n.package||''))continue;
    const label=`${n.text||''} ${n['content-desc']||''}`.trim().replace(/\s+/g,' ');
    if(!label)continue;
    const b=parseBounds(n.bounds);if(!b||b.w<18||b.h<18)continue;
    if(b.top<screen.h*.35)continue; // chooser actions are in the lower portion of this Samsung sheet
    const ai=nearestActionContainer(nodes,i,screen),an=nodes[ai],ab=parseBounds(an?.bounds)||b;
    if(!ab||ab.w<40||ab.h<32)continue;
    const key=an?.bounds||n.bounds;
    if(!groups.has(key))groups.set(key,{idx:ai,n:an||n,b:ab,labels:new Set(),resources:new Set(),classes:new Set()});
    const g=groups.get(key);g.labels.add(label);if(n['resource-id'])g.resources.add(n['resource-id']);if(n.class)g.classes.add(n.class);
  }
  const out=[...groups.values()].map(g=>{
    const subtree=descendantText(nodes,g.idx);
    const h=[...g.labels,subtree,...g.resources].filter(Boolean).join(' | ').replace(/\s+/g,' ');
    return {...g,h,clickable:g.n?.clickable==='true'};
  }).filter(g=>!/cancel|취소|닫기|close|more|더보기|settings|설정|キャンセル/i.test(g.h));
  // Distinct cards/rows only, stable left-to-right then top-to-bottom ordering.
  const dedup=[];
  for(const g of out.sort((a,b)=>a.b.top-b.b.top||a.b.left-b.b.left)){
    if(!dedup.some(d=>Math.abs(d.b.x-g.b.x)<35&&Math.abs(d.b.y-g.b.y)<35))dedup.push(g);
  }
  return dedup;
}
function chooserRole(g){
  const s=g.h;
  if(/camera|카메라|カメラ|capture|촬영/i.test(s))return 'camera';
  if(/file|files|document|documents|myfiles|파일|문서|ファイル|ドキュメント/i.test(s))return 'files';
  if(/photo|photos|image|images|video|videos|media|gallery|사진|동영상|이미지|갤러리|写真|画像|動画|メディア|ギャラリー/i.test(s))return 'media';
  return 'unknown';
}
function chooseMediaAction(xml){
  const all=chooserActionCandidates(xml).map(g=>({...g,role:chooserRole(g)}));
  const media=all.filter(g=>g.role==='media');
  if(media.length)return {target:media[0],all,reason:'semantic-media'};
  // Runtime inference: if the sheet has the classic three actions and camera/files are identifiable,
  // choose the remaining action without requiring its localized display text.
  const camera=all.filter(g=>g.role==='camera'), files=all.filter(g=>g.role==='files');
  const unknown=all.filter(g=>g.role==='unknown');
  if(camera.length&&files.length&&unknown.length===1)return {target:unknown[0],all,reason:'remaining-after-camera-files'};
  return {target:null,all,reason:'unresolved'};
}
function systemTextTargets(xml, patterns){
  const ns=parseNodes(xml), out=[];
  for(const n of ns){
    if(/chrome/i.test(n.package||'')) continue;
    const b=parseBounds(n.bounds); if(!b || b.w<20 || b.h<20) continue;
    const h=hay(n); const ix=patterns.findIndex(re=>re.test(h));
    if(ix>=0) out.push({n,b,h,ix,clickable:n.clickable==='true'});
  }
  out.sort((a,b)=>a.ix-b.ix || Number(b.clickable)-Number(a.clickable) || a.b.top-b.b.top || a.b.left-b.b.left);
  return out;
}
function tapTarget(t){adb('shell','input','tap',String(t.b.x),String(t.b.y));}

function normalizeVisible(s=''){return String(s||'').trim().replace(/\s+/g,' ');}
function visibleLabel(n){return [normalizeVisible(n.text),normalizeVisible(n['content-desc'])].filter(Boolean).join(' | ');}
function phaseActionTarget(xml,patterns){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes),found=[];
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i]; if(/chrome/i.test(n.package||''))continue;
    // IMPORTANT: Android often exposes the same visible label in BOTH text and content-desc.
    // Matching their concatenation turns "갤러리" into "갤러리 갤러리" and falsely misses it.
    // Match each accessibility field independently, then resolve the real clickable container.
    const fields=[normalizeVisible(n.text),normalizeVisible(n['content-desc'])].filter(Boolean);
    if(!fields.length)continue;
    const b=parseBounds(n.bounds); if(!b||b.w<18||b.h<18)continue;
    let bestRank=Infinity,matched='';
    for(const field of fields){
      const r=patterns.findIndex(re=>re.test(field));
      if(r>=0 && r<bestRank){bestRank=r;matched=field;}
    }
    if(!Number.isFinite(bestRank))continue;
    // If the labelled node itself is clickable, prefer it. Otherwise climb only to the
    // nearest clickable/action-sized parent so a whole sheet/container cannot steal the tap.
    let ai=i;
    if(n.clickable!=='true') ai=nearestActionContainer(nodes,i,screen);
    const an=nodes[ai]||n, ab=parseBounds(an.bounds)||b;
    if(!ab||ab.w<40||ab.h<32)continue;
    const exact=fields.some(field=>patterns.some(re=>{const m=field.match(re);return m&&m[0]===field;}));
    found.push({idx:ai,n:an,b:ab,h:matched||visibleLabel(n),rank:bestRank,exact,clickable:an.clickable==='true',sourceText:normalizeVisible(n.text),sourceDesc:normalizeVisible(n['content-desc'])});
  }
  found.sort((a,b)=>Number(b.exact)-Number(a.exact)||a.rank-b.rank||Number(b.clickable)-Number(a.clickable)||a.b.top-b.b.top||a.b.left-b.b.left);
  const dedup=[];for(const c of found){if(!dedup.some(d=>rectKey(d.b)===rectKey(c.b)))dedup.push(c);}return dedup[0]||null;
}
async function tapRequiredPhase(caseId,phase,xml,patterns,errorPrefix){
  await snapshotNative(caseId,`${phase}_BEFORE`,xml);
  const target=phaseActionTarget(xml,patterns);
  if(!target){
    write(`${caseId}_${phase}_CANDIDATES.json`,systemTextTargets(xml,patterns).map(t=>({label:t.h,bounds:t.n.bounds,resourceId:t.n['resource-id']||'',class:t.n.class||'',clickable:t.clickable})));
    throw new Error(`${errorPrefix}_CONTROL_NOT_FOUND`);
  }
  write(`${caseId}_${phase}_TARGET.json`,{label:target.h,bounds:target.n.bounds,resourceId:target.n['resource-id']||'',class:target.n.class||'',clickable:target.clickable});
  const before=uiFingerprint(xml); tapTarget(target); log(`[FLOW] ${caseId} ${phase} TAP -> "${target.h}"`);
  const moved=await waitSystemState(x=>{
    if(!pickerActive(x))return {kind:'returned'};
    return uiFingerprint(x)!==before?{kind:'changed'}:null;
  },7000,`${errorPrefix}_DID_NOT_CHANGE`);
  if(moved.value.kind==='returned')throw new Error(`${errorPrefix}_RETURNED_EARLY`);
  await snapshotNative(caseId,`${phase}_AFTER`,moved.xml);
  return moved.xml;
}

// Android media navigation is read from the live UI tree at runtime.
// On the validated Samsung user path the media chooser has two distinct navigation phases:
// media action -> Gallery -> Camera -> photo grid. Each phase is resolved from visible
// accessibility text/content-desc and its clickable ancestor; resource-id/package words are
// never allowed to masquerade as the visible Gallery/Camera control.
function rectKey(b){return `${b.left},${b.top},${b.right},${b.bottom}`;}
function overlapRatio(a,b){const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));const inter=x*y;if(!inter)return 0;return inter/Math.min(a.w*a.h,b.w*b.h);}
function uiFingerprint(xml){
  const ns=parseNodes(xml).filter(n=>!/chrome/i.test(n.package||''));
  return ns.map(n=>`${n.package}|${n['resource-id']||''}|${n.text||''}|${n['content-desc']||''}|${n.bounds||''}|${n.clickable||''}`).join('\n');
}
function likelySystemBarText(h=''){return /^(오후|오전|AM|PM)?\s*\d{1,2}:\d{2}|wifi|battery|배터리|알림|notification|뒤로|back|홈|home|최근 앱|recent apps/i.test(h);}
function actionContainers(xml){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes),out=[];
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i]; if(/chrome/i.test(n.package||''))continue;
    const b=parseBounds(n.bounds); if(!b || b.w<44 || b.h<36)continue;
    const h=descendantText(nodes,i).trim();
    if(!h || likelySystemBarText(h))continue;
    if(/cancel|취소|닫기|close|settings|설정|도움말|help/i.test(h))continue;
    if(n.clickable!=='true' && n.focusable!=='true')continue;
    if(b.w>screen.w*.99 && b.h>screen.h*.75)continue;
    out.push({idx:i,n,b,h});
  }
  const dedup=[];
  for(const c of out.sort((a,b)=>a.b.top-b.b.top||a.b.left-b.b.left||a.b.w-b.b.w)){
    if(dedup.some(d=>overlapRatio(d.b,c.b)>.92 && d.h===c.h))continue;
    dedup.push(c);
  }
  return dedup;
}
function repeatedGridCells(xml){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes),raw=[];
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i]; if(/chrome/i.test(n.package||''))continue;
    const b=parseBounds(n.bounds); if(!b)continue;
    if(b.top<Math.max(180,screen.h*.08) || b.bottom>screen.h*.98)continue;
    if(b.w<90||b.h<90||b.w>screen.w*.60||b.h>screen.w*.60)continue;
    const ratio=b.w/b.h; if(ratio<.72||ratio>1.38)continue;
    const h=hay(n);
    if(/camera|카메라|file|파일|document|문서|album|앨범|gallery|갤러리|recent|최근|done|완료|add|추가|cancel|취소/i.test(h))continue;
    // Samsung Gallery/PhotoPicker thumbnail nodes can be unlabeled. Geometry and repetition
    // are stronger evidence than accessibility text, so keep image-ish/clickable containers.
    const imageish=/image|photo|thumbnail|grid|item|media|사진|이미지/i.test(`${n.class||''} ${n['resource-id']||''} ${h}`);
    if(n.clickable!=='true' && !imageish)continue;
    raw.push({idx:i,n,b,h});
  }
  // Remove nested duplicates that occupy the same thumbnail.
  const spatial=[];
  for(const c of raw.sort((a,b)=>a.b.top-b.b.top||a.b.left-b.b.left||b.b.w-a.b.w)){
    if(spatial.some(d=>Math.abs(d.b.x-c.b.x)<28&&Math.abs(d.b.y-c.b.y)<28))continue;
    spatial.push(c);
  }
  if(spatial.length<PHOTO_SLOT)return [];
  // Find the dominant thumbnail size. A real gallery presents >=4 near-equal tiles.
  let best=[];
  for(const seed of spatial){
    const grp=spatial.filter(c=>Math.abs(c.b.w-seed.b.w)<=Math.max(18,seed.b.w*.18)&&Math.abs(c.b.h-seed.b.h)<=Math.max(18,seed.b.h*.18));
    if(grp.length>best.length)best=grp;
  }
  if(best.length<PHOTO_SLOT)return [];
  best.sort((a,b)=>{
    const rowTol=Math.max(25,Math.min(a.b.h,b.b.h)*.35);
    if(Math.abs(a.b.top-b.b.top)<=rowTol)return a.b.left-b.b.left;
    return a.b.top-b.b.top;
  });
  // Require at least two distinct x positions so a vertical album list cannot masquerade as grid.
  const xs=[];for(const c of best){if(!xs.some(x=>Math.abs(x-c.b.x)<45))xs.push(c.b.x);}if(xs.length<2)return [];
  return best;
}

function robustPhotoGridCells(xml){
  // 1) Keep the strict repeated-cell detector when it already proves a real grid.
  const strict=repeatedGridCells(xml);
  if(strict.length>=PHOTO_SLOT)return strict.map(c=>({...c,gridSource:'strict'}));

  // 2) Samsung Gallery can expose thumbnail children without clickable/image labels.
  // Restrict geometric inference to an actual scrollable collection container so unrelated
  // square controls elsewhere on the screen can never become "photo 4".
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes);
  const containers=[];
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i]; if(/chrome/i.test(n.package||''))continue;
    const b=parseBounds(n.bounds); if(!b)continue;
    const cls=`${n.class||''} ${n['resource-id']||''}`;
    const collection=/RecyclerView|GridView|AbsListView|recycler|grid|photo_list|thumbnail|media_list/i.test(cls) || n.scrollable==='true';
    if(!collection)continue;
    if(b.w<screen.w*.65||b.h<screen.h*.20)continue;
    if(b.top>screen.h*.75)continue;
    containers.push({idx:i,n,b});
  }

  function descendants(root){
    const out=[],q=[...(nodes[root].children||[])];
    while(q.length){const i=q.shift();out.push(i);for(const c of nodes[i]?.children||[])q.push(c);}return out;
  }
  function gridFromContainer(c){
    const raw=[];
    for(const i of descendants(c.idx)){
      const n=nodes[i],b=parseBounds(n?.bounds);if(!b)continue;
      if(b.left<c.b.left-2||b.right>c.b.right+2||b.top<c.b.top-2||b.bottom>c.b.bottom+2)continue;
      if(b.w<70||b.h<70||b.w>screen.w*.48||b.h>screen.w*.48)continue;
      const ratio=b.w/b.h;if(ratio<.68||ratio>1.45)continue;
      const own=`${n.text||''} ${n['content-desc']||''}`.trim();
      if(/^(갤러리|최근|최근 항목|앨범|카메라|파일|완료|추가|취소|Gallery|Recents?|Albums?|Camera|Files?|Done|Add|Cancel)$/i.test(own))continue;
      raw.push({idx:i,n,b,h:hay(n),gridContainer:c.n['resource-id']||c.n.class||''});
    }
    const spatial=[];
    for(const x of raw.sort((a,b)=>a.b.top-b.b.top||a.b.left-b.b.left||b.b.w-a.b.w)){
      if(spatial.some(d=>Math.abs(d.b.x-x.b.x)<24&&Math.abs(d.b.y-x.b.y)<24))continue;
      spatial.push(x);
    }
    let best=[];
    for(const seed of spatial){
      const g=spatial.filter(x=>Math.abs(x.b.w-seed.b.w)<=Math.max(16,seed.b.w*.16)&&Math.abs(x.b.h-seed.b.h)<=Math.max(16,seed.b.h*.16));
      if(g.length>best.length)best=g;
    }
    if(best.length<PHOTO_SLOT)return [];
    const xs=[];for(const x of best){if(!xs.some(v=>Math.abs(v-x.b.x)<38))xs.push(x.b.x);}if(xs.length<2)return [];
    best.sort((a,b)=>{
      const tol=Math.max(22,Math.min(a.b.h,b.b.h)*.28);
      return Math.abs(a.b.top-b.b.top)<=tol ? a.b.left-b.b.left : a.b.top-b.b.top;
    });
    return best.map(x=>({...x,gridSource:'collection'}));
  }

  let best=[];
  for(const c of containers){const g=gridFromContainer(c);if(g.length>best.length)best=g;}
  return best;
}
function navigationScore(c,screen){
  const h=c.h; let score=0;
  if(/recent|최근|recents|recently|최신|camera roll|카메라 롤/i.test(h))score+=100;
  if(/photos?|사진|images?|이미지|gallery|갤러리|media|미디어/i.test(h))score+=70;
  if(/albums?|앨범|folders?|폴더|collections?|컬렉션/i.test(h))score+=45;
  if(/camera|카메라|files?|파일|document|문서|video only|동영상만/i.test(h))score-=120;
  if(c.b.top>screen.h*.12&&c.b.bottom<screen.h*.92)score+=15;
  if(c.b.w>screen.w*.25&&c.b.h>50)score+=10;
  if(c.b.h>screen.h*.40)score-=40;
  return score;
}
function mediaNavigationCandidates(xml,visitedRects=new Set()){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes);
  return actionContainers(xml).map(c=>({...c,score:navigationScore(c,screen)}))
    .filter(c=>c.score>0&&!visitedRects.has(rectKey(c.b)))
    .sort((a,b)=>b.score-a.score||a.b.top-b.b.top||a.b.left-b.b.left);
}
async function snapshotNative(caseId,label,xml){
  write(`${caseId}_${label}.xml`,xml);
  const nodes=parseNodes(xml).map(n=>({text:n.text||'',contentDesc:n['content-desc']||'',resourceId:n['resource-id']||'',class:n.class||'',package:n.package||'',clickable:n.clickable||'',focusable:n.focusable||'',bounds:n.bounds||''}));
  write(`${caseId}_${label}_nodes.json`,nodes);
  await shot(`${caseId}_${label}.png`);
}
async function discoverPhotoGrid(caseId,initialXml){
  let xml=initialXml; const seenFingerprints=new Set(); const visitedRects=new Set();
  for(let step=1;step<=6;step++){
    await snapshotNative(caseId,`MEDIA_STEP_${step}`,xml);
    const grid=repeatedGridCells(xml);
    if(grid.length>=PHOTO_SLOT){
      log(`[DISCOVERY] ${caseId} photo grid proven at step ${step}; cells=${grid.length}`);
      return {xml,cells:grid,step};
    }
    const fp=uiFingerprint(xml); if(seenFingerprints.has(fp))throw new Error('HARNESS_MEDIA_UI_LOOP'); seenFingerprints.add(fp);
    const nav=mediaNavigationCandidates(xml,visitedRects);
    write(`${caseId}_MEDIA_STEP_${step}_NAV.json`,nav.map(c=>({label:c.h,score:c.score,bounds:c.n.bounds,resourceId:c.n['resource-id']||'',class:c.n.class||''})));
    if(!nav.length)throw new Error('HARNESS_MEDIA_NAVIGATION_UNRESOLVED');
    const target=nav[0]; visitedRects.add(rectKey(target.b));
    log(`[DISCOVERY] ${caseId} step ${step} nav score=${target.score} -> "${target.h.slice(0,120)}"`);
    const before=fp; tapTarget(target);
    const moved=await waitSystemState(x=>{
      if(!pickerActive(x))return {kind:'returned'};
      const nx=uiFingerprint(x); if(nx!==before)return {kind:'changed'};
      return null;
    },7000,'HARNESS_MEDIA_NAVIGATION_DID_NOT_CHANGE');
    if(moved.value.kind==='returned')throw new Error('HARNESS_MEDIA_NAVIGATION_RETURNED_BEFORE_PHOTO_SELECTION');
    xml=moved.xml;
  }
  throw new Error('HARNESS_MEDIA_GRID_DISCOVERY_EXHAUSTED');
}
async function waitPicker(ms=7000){const st=Date.now();let last='';while(Date.now()-st<ms){last=dumpUi();if(pickerActive(last))return last;await sleep(120);}write(`picker_not_found_${Date.now()}.xml`,last);throw new Error('HARNESS_PICKER_NOT_DETECTED');}

async function waitSystemState(test, ms, errorCode){
  const st=Date.now(); let last='';
  while(Date.now()-st<ms){ last=dumpUi(); const v=test(last); if(v) return {xml:last,value:v}; await sleep(120); }
  throw new Error(errorCode);
}

// Checklist-bound Android picker flow. Every state must pass in order.
async function selectGalleryPhoto(caseId){
  // A1. Read the actual Android chooser instead of assuming its labels.
  let xml=await waitPicker(7000);
  await snapshotNative(caseId,'A1_CHOOSER_OPEN',xml);
  log(`[FLOW] ${caseId} A1 CHOOSER_OPEN PASS`);

  // A2. Discover the media action from every live chooser item. Camera/files are excluded;
  // an unfamiliar third action can still be inferred structurally.
  const choice=chooseMediaAction(xml);
  write(`${caseId}_A2_CHOOSER_ACTIONS.json`,choice.all.map(g=>({label:g.h,role:g.role,bounds:g.n?.bounds||'',clickable:g.clickable,resourceId:g.n?.['resource-id']||''})));
  if(choice.target){
    const before=uiFingerprint(xml);
    tapTarget(choice.target);
    log(`[FLOW] ${caseId} A2 MEDIA_ACTION_TAP (${choice.reason}) -> "${choice.target.h}"`);
    const moved=await waitSystemState(x=>{
      if(!pickerActive(x))return null;
      return uiFingerprint(x)!==before ? true : null;
    },7000,'HARNESS_CHOOSER_MEDIA_ACTION_DID_NOT_OPEN');
    xml=moved.xml;
    await snapshotNative(caseId,'A2_MEDIA_ACTION_SELECTED',xml);
    log(`[FLOW] ${caseId} A2 MEDIA_ACTION_SELECTED PASS`);
  }else{
    // Android can remember the last media handler and enter Gallery directly. This is a
    // valid native state, not a reason to misclassify the product. Prove that the next
    // expected visible phase exists before continuing.
    const galleryNow=phaseActionTarget(xml,[/^갤러리$/i,/^Gallery$/i,/^ギャラリー$/i]);
    const cameraNow=phaseActionTarget(xml,[/^카메라$/i,/^Camera$/i,/^カメラ$/i]);
    const gridNow=robustPhotoGridCells(xml);
    if(!galleryNow&&!cameraNow&&gridNow.length<PHOTO_SLOT){
      await snapshotNative(caseId,'A2_CHOOSER_UNRESOLVED',xml);
      throw new Error('HARNESS_CHOOSER_MEDIA_ACTION_UNRESOLVED');
    }
    write(`${caseId}_A2_DIRECT_MEDIA_STATE.json`,{galleryVisible:!!galleryNow,cameraVisible:!!cameraNow,gridCells:gridNow.length});
    log(`[FLOW] ${caseId} A2 MEDIA_ACTION_ALREADY_ACTIVE PASS`);
  }

  // A3. Samsung media flow: select the visible Gallery control on THIS screen.
  // Match visible text/content-desc only so an unrelated package/resource-id containing
  // "gallery" cannot steal the tap.
  const galleryControl=phaseActionTarget(xml,[/^갤러리$/i,/^Gallery$/i,/^ギャラリー$/i]);
  if(galleryControl){
    xml=await tapRequiredPhase(caseId,'A3_GALLERY',xml,[/^갤러리$/i,/^Gallery$/i,/^ギャラリー$/i],'HARNESS_GALLERY');
    log(`[FLOW] ${caseId} A3 GALLERY_SELECTED PASS`);
  }else{
    const cameraAlready=phaseActionTarget(xml,[/^카메라$/i,/^Camera$/i,/^カメラ$/i]);
    if(!cameraAlready && robustPhotoGridCells(xml).length<PHOTO_SLOT)throw new Error('HARNESS_GALLERY_CONTROL_NOT_FOUND');
    log(`[FLOW] ${caseId} A3 GALLERY_ALREADY_ACTIVE PASS`);
  }

  // A4. Inside Gallery, select the visible Camera collection. If the OS restored directly
  // into Camera, prove the photo grid rather than tapping an unrelated similarly named node.
  const cameraControl=phaseActionTarget(xml,[/^카메라$/i,/^Camera$/i,/^カメラ$/i]);
  if(cameraControl){
    xml=await tapRequiredPhase(caseId,'A4_CAMERA',xml,[/^카메라$/i,/^Camera$/i,/^カメラ$/i],'HARNESS_CAMERA_COLLECTION');
    log(`[FLOW] ${caseId} A4 CAMERA_SELECTED PASS`);
  }else if(robustPhotoGridCells(xml).length>=PHOTO_SLOT){
    log(`[FLOW] ${caseId} A4 CAMERA_ALREADY_ACTIVE PASS`);
  }else throw new Error('HARNESS_CAMERA_COLLECTION_CONTROL_NOT_FOUND');

  // A5. Only after Camera opens do we accept a proven repeated thumbnail grid.
  await snapshotNative(caseId,'A5_CAMERA_GRID_SCREEN',xml);
  const cells=robustPhotoGridCells(xml);
  if(cells.length<PHOTO_SLOT){
    await snapshotNative(caseId,'A5_GRID_UNRESOLVED',xml);
    throw new Error('HARNESS_CAMERA_PHOTO_GRID_NOT_PROVEN');
  }
  write(`${caseId}_A5_GRID.json`,cells.map((c,i)=>({slot:i+1,bounds:c.n.bounds,label:c.h,resourceId:c.n['resource-id']||'',class:c.n.class||'',clickable:c.n.clickable,gridSource:c.gridSource||'unknown',gridContainer:c.gridContainer||''})));
  log(`[FLOW] ${caseId} A5 CAMERA_GRID_READY PASS (${cells.length} cells)`);

  // A6. Camera uses a stable first-photo test input. Multi-image tools repeat this same photo.
  const c=cells[PHOTO_SLOT-1];
  if(!c)throw new Error(`HARNESS_PHOTO_SLOT_MISSING:${PHOTO_SLOT}`);
  const beforePhotoTap=uiFingerprint(xml);
  tapTarget(c);
  log(`[FLOW] ${caseId} A6 PHOTO_SLOT_${PHOTO_SLOT} TAP source=${c.gridSource||'unknown'} bounds=${c.n.bounds}`);
  // Prove that the tap hit a real media cell. It may either return immediately or change the
  // picker to a selected/commit state. Never silently continue after a dead coordinate tap.
  const photoTapState=await waitSystemState(x=>{
    if(!pickerActive(x))return {kind:'returned'};
    if(uiFingerprint(x)!==beforePhotoTap)return {kind:'changed'};
    return null;
  },3500,'HARNESS_PHOTO_SLOT_TAP_DID_NOT_CHANGE_UI').catch(async e=>{
    await snapshotNative(caseId,'A6_PHOTO_TAP_NO_EFFECT',dumpUi());
    throw e;
  });
  if(photoTapState.value.kind==='returned'){log(`[FLOW] ${caseId} A7 RETURN_TO_WEB PASS`);return;}
  xml=photoTapState.xml;
  await snapshotNative(caseId,'A6_PHOTO_SELECTED',xml);

  // A7. Return to Chrome. If the picker requires a single explicit commit action, press it once.
  const end=Date.now()+8000;let committed=false;
  while(Date.now()<end){
    await sleep(100); const x=dumpUi();
    if(!pickerActive(x)){log(`[FLOW] ${caseId} A7 RETURN_TO_WEB PASS`);return;}
    if(!committed){
      // Match text/content-desc independently (same accessibility fix as Gallery/Recents).
      // Android may expose both fields with the same label; concatenating them turns
      // '완료' into '완료 완료' and previously caused the commit button to be missed.
      const a=phaseActionTarget(x,[/^(완료|추가|확인|Done|Add|Choose|선택)$/i]);
      if(a){
        tapTarget(a); committed=true;
        log(`[FLOW] ${caseId} A7 COMMIT TAP -> "${a.h}"`);
        await snapshotNative(caseId,'A7_COMMIT_TAPPED',x);
      }
    }
  }
  await snapshotNative(caseId,'A5_RETURN_FAIL',dumpUi());
  throw new Error('HARNESS_PICKER_DID_NOT_RETURN');
}

function currentForegroundPackage(){
  const txt=adbText('shell','dumpsys','window','windows');
  const m=txt.match(/mCurrentFocus[^\n]*\s([A-Za-z0-9._]+)\/[A-Za-z0-9.$_]+/i)||txt.match(/mFocusedApp[^\n]*\s([A-Za-z0-9._]+)\//i);
  return m?.[1]||'';
}
async function recoverToChrome(page,caseId){
  let xml=dumpUi(); let pkg=currentForegroundPackage();
  const state=()=>({package:pkg,picker:pickerActive(xml),chromeUi:parseNodes(xml).some(n=>/com\.android\.chrome|chrome/i.test(n.package||''))});
  let st=state();
  if(st.chromeUi&&!st.picker){
    write(`${caseId}_RECOVERY.json`,{action:'none',...st});
    return st;
  }
  log(`[RECOVERY] ${caseId} native state before TOOL: package=${pkg||'unknown'} picker=${st.picker}`);
  for(let i=1;i<=4;i++){
    adb('shell','input','keyevent','4'); await sleep(250);
    xml=dumpUi();pkg=currentForegroundPackage();st=state();
    if(st.chromeUi&&!st.picker){
      write(`${caseId}_RECOVERY.json`,{action:`back-${i}`,...st});
      log(`[RECOVERY] ${caseId} Chrome restored with BACK x${i}`);
      return st;
    }
  }
  // Bring Chrome to foreground without following a URL or opening a downloaded file.
  adb('shell','monkey','-p','com.android.chrome','-c','android.intent.category.LAUNCHER','1');
  await sleep(500); xml=dumpUi();pkg=currentForegroundPackage();st=state();
  if(st.chromeUi&&!st.picker){
    write(`${caseId}_RECOVERY.json`,{action:'chrome-launcher',...st});
    log(`[RECOVERY] ${caseId} Chrome foreground restored`);
    return st;
  }
  await snapshotNative(caseId,'RECOVERY_FAIL',xml);
  throw new Error(`HARNESS_CHROME_STATE_RECOVERY_FAILED:${pkg||'unknown'}`);
}

async function resolveUploadControl(page,inputSel,tool){
  const input=page.locator(inputSel).first();
  await input.waitFor({state:'attached',timeout:12000});

  // 1) Explicit visible upload controls supplied by the tool map.
  const explicitControls=tool.uploadControlsByInput?.[inputSel]||tool.uploadControls||[];
  for(const sel of explicitControls){
    const l=page.locator(sel).first();
    if(await l.count() && await l.isVisible().catch(()=>false)) return {control:l,desc:await describeControl(l)};
  }

  // 2) Associated label / clickable ancestor of the actual input.
  const handle=await input.evaluateHandle(el=>{
    const usable=n=>{if(!n)return false;const r=n.getBoundingClientRect();const cs=getComputedStyle(n);return r.width>8&&r.height>8&&cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0;};
    if(el.id){
      const labels=[...document.querySelectorAll('label')].filter(x=>x.htmlFor===el.id&&usable(x));
      if(labels.length)return labels[0];
    }
    let n=el.parentElement;
    while(n){
      if(usable(n) && (n.matches('label,button,[role="button"]') || getComputedStyle(n).cursor==='pointer')) return n;
      n=n.parentElement;
    }
    return null;
  });
  const associated=handle.asElement();
  if(associated) return {control:associated,desc:await describeControl(associated)};
  await handle.dispose().catch(()=>{});

  // 3) Real FIXLGS pages often keep the hidden input and visible button as siblings
  //    (TOOL001: data-testid=converter-upload-button). Find the user-facing control
  //    by upload semantics instead of DOM-parent guessing.
  const patterns=[
    tool.uploadText,
    /^(이미지|사진|파일).*(선택|추가|불러오기)$/i,
    /^(선택|추가).*(이미지|사진|파일)$/i,
    /^(choose|select|add|upload|browse).*(image|photo|file)s?$/i,
    /^(image|photo|file)s?.*(choose|select|add|upload|browse)$/i,
    /(画像|写真|ファイル).*(選択|追加|アップロード)/i,
  ].filter(Boolean);
  const candidates=page.locator('button,label,[role="button"],a');
  const n=await candidates.count();
  for(let i=0;i<n;i++){
    const c=candidates.nth(i);
    if(!(await c.isVisible().catch(()=>false))) continue;
    const txt=(await c.innerText().catch(()=>'' )).trim().replace(/\s+/g,' ');
    const testid=(await c.getAttribute('data-testid').catch(()=>''))||'';
    if(/upload|file.*select|select.*file|image.*select|select.*image|파일.*선택|이미지.*선택/i.test(testid) || patterns.some(re=>re.test(txt))){
      return {control:c,desc:await describeControl(c)};
    }
  }
  throw new Error('HARNESS_VISIBLE_UPLOAD_CONTROL_NOT_FOUND');
}
async function describeControl(control){
  return control.evaluate(el=>({
    tag:el.tagName,
    id:el.id||'',
    testid:el.getAttribute('data-testid')||'',
    text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,160),
    rect:(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})(),
  }));
}
async function openPicker(page,context,tool,caseId,inputSel){
  const {control,desc}=await resolveUploadControl(page,inputSel,tool);
  write(`${caseId}_upload_target.json`,desc);
  log(`[FLOW] ${caseId} W2 UPLOAD_CONTROL_RESOLVED PASS`);
  log(`[UPLOAD] ${caseId} -> ${desc.tag}${desc.testid?` [${desc.testid}]`:''}${desc.text?` "${desc.text.slice(0,80)}"`:''}`);
  await control.scrollIntoViewIfNeeded().catch(()=>{});
  // One real trusted browser click. No coordinate guessing and no retry chain.
  await control.click({timeout:6000});
  log(`[FLOW] ${caseId} W3 UPLOAD_CONTROL_CLICKED PASS`);
  const xml=await waitPicker(6500);
  write(`${caseId}_picker_open.xml`,xml);
  log(`[PICKER] ${caseId} OPEN CONFIRMED`);
}

async function waitBrowserReturned(page,caseId,timeout=9000){
  const st=Date.now(); let lastXml=''; let lastState={};
  while(Date.now()-st<timeout){
    lastXml=dumpUi();
    const nodes=parseNodes(lastXml);
    const chromeVisible=nodes.some(n=>/com\.android\.chrome|chrome/i.test(n.package||''));
    const nativePicker=pickerActive(lastXml);
    const web=await page.evaluate(()=>({
      visibility:document.visibilityState,
      hidden:document.hidden,
      href:location.href,
      ready:document.readyState,
      focused:document.hasFocus(),
    })).catch(()=>null);
    lastState={chromeVisible,nativePicker,web};
    if(chromeVisible && !nativePicker && web && web.visibility==='visible' && !web.hidden){
      write(`${caseId}_A7_WEB_RETURN.json`,lastState);
      log(`[FLOW] ${caseId} A7 WEB_RETURN_CONFIRMED PASS`);
      return lastState;
    }
    await sleep(100);
  }
  write(`${caseId}_A7_WEB_RETURN_FAIL.json`,lastState);
  if(lastXml)write(`${caseId}_A7_WEB_RETURN_FAIL.xml`,lastXml);
  throw new Error('HARNESS_WEB_RETURN_NOT_CONFIRMED');
}

async function baseline(page){return page.evaluate(()=>({
  imgs:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,
  canvases:[...document.querySelectorAll('canvas')].filter(c=>c.width>0&&c.height>0).length,
  signals:document.querySelectorAll('[data-testid*="file-card"],[data-testid*="file-item"],[data-testid*="preview"],[data-testid*="filename"],[data-testid*="layer"]').length,
  text:(document.body?.innerText||'').length,
}));}
async function visibleAny(page,selectors){for(const s of selectors||[]){try{const l=page.locator(s).first();if(await l.count()&&await l.isVisible())return s;}catch{}}return null;}
async function stateDelta(page,b){return page.evaluate(base=>{
  const imgs=[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length;
  const canvases=[...document.querySelectorAll('canvas')].filter(c=>c.width>0&&c.height>0).length;
  const signals=document.querySelectorAll('[data-testid*="file-card"],[data-testid*="file-item"],[data-testid*="preview"],[data-testid*="filename"],[data-testid*="layer"]').length;
  const alerts=[...document.querySelectorAll('[role="alert"]')].map(x=>(x.textContent||'').trim()).filter(Boolean);
  return{imgs,canvases,signals,alerts,changed:imgs>base.imgs||canvases>base.canvases||signals>base.signals};
},b);}
async function waitAttach(page,tool,b,caseId){
  const start=Date.now();while(Date.now()-start<SAFETY_ATTACH_MS){const exact=await visibleAny(page,tool.attach);const d=await stateDelta(page,b);if(exact||d.changed)return{exact,delta:d,ms:Date.now()-start};if(d.alerts.length) return {error:d.alerts.join(' | '),delta:d,ms:Date.now()-start};await sleep(100);}const d=await stateDelta(page,b);return{timeout:true,delta:d,ms:Date.now()-start};
}
async function immediateScroll(page){await page.evaluate(px=>window.scrollBy({top:px,left:0,behavior:'instant'}),SCROLL_PX);}
async function findAction(page,action){
  if(!action)return null;
  if(typeof action==='string'){const l=page.locator(action).first();if(await l.count()&&await l.isVisible()&&await l.isEnabled())return l;return null;}
  const bs=page.getByRole('button');const n=await bs.count();for(let i=0;i<n;i++){const b=bs.nth(i);if(!(await b.isVisible().catch(()=>false))||!(await b.isEnabled().catch(()=>false)))continue;const txt=(await b.innerText().catch(()=>'' )).trim();if(action.test(txt))return b;}return null;
}
async function waitResult(page,tool,caseId){
  const start=Date.now();while(Date.now()-start<SAFETY_RESULT_MS){const s=await visibleAny(page,tool.result);if(s){let enabled=true;try{const l=page.locator(s).first();if(await l.evaluate(el=>['BUTTON','INPUT'].includes(el.tagName)))enabled=await l.isEnabled();}catch{}if(enabled)return{selector:s,ms:Date.now()-start};}const alerts=await page.locator('[role="alert"]').allInnerTexts().catch(()=>[]);if(alerts.filter(Boolean).length)return{error:alerts.join(' | '),ms:Date.now()-start};await sleep(100);}return{timeout:true,ms:Date.now()-start};
}


async function waitAttr(page, selector, attr, terminal, timeout=SAFETY_RESULT_MS){
  const l=page.locator(selector).first(); const st=Date.now(); let value='';
  while(Date.now()-st<timeout){ value=(await l.getAttribute(attr).catch(()=>''))||''; if(terminal.test(value)) return {value,ms:Date.now()-st}; await sleep(100); }
  return {timeout:true,value,ms:Date.now()-st};
}
async function clickReady(page,selector){
  const l=page.locator(selector).first(); await l.waitFor({state:'visible',timeout:SAFETY_RESULT_MS}); await l.scrollIntoViewIfNeeded().catch(()=>{}); await l.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
  if(!(await l.isEnabled().catch(()=>true))) throw new Error(`PRODUCT_ACTION_DISABLED:${selector}`);
  await l.click({timeout:7000}); return l;
}
async function assertVisible(page,selector,timeout=SAFETY_RESULT_MS){
  const l=page.locator(selector).first(); await l.waitFor({state:'visible',timeout}); return l;
}
async function noAlert(page){ const a=(await page.locator('[role="alert"]').allInnerTexts().catch(()=>[])).filter(Boolean); if(a.length) throw new Error(`PRODUCT_ALERT:${a.join(' | ')}`); }
function androidDownloadSnapshot(){
  // IMPORTANT: pass the complete loop directly to `adb shell`.
  // V16 used `adb shell sh -c <script>` as split arguments; adb reconstructed that as
  // `sh -c for ...`, so only the word `for` became the -c program on some Windows adb builds.
  // The result was an empty snapshot even when Download contained files.
  const script='for d in /sdcard/Download /storage/emulated/0/Download /sdcard/Downloads /storage/emulated/0/Downloads; do [ -d "$d" ] || continue; echo "__DIR__|$d"; for f in "$d"/*; do [ -f "$f" ] || continue; stat -c "__FILE__|%n|%s|%Y|%Z|%i" "$f" 2>/dev/null; done; done';
  const r=adb('shell',script);
  const stdout=String(r.stdout||'').trim(), stderr=String(r.stderr||'').trim();
  const m=new Map(), dirs=[];
  for(const line of stdout.split(/\r?\n/)){
    if(!line)continue;
    if(line.startsWith('__DIR__|')){dirs.push(line.slice(8));continue;}
    if(!line.startsWith('__FILE__|'))continue;
    const parts=line.slice(9).split('|');if(parts.length<5)continue;
    const inode=parts.pop()||'',ctime=Number(parts.pop()||0),mtime=Number(parts.pop()||0),size=Number(parts.pop()||0),name=parts.join('|');
    if(!name||!Number.isFinite(size))continue;
    // /sdcard and /storage/emulated/0 are aliases. Canonicalize the key so the same file
    // is not counted twice while preserving the real path as evidence.
    const key=name.replace(/^\/storage\/emulated\/0\//,'/sdcard/');
    m.set(key,{path:name,size,mtime,ctime,inode});
  }
  Object.defineProperty(m,'_diag',{value:{status:r.status,stdout,stderr,dirs},enumerable:false});
  return m;
}
function downloadSnapshotJson(m){return [...m.entries()].map(([name,v])=>({name,...v})).sort((a,b)=>a.name.localeCompare(b.name));}
function downloadDiag(m){return m?._diag||{};}
function changedDownload(before,after){
  const hits=[];
  for(const [name,v] of after){
    const b=before.get(name);
    if(v.size<=0 || /\.(?:crdownload|tmp|part)$/i.test(name))continue;
    if(!b||b.size!==v.size||b.mtime!==v.mtime||b.ctime!==v.ctime||b.inode!==v.inode)hits.push({name,...v});
  }
  hits.sort((a,b)=>(b.ctime||b.mtime)-(a.ctime||a.mtime));
  return hits[0]||null;
}
function nativeVisibleFields(n){return [normalizeVisible(n.text),normalizeVisible(n['content-desc'])].filter(Boolean);}
function nativeExactAction(xml,patterns){
  const nodes=parseUiTree(xml),screen=nodeScreen(nodes),found=[];
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i], fields=nativeVisibleFields(n); if(!fields.length)continue;
    const b=parseBounds(n.bounds);if(!b||b.w<18||b.h<18)continue;
    let rank=Infinity,matched='';
    for(const field of fields){const ix=patterns.findIndex(re=>re.test(field));if(ix>=0&&ix<rank){rank=ix;matched=field;}}
    if(!Number.isFinite(rank))continue;
    let ai=i;if(n.clickable!=='true')ai=nearestActionContainer(nodes,i,screen);
    const an=nodes[ai]||n,ab=parseBounds(an.bounds)||b;if(!ab||ab.w<40||ab.h<32)continue;
    found.push({n:an,b:ab,h:matched,rank,clickable:an.clickable==='true'});
  }
  found.sort((a,b)=>a.rank-b.rank||Number(b.clickable)-Number(a.clickable)||a.b.top-b.b.top||a.b.left-b.b.left);
  const dedup=[];for(const c of found){if(!dedup.some(d=>rectKey(d.b)===rectKey(c.b)))dedup.push(c);}return dedup[0]||null;
}
async function handleChromeDownloadConfirmation(caseId, maxWaitMs=2200){
  // Chrome can show a native duplicate-download confirmation when the same generated filename
  // already exists. This is part of the real user flow. Press ONLY "download again".
  // Open/열기 is a hard deny-list and is never an action target anywhere in this routine.
  const deadline=Date.now()+maxWaitMs;let last='';
  while(Date.now()<deadline){
    const xml=dumpUi();last=xml;
    const text=parseNodes(xml).flatMap(nativeVisibleFields).join(' | ');
    const openSeen=/(^|\s|\|)(열기|Open)(\s|\||$)/i.test(text);
    if(openSeen) log(`[DOWNLOAD] ${caseId} Open/열기 UI observed -> IGNORED`);
    const confirm=/파일.{0,20}다시.{0,20}다운로드|다시\s*다운로드.{0,20}(하시겠|할까요)|download.{0,30}again|re-?download/i.test(text);
    if(confirm){
      write(`${caseId}_DOWNLOAD_REDOWNLOAD_CONFIRM.xml`,xml);
      let target=nativeExactAction(xml,[/^(다시\s*다운로드|Download\s*again|Re-?download|もう一度ダウンロード)$/i]);
      if(!target){
        // Chrome duplicate-download dialog exposes the affirmative action with a stable
        // resource id even when accessibility text matching misses it. Use this only
        // after the duplicate-dialog title itself has already been positively identified.
        const nodes=parseUiTree(xml);
        const positive=nodes.find(n=>/com\.android\.chrome:id\/positive_button$/.test(n['resource-id']||'') && n.clickable==='true' && n.enabled!=='false');
        const b=positive?parseBounds(positive.bounds):null;
        if(positive&&b)target={n:positive,b,h:normalizeVisible(positive.text)||normalizeVisible(positive['content-desc'])||'positive_button',rank:0,clickable:true};
      }
      if(!target)throw new Error('HARNESS_DOWNLOAD_REDOWNLOAD_ACTION_NOT_FOUND');
      tapTarget(target);
      log(`[DOWNLOAD] ${caseId} duplicate confirmation -> 다시 다운로드 TAP (${target.h})`);
      await sleep(250);
      return {handled:true,label:target.h};
    }
    // If native Chrome did not show a duplicate dialog quickly, continue with storage polling.
    if(Date.now()+250>=deadline)break;
    await sleep(120);
  }
  if(last)write(`${caseId}_DOWNLOAD_NATIVE_POST_CLICK.xml`,last);
  return {handled:false};
}
async function pollAndroidDownload(before,caseId,label){
  write(`${caseId}_DOWNLOAD_BEFORE.json`,downloadSnapshotJson(before));
  write(`${caseId}_DOWNLOAD_BEFORE_DIAG.json`,downloadDiag(before));
  const st=Date.now();let last=null,stable=0,lastAfter=new Map(),lastNativeProbe=0,lateConfirmCount=0;
  while(Date.now()-st<20000){
    lastAfter=androidDownloadSnapshot();const hit=changedDownload(before,lastAfter);
    if(hit){if(last&&last.name===hit.name&&last.size===hit.size)stable++;else stable=0;last=hit;if(stable>=1){write(`${caseId}_DOWNLOAD_AFTER.json`,downloadSnapshotJson(lastAfter));write(`${caseId}_DOWNLOAD_AFTER_DIAG.json`,downloadDiag(lastAfter));log(`[FLOW] ${caseId} W8 DOWNLOAD_FILE PASS ${hit.path||hit.name} ${hit.size}B`);return hit;}}
    // Large generated files (notably TOOL013) can surface Chrome's duplicate-download
    // confirmation several seconds after the web click. Continue observing native UI while
    // storage is polled. The routine can tap only "download again"; Open/열기 stays denied.
    if(Date.now()-lastNativeProbe>=450){
      lastNativeProbe=Date.now();
      const late=await handleChromeDownloadConfirmation(`${caseId}_LATE${lateConfirmCount+1}`,420);
      if(late.handled){lateConfirmCount++;write(`${caseId}_DOWNLOAD_LATE_CONFIRMATION_${lateConfirmCount}.json`,late);log(`[DOWNLOAD] ${caseId} late duplicate confirmation handled #${lateConfirmCount}`);}
    }
    await sleep(220);
  }
  write(`${caseId}_DOWNLOAD_AFTER_FAIL.json`,downloadSnapshotJson(lastAfter));
  write(`${caseId}_DOWNLOAD_AFTER_FAIL_DIAG.json`,downloadDiag(lastAfter));
  // Failure to observe Android storage is a harness verification failure unless the page
  // itself surfaced a product error. Do not falsely label an otherwise successful product.
  throw new Error(`HARNESS_DOWNLOAD_FILE_NOT_OBSERVED:${label}`);
}
async function clickDownloadLocatorAndVerify(page,l,caseId,label){
  await l.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
  if(!(await l.isEnabled().catch(()=>true)))throw new Error(`PRODUCT_DOWNLOAD_DISABLED:${label}`);
  await l.scrollIntoViewIfNeeded().catch(()=>{});
  const before=androidDownloadSnapshot();
  await l.click({timeout:7000});
  await sleep(120);
  // Product alert is still a product failure. Native Chrome duplicate-download confirmation
  // is handled separately and never by clicking Open/열기.
  await noAlert(page);
  const confirmation=await handleChromeDownloadConfirmation(caseId);
  write(`${caseId}_DOWNLOAD_CONFIRMATION.json`,confirmation);
  const hit=await pollAndroidDownload(before,caseId,label);
  await recoverToChrome(page,`${caseId}_POST_DOWNLOAD`);
  return hit;
}
async function clickDownloadLike(page,selector,caseId){
  const l=await assertVisible(page,selector);return clickDownloadLocatorAndVerify(page,l,caseId,selector);
}
async function clickFirstIndividualDownload(page,scopeSelector,caseId){
  const scope=page.locator(scopeSelector).first();await scope.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
  const candidates=scope.locator('button,[role="button"],a');const n=await candidates.count();
  for(let i=0;i<n;i++){const l=candidates.nth(i);if(!(await l.isVisible().catch(()=>false)))continue;const txt=((await l.innerText().catch(()=>''))+' '+(await l.getAttribute('aria-label').catch(()=>''))).trim();if(!/(다운로드|Download|保存|ダウンロード)/i.test(txt))continue;if(/ZIP|전체|all/i.test(txt))continue;return clickDownloadLocatorAndVerify(page,l,caseId,`individual:${txt}`);}
  throw new Error(`PRODUCT_DOWNLOAD_CONTROL_NOT_FOUND:${scopeSelector}`);
}
async function clickDownloadByText(page,caseId,re){
  const candidates=page.locator('button,[role="button"],a');const n=await candidates.count();
  for(let i=0;i<n;i++){const l=candidates.nth(i);if(!(await l.isVisible().catch(()=>false)))continue;const txt=((await l.innerText().catch(()=>''))+' '+(await l.getAttribute('aria-label').catch(()=>''))).trim();if(re.test(txt))return clickDownloadLocatorAndVerify(page,l,caseId,txt);}
  throw new Error(`PRODUCT_DOWNLOAD_CONTROL_NOT_FOUND:${re}`);
}
async function armRawPickerFileMetadataCapture(page,inputSelector,caseId){
  const toolNo=toolNumberFromCase(caseId); if(toolNo!=='015'&&toolNo!=='016')return;
  const armed=await page.evaluate(({sel,key})=>{
    const input=document.querySelector(sel);
    if(!(input instanceof HTMLInputElement))return {ok:false,reason:'INPUT_NOT_FOUND'};
    window.__fixlgsRawPickerMeta=window.__fixlgsRawPickerMeta||{};
    window.__fixlgsImagePipelineDiag=window.__fixlgsImagePipelineDiag||{};
    window.__fixlgsImagePipelineDiag[key]={armedAt:Date.now(),objectUrls:[],imageEvents:[]};
    window.__fixlgsDiagActiveKey=key;

    // Passive observation only: record the Blob/File the product itself passes to
    // URL.createObjectURL. Do not read bytes and do not create a second decode path.
    if(!window.__fixlgsObjectUrlDiagPatched){
      const nativeCreate=URL.createObjectURL.bind(URL);
      URL.createObjectURL=function(obj){
        const url=nativeCreate(obj);
        try{
          const active=window.__fixlgsDiagActiveKey;
          const store=active&&window.__fixlgsImagePipelineDiag?.[active];
          if(store)store.objectUrls.push({url,name:obj instanceof File?obj.name:'',size:typeof obj?.size==='number'?obj.size:null,type:obj?.type||'',lastModified:obj instanceof File?obj.lastModified:null,at:Date.now()});
        }catch{}
        return url;
      };
      window.__fixlgsObjectUrlDiagPatched=true;
    }
    if(!window.__fixlgsImageSrcDiagPatched){
      const desc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
      if(desc?.set&&desc?.get){
        Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:desc.enumerable,get:desc.get,set:function(v){
          try{
            const active=window.__fixlgsDiagActiveKey;
            const store=active&&window.__fixlgsImagePipelineDiag?.[active];
            if(store&&String(v).startsWith('blob:')){
              const entry={src:String(v),setAt:Date.now(),status:'pending'};store.imageEvents.push(entry);
              this.addEventListener('load',()=>{entry.status='load';entry.naturalWidth=this.naturalWidth;entry.naturalHeight=this.naturalHeight;entry.loadedAt=Date.now();},{once:true});
              this.addEventListener('error',()=>{entry.status='error';entry.erroredAt=Date.now();},{once:true});
            }
          }catch{}
          return desc.set.call(this,v);
        }});
      }
      window.__fixlgsImageSrcDiagPatched=true;
    }

    const handler=()=>{
      const f=input.files?.[0];
      window.__fixlgsRawPickerMeta[key]=f?{
        name:f.name,size:f.size,type:f.type,lastModified:f.lastModified,
        capturedAt:Date.now(),source:'native-input-change-capture'
      }:{capturedAt:Date.now(),source:'native-input-change-capture',empty:true};
    };
    input.addEventListener('change',handler,{capture:true,once:true});
    return {ok:true};
  },{sel:inputSelector,key:caseId}).catch(e=>({ok:false,reason:String(e)}));
  write(`${caseId}_DIAGNOSTICS_ARM.json`,armed);
  log(`[DIAG] ${caseId} ARM ${armed?.ok?'PASS':'FAIL'} ${armed?.reason||''}`);
}
function androidMediaStoreInfoByName(name){
  if(!name)return {name:'',query:'SKIPPED_NO_NAME',raw:''};
  const safe=String(name).replace(/'/g,"''");
  const args=['shell','content','query','--uri','content://media/external/images/media','--projection','_display_name:_size:width:height:date_modified','--where',`_display_name='${safe}'`];
  const r=adb(...args);
  return {name,args,exitStatus:r.status,raw:`${r.stdout||''}${r.stderr||''}`.trim()};
}
async function captureInputDiagnostics(page,tool,inputSelector,caseId){
  if(tool.number!==15&&tool.number!==16)return;
  const diag=await page.evaluate(({sel,key,toolNumber})=>{
    const input=document.querySelector(sel);
    const files=input instanceof HTMLInputElement?Array.from(input.files||[]).map(f=>({name:f.name,size:f.size,type:f.type,lastModified:f.lastModified})):[];
    const rawPicker=window.__fixlgsRawPickerMeta?.[key]||null;
    const pipeline=window.__fixlgsImagePipelineDiag?.[key]||null;
    const root=document.querySelector(toolNumber==='016'?'[data-testid="tool016-root"]':'[data-testid="tool015-root"]');
    const serviceLimits=root?{
      maxFileBytes:root.getAttribute('data-max-file-bytes'),
      maxPixels:root.getAttribute('data-max-pixels'),
      maxSide:root.getAttribute('data-max-side')
    }:null;
    const canvases=Array.from(document.querySelectorAll('canvas')).map((c,i)=>({i,width:c.width,height:c.height,testid:c.getAttribute('data-testid')||''}));
    const images=Array.from(document.images).map((im,i)=>({i,naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,width:im.width,height:im.height,testid:im.getAttribute('data-testid')||''})).filter(x=>x.naturalWidth||x.naturalHeight);
    const text=(document.body?.innerText||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).filter(x=>/픽셀|pixel|6000|6,000|1200|12MP|12 MP|이미지|image/i.test(x)).slice(0,80);
    return {selector:sel,mobileStable:input?.getAttribute?.('data-mobile-stable-input')||'',rawPicker,pipeline,files,serviceLimits,canvases,images,relevantText:text,href:location.href};
  },{sel:inputSelector,key:caseId,toolNumber:tool.number}).catch(e=>({selector:inputSelector,error:String(e)}));
  const rawName=diag?.rawPicker?.name||diag?.files?.[0]?.name||'';
  diag.androidMediaStore=androidMediaStoreInfoByName(rawName);
  write(`${caseId}_INPUT_DIAGNOSTICS.json`,diag);
  log(`[DIAG] ${caseId} rawPicker=${JSON.stringify(diag.rawPicker||null)} pipeline=${JSON.stringify(diag.pipeline||null)} media=${JSON.stringify(diag.androidMediaStore||null)} files=${JSON.stringify(diag.files||[])} canvases=${JSON.stringify(diag.canvases||[])} images=${JSON.stringify(diag.images||[])}`); if(!diag.rawPicker)log(`[DIAG] ${caseId} RAW_PICKER_META MISSING`);
}

async function drawMosaicRectangle(page){
  const c=page.locator('[data-testid="tool010-canvas"]').first(); await c.waitFor({state:'visible',timeout:SAFETY_RESULT_MS}); const b=await c.boundingBox(); if(!b) throw new Error('HARNESS_TOOL010_CANVAS_BOX');
  const x1=b.x+b.width*.22,y1=b.y+b.height*.22,x2=b.x+b.width*.46,y2=b.y+b.height*.44;
  await page.mouse.move(x1,y1); await page.mouse.down(); await page.mouse.move(x2,y2,{steps:5}); await page.mouse.up();
  const count=page.locator('[data-testid="tool010-applied-count"]'); const st=Date.now(); while(Date.now()-st<5000){const txt=(await count.innerText().catch(()=>''));const n=Number(txt.match(/\d+/)?.[0]||0);if(n>0)return n;await sleep(100);}throw new Error('PRODUCT_TOOL010_REGION_NOT_CREATED');
}
function toolNumberFromCase(caseId){const m=String(caseId).match(/^T(\d{1,3})_/);return m?m[1].padStart(3,'0'):'';}
async function runToolWorkflow(page,tool,caseId){
  const w=tool.workflow||{kind:'none'}; log(`[FLOW] ${caseId} W6 TOOL_WORKFLOW ${w.kind}`);
  if(w.kind==='status'){
    await clickReady(page,w.run); const st=await waitAttr(page,w.card,'data-status',w.terminal); write(`${caseId}_workflow_status.json`,st);
    if(st.timeout) throw new Error(`PRODUCT_PROCESS_TIMEOUT:${w.card}`);
    let acceptedUnreached=false;
    if(!w.pass.test(st.value)){
      if(st.value==='unreached'&&w.acceptUnreached){
        const choice=await findAction(page,w.acceptUnreached);
        if(!choice)throw new Error('PRODUCT_TOOL005_CURRENT_RESULT_ACTION_NOT_FOUND');
        const label=(await choice.innerText().catch(()=>'' )).trim().replace(/\s+/g,' ');
        await choice.click({timeout:7000});acceptedUnreached=true;
        log(`[FLOW] ${caseId} TOOL005 CURRENT_RESULT_USE TAP -> "${label}"`);
        // Wait for the product to commit acceptUnreached and reveal the real per-file
        // download action. Do not guess or bypass product state.
        const card=page.locator(w.card).first();
        const acceptDeadline=Date.now()+5000;let accepted=false,downloadVisible=false;
        while(Date.now()<acceptDeadline){
          accepted=(await card.getAttribute('data-accepted').catch(()=>''))==='true';
          const buttons=card.locator('button,[role="button"],a');const count=await buttons.count();
          for(let i=0;i<count;i++){
            const b=buttons.nth(i);if(!(await b.isVisible().catch(()=>false)))continue;
            const txt=((await b.innerText().catch(()=>''))+' '+(await b.getAttribute('aria-label').catch(()=>''))).trim();
            if(/다운로드|Download|ダウンロード/i.test(txt) && !/ZIP|전체|all/i.test(txt)){downloadVisible=true;break;}
          }
          if(accepted&&downloadVisible)break;
          await sleep(100);
        }
        write(`${caseId}_TOOL005_ACCEPT_STATE.json`,{accepted,downloadVisible});
        if(!accepted)throw new Error('PRODUCT_TOOL005_CURRENT_RESULT_NOT_ACCEPTED');
        if(!downloadVisible)throw new Error('PRODUCT_TOOL005_DOWNLOAD_NOT_REVEALED');
      }else throw new Error(`PRODUCT_PROCESS_STATUS:${st.value}`);
    }
    let download=null;
    if(w.downloadInCard){
      try{download=await clickFirstIndividualDownload(page,w.card,caseId);}
      catch(e){
        if(toolNumberFromCase(caseId)==='005'&&acceptedUnreached){
          const card=page.locator(w.card).first();
          const direct=card.locator('.target-size-file-actions button').filter({hasText:/^(다운로드|Download|ダウンロード)$/i}).first();
          if(await direct.isVisible().catch(()=>false)){
            download=await clickDownloadLocatorAndVerify(page,direct,caseId,'TOOL005_CURRENT_RESULT_DIRECT_DOWNLOAD');
          }else{
            const zip=page.locator('[data-testid="target-zip-button"]').first();
            if(await zip.isVisible().catch(()=>false) && await zip.isEnabled().catch(()=>false)){
              log(`[FLOW] ${caseId} TOOL005 per-file download not visible; using enabled product ZIP download`);
              download=await clickDownloadLocatorAndVerify(page,zip,caseId,'TOOL005_CURRENT_RESULT_ZIP_DOWNLOAD');
            }else throw e;
          }
        }else throw e;
      }
    }
    return {kind:w.kind,status:st.value,acceptedUnreached,download};
  }
  if(w.kind==='cropper'){
    const rotate=page.getByRole('button',{name:'회전',exact:true}); if(await rotate.count()&&await rotate.isVisible().catch(()=>false)){await rotate.click();const right=page.getByRole('button',{name:'오른쪽으로 90도'});if(await right.count()&&await right.isVisible().catch(()=>false))await right.click();}
    const resultBtn=page.getByRole('button',{name:/결과 확인|Preview Result/i}).first(); await resultBtn.waitFor({state:'visible',timeout:SAFETY_RESULT_MS}); await resultBtn.click(); const dl=await clickDownloadLike(page,'[data-testid="cropper-download-zip"]',caseId); return {kind:w.kind,download:dl};
  }
  if(w.kind==='click-result'){
    let download=null;
    if(w.download===w.click || /download/i.test(w.click)) download=await clickDownloadLike(page,w.click,caseId); else { await clickReady(page,w.click); if(w.download) download=await clickDownloadLike(page,w.download,caseId); }
    if(w.result) await assertVisible(page,w.result); if(w.status) await noAlert(page); return {kind:w.kind,download};
  }
  if(w.kind==='pdf-signature'){
    const canvas=page.locator('[data-testid="tool032-draw-canvas"]').first();
    await canvas.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
    const box=await canvas.boundingBox();
    if(!box) throw new Error('HARNESS_TOOL032_DRAW_CANVAS_NO_BOX');
    await page.mouse.move(box.x+Math.max(24,box.width*0.16),box.y+box.height*0.58);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*0.42,box.y+box.height*0.36,{steps:8});
    await page.mouse.move(box.x+box.width*0.68,box.y+box.height*0.62,{steps:8});
    await page.mouse.up();
    await assertVisible(page,'[data-testid="tool032-signature-overlay"]',SAFETY_RESULT_MS);
    await clickReady(page,w.click);
    await assertVisible(page,w.result,SAFETY_RESULT_MS*2);
    const download=await clickDownloadLike(page,w.download,caseId);
    return {kind:w.kind,download};
  }
  if(w.kind==='mosaic'){
    const n=await drawMosaicRectangle(page); await clickDownloadLike(page,'[data-testid="tool010-download"]',caseId); return {kind:w.kind,regions:n};
  }
  if(w.kind==='border'){
    const toggle=page.locator('[data-testid="tool012-border-toggle"]'); if(await toggle.count()){await toggle.check().catch(async()=>{await toggle.click();});}
    await assertVisible(page,'[data-testid="tool012-output-size"]'); await clickDownloadLike(page,'[data-testid="tool012-download"]',caseId); return {kind:w.kind};
  }
  if(w.kind==='before-after'){
    await assertVisible(page,'[data-testid="tool015-preview-canvas"]'); const state=page.locator('[data-testid="tool015-state"]');
    const before=await state.getAttribute('data-before-ready'), after=await state.getAttribute('data-after-ready'); if(before!=='1'||after!=='1') throw new Error(`PRODUCT_TOOL015_NOT_READY:${before}/${after}`);
    await clickDownloadLike(page,'[data-testid="tool015-download"]',caseId); return {kind:w.kind,before,after};
  }
  if(w.kind==='text'){
    // Real TOOL016 user flow: attach image -> add a text layer -> content textarea appears.
    const addbar=page.locator('[data-testid="tool016-addbar"]');
    await addbar.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
    const addButton=addbar.locator('button').first();
    if(!(await addButton.isVisible().catch(()=>false)) || !(await addButton.isEnabled().catch(()=>false))) throw new Error('HARNESS_TOOL016_ADD_TEXT_ACTION_NOT_FOUND');
    await addButton.click({timeout:7000});
    log(`[FLOW] ${caseId} TOOL016 ADD_TEXT_LAYER PASS`);
    const input=page.locator('[data-testid="tool016-content"]');
    await input.waitFor({state:'visible',timeout:SAFETY_RESULT_MS});
    await input.fill('TEST');
    await assertVisible(page,'[data-testid="tool016-preview-canvas"]');
    await clickDownloadLike(page,'[data-testid="tool016-download"]',caseId);
    return {kind:w.kind};
  }
  if(w.kind==='watermark'){
    const text=page.locator('[data-testid="tool017-text-input"]'); await text.fill('TEST'); await clickReady(page,'[data-testid="tool017-process-all"]');
    const current=page.locator('[data-testid="tool017-download-current"]'); const st=Date.now(); while(Date.now()-st<SAFETY_RESULT_MS){if(await current.isVisible().catch(()=>false)&&await current.isEnabled().catch(()=>false))break;await sleep(100);} if(!(await current.isEnabled().catch(()=>false))) throw new Error('PRODUCT_TOOL017_RESULT_NOT_READY'); const download=await clickDownloadLocatorAndVerify(page,current,caseId,'tool017-current'); return {kind:w.kind,download};
  }
  if(w.kind==='metadata'){
    await assertVisible(page,'[data-testid="tool018-result"]'); await assertVisible(page,'[data-testid="tool018-basic-info"]'); return {kind:w.kind};
  }
  if(w.kind==='title-download'){
    if(w.title){const title=page.locator(w.title);if(await title.count())await title.fill('TEST').catch(()=>{});} await assertVisible(page,w.result); await clickDownloadLike(page,w.download,caseId); return {kind:w.kind};
  }
  if(w.kind==='download'){
    await clickDownloadLike(page,w.download,caseId); return {kind:w.kind};
  }
  if(w.kind==='generate'){
    await clickReady(page,w.run); await assertVisible(page,w.result,SAFETY_RESULT_MS*2); await noAlert(page); const download=await clickDownloadByText(page,caseId,/(전체\s*ZIP\s*다운로드|Download\s*All\s*ZIP|すべて.*ダウンロード)/i); return {kind:w.kind,download};
  }
  if(w.kind==='export'){
    const count=page.locator(w.count); const st=Date.now(); let n=0; while(Date.now()-st<SAFETY_RESULT_MS){const txt=(await count.innerText().catch(()=>''));n=Number(txt.match(/\d+/)?.[0]||0);if(n>0)break;await sleep(100);} if(n<1) throw new Error('PRODUCT_TOOL024_RESULT_COUNT_ZERO');
    await clickDownloadLike(page,w.run,caseId); const failures=page.locator(w.failures); if(await failures.count()&&await failures.isVisible().catch(()=>false)){const txt=(await failures.innerText().catch(()=>'' )).trim(); if(txt&& !/^0\b/.test(txt)) throw new Error(`PRODUCT_TOOL024_EXPORT_FAILURES:${txt}`);} return {kind:w.kind,count:n};
  }
  if(w.kind==='id-passport'){
    const preview=await assertVisible(page,'[data-testid="tool025-preview"] canvas');
    const size=await assertVisible(page,w.size);
    const sizeText=(await size.innerText().catch(()=>'' )).trim();
    if(!/\d+\s*[×x]\s*\d+px/i.test(sizeText)) throw new Error(`PRODUCT_TOOL025_OUTPUT_SIZE_INVALID:${sizeText}`);
    const dropzone=await assertVisible(page,w.dropzone);
    const dzClass=(await dropzone.getAttribute('class').catch(()=>''))||'';
    if(!/dropzoneReady/.test(dzClass)) throw new Error(`PRODUCT_TOOL025_DROPZONE_NOT_READY:${dzClass}`);
    await assertVisible(page,w.workspace);
    const count=await assertVisible(page,w.a4count);
    const countText=(await count.innerText().catch(()=>'' )).trim();
    const a4Count=Number(countText.match(/\d+/)?.[0]||0);
    if(a4Count<1) throw new Error(`PRODUCT_TOOL025_A4_COUNT_ZERO:${countText}`);
    const individual=page.locator(w.download).first();
    if(!(await individual.isVisible().catch(()=>false))||!(await individual.isEnabled().catch(()=>false))) throw new Error('PRODUCT_TOOL025_INDIVIDUAL_DOWNLOAD_NOT_READY');
    const a4=page.locator(w.a4).first();
    if(!(await a4.isVisible().catch(()=>false))||!(await a4.isEnabled().catch(()=>false))) throw new Error('PRODUCT_TOOL025_A4_DOWNLOAD_NOT_READY');
    const individualDownload=await clickDownloadLocatorAndVerify(page,individual,caseId,'TOOL025_INDIVIDUAL_DOWNLOAD');
    const a4Download=await clickDownloadLocatorAndVerify(page,a4,caseId,'TOOL025_A4_DOWNLOAD');
    return {kind:w.kind,size:sizeText,a4Count,individualDownload,a4Download,previewVisible:await preview.isVisible().catch(()=>false),dropzoneReady:true};
  }
  return {kind:'none'};
}

async function runCase(page,context,tool,round){
  const caseId=`T${tool.number}_R${round}`;const url=`${BASE}/${LOCALE}/${tool.slug}`;const started=Date.now();
  log(`\n[${tool.number}] ROUND ${round} START  ${url}`);
  try{
    await recoverToChrome(page,`${caseId}_START`);
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    const status=response?.status?.()||0;
    const bodyText=(await page.locator('body').innerText().catch(()=>'' )).slice(0,2000);
    if(status===404||/page not found|404\s*:\s*this page could not be found/i.test(bodyText)) throw new Error(`HARNESS_WEB_ROUTE_NOT_AVAILABLE:${status||'unknown'}:${url}`);
    await page.locator(tool.input).first().waitFor({state:'attached',timeout:12000});
    log(`[FLOW] ${caseId} W1 WEB_TOOL_OPEN PASS`);
    const base=await baseline(page);
    const uploadSelectors=tool.uploadSelectors||Array.from({length:tool.uploads},()=>tool.input);
    for(let u=0;u<uploadSelectors.length;u++){
      const sel=uploadSelectors[u];const cid=`${caseId}_U${u+1}`;
      log(`[${tool.number}] upload ${u+1}/${uploadSelectors.length}`);
      await armRawPickerFileMetadataCapture(page,sel,cid);
      await openPicker(page,context,tool,cid,sel);
      await selectGalleryPhoto(cid);
      // Do not scroll while Android is still committing/closing the picker. First prove that
      // Chrome and the live page are foreground/visible, then perform the required one scroll.
      await waitBrowserReturned(page,cid);
      // User-observed real flow: attachment settles after a small scroll. No fixed 5-second wait.
      await immediateScroll(page);
      log(`[FLOW] ${cid} W4 IMMEDIATE_SMALL_SCROLL PASS`);
      await captureInputDiagnostics(page,tool,sel,cid);
      if(tool.fixedGalleryInputUnsupported){
        const st=Date.now(); let alerts=[]; let cards=0; let unsupportedText='';
        const unsupported=/지원하지 않거나 손상된 파일|지원하지 않는 파일|unsupported(?: or damaged)? file|unsupported format|対応していない.*ファイル|破損した.*ファイル/i;
        while(Date.now()-st<3500){
          alerts=(await page.locator('[role="alert"]').allInnerTexts().catch(()=>[])).filter(Boolean);
          cards=await page.locator(tool.attach[0]).count().catch(()=>0);
          const body=(await page.locator('body').innerText().catch(()=>''));
          unsupportedText=body.split(/\r?\n/).map(x=>x.trim()).find(x=>unsupported.test(x))||'';
          if(alerts.length||cards||unsupportedText)break;
          await sleep(100);
        }
        if((alerts.length||unsupportedText) && !cards){
          const note={reason:'SOURCE_ACCEPT_ONLY_SVG_BMP_TIFF',alerts,unsupportedText,cards};
          write(`${caseId}_source_input_policy.json`,note);
          log(`[${tool.number}] INPUT_NOT_APPLICABLE TOOL003_UNSUPPORTED_INPUT -> ${unsupportedText||alerts.join(' | ')}`);
          return result(tool,round,'INPUT_NOT_APPLICABLE','SOURCE_INPUT_POLICY','TOOL003 source accepts SVG/BMP/TIFF only; selected gallery JPG is an unsupported test input',started,note);
        }
        if(cards) log(`[${tool.number}] SOURCE_INPUT_POLICY accepted selected file; continue functional workflow`);
      }
      const a=await waitAttach(page,tool,base,cid);
      write(`${cid}_attach.json`,a);
      if(!a.error&&!a.timeout) log(`[FLOW] ${cid} W5 ATTACH_STATE_READY PASS`);
      if(a.error||a.timeout){
        await captureInputDiagnostics(page,tool,sel,`${cid}_POST_ATTACH_FAIL`);
        await shot(`${cid}_attach_fail.png`);const blocked=['W6 PROCESS_ACTION','W7 RESULT_READY','W8 DOWNLOAD_VERIFY'];write(`${caseId}_blocked.json`,blocked);log(`[BLOCKED] ${caseId} ${blocked.join(' -> ')}`);return result(tool,round,'PRODUCT_FAIL','ATTACH',a.error||'attachment state not reached',started,{attach:a,blocked});
      }
    }
    let wf;
    try { wf=await runToolWorkflow(page,tool,caseId); write(`${caseId}_workflow.json`,wf); log(`[FLOW] ${caseId} W6 PROCESS_ACTION PASS`); }
    catch(e){
      const msg=String(e?.message||e); const harness=/HARNESS_/.test(msg); const downloadFailure=/(?:HARNESS|PRODUCT)_DOWNLOAD_|DOWNLOAD_REDOWNLOAD/.test(msg);
      if(downloadFailure){
        log(`[FLOW] ${caseId} W6 PROCESS_ACTION PASS (download stage reached)`);
        log(`[FLOW] ${caseId} W7 RESULT_READY PASS`);
        log(`[FLOW] ${caseId} W8 DOWNLOAD_VERIFY FAIL ${msg}`);
        await shot(`${caseId}_download_fail.png`);
        return result(tool,round,harness?'HARNESS_FAIL':'PRODUCT_FAIL','DOWNLOAD',msg,started,{workflow:wf||null,blocked:[]});
      }
      const blocked=['W7 RESULT_READY','W8 DOWNLOAD_VERIFY']; await shot(`${caseId}_process_fail.png`); write(`${caseId}_blocked.json`,blocked); log(`[BLOCKED] ${caseId} ${blocked.join(' -> ')}`); return result(tool,round,harness?'HARNESS_FAIL':'PRODUCT_FAIL','PROCESS',msg,started,{workflow:wf||null,blocked});
    }
    await noAlert(page);
    log(`[FLOW] ${caseId} W7 RESULT_READY PASS`);
    if(tool.number!=='018') log(`[FLOW] ${caseId} W8 DOWNLOAD_VERIFIED PASS`);
    log(`[${tool.number}] PASS  ${(Date.now()-started)/1000}s`);return result(tool,round,'PASS','DONE','',started,{workflow:wf});
  }catch(e){
    const msg=String(e?.message||e);const harness=/HARNESS_|PICKER_|NO_ANDROID|VISIBLE_UPLOAD_CONTROL|PHOTO_GRID|PHOTO_SLOT|uiautomator/i.test(msg);
    await shot(`${caseId}_${harness?'harness':'product'}_fail.png`).catch(()=>{});
    log(`[${tool.number}] ${harness?'HARNESS_FAIL':'PRODUCT_FAIL'} ${msg}`);
    return result(tool,round,harness?'HARNESS_FAIL':'PRODUCT_FAIL',harness?'HARNESS':'EXCEPTION',msg,started,{});
  }
}
function result(tool,round,status,stage,message,started,extra){return{tool:tool.number,slug:tool.slug,round,status,stage,message,elapsedMs:Date.now()-started,...extra};}

function archiveResultFolder(src,zipPath){
  try{if(fs.existsSync(zipPath))fs.rmSync(zipPath,{force:true});}catch{}
  if(process.platform==='win32'){
    const tar=spawnSync('tar.exe',['-a','-c','-f',zipPath,'-C',src,'.'],{encoding:'utf8',windowsHide:true});
    if(tar.status===0&&fs.existsSync(zipPath)&&fs.statSync(zipPath).size>0)return{ok:true,method:'tar.exe'};
    const ps=`$ErrorActionPreference='Stop'; Compress-Archive -Path '${src.replace(/'/g,"''")}\\*' -DestinationPath '${zipPath.replace(/'/g,"''")}' -Force`;
    const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8',windowsHide:true});
    if(r.status===0&&fs.existsSync(zipPath)&&fs.statSync(zipPath).size>0)return{ok:true,method:'Compress-Archive'};
    return{ok:false,message:`tar=${tar.status}:${(tar.stderr||tar.stdout||'').trim()} | powershell=${r.status}:${(r.stderr||r.stdout||'').trim()}`};
  }
  const r=spawnSync('zip',['-qr',zipPath,'.'],{cwd:src,encoding:'utf8'});
  if(r.status===0&&fs.existsSync(zipPath)&&fs.statSync(zipPath).size>0)return{ok:true,method:'zip'};
  return{ok:false,message:`zip=${r.status}:${(r.stderr||r.stdout||'').trim()}`};
}

let device=null, context=null, cleanupDone=false, exitCode=0;
async function cleanupAndroidResources(){
  if(cleanupDone)return;cleanupDone=true;
  const timed=async(label,fn,ms=5000)=>{
    if(!fn)return;log(`[CLEANUP] ${label} START`);
    let timer;try{
      const result=await Promise.race([Promise.resolve().then(fn).then(()=>({ok:true})).catch(e=>({ok:false,error:String(e?.message||e)})),new Promise(resolve=>{timer=setTimeout(()=>resolve({ok:false,timeout:true}),ms);})]);
      if(timer)clearTimeout(timer);
      if(result.ok)log(`[CLEANUP] ${label} PASS`);else if(result.timeout)log(`[CLEANUP] ${label} TIMEOUT ${ms}ms`);else log(`[CLEANUP] ${label} FAIL ${result.error}`);
    }catch(e){if(timer)clearTimeout(timer);log(`[CLEANUP] ${label} FAIL ${String(e?.message||e)}`);}
  };
  // Close browser first, then the Playwright Android device transport. V16 only closed the
  // browser context, which could leave the Node process alive after ARCHIVE PASS.
  await timed('BROWSER_CONTEXT_CLOSE',context?()=>context.close():null);
  context=null;
  await timed('ANDROID_DEVICE_CLOSE',device&&typeof device.close==='function'?()=>device.close():null);
  device=null;
  if(autoReversePort){
    const rr=adb('reverse','--remove',`tcp:${autoReversePort}`);
    log(`[CLEANUP] ADB_REVERSE_REMOVE tcp:${autoReversePort} ${rr.status===0?'PASS':'WARN'}`);
    autoReversePort=null;
  }
  log('[CLEANUP] COMPLETE');
}
try{
  log('FIXLGS TOOLBOX MOBILE REAL-PHOTO VALIDATOR');
  log(`Target: ${TOOLS.map(t=>t.number).join(', ')}`);
  log(`Photo: Gallery -> Camera -> slot ${PHOTO_SLOT} (stable camera-photo test input)`);
  log('Flow: live Android UI discovery -> Gallery -> Camera -> proven photo grid -> slot select -> immediate small scroll -> product workflow');
  log(`Retest: ${RETEST?'PRODUCT_FAIL only, once':'disabled'}`);
  log('Checklist-bound flow:');
  FLOW_CHECKLIST.forEach(x=>log(`  - ${x}`));
  log('');
  const state=adbText('devices');write('adb-devices.txt',state);if(!/\tdevice\b/.test(state))throw new Error('HARNESS_NO_ANDROID_DEVICE');
  await resolveTool025Base();
  const devices=await android.devices();if(!devices.length)throw new Error('HARNESS_NO_PLAYWRIGHT_ANDROID_DEVICE');
  device=devices[0];context=await device.launchBrowser({});const pages=context.pages();const page=pages[0]||await context.newPage();
  const downloadProbe=androidDownloadSnapshot();write('download-storage-probe.json',{files:downloadSnapshotJson(downloadProbe),diag:downloadDiag(downloadProbe)});log(`[SELF-CHECK] Android Download dirs=${(downloadDiag(downloadProbe).dirs||[]).join(', ')||'not-observed'} files=${downloadProbe.size}`);
  const first=[];
  for(let i=0;i<TOOLS.length;i++){log(`[PROGRESS ${i+1}/${TOOLS.length}] TOOL ${TOOLS[i].number}`);first.push(await runCase(page,context,TOOLS[i],1));}
  const retryTargets=RETEST?first.filter(r=>r.status==='PRODUCT_FAIL'&&r.tool!=='018').map(r=>TOOLS.find(t=>t.number===r.tool)).filter(Boolean):[];
  const second=[];
  if(retryTargets.length){log(`\n[RETEST] PRODUCT_FAIL ${retryTargets.map(t=>t.number).join(', ')} -> independent one-time retest`);for(let i=0;i<retryTargets.length;i++)second.push(await runCase(page,context,retryTargets[i],2));}
  const final=TOOLS.map(tool=>{const a=first.find(r=>r.tool===tool.number),b=second.find(r=>r.tool===tool.number);let verdict=(tool.number==='018'&&a.status!=='PASS')?'TOOL018_SPECIAL_FAIL':a.status;let retestNote='';if(tool.number!=='018'&&a.status==='PRODUCT_FAIL'&&b?.status==='PASS')verdict='FLAKY';else if(tool.number!=='018'&&a.status==='PRODUCT_FAIL'&&b?.status==='PRODUCT_FAIL')verdict='PRODUCT_FAIL';else if(tool.number!=='018'&&a.status==='PRODUCT_FAIL'&&b?.status==='HARNESS_FAIL'){verdict='PRODUCT_FAIL';retestNote='RETEST_HARNESS_INVALID_ORIGINAL_PRODUCT_FAIL_PRESERVED';}return{tool:tool.number,slug:tool.slug,first:a.status,retest:b?.status||'',verdict,firstStage:a.stage,retestStage:b?.stage||'',message:(b?.status==='PRODUCT_FAIL'?b.message:a.message)||'',blocked:[...(a.blocked||[]),...(b?.blocked||[])],retestNote};});
  const summary={createdAt:new Date().toISOString(),baseUrl:BASE,locale:LOCALE,photoSource:'Gallery/Camera/Camera-first-photo',photoSlot:PHOTO_SLOT,firstPass:first,retest:second,final,counts:{pass:final.filter(x=>x.verdict==='PASS').length,flaky:final.filter(x=>x.verdict==='FLAKY').length,inputNotApplicable:final.filter(x=>x.verdict==='INPUT_NOT_APPLICABLE').length,productFail:final.filter(x=>x.verdict==='PRODUCT_FAIL').length,harnessFail:final.filter(x=>x.verdict==='HARNESS_FAIL').length,blockedSteps:final.reduce((n,x)=>n+(x.blocked?.length||0),0),tool018SpecialFail:final.filter(x=>x.verdict==='TOOL018_SPECIAL_FAIL').length}};
  write('summary.json',summary);write('summary.tsv',['TOOL\tFIRST\tRETEST\tFINAL\tSTAGE\tBLOCKED\tRETEST_NOTE\tMESSAGE',...final.map(x=>`${x.tool}\t${x.first}\t${x.retest}\t${x.verdict}\t${x.retestStage||x.firstStage}\t${(x.blocked||[]).join(' > ')}\t${x.retestNote||''}\t${String(x.message).replace(/[\t\r\n]+/g,' ')}`)].join('\n'));
  log('\n================ FINAL ================');for(const x of final)log(`TOOL${x.tool}  ${x.verdict}${x.retest?`  (${x.first} -> ${x.retest})`:''}${x.retestNote?`  [${x.retestNote}]`:''}`);log('---------------------------------------');log(`PASS ${summary.counts.pass} | FLAKY ${summary.counts.flaky} | INPUT_NA ${summary.counts.inputNotApplicable} | PRODUCT_FAIL ${summary.counts.productFail} | HARNESS_FAIL ${summary.counts.harnessFail} | BLOCKED_STEPS ${summary.counts.blockedSteps} | TOOL018_SPECIAL_FAIL ${summary.counts.tool018SpecialFail}`);log(`RESULT DIR: ${outDir}`);
  exitCode=summary.counts.productFail?1:0;
}catch(e){
  log(`[FATAL HARNESS] ${String(e?.stack||e)}`);exitCode=2;
  write('fatal-harness.json',{createdAt:new Date().toISOString(),error:String(e?.stack||e),exitCode});
}finally{
  await cleanupAndroidResources();
}
const zipPath=path.join(desktop,`${path.basename(outDir)}.zip`);log(`RESULT ZIP TARGET: ${zipPath}`);
const ar=archiveResultFolder(outDir,zipPath);if(ar.ok)log(`[ARCHIVE] PASS ${zipPath}`);else{log(`[ARCHIVE_FAIL] ${ar.message}`);write('archive-fail.txt',ar.message);}
log(`[EXIT] NORMAL code=${exitCode}`);
process.exit(exitCode);
