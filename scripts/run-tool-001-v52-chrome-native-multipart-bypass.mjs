#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { _android as android } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const repeats=Math.max(1,Number(args.repeats||7));
const pickerStableTimeoutMs=Math.max(9000,Number(args['picker-timeout-ms']||12000));
const requestedPort=Math.max(1024,Number(args.port||18752));
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V52_CHROME_NATIVE_MULTIPART_BYPASS_REAL_DEVICE_${stamp}`);
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
function dumpUi(){const remote='/sdcard/tool001-v52-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function fullLogcat(){return adbText('logcat','-b','all','-d','-v','threadtime');}
function filteredEvidence(text){return String(text||'').split(/\r?\n/).filter(x=>/(chromium|chrome|cr_|photopicker|MediaProvider|fuse|ContentResolver|ContentProviderHelper|UriGrantsManagerService|UriPermission|permission denied|EACCES|ENOENT|ERR_UPLOAD_FILE_CHANGED|file could not be read|FileChooser|SelectFileDialog|multipart|upload|content:\/\/|Storage)/i.test(x)).slice(-3200).join('\n');}
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function evidenceFromLogcat(text){
  const lines=String(text||'').split(/\r?\n/);
  return{
    uriPermissionWmLockErrors:lines.filter(x=>/Unable to check Uri permission because caller is holding WM lock/i.test(x)).length,
    mediaProviderLowerFsOpens:lines.filter(x=>/MediaProvider: Open with lower FS/i.test(x)).length,
    chromeNoPersistedWritePermission:lines.filter(x=>/cr_SelectFileDialog: No persisted write permission/i.test(x)).length,
    uploadFileChanged:lines.filter(x=>/ERR_UPLOAD_FILE_CHANGED/i.test(x)).length,
    pickerStarts:lines.filter(x=>/ActivityTaskManager: START .*com\.google\.android\.photopicker/i.test(x)).slice(-8)
  };
}

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

function chromeMainProcessIdentity(){
  const pid=adbText('shell','pidof','com.android.chrome').trim().split(/\s+/).filter(Boolean)[0]||'';
  return pid?{pid,key:pid}:null;
}
async function forceStopChromeAndVerify(caseNo){
  const before=chromeMainProcessIdentity();
  const stop=adb('shell','am','force-stop','com.android.chrome');
  const deadline=Date.now()+5000;
  let after=chromeMainProcessIdentity();
  while(after && Date.now()<deadline){await sleep(120);after=chromeMainProcessIdentity();}
  write(`case-${caseNo}-chrome-force-stop.json`,{before,commandStatus:stop.status,commandStdout:stop.stdout||'',commandStderr:stop.stderr||'',stopped:!after,after});
  if(stop.status!==0)throw new Error(`HARNESS_CHROME_FORCE_STOP_COMMAND_FAILED:${stop.stderr||stop.stdout||''}`);
  if(after)throw new Error(`HARNESS_CHROME_FORCE_STOP_FAILED:pid=${after.pid}`);
  return before;
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
  const server=http.createServer((req,res)=>{
    const u=new URL(req.url||'/',`http://${req.headers.host||'127.0.0.1'}`);
    if(req.method==='GET' && u.pathname==='/health'){
      res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
      res.end(JSON.stringify({ok:true,at:Date.now()}));
      return;
    }
    if(req.method==='GET' && u.pathname==='/form'){
      const round=Number(u.searchParams.get('round')||0);
      const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOOL001 V52 Native Multipart</title></head>
<body style="font-family:sans-serif;padding:28px"><h2>TOOL001 Chrome Native Multipart Upload</h2>
<p>No TOOL001 / React / Next.js. No JavaScript byte read. One file choice, then native HTML form multipart submit.</p>
<form id="f" method="POST" action="/upload?round=${round}" enctype="multipart/form-data">
<input id="file" name="file" type="file" accept="image/*" style="font-size:20px;padding:14px 4px">
</form><pre id="out"></pre>
<script>
window.__diag={stage:'idle',round:${round},pageLoadedAt:Date.now()};
const f=document.getElementById('f'),i=document.getElementById('file'),o=document.getElementById('out');
i.addEventListener('change',()=>{
 const file=i.files&&i.files[0];
 window.__diag={stage:'form_submit',round:${round},changeAt:Date.now(),name:file?file.name:'',size:file?file.size:0,type:file?file.type:''};
 o.textContent=JSON.stringify(window.__diag,null,2);
 f.submit();
});
</script></body></html>`;
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
      res.end(html);
      return;
    }
    if(req.method==='POST' && u.pathname==='/upload'){
      const round=Number(u.searchParams.get('round')||0);
      const chunks=[];
      let total=0,aborted=false;
      req.on('data',c=>{chunks.push(c);total+=c.length;});
      req.on('aborted',()=>{aborted=true;uploads.set(round,{round,received:true,pass:false,error:'REQUEST_ABORTED',bodyBytes:total,at:Date.now()});});
      req.on('error',e=>{uploads.set(round,{round,received:true,pass:false,error:`REQUEST_ERROR:${e.message}`,bodyBytes:total,at:Date.now()});});
      req.on('end',()=>{
        if(aborted)return;
        const body=Buffer.concat(chunks);
        const parsed=parseMultipartFile(body,req.headers['content-type']||'');
        const result={round,received:true,bodyBytes:body.length,contentLength:Number(req.headers['content-length']||0),...parsed,at:Date.now()};
        result.pass=parsed.ok && parsed.fileBytes>0;
        uploads.set(round,result);
        write(`server-upload-round-${round}.json`,result);
        res.writeHead(result.pass?200:400,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
        res.end(`<html><body><h2>${result.pass?'UPLOAD_OK':'UPLOAD_FAIL'}</h2><pre>${JSON.stringify(result,null,2).replace(/</g,'&lt;')}</pre></body></html>`);
      });
      return;
    }
    res.writeHead(404,{'content-type':'text/plain'});res.end('not found');
  });
  return{server,uploads};
}

async function waitServerUpload(uploads,round,timeoutMs=10000){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){
    if(uploads.has(round))return uploads.get(round);
    await sleep(120);
  }
  return null;
}
async function makeZip(){
  if(process.platform!=='win32')return;
  const zip=`${outDir}.zip`;
  const ps=`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`;
  const r=spawnSync('powershell.exe',['-NoProfile','-Command',ps],{encoding:'utf8'});
  if(r.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] RESULT ZIP FAILED',r.stderr||r.stdout||'');
}

async function main(){
  log('=== TOOL001 V52 CHROME NATIVE MULTIPART BYPASS VALIDATION ===');
  log(`REPEATS=${repeats}`);
  log('PRODUCT_CODE=NONE');
  log('BYTE_READ_JS=NONE');
  log('TRANSPORT=HTML_FORM_MULTIPART_BROWSER_NATIVE');
  log('ONE_SELECTION_ONE_FORM_SUBMIT_NO_RETRY');
  if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');
  if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');

  const {server,uploads}=createUploadServer();
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(requestedPort,'127.0.0.1',resolve);
  });
  const port=server.address().port;
  const reverse=adb('reverse',`tcp:${port}`,`tcp:${port}`);
  if(reverse.status!==0){server.close();throw new Error(`ADB_REVERSE_FAILED:${reverse.stderr||reverse.stdout||''}`);}
  write('device-info.txt',[
    `model=${adbText('shell','getprop','ro.product.model').trim()}`,
    `android=${adbText('shell','getprop','ro.build.version.release').trim()}`,
    `sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,
    `chrome=${browserVersion('com.android.chrome')}`,
    `adb_reverse_port=${port}`
  ].join('\n'));

  const devices=await android.devices();
  if(!devices.length)throw new Error('PLAYWRIGHT_ANDROID_DEVICE_NOT_FOUND');
  const device=devices[0];
  const rows=[];
  try{
    for(let r=1;r<=repeats;r++){
      const caseNo=`CHROME-MULTIPART-${r}`;
      log(`===== Chrome native multipart ${r}/${repeats} =====`);
      const row={phase:'CHROME_NATIVE_MULTIPART',round:r,pass:false,harnessFail:false,error:'',upload:null};
      let context=null,page=null;
      try{
        await forceStopChromeAndVerify(caseNo);
        adb('logcat','-b','all','-c');
        context=await device.launchBrowser({});
        page=await context.newPage();
        const requestFailures=[];
        page.on('requestfailed',req=>requestFailures.push({url:req.url(),failure:req.failure()}));
        row.requestFailures=requestFailures;
        const formUrl=`http://127.0.0.1:${port}/form?round=${r}`;
        const response=await page.goto(formUrl,{waitUntil:'domcontentloaded',timeout:15000});
        if(!response || !response.ok())throw new Error(`HARNESS_LOCAL_FORM_LOAD_FAILED:${response?.status()||'NO_RESPONSE'}`);
        const health=await page.evaluate(async()=>{const r=await fetch('/health',{cache:'no-store'});return r.ok;});
        if(health!==true)throw new Error('HARNESS_LOCAL_SERVER_HEALTH_FAILED');
        await page.locator('#file').click({timeout:5000,noWaitAfter:true});
        row.selected=await selectPhoto01(caseNo);
        row.upload=await waitServerUpload(uploads,r,10000);
        if(row.upload?.pass && Number(row.upload.fileBytes)>0){
          row.pass=true;
          if(Number(row.upload.fileBytes)!==457776){
            row.pass=false;
            row.error=`UPLOAD_BYTES_UNEXPECTED:${row.upload.fileBytes}`;
          }
        }else if(row.upload){
          row.error=row.upload.error||'UPLOAD_MULTIPART_PARSE_OR_BYTES_FAILED';
        }else{
          row.error='UPLOAD_SERVER_TIMEOUT_AFTER_VALID_SELECTION';
        }
        await sleep(250);
      }catch(e){
        row.error=String(e?.message||e);
        row.harnessFail=/HARNESS_|Target page|Page closed|Browser has been closed|ADB_REVERSE_FAILED/i.test(row.error);
      }

      const lc=fullLogcat();
      row.systemEvidence=evidenceFromLogcat(lc);
      write(`case-${caseNo}.json`,row);
      write(`case-${caseNo}-logcat-all-buffers.txt`,lc);
      write(`case-${caseNo}-logcat-filtered.txt`,filteredEvidence(lc));
      await screen(`case-${caseNo}-device.png`);
      log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] multipart R${r} fileBytes=${row.upload?.fileBytes||0} bodyBytes=${row.upload?.bodyBytes||0} lowerFsOpens=${row.systemEvidence.mediaProviderLowerFsOpens} uploadChanged=${row.systemEvidence.uploadFileChanged} error=${row.error||'-'}`);
      if(page)await page.close().catch(()=>{});
      if(context)await context.close().catch(()=>{});
      rows.push(row);
      await sleep(250);
    }
  }finally{
    adb('shell','am','force-stop','com.android.chrome');
    if(typeof device.close==='function')await device.close().catch(()=>{});
    adb('reverse','--remove',`tcp:${port}`);
    await new Promise(resolve=>server.close(()=>resolve()));
  }

  const valid=rows.filter(x=>!x.harnessFail);
  const pass=valid.filter(x=>x.pass);
  const fail=valid.filter(x=>!x.pass);
  const exact=pass.filter(x=>Number(x.upload?.fileBytes)===457776).length;
  const interpretation=
    valid.length!==repeats?'INCONCLUSIVE_HARNESS_FAILURE':
    pass.length===repeats?'NATIVE_MULTIPART_BYPASS_7_OF_7_CONFIRMED_CANDIDATE':
    pass.length>0?'NATIVE_MULTIPART_ALSO_RANDOM_NOT_A_100_PERCENT_BYPASS':
    'NATIVE_MULTIPART_PATH_FAILED_ALL_ROUNDS';
  const result={version:'V52-CHROME-NATIVE-MULTIPART-BYPASS',repeats,total:rows.length,valid:valid.length,harnessFail:rows.length-valid.length,pass:pass.length,fail:fail.length,exactBytes:exact,interpretation,rows};
  write('result.json',result);
  const summary=[
    'TOOL001 V52 CHROME NATIVE MULTIPART BYPASS VALIDATION',
    `REPEATS=${repeats}`,
    `VALID=${valid.length}/${rows.length} PASS=${pass.length}/${valid.length} FAIL=${fail.length} HARNESS_FAIL=${rows.length-valid.length}`,
    `EXACT_457776_BYTES_PASS=${exact}`,
    `INTERPRETATION=${interpretation}`,
    '',
    'RULE_1=Each round is one Chrome file chooser open and PHOTO01 one selection.',
    'RULE_2=JavaScript never reads file bytes: no arrayBuffer, FileReader, Blob read, or stream read.',
    'RULE_3=After file selection, a native HTML form performs one multipart/form-data submit.',
    'RULE_4=The local Node server only receives and counts uploaded bytes; it never reads the Android provider directly.',
    'RULE_5=No retry, no recovery, no alternate photo, no fallback selection.',
    'RULE_6=No TOOL001 / React / Next.js product code.'
  ].join('\n');
  write('v52-native-multipart-summary.txt',summary);
  log(summary);
  await makeZip();
}
main().catch(async e=>{
  log('[FATAL]',e?.stack||String(e));
  try{await screen('fatal-device.png');}catch{}
  await makeZip();
  process.exitCode=1;
});
