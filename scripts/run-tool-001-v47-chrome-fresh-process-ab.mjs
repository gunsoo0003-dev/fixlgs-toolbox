#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { _android as android } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const repeats=Math.max(1,Number(args.repeats||7));
const pickerStableTimeoutMs=Math.max(9000,Number(args['picker-timeout-ms']||12000));
const here=path.dirname(fileURLToPath(import.meta.url));
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V47_CHROME_DEEP_DIAG_REAL_DEVICE_${stamp}`);
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
function dumpUi(){const remote='/sdcard/tool001-v47-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function fullLogcat(){return adbText('logcat','-b','all','-d','-v','threadtime');}
function filteredEvidence(text){return String(text||'').split(/\r?\n/).filter(x=>/(chromium|chrome|cr_|photopicker|MediaProvider|fuse|ContentResolver|openFileDescriptor|ContentProviderHelper|UriGrantsManagerService|UriPermission|permission denied|EACCES|ENOENT|NotReadableError|ERR_UPLOAD_FILE_CHANGED|file could not be read|FileReader|FileChooser|SelectFileDialog|Blob|arrayBuffer|content:\/\/|Storage)/i.test(x)).slice(-3200).join('\n');}
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function cmdOk(name,args,cwd){return spawnSync(name,args,{cwd,encoding:'utf8',shell:process.platform==='win32',maxBuffer:128*1024*1024});}
function evidenceFromLogcat(text){
  const lines=String(text||'').split(/\r?\n/);
  return{
    uriPermissionWmLockErrors:lines.filter(x=>/Unable to check Uri permission because caller is holding WM lock/i.test(x)).length,
    mediaProviderLowerFsOpens:lines.filter(x=>/MediaProvider: Open with lower FS/i.test(x)).length,
    chromeNoPersistedWritePermission:lines.filter(x=>/cr_SelectFileDialog: No persisted write permission/i.test(x)).length,
    pickerStarts:lines.filter(x=>/ActivityTaskManager: START .*com\.google\.android\.photopicker/i.test(x)).slice(-8)
  };
}


function filterLines(text,re,max=900){return String(text||'').split(/\r?\n/).filter(x=>re.test(x)).slice(-max).join('\n');}
function chromeProcessSnapshot(){
  const pid=adbText('shell','pidof','com.android.chrome').trim();
  const ps=adbText('shell','ps','-A');
  const top=adbText('shell','dumpsys','activity','top');
  const win=adbText('shell','dumpsys','window','windows');
  const cmdlines=[];
  for(const p of pid.split(/\s+/).filter(Boolean).slice(0,16)){
    const raw=adbText('shell','sh','-c',`cat /proc/${p}/cmdline 2>/dev/null | tr "\\000" " "`);
    if(raw.trim())cmdlines.push(`PID ${p}: ${raw.trim()}`);
  }
  return[
    `chrome_pidof=${pid||'(none)'}`,
    '',
    '[PS_CHROME]',
    filterLines(ps,/chrome|chromium/i,500),
    '',
    '[ACTIVITY_TOP_RELEVANT]',
    filterLines(top,/chrome|chromium|photopicker|MediaProvider|ResumedActivity|topResumedActivity|ACTIVITY /i,700),
    '',
    '[WINDOW_RELEVANT]',
    filterLines(win,/chrome|chromium|photopicker|mCurrentFocus|mFocusedApp/i,500),
    '',
    '[CHROME_CMDLINES_PASSIVE]',
    cmdlines.join('\n')||'(not readable)'
  ].join('\n');
}
function uriGrantSnapshot(){
  const providers=adbText('shell','dumpsys','activity','providers');
  const pkg=adbText('shell','dumpsys','package','com.android.chrome');
  return[
    '[ACTIVITY_PROVIDERS_RELEVANT]',
    filterLines(providers,/chrome|photopicker|media|content:\/\/|uri|grant|permission/i,1000),
    '',
    '[CHROME_PACKAGE_URI_PERMISSION_RELEVANT]',
    filterLines(pkg,/uri|grant|permission|storage|media|photo/i,800)
  ].join('\n');
}
async function attachPassivePageAndCdpEvidence(context,page){
  const pageEvents=[];
  const cdpEvents=[];
  const pushPage=(type,data={})=>pageEvents.push({at:Date.now(),type,...data});
  page.on('console',msg=>pushPage('console',{consoleType:msg.type(),text:msg.text(),location:msg.location()}));
  page.on('pageerror',err=>pushPage('pageerror',{name:err?.name||'',message:err?.message||String(err)}));
  page.on('crash',()=>pushPage('crash'));
  page.on('requestfailed',req=>pushPage('requestfailed',{url:req.url(),failure:req.failure()}));
  let cdp=null,cdpAttachError='';
  try{
    if(typeof context.newCDPSession!=='function')throw new Error('NEW_CDP_SESSION_UNAVAILABLE');
    cdp=await context.newCDPSession(page);
    const pushCdp=(type,payload)=>cdpEvents.push({at:Date.now(),type,payload});
    cdp.on('Runtime.exceptionThrown',p=>pushCdp('Runtime.exceptionThrown',p));
    cdp.on('Runtime.consoleAPICalled',p=>pushCdp('Runtime.consoleAPICalled',p));
    cdp.on('Log.entryAdded',p=>pushCdp('Log.entryAdded',p));
    cdp.on('Inspector.targetCrashed',p=>pushCdp('Inspector.targetCrashed',p));
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.enable');
  }catch(e){
    cdpAttachError=String(e?.message||e);
    cdpEvents.push({at:Date.now(),type:'CDP_ATTACH_UNAVAILABLE',error:cdpAttachError});
  }
  return{pageEvents,cdpEvents,cdpAttachError,detach:async()=>{if(cdp)await cdp.detach().catch(()=>{});}};
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

const MINIMAL_HTML=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOOL001 V47 Chrome Byte Read</title></head><body style="font-family:sans-serif;padding:28px"><h2>TOOL001 Chrome Minimal File Read</h2><p>No TOOL001 / React / Next.js. One visible file input, one picker selection, one arrayBuffer read. Passive diagnostics only.</p><input id="file" type="file" accept="image/*" style="font-size:20px;padding:14px 4px"><pre id="out"></pre><script>
window.__diag={stage:'idle',pass:null,pageLoadedAt:Date.now(),ua:navigator.userAgent};
const f=document.getElementById('file'),o=document.getElementById('out');
const paint=()=>o.textContent=JSON.stringify(window.__diag,null,2);
f.addEventListener('change',async()=>{
 const changeAt=Date.now();
 const file=f.files&&f.files[0];
 if(!file){window.__diag={...window.__diag,stage:'no_file',pass:false,changeAt};paint();console.log('V47_DIAG no_file');return;}
 const readStartAt=Date.now();
 window.__diag={...window.__diag,stage:'read_start',pass:null,changeAt,readStartAt,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified,visibility:document.visibilityState,hasFocus:document.hasFocus()};paint();
 console.log('V47_DIAG read_start',JSON.stringify({name:file.name,size:file.size,type:file.type,lastModified:file.lastModified,changeAt,readStartAt}));
 try{
   const ab=await file.arrayBuffer();
   const readEndAt=Date.now();
   window.__diag={...window.__diag,stage:'read_pass',pass:true,bytes:ab.byteLength,readEndAt,readDurationMs:readEndAt-readStartAt};paint();
   console.log('V47_DIAG read_pass',JSON.stringify({bytes:ab.byteLength,readDurationMs:readEndAt-readStartAt}));
 }catch(e){
   const readEndAt=Date.now();
   window.__diag={...window.__diag,stage:'read_fail',pass:false,errorName:e&&e.name||'',errorMessage:e&&e.message||String(e),readEndAt,readDurationMs:readEndAt-readStartAt};paint();
   console.error('V47_DIAG read_fail',JSON.stringify({errorName:e&&e.name||'',errorMessage:e&&e.message||String(e),readDurationMs:readEndAt-readStartAt}));
 }
});
paint();
</script></body></html>`;

function chromeMainProcessIdentity(){
  const pid=adbText('shell','pidof','com.android.chrome').trim().split(/\s+/).filter(Boolean)[0]||'';
  if(!pid)return null;
  const startTicks=adbText('shell','sh','-c',`awk '{print $22}' /proc/${pid}/stat 2>/dev/null`).trim();
  return{pid,startTicks,key:`${pid}:${startTicks||'unknown'}`};
}
async function forceStopChromeAndVerify(caseNo){
  const before=chromeMainProcessIdentity();
  const stop=adb('shell','am','force-stop','com.android.chrome');
  const deadline=Date.now()+5000;
  let after=chromeMainProcessIdentity();
  while(after && Date.now()<deadline){await sleep(120);after=chromeMainProcessIdentity();}
  write(`case-${caseNo}-chrome-force-stop.json`,{
    before,
    commandStatus:stop.status,
    commandStdout:stop.stdout||'',
    commandStderr:stop.stderr||'',
    stopped:!after,
    after
  });
  if(stop.status!==0)throw new Error(`HARNESS_CHROME_FORCE_STOP_COMMAND_FAILED:${stop.stderr||stop.stdout||''}`);
  if(after)throw new Error(`HARNESS_CHROME_FORCE_STOP_FAILED:pid=${after.pid}`);
  return before;
}
async function waitChromeIdentity(timeoutMs=6000){
  const deadline=Date.now()+timeoutMs;
  let id=chromeMainProcessIdentity();
  while(!id && Date.now()<deadline){await sleep(120);id=chromeMainProcessIdentity();}
  return id;
}

async function runChromeMinimal(){
  log('=== PHASE A: CHROME MINIMAL HTML / FRESH-PROCESS A-B DIAGNOSTICS ===');
  const devices=await android.devices();
  if(!devices.length)throw new Error('PLAYWRIGHT_ANDROID_DEVICE_NOT_FOUND');
  const device=devices[0];
  const rows=[];
  let previousLaunchedIdentity=null;
  for(let r=1;r<=repeats;r++){
    const caseNo=`CHROME-MIN-${r}`;
    log(`===== Chrome fresh-process diag ${r}/${repeats} =====`);
    const row={phase:'CHROME_MINIMAL_FRESH_PROCESS',round:r,pass:false,harnessFail:false,error:'',diag:null,notReadable:false};
    let context=null,page=null,evidence=null;
    try{
      // Intentional A/B condition: each round starts from a fully stopped Chrome process.
      // This is performed before the user flow and is never used to recover a failed read.
      row.chromeIdentityBeforeForceStop=await forceStopChromeAndVerify(caseNo);
      write(`case-${caseNo}-chrome-process-after-force-stop.txt`,chromeProcessSnapshot());

      // Clear logs only after Chrome is confirmed stopped so each case captures the fresh launch/read chain.
      adb('logcat','-b','all','-c');

      context=await device.launchBrowser({});
      row.chromeIdentityAfterLaunch=await waitChromeIdentity();
      if(!row.chromeIdentityAfterLaunch)throw new Error('HARNESS_CHROME_NEW_PROCESS_NOT_OBSERVED');
      row.freshProcessVersusPrevious=!previousLaunchedIdentity || row.chromeIdentityAfterLaunch.key!==previousLaunchedIdentity.key;
      if(previousLaunchedIdentity && !row.freshProcessVersusPrevious){
        throw new Error(`HARNESS_CHROME_PROCESS_IDENTITY_REUSED:${row.chromeIdentityAfterLaunch.key}`);
      }
      previousLaunchedIdentity=row.chromeIdentityAfterLaunch;
      write(`case-${caseNo}-chrome-process-after-fresh-launch.txt`,chromeProcessSnapshot());

      page=await context.newPage();
      evidence=await attachPassivePageAndCdpEvidence(context,page);
      row.cdpAttachError=evidence.cdpAttachError;
      await page.setContent(MINIMAL_HTML,{waitUntil:'domcontentloaded',timeout:15000});
      await page.locator('#file').click({timeout:5000,noWaitAfter:true});
      row.selected=await selectPhoto01(caseNo);
      const deadline=Date.now()+9000;
      while(Date.now()<deadline){
        const d=await page.evaluate(()=>window.__diag);
        row.diag=d;
        if(d?.stage==='read_pass'||d?.stage==='read_fail')break;
        await sleep(150);
      }
      if(row.diag?.stage==='read_pass'&&row.diag?.bytes>0)row.pass=true;
      else if(row.diag?.stage==='read_fail'){
        row.error=`${row.diag.errorName||''}:${row.diag.errorMessage||''}`;
        row.notReadable=/NotReadableError|could not be read/i.test(row.error);
      }else{
        row.harnessFail=true;
        row.error='HARNESS_DIAG_RESULT_TIMEOUT';
      }
      await sleep(300);
    }catch(e){
      row.error=String(e?.message||e);
      row.harnessFail=/HARNESS_|Target page|Page closed|Browser has been closed/i.test(row.error);
      if(!row.harnessFail && !row.diag?.stage)row.harnessFail=true;
    }

    const lc=fullLogcat();
    row.systemEvidence=evidenceFromLogcat(lc);
    row.pageEventCount=evidence?.pageEvents?.length||0;
    row.cdpEventCount=evidence?.cdpEvents?.length||0;
    row.chromeIdentityAtEvidence=chromeMainProcessIdentity();
    write(`case-${caseNo}.json`,row);
    write(`case-${caseNo}-page-events.json`,evidence?.pageEvents||[]);
    write(`case-${caseNo}-cdp-events.json`,evidence?.cdpEvents||[]);
    write(`case-${caseNo}-logcat-all-buffers.txt`,lc);
    write(`case-${caseNo}-logcat-deep-filtered.txt`,filteredEvidence(lc));
    write(`case-${caseNo}-chrome-process-after.txt`,chromeProcessSnapshot());
    write(`case-${caseNo}-uri-grant-snapshot.txt`,uriGrantSnapshot());
    await screen(`case-${caseNo}-device.png`);
    log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] Chrome fresh-process R${r} pid=${row.chromeIdentityAfterLaunch?.pid||'-'} start=${row.chromeIdentityAfterLaunch?.startTicks||'-'} fresh=${row.freshProcessVersusPrevious!==false} stage=${row.diag?.stage||'-'} bytes=${row.diag?.bytes||0} readMs=${row.diag?.readDurationMs??'-'} cdpEvents=${row.cdpEventCount} pageEvents=${row.pageEventCount} uriWmLock=${row.systemEvidence.uriPermissionWmLockErrors} lowerFsOpens=${row.systemEvidence.mediaProviderLowerFsOpens} noPersistWrite=${row.systemEvidence.chromeNoPersistedWritePermission} error=${row.error||'-'}`);

    if(evidence)await evidence.detach().catch(()=>{});
    if(page)await page.close().catch(()=>{});
    if(context)await context.close().catch(()=>{});
    rows.push(row);
    await sleep(250);
  }
  // Leave Chrome stopped after the diagnostic so the last test process does not linger.
  adb('shell','am','force-stop','com.android.chrome');
  if(typeof device.close==='function')await device.close().catch(()=>{});
  return rows;
}

function summarize(rows){
  const valid=rows.filter(x=>!x.harnessFail);
  return{total:rows.length,valid:valid.length,harnessFail:rows.length-valid.length,pass:valid.filter(x=>x.pass).length,fail:valid.filter(x=>!x.pass).length,notReadable:valid.filter(x=>x.notReadable).length};
}
function comparePassiveSignals(rows){
  const valid=rows.filter(x=>!x.harnessFail);
  const pass=valid.filter(x=>x.pass),fail=valid.filter(x=>!x.pass);
  const avg=(xs,key)=>xs.length?Number((xs.reduce((a,x)=>a+(Number(x?.systemEvidence?.[key])||0),0)/xs.length).toFixed(2)):null;
  const avgDiag=(xs,key)=>xs.length?Number((xs.reduce((a,x)=>a+(Number(x?.diag?.[key])||0),0)/xs.length).toFixed(2)):null;
  return{
    passRounds:pass.map(x=>x.round),failRounds:fail.map(x=>x.round),
    passAvgLowerFsOpens:avg(pass,'mediaProviderLowerFsOpens'),failAvgLowerFsOpens:avg(fail,'mediaProviderLowerFsOpens'),
    passAvgUriWmLock:avg(pass,'uriPermissionWmLockErrors'),failAvgUriWmLock:avg(fail,'uriPermissionWmLockErrors'),
    passAvgReadMs:avgDiag(pass,'readDurationMs'),failAvgReadMs:avgDiag(fail,'readDurationMs'),
    cdpAttachUnavailableRounds:valid.filter(x=>x.cdpAttachError).map(x=>x.round)
  };
}
async function makeZip(){
  if(process.platform!=='win32')return;
  const zip=`${outDir}.zip`;
  const ps=`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`;
  const r=spawnSync('powershell.exe',['-NoProfile','-Command',ps],{encoding:'utf8'});
  if(r.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] RESULT ZIP FAILED',r.stderr||r.stdout||'');
}

async function main(){
  log('=== TOOL001 V47 CHROME FRESH-PROCESS A/B DIAGNOSTICS ===');
  log(`REPEATS=${repeats}`);
  log(`PICKER_STABLE_TIMEOUT_MS=${pickerStableTimeoutMs}`);
  log('NO_NATIVE_APP=TRUE');
  log('NO_CHROME_FLAGS=TRUE');
  log('INTENTIONAL_AB_CONDITION=FORCE_STOP_AND_FRESH_CHROME_PROCESS_BEFORE_EACH_ROUND');
  if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');
  if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');
  write('device-info.txt',[
    `model=${adbText('shell','getprop','ro.product.model').trim()}`,
    `android=${adbText('shell','getprop','ro.build.version.release').trim()}`,
    `sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,
    `chrome=${browserVersion('com.android.chrome')}`
  ].join('\n'));

  const chromeRows=await runChromeMinimal();
  const chrome=summarize(chromeRows);
  const passiveComparison=comparePassiveSignals(chromeRows);
  const interpretation=chrome.valid===repeats?(chrome.fail===0?'FRESH_CHROME_PROCESS_7_OF_7_PASS_STATE_LIFECYCLE_STRONGLY_SUSPECTED':'FRESH_CHROME_PROCESS_STILL_RANDOM_OR_FAILING'):'INCONCLUSIVE_HARNESS_FAILURE';
  const summary=[
    'TOOL001 V47 CHROME FRESH-PROCESS A/B DIAGNOSTICS',
    `REPEATS=${repeats}`,
    `VALID=${chrome.valid}/${chrome.total} PASS=${chrome.pass}/${chrome.valid} FAIL=${chrome.fail} NOTREADABLE=${chrome.notReadable} HARNESS_FAIL=${chrome.harnessFail}`,
    `INTERPRETATION=${interpretation}`,
    '',
    `PASS_ROUNDS=${passiveComparison.passRounds.join(',')||'-'}`,
    `FAIL_ROUNDS=${passiveComparison.failRounds.join(',')||'-'}`,
    `PASS_AVG_LOWER_FS_OPENS=${passiveComparison.passAvgLowerFsOpens ?? '-'}`,
    `FAIL_AVG_LOWER_FS_OPENS=${passiveComparison.failAvgLowerFsOpens ?? '-'}`,
    `PASS_AVG_URI_WM_LOCK=${passiveComparison.passAvgUriWmLock ?? '-'}`,
    `FAIL_AVG_URI_WM_LOCK=${passiveComparison.failAvgUriWmLock ?? '-'}`,
    `PASS_AVG_READ_MS=${passiveComparison.passAvgReadMs ?? '-'}`,
    `FAIL_AVG_READ_MS=${passiveComparison.failAvgReadMs ?? '-'}`,
    `CDP_ATTACH_UNAVAILABLE_ROUNDS=${passiveComparison.cdpAttachUnavailableRounds.join(',')||'-'}`,
    '',
    'RULE_1=One round is one picker open, PHOTO01 one selection, one file.arrayBuffer() call.',
    'RULE_2=No retry, no recovery, no alternate photo, no grid/coordinate fallback.',
    'RULE_3=No TOOL001/React/Next.js product code in the test page.',
    'RULE_4=No Samsung Internet and no Native diagnostic APK.',
    'RULE_5=No Chrome command-line/debug flag injection. Evidence collection is passive.',
    'RULE_6=HARNESS_FAIL is never counted as product/browser byte-read FAIL.',
    'RULE_7=CDP/page events, all-buffer logcat, process snapshots and URI-grant snapshots are observation only.',
    'RULE_8=Before every round Chrome is force-stopped and relaunched as the only intentional A/B condition; this is never used after a failure as recovery.'
  ].join('\n');
  write('v47-chrome-fresh-process-summary.txt',summary);
  write('result.json',{version:'V47-CHROME-FRESH-PROCESS-AB',repeats,chrome,interpretation,passiveComparison,chromeRows});
  log(summary);
  await makeZip();
}

main().catch(async e=>{
  log('[FATAL]',e?.stack||String(e));
  try{await screen('fatal-device.png');}catch{}
  await makeZip();
  process.exitCode=1;
});
