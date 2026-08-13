#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { spawnSync } from 'child_process';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const repeats=Math.max(1,Number(args.repeats||7));
const pickerStableTimeoutMs=Math.max(9000,Number(args['picker-timeout-ms']||12000));
const requestedPort=Math.max(1024,Number(args.port||18753));
const CHROME_PKG='com.android.chrome';
const FIREFOX_PKG='org.mozilla.firefox';
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V53R2_CHROME_FIREFOX_NATIVE_MULTIPART_AB_REAL_DEVICE_${stamp}`);
fs.mkdirSync(outDir,{recursive:true});
const logLines=[];
function log(...p){const s=p.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');console.log(s);logLines.push(s);fs.writeFileSync(path.join(outDir,'runner.log'),logLines.join('\n'));}
function write(name,data){fs.writeFileSync(path.join(outDir,name),typeof data==='string'?data:JSON.stringify(data,null,2));}
function adb(...a){return spawnSync('adb',a,{encoding:'utf8',shell:false,maxBuffer:128*1024*1024});}
function adbText(...a){const r=adb(...a);return `${r.stdout||''}${r.stderr||''}`;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function screen(name){const r=spawnSync('adb',['exec-out','screencap','-p'],{encoding:null,maxBuffer:64*1024*1024});if(r.status===0&&r.stdout?.length)fs.writeFileSync(path.join(outDir,name),r.stdout);}
function xmlDecode(v=''){return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function parseBounds(bounds=''){const m=String(bounds).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);if(!m)return null;const left=+m[1],top=+m[2],right=+m[3],bottom=+m[4];return{left,top,right,bottom,w:right-left,h:bottom-top,x:Math.floor((left+right)/2),y:Math.floor((top+bottom)/2)};}
function dumpUi(){const remote='/sdcard/tool001-v53-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function fullLogcat(){return adbText('logcat','-b','all','-d','-v','threadtime');}
function filteredEvidence(text){return String(text||'').split(/\r?\n/).filter(x=>/(chromium|chrome|firefox|fenix|gecko|GeckoSession|photopicker|MediaProvider|fuse|ContentResolver|ContentProviderHelper|UriGrantsManagerService|UriPermission|permission denied|EACCES|ENOENT|ERR_UPLOAD_FILE_CHANGED|file could not be read|FileChooser|SelectFileDialog|multipart|upload|content:\/\/|Storage)/i.test(x)).slice(-3600).join('\n');}
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function packageInstalled(pkg){return /package:/i.test(adbText('shell','pm','path',pkg));}
function evidenceFromLogcat(text){
  const lines=String(text||'').split(/\r?\n/);
  return{
    uriPermissionWmLockErrors:lines.filter(x=>/Unable to check Uri permission because caller is holding WM lock/i.test(x)).length,
    mediaProviderLowerFsOpens:lines.filter(x=>/MediaProvider: Open with lower FS/i.test(x)).length,
    chromeNoPersistedWritePermission:lines.filter(x=>/cr_SelectFileDialog: No persisted write permission/i.test(x)).length,
    uploadFileChanged:lines.filter(x=>/ERR_UPLOAD_FILE_CHANGED/i.test(x)).length,
    geckoMentions:lines.filter(x=>/firefox|fenix|gecko|GeckoSession/i.test(x)).length,
    pickerStarts:lines.filter(x=>/ActivityTaskManager: START .*com\.google\.android\.photopicker/i.test(x)).slice(-8)
  };
}
function screenSize(){const t=adbText('shell','wm','size');const m=t.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i)||t.match(/(\d+)x(\d+)/);if(!m)return{w:1080,h:2400};return{w:+m[1],h:+m[2]};}

// ===== V39 EXACT PICKER SOURCE START =====
const pcScreen=screen;
const nodeHay=hay;
function parseUiTree(xml){const tokens=String(xml||'').match(/<node\s+[^>]*>|<\/node>/g)||[];const root={attrs:{},children:[]};const stack=[root];for(const tok of tokens){if(tok.startsWith('</node')){if(stack.length>1)stack.pop();continue;}const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(tok)))attrs[a[1]]=xmlDecode(a[2]);const node={attrs,children:[]};stack[stack.length-1].children.push(node);if(!tok.endsWith('/>'))stack.push(node);}return root;}
function descendantText(node){const parts=[];const walk=n=>{if(n?.attrs){if(n.attrs.text)parts.push(n.attrs.text);if(n.attrs['content-desc'])parts.push(n.attrs['content-desc']);if(n.attrs['resource-id'])parts.push(n.attrs['resource-id']);}for(const c of n?.children||[])walk(c);};walk(node);return parts.join(' ');}
function photoPickerActionControls(xml){const tree=parseUiTree(xml);const out=[];const positiveExact=/^(완료|추가|열기|확인|done|add|open|choose|use|選択|完了|追加|開く)$/i;const negative=/(전체 선택 해제|선택 해제|deselect|unselect|미리보기|preview|취소|cancel|닫기|close|선택됨|selected|사진 또는 동영상 .*개 선택)/i;const walk=n=>{const a=n.attrs||{};const b=parseBounds(a.bounds);const label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.google.android.photopicker'&&a.clickable==='true'&&b&&b.w>=90&&b.h>=60&&b.top>=1200&&!negative.test(label)){const tokens=label.split(/\s+/).filter(Boolean);const exact=tokens.find(t=>positiveExact.test(t));if(exact)out.push({node:n,attrs:a,bounds:b,label,exact});}for(const c of n.children||[])walk(c);};walk(tree);out.sort((a,b)=>(b.bounds.top-a.bounds.top)||(b.bounds.left-a.bounds.left));return out;}
function foregroundSnapshot(){
  const windowTxt=adbText('shell','dumpsys','window','windows');
  const activityTxt=adbText('shell','dumpsys','activity','activities');
  const activityTopTxt=adbText('shell','dumpsys','activity','top');
  const lines=[
    ...windowTxt.split(/\r?\n/).filter(x=>/mCurrentFocus|mFocusedApp/i.test(x)).slice(0,8),
    ...activityTxt.split(/\r?\n/).filter(x=>/mResumedActivity|topResumedActivity|ResumedActivity/i.test(x)).slice(0,8),
    ...activityTopTxt.split(/\r?\n/).filter(x=>/ACTIVITY |mResumedActivity|topResumedActivity/i.test(x)).slice(0,8)
  ];
  const joined=lines.join(' || ');
  const packages=[...new Set((joined.match(/[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+){1,}/g)||[]))];
  return{lines,joined,packages};
}
function resumedPackageFromForeground(fg){
  const joined=String(fg?.joined||'');
  const m=joined.match(/(?:topResumedActivity|mResumedActivity|ResumedActivity)[^{}]*\{[^}]*\s([a-zA-Z0-9_.]+)\/[a-zA-Z0-9_.$]+/);
  return m?.[1]||'';
}
function pickerSignalSnapshot(){
  let xml='';try{xml=dumpUi();}catch{}
  const fg=foregroundSnapshot();
  const nodes=parseUiNodes(xml);
  const uiPackages=[...new Set(nodes.map(n=>n.package).filter(Boolean))];
  const resumedPackage=resumedPackageFromForeground(fg);
  const uiIsPicker=uiPackages.some(p=>/com\.google\.android\.photopicker|documentsui|myfiles|filepicker/i.test(p));
  const resumedIsPicker=/com\.google\.android\.photopicker|documentsui|myfiles|filepicker/i.test(resumedPackage);
  const detected=uiIsPicker || resumedIsPicker;
  const text=nodes.map(nodeHay).join('\\n');
  return{
    detected,xml,fg,uiPackages,resumedPackage,uiIsPicker,resumedIsPicker,
    textSample:text.slice(0,1000)
  };
}
async function waitStablePickerOpen(caseNo,method,timeoutMs=6500){
  const started=Date.now();let consecutive=0,last=null;const history=[];
  while(Date.now()-started<timeoutMs){
    last=pickerSignalSnapshot();
    history.push({at:Date.now(),detected:last.detected,consecutive,fg:last.fg.joined,uiPackages:last.uiPackages,resumedPackage:last.resumedPackage,uiIsPicker:last.uiIsPicker,resumedIsPicker:last.resumedIsPicker});
    if(last.detected)consecutive++;else consecutive=0;
    if(consecutive>=3){
      write(`case-${caseNo}-${method}-stable-picker-history.json`,history);
      write(`case-${caseNo}-${method}-stable-picker.xml`,last.xml);
      await pcScreen(`case-${caseNo}-${method}-stable-picker.png`);
      return last.xml;
    }
    await sleep(250);
  }
  write(`case-${caseNo}-${method}-picker-history.json`,history);
  if(last?.xml)write(`case-${caseNo}-${method}-picker-last.xml`,last.xml);
  return null;
}
function pickerMediaCandidates(xml){
  const tree=parseUiTree(xml);
  const out=[],seen=new Set();
  const walk=n=>{
    const a=n.attrs||{}, b=parseBounds(a.bounds);
    const desc=descendantText(n).trim().replace(/\s+/g,' ');
    const blocked=/(드래그 핸들|drag handle|더보기|more|컬렉션|collection|완료|done|추가|add|취소|cancel)/i.test(desc);
    const mediaLike=/(촬영한 사진|촬영한 동영상|photo|video|image|사진|동영상)/i.test(desc);
    if(
      a.package==='com.google.android.photopicker' &&
      a.clickable==='true' &&
      b && b.top>=900 && b.bottom<=2400 &&
      b.w>=300 && b.w<=420 && b.h>=300 && b.h<=420 &&
      !blocked && mediaLike
    ){
      if(!seen.has(a.bounds)){
        seen.add(a.bounds);
        out.push({bounds:a.bounds,desc,class:a.class||'',parsed:b});
      }
    }
    for(const c of n.children||[])walk(c);
  };
  walk(tree);
  out.sort((x,y)=>x.parsed.top-y.parsed.top || x.parsed.left-y.parsed.left);
  return out;
}
async function autoSelectPickerMediaV38(caseNo,label,round,page){
  const before=pickerSignalSnapshot();
  if(!before.detected)throw new Error('HARNESS_PICKER_NOT_ACTIVE');
  const candidates=pickerMediaCandidates(before.xml||'');
  write(`case-${caseNo}-media-grid-r${round}.json`,candidates.map((c,i)=>({slot:i+1,bounds:c.bounds,desc:c.desc,class:c.class})));
  if(!candidates.length)throw new Error('HARNESS_MEDIA_CELL_NOT_FOUND');
  const c=candidates[0],b=c.parsed;
  if(b.top<900||b.w<300||b.w>420||b.h<300||b.h>420)throw new Error('HARNESS_UNSAFE_MEDIA_BOUNDS');
  adb('shell','input','tap',String(b.x),String(b.y));
  log(`[PHOTO TAP] CASE ${caseNo}: PHOTO_01 -> 사진첩 1번 ${c.bounds}`);
  await sleep(250);await pcScreen(`case-${caseNo}-after-photo-tap.png`);
  const dl=Date.now()+8500;let commitTapped=false;
  while(Date.now()<dl){
    const snap=pickerSignalSnapshot();
    if(!snap.detected){await sleep(350);return{selected:true,autoClosed:true,slot:1};}
    if(!commitTapped){const actions=photoPickerActionControls(snap.xml||'');if(actions.length){const a=actions[0],bb=a.bounds;adb('shell','input','tap',String(bb.x),String(bb.y));commitTapped=true;log(`[COMMIT TAP] CASE ${caseNo}: ${a.exact}`);await sleep(250);}}
    await sleep(180);
  }
  throw new Error('HARNESS_PICKER_RETURN_TIMEOUT');
}
// ===== V39 EXACT PICKER SOURCE END =====

async function selectPhoto01(caseNo){
  const stable=await waitStablePickerOpen(caseNo,'v39-source-exact',pickerStableTimeoutMs);
  if(!stable)throw new Error('HARNESS_FAIL:PICKER_NOT_STABLE');
  return autoSelectPickerMediaV38(caseNo,'PHOTO_01',1,null);
}

function browserProcessIdentity(pkg){
  const pid=adbText('shell','pidof',pkg).trim().split(/\s+/).filter(Boolean)[0]||'';
  return pid?{pid,key:pid}:null;
}
async function forceStopBrowserAndVerify(caseNo,pkg,label){
  const before=browserProcessIdentity(pkg);
  const stop=adb('shell','am','force-stop',pkg);
  const deadline=Date.now()+5000;
  let after=browserProcessIdentity(pkg);
  while(after && Date.now()<deadline){await sleep(120);after=browserProcessIdentity(pkg);}
  write(`case-${caseNo}-${label.toLowerCase()}-force-stop.json`,{before,commandStatus:stop.status,commandStdout:stop.stdout||'',commandStderr:stop.stderr||'',stopped:!after,after});
  if(stop.status!==0)throw new Error(`HARNESS_${label}_FORCE_STOP_COMMAND_FAILED:${stop.stderr||stop.stdout||''}`);
  if(after)throw new Error(`HARNESS_${label}_FORCE_STOP_FAILED:pid=${after.pid}`);
  return before;
}
function adbShellQuote(v){
  return "'"+String(v).replace(/'/g, "'\\''")+"'";
}
function launchBrowserUrl(pkg,url){
  const cmd=`am start -W -a android.intent.action.VIEW -d ${adbShellQuote(url)} -p ${adbShellQuote(pkg)}`;
  return adb('shell',cmd);
}
async function waitExpectedBrowserForeground(pkg,timeoutMs=6000){
  const deadline=Date.now()+timeoutMs;let last=null;
  while(Date.now()<deadline){
    last=foregroundSnapshot();
    if(resumedPackageFromForeground(last)===pkg)return{ok:true,foreground:last};
    await sleep(120);
  }
  return{ok:false,foreground:last};
}
function tapBrowserFileInputOnce(){
  const {w,h}=screenSize();
  const x=Math.floor(w/2),y=Math.floor(h/2);
  const r=adb('shell','input','tap',String(x),String(y));
  return{x,y,status:r.status,stdout:r.stdout||'',stderr:r.stderr||''};
}

function parseMultipartFile(body,contentType){
  const bm=String(contentType||'').match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if(!bm)return{ok:false,error:'BOUNDARY_NOT_FOUND',fileBytes:0};
  const boundary=bm[1]||bm[2];
  const marker=Buffer.from(`--${boundary}`);
  let pos=0;
  while(true){
    const partStart=body.indexOf(marker,pos);
    if(partStart<0)break;
    const headerStart=partStart+marker.length+2;
    const headerEnd=body.indexOf(Buffer.from('\r\n\r\n'),headerStart);
    if(headerEnd<0)break;
    const headers=body.subarray(headerStart,headerEnd).toString('utf8');
    const next=body.indexOf(Buffer.from(`\r\n--${boundary}`),headerEnd+4);
    if(next<0)break;
    const filename=headers.match(/filename="([^"]*)"/i)?.[1]||'';
    const fieldName=headers.match(/name="([^"]*)"/i)?.[1]||'';
    if(filename || fieldName==='file'){
      const data=body.subarray(headerEnd+4,next);
      return{ok:true,boundary,fieldName,filename,fileBytes:data.length,contentType:headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]||''};
    }
    pos=next+2;
  }
  return{ok:false,error:'FILE_PART_NOT_FOUND',fileBytes:0,boundary};
}

function createUploadServer(){
  const uploads=new Map();
  const visits=new Map();
  const server=http.createServer((req,res)=>{
    const u=new URL(req.url||'/',`http://${req.headers.host||'127.0.0.1'}`);
    if(req.method==='GET' && u.pathname==='/health'){
      res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({ok:true,at:Date.now()}));return;
    }
    if(req.method==='GET' && u.pathname==='/form'){
      const round=Number(u.searchParams.get('round')||0);
      const phase=String(u.searchParams.get('phase')||'UNKNOWN').toUpperCase();
      const key=`${phase}-${round}`;
      visits.set(key,{phase,round,at:Date.now(),ua:req.headers['user-agent']||''});
      write(`server-visit-${key}.json`,visits.get(key));
      const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOOL001 V53 Engine Boundary A/B</title>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:sans-serif;background:#fff}#file{position:fixed;inset:0;width:100vw;height:100vh;opacity:.01;z-index:9999}.box{position:fixed;inset:20% 7%;display:flex;align-items:center;justify-content:center;text-align:center;border:3px solid #111;border-radius:24px;padding:24px;box-sizing:border-box}pre{white-space:pre-wrap}</style></head>
<body><div class="box"><div><h2>TOOL001 V53 ${phase}</h2><p>Tap once anywhere in this page to select PHOTO01.</p><p>Native HTML multipart submit. No JavaScript byte read.</p><pre id="out"></pre></div></div>
<form id="f" method="POST" action="/upload?phase=${encodeURIComponent(phase)}&round=${round}" enctype="multipart/form-data"><input id="file" name="file" type="file" accept="image/*" aria-label="V53_UPLOAD_FILE"></form>
<script>window.__diag={stage:'idle',phase:${JSON.stringify(phase)},round:${round},pageLoadedAt:Date.now()};const f=document.getElementById('f'),i=document.getElementById('file'),o=document.getElementById('out');i.addEventListener('change',()=>{const file=i.files&&i.files[0];window.__diag={stage:'form_submit',phase:${JSON.stringify(phase)},round:${round},changeAt:Date.now(),name:file?file.name:'',size:file?file.size:0,type:file?file.type:''};o.textContent=JSON.stringify(window.__diag,null,2);f.submit();});</script></body></html>`;
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});res.end(html);return;
    }
    if(req.method==='POST' && u.pathname==='/upload'){
      const round=Number(u.searchParams.get('round')||0);
      const phase=String(u.searchParams.get('phase')||'UNKNOWN').toUpperCase();
      const key=`${phase}-${round}`;
      const chunks=[];let total=0,aborted=false;
      req.on('data',c=>{chunks.push(c);total+=c.length;});
      req.on('aborted',()=>{aborted=true;uploads.set(key,{phase,round,received:true,pass:false,error:'REQUEST_ABORTED',bodyBytes:total,at:Date.now()});});
      req.on('error',e=>{uploads.set(key,{phase,round,received:true,pass:false,error:`REQUEST_ERROR:${e.message}`,bodyBytes:total,at:Date.now()});});
      req.on('end',()=>{
        if(aborted)return;
        const body=Buffer.concat(chunks);const parsed=parseMultipartFile(body,req.headers['content-type']||'');
        const result={phase,round,received:true,bodyBytes:body.length,contentLength:Number(req.headers['content-length']||0),...parsed,at:Date.now()};
        result.pass=parsed.ok && parsed.fileBytes>0;uploads.set(key,result);write(`server-upload-${key}.json`,result);
        res.writeHead(result.pass?200:400,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});res.end(`<html><body><h2>${result.pass?'UPLOAD_OK':'UPLOAD_FAIL'}</h2><pre>${JSON.stringify(result,null,2).replace(/</g,'&lt;')}</pre></body></html>`);
      });return;
    }
    res.writeHead(404,{'content-type':'text/plain'});res.end('not found');
  });
  return{server,uploads,visits};
}
async function waitMap(map,key,timeoutMs){const deadline=Date.now()+timeoutMs;while(Date.now()<deadline){if(map.has(key))return map.get(key);await sleep(120);}return null;}

async function makeZip(){
  if(process.platform!=='win32')return;
  const zip=`${outDir}.zip`;
  const ps=`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`;
  const r=spawnSync('powershell.exe',['-NoProfile','-Command',ps],{encoding:'utf8'});
  if(r.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] RESULT ZIP FAILED',r.stderr||r.stdout||'');
}

async function runPhase({label,pkg,serverPort,uploads,visits}){
  const rows=[];
  for(let r=1;r<=repeats;r++){
    const caseNo=`${label}-MULTIPART-${r}`;
    const key=`${label}-${r}`;
    log(`===== ${label} native multipart ${r}/${repeats} =====`);
    const row={phase:`${label}_NATIVE_MULTIPART`,browser:label,package:pkg,round:r,pass:false,harnessFail:false,error:'',upload:null,visit:null,tap:null};
    try{
      await forceStopBrowserAndVerify(caseNo,pkg,label);
      adb('logcat','-b','all','-c');
      const formUrl=`http://127.0.0.1:${serverPort}/form?phase=${encodeURIComponent(label)}&round=${r}`;
      const launch=launchBrowserUrl(pkg,formUrl);
      row.launch={status:launch.status,stdout:launch.stdout||'',stderr:launch.stderr||''};
      if(launch.status!==0)throw new Error(`HARNESS_${label}_URL_LAUNCH_FAILED:${launch.stderr||launch.stdout||''}`);
      row.foregroundCheck=await waitExpectedBrowserForeground(pkg,6000);
      if(!row.foregroundCheck.ok){
        const resumed=resumedPackageFromForeground(row.foregroundCheck.foreground)||'NONE';
        throw new Error(`HARNESS_${label}_WRONG_FOREGROUND_PACKAGE:expected=${pkg}:actual=${resumed}`);
      }
      row.visit=await waitMap(visits,key,12000);
      if(!row.visit)throw new Error(`HARNESS_${label}_LOCAL_FORM_LOAD_TIMEOUT`);
      await sleep(700);
      await screen(`case-${caseNo}-before-file-tap.png`);
      row.tap=tapBrowserFileInputOnce();
      if(row.tap.status!==0)throw new Error(`HARNESS_${label}_FILE_INPUT_TAP_COMMAND_FAILED`);
      row.selected=await selectPhoto01(caseNo);
      row.upload=await waitMap(uploads,key,10000);
      if(row.upload?.pass && Number(row.upload.fileBytes)>0){
        row.pass=true;
        if(Number(row.upload.fileBytes)!==457776){row.pass=false;row.error=`UPLOAD_BYTES_UNEXPECTED:${row.upload.fileBytes}`;}
      }else if(row.upload){row.error=row.upload.error||'UPLOAD_MULTIPART_PARSE_OR_BYTES_FAILED';}
      else{row.error='UPLOAD_SERVER_TIMEOUT_AFTER_VALID_SELECTION';}
      await sleep(250);
    }catch(e){
      row.error=String(e?.message||e);
      row.harnessFail=/HARNESS_/i.test(row.error);
    }
    const lc=fullLogcat();row.systemEvidence=evidenceFromLogcat(lc);
    write(`case-${caseNo}.json`,row);write(`case-${caseNo}-logcat-all-buffers.txt`,lc);write(`case-${caseNo}-logcat-filtered.txt`,filteredEvidence(lc));
    await screen(`case-${caseNo}-device.png`);
    log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] ${label} R${r} fileBytes=${row.upload?.fileBytes||0} bodyBytes=${row.upload?.bodyBytes||0} lowerFsOpens=${row.systemEvidence.mediaProviderLowerFsOpens} uploadChanged=${row.systemEvidence.uploadFileChanged} error=${row.error||'-'}`);
    adb('shell','am','force-stop',pkg);rows.push(row);await sleep(350);
  }
  return rows;
}

function phaseStats(rows){const valid=rows.filter(x=>!x.harnessFail),pass=valid.filter(x=>x.pass),fail=valid.filter(x=>!x.pass);return{total:rows.length,valid:valid.length,harnessFail:rows.length-valid.length,pass:pass.length,fail:fail.length,exactBytes:pass.filter(x=>Number(x.upload?.fileBytes)===457776).length};}

async function main(){
  log('=== TOOL001 V53R2 CHROME vs FIREFOX NATIVE MULTIPART ENGINE BOUNDARY A/B ===');
  log(`REPEATS_PER_BROWSER=${repeats}`);log('PRODUCT_CODE=NONE');log('BYTE_READ_JS=NONE');log('TRANSPORT=HTML_FORM_MULTIPART_BROWSER_NATIVE');log('BROWSER_CONTROL=ADB_IDENTICAL_FLOW');log('ONE_SELECTION_ONE_FORM_SUBMIT_NO_RETRY');
  if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');
  if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');
  if(!packageInstalled(CHROME_PKG))throw new Error(`CHROME_NOT_INSTALLED_PACKAGE_${CHROME_PKG}`);
  if(!packageInstalled(FIREFOX_PKG))throw new Error(`FIREFOX_NOT_INSTALLED_PACKAGE_${FIREFOX_PKG}`);

  const {server,uploads,visits}=createUploadServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(requestedPort,'127.0.0.1',resolve);});
  const port=server.address().port;const reverse=adb('reverse',`tcp:${port}`,`tcp:${port}`);
  if(reverse.status!==0){server.close();throw new Error(`ADB_REVERSE_FAILED:${reverse.stderr||reverse.stdout||''}`);}
  write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${browserVersion(CHROME_PKG)}`,`firefox=${browserVersion(FIREFOX_PKG)}`,`firefox_package=${FIREFOX_PKG}`,`adb_reverse_port=${port}`].join('\n'));

  let chromeRows=[],firefoxRows=[];
  try{
    chromeRows=await runPhase({label:'CHROME',pkg:CHROME_PKG,serverPort:port,uploads,visits});
    firefoxRows=await runPhase({label:'FIREFOX',pkg:FIREFOX_PKG,serverPort:port,uploads,visits});
  }finally{
    adb('shell','am','force-stop',CHROME_PKG);adb('shell','am','force-stop',FIREFOX_PKG);adb('reverse','--remove',`tcp:${port}`);await new Promise(resolve=>server.close(()=>resolve()));
  }

  const chrome=phaseStats(chromeRows),firefox=phaseStats(firefoxRows);
  let interpretation='';
  if(chrome.valid!==repeats || firefox.valid!==repeats)interpretation='INCONCLUSIVE_HARNESS_FAILURE';
  else if(chrome.pass<repeats && firefox.pass===repeats)interpretation='CHROMIUM_ANDROID_UPLOAD_BOUNDARY_STRONGLY_SUPPORTED_FIREFOX_7_OF_7';
  else if(chrome.pass<repeats && firefox.pass<repeats)interpretation='BOTH_ENGINES_RANDOM_ANDROID_PICKER_PROVIDER_URI_LAYER_REMAINS';
  else if(chrome.pass===repeats && firefox.pass===repeats)interpretation='BOTH_ENGINES_7_OF_7_REPEAT_MORE_BECAUSE_HISTORICAL_RANDOMNESS';
  else if(chrome.pass===repeats && firefox.pass<repeats)interpretation='FIREFOX_SPECIFIC_OR_FIREFOX_HARNESS_PATH_REVIEW';
  else interpretation='MIXED_ENGINE_RESULT_REVIEW_ROWS';
  const result={version:'V53R2-CHROME-FIREFOX-NATIVE-MULTIPART-AB',repeatsPerBrowser:repeats,chrome,firefox,interpretation,rows:[...chromeRows,...firefoxRows]};write('result.json',result);
  const summary=['TOOL001 V53R2 CHROME vs FIREFOX NATIVE MULTIPART ENGINE BOUNDARY A/B',`REPEATS_PER_BROWSER=${repeats}`,`CHROME VALID=${chrome.valid}/${chrome.total} PASS=${chrome.pass}/${chrome.valid} FAIL=${chrome.fail} HARNESS_FAIL=${chrome.harnessFail} EXACT_457776=${chrome.exactBytes}`,`FIREFOX VALID=${firefox.valid}/${firefox.total} PASS=${firefox.pass}/${firefox.valid} FAIL=${firefox.fail} HARNESS_FAIL=${firefox.harnessFail} EXACT_457776=${firefox.exactBytes}`,`INTERPRETATION=${interpretation}`,'','RULE_1=Chrome and Firefox use the same local minimal HTML form and the same ADB one-tap browser flow.','RULE_2=Each round has one file-input tap and PHOTO01 one selection.','RULE_3=JavaScript never reads file bytes.','RULE_4=Native HTML multipart/form-data performs one submit.','RULE_5=No retry, no recovery, no alternate photo, no picker fallback.','RULE_6=HARNESS_FAIL is separated from browser/upload FAIL.','RULE_7=No TOOL001 / React / Next.js product code.'].join('\n');
  write('v53r2-chrome-firefox-summary.txt',summary);log(summary);await makeZip();
}
main().catch(async e=>{log('[FATAL]',e?.stack||String(e));try{await screen('fatal-device.png');}catch{}await makeZip();process.exitCode=1;});
