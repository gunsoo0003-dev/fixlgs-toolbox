#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { chromium } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const repeats=Math.max(1,Number(args.repeats||7));
const pickerStableTimeoutMs=Math.max(9000,Number(args['picker-timeout-ms']||12000));
const previewTimeoutMs=Math.max(5000,Number(args['preview-timeout-ms']||9000));
const cdpPort=Math.max(1024,Number(args['cdp-port']||19254));
const CHROME_PKG='com.android.chrome';
const SQUOOSH_URL='https://squoosh.app/';
const PHOTO01_FILENAME=String(args['photo01-name']||'1000008533.jpg');
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V54R1_SQUOOSH_CHROME_BASELINE_REAL_DEVICE_${stamp}`);
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
function dumpUi(){const remote='/sdcard/tool001-v54-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function fullLogcat(){return adbText('logcat','-b','all','-d','-v','threadtime');}
function filteredEvidence(text){return String(text||'').split(/\r?\n/).filter(x=>/(chromium|chrome|squoosh|photopicker|intentresolver|MediaProvider|fuse|ContentResolver|ContentProviderHelper|UriGrantsManagerService|UriPermission|permission denied|EACCES|ENOENT|NotReadableError|ERR_UPLOAD_FILE_CHANGED|file could not be read|FileChooser|SelectFileDialog|decode|content:\/\/|Storage)/i.test(x)).slice(-3600).join('\n');}
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function evidenceFromLogcat(text){const lines=String(text||'').split(/\r?\n/);return{uriPermissionWmLockErrors:lines.filter(x=>/Unable to check Uri permission because caller is holding WM lock/i.test(x)).length,mediaProviderLowerFsOpens:lines.filter(x=>/MediaProvider: Open with lower FS/i.test(x)).length,chromeNoPersistedWritePermission:lines.filter(x=>/cr_SelectFileDialog: No persisted write permission/i.test(x)).length,uploadFileChanged:lines.filter(x=>/ERR_UPLOAD_FILE_CHANGED/i.test(x)).length,notReadableMentions:lines.filter(x=>/NotReadableError|requested file could not be read|file could not be read/i.test(x)).length,pickerStarts:lines.filter(x=>/ActivityTaskManager: START .*com\.google\.android\.photopicker/i.test(x)).slice(-8),resolverStarts:lines.filter(x=>/ActivityTaskManager: START .*intentresolver|com\.android\.intentresolver/i.test(x)).slice(-8)};}
function adbShellQuote(v){return `'${String(v).replaceAll("'","'\"'\"'")}'`;}
function launchChromeUrl(url){const cmd=`am start -W -a android.intent.action.VIEW -d ${adbShellQuote(url)} -p ${adbShellQuote(CHROME_PKG)}`;return adb('shell',cmd);}
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
function uiPackageSet(xml){return new Set(parseUiNodes(xml).map(n=>n.package).filter(Boolean));}
function intentResolverPhotoTarget(xml){
  const labels=new Set(['사진 및 동영상','Photos and videos','Photos & videos','写真と動画']);
  const tree=parseUiTree(xml),found=[];
  const walk=n=>{const a=n.attrs||{},b=parseBounds(a.bounds),label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.android.intentresolver'&&a.clickable==='true'&&b){for(const x of labels){if(label===x||label.endsWith(` ${x}`)||label.includes(x)){found.push({label:x,bounds:b,raw:label});break;}}}for(const c of n.children||[])walk(c);};walk(tree);
  found.sort((a,b)=>a.bounds.left-b.bounds.left);return found[0]||null;
}
async function passSystemChooserOnceIfPresent(caseNo,timeoutMs=3500){
  const deadline=Date.now()+timeoutMs;let tapped=false;
  while(Date.now()<deadline){
    const snap=pickerSignalSnapshot();
    if(snap.detected)return{pickerReady:true,chooserTapped:tapped};
    const pkgs=uiPackageSet(snap.xml||'');
    if(!tapped&&pkgs.has('com.android.intentresolver')){
      const target=intentResolverPhotoTarget(snap.xml||'');
      write(`case-${caseNo}-intentresolver.xml`,snap.xml||'');
      if(!target)throw new Error('HARNESS_INTENT_RESOLVER_PHOTOS_AND_VIDEOS_NOT_FOUND');
      adb('shell','input','tap',String(target.bounds.x),String(target.bounds.y));tapped=true;
      log(`[CHOOSER TAP] CASE ${caseNo}: ${target.label}`);await screen(`case-${caseNo}-after-chooser-tap.png`);await sleep(300);continue;
    }
    await sleep(180);
  }
  return{pickerReady:false,chooserTapped:tapped};
}
function documentsUiExactPhoto01(xml){
  const tree=parseUiTree(xml),found=[];
  const walk=n=>{const a=n.attrs||{},b=parseBounds(a.bounds),label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.google.android.documentsui'&&a.clickable==='true'&&b&&label.includes(PHOTO01_FILENAME))found.push({bounds:b,label});for(const c of n.children||[])walk(c);};walk(tree);
  found.sort((a,b)=>(a.bounds.w*a.bounds.h)-(b.bounds.w*b.bounds.h));return found[0]||null;
}
function documentsUiOpenControl(xml){
  const tree=parseUiTree(xml),out=[];const exact=/^(열기|Open|선택|Choose|확인|OK|開く|選択)$/i;
  const walk=n=>{const a=n.attrs||{},b=parseBounds(a.bounds),label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.google.android.documentsui'&&a.clickable==='true'&&b&&exact.test(label))out.push({bounds:b,label});for(const c of n.children||[])walk(c);};walk(tree);return out[0]||null;
}
async function selectDocumentsUiPhoto01(caseNo,stableXml){
  const c=documentsUiExactPhoto01(stableXml);write(`case-${caseNo}-documentsui-photo01.json`,c||{filename:PHOTO01_FILENAME,found:false});if(!c)throw new Error('HARNESS_DOCUMENTSUI_PHOTO01_EXACT_NOT_VISIBLE');
  adb('shell','input','tap',String(c.bounds.x),String(c.bounds.y));log(`[PHOTO TAP] CASE ${caseNo}: PHOTO_01 exact filename ${PHOTO01_FILENAME}`);await sleep(250);await screen(`case-${caseNo}-after-photo-tap.png`);
  const deadline=Date.now()+8500;let commitTapped=false;
  while(Date.now()<deadline){const snap=pickerSignalSnapshot();if(!snap.detected){await sleep(350);return{selected:true,autoClosed:true,documentsUi:true};}if(!commitTapped){const a=documentsUiOpenControl(snap.xml||'');if(a){adb('shell','input','tap',String(a.bounds.x),String(a.bounds.y));commitTapped=true;log(`[COMMIT TAP] CASE ${caseNo}: ${a.label}`);await sleep(250);}}await sleep(180);}
  throw new Error('HARNESS_DOCUMENTSUI_RETURN_TIMEOUT');
}
async function selectPhoto01ForActualPicker(caseNo){
  const stable=await waitStablePickerOpen(caseNo,'v39-source-exact',pickerStableTimeoutMs);if(!stable)throw new Error('HARNESS_FAIL:PICKER_NOT_STABLE');
  const pkgs=uiPackageSet(stable);if(pkgs.has('com.google.android.photopicker'))return autoSelectPickerMediaV38(caseNo,'PHOTO_01',1,null);if(pkgs.has('com.google.android.documentsui'))return selectDocumentsUiPhoto01(caseNo,stable);throw new Error(`HARNESS_UNSUPPORTED_PICKER_PACKAGE:${[...pkgs].join(',')}`);
}
function browserProcessIdentity(){const pid=adbText('shell','pidof',CHROME_PKG).trim().split(/\s+/).filter(Boolean)[0]||'';return{pid};}
async function forceStopChromeAndVerify(caseNo){const before=browserProcessIdentity();const stop=adb('shell','am','force-stop',CHROME_PKG);const deadline=Date.now()+5000;while(Date.now()<deadline){if(!browserProcessIdentity().pid){const result={before,after:browserProcessIdentity(),status:stop.status};write(`case-${caseNo}-chrome-force-stop.json`,result);return result;}await sleep(120);}throw new Error('HARNESS_CHROME_FORCE_STOP_TIMEOUT');}
async function waitExpectedChromeForeground(timeoutMs=6000){const deadline=Date.now()+timeoutMs;let last=null;while(Date.now()<deadline){last=foregroundSnapshot();if(resumedPackageFromForeground(last)===CHROME_PKG)return{ok:true,foreground:last};await sleep(150);}return{ok:false,foreground:last};}
async function connectPassiveChromePage(timeoutMs=7000){
  adb('forward','--remove',`tcp:${cdpPort}`);const fwd=adb('forward',`tcp:${cdpPort}`,'localabstract:chrome_devtools_remote');if(fwd.status!==0)throw new Error(`HARNESS_CDP_FORWARD_FAILED:${fwd.stderr||fwd.stdout||fwd.status}`);
  const deadline=Date.now()+timeoutMs;let lastErr='';
  while(Date.now()<deadline){try{const browser=await chromium.connectOverCDP(`http://127.0.0.1:${cdpPort}`);const pages=browser.contexts().flatMap(c=>c.pages());let page=pages.find(p=>/^https:\/\/squoosh\.app(?:\/|$)/i.test(p.url()));if(!page){await sleep(180);page=browser.contexts().flatMap(c=>c.pages()).find(p=>/^https:\/\/squoosh\.app(?:\/|$)/i.test(p.url()));}if(!page)throw new Error('SQUOOSH_PAGE_NOT_FOUND_IN_CDP');return{browser,page};}catch(e){lastErr=String(e?.message||e);await sleep(250);}}
  throw new Error(`HARNESS_CDP_ATTACH_FAILED:${lastErr}`);
}
async function waitSquooshIntroReady(page,timeoutMs=10000){
  const deadline=Date.now()+timeoutMs;let last=null;
  while(Date.now()<deadline){try{last=await page.evaluate(()=>({href:location.href,pathname:location.pathname,title:document.title,inputCount:document.querySelectorAll('input[type=file]').length,openButtonCount:document.querySelectorAll('input[type=file] ~ div button').length,bodyText:(document.body?.innerText||'').slice(0,1200)}));if(last.pathname==='/'&&last.inputCount===1&&last.openButtonCount>=1)return last;}catch{}await sleep(200);}
  throw new Error(`HARNESS_SQUOOSH_INTRO_NOT_READY:${JSON.stringify(last)}`);
}
async function clickSquooshOpenOnce(page){const btn=page.locator('input[type=file] ~ div button').first();if(await btn.count()!==1)throw new Error('HARNESS_SQUOOSH_VISIBLE_OPEN_BUTTON_NOT_FOUND');await btn.click({timeout:5000});return{clicked:true,selector:'input[type=file] ~ div button:first'};}
function attachPageEvidence(page){const events=[];const push=(type,data={})=>events.push({at:Date.now(),type,...data});page.on('console',m=>push('console',{consoleType:m.type(),text:m.text()}));page.on('pageerror',e=>push('pageerror',{name:e?.name||'',message:e?.message||String(e)}));page.on('requestfailed',r=>push('requestfailed',{url:r.url(),failure:r.failure()}));page.on('crash',()=>push('crash'));return events;}
async function previewSnapshot(page){
  return page.evaluate(()=>{
    const sample=c=>{try{const w=c.width||0,h=c.height||0;if(!w||!h)return{ok:false,alpha:0};const x=Math.max(0,Math.min(w-1,Math.floor(w/2))),y=Math.max(0,Math.min(h-1,Math.floor(h/2)));const d=c.getContext('2d')?.getImageData(x,y,1,1)?.data;return{ok:!!d,alpha:d?d[3]:0,rgba:d?Array.from(d):[]};}catch(e){return{ok:false,alpha:0,error:String(e)};}};
    const canvases=[...document.querySelectorAll('two-up canvas')].map((c,i)=>{const r=c.getBoundingClientRect(),s=sample(c);return{i,width:c.width,height:c.height,rectWidth:r.width,rectHeight:r.height,visible:r.width>0&&r.height>0,...s};});
    const bodyText=(document.body?.innerText||'').slice(0,5000),errorMatch=bodyText.match(/Source decoding error[^\n]*|Failed to load app[^\n]*|Processing error[^\n]*/i);
    return{href:location.href,pathname:location.pathname,title:document.title,canvasCount:canvases.length,canvases,errorText:errorMatch?.[0]||'',bodyTextSample:bodyText.slice(0,1800)};
  });
}
async function waitSquooshPreview(page,timeoutMs){const deadline=Date.now()+timeoutMs;let last=null,nextHeartbeat=Date.now()+3000;while(Date.now()<deadline){last=await previewSnapshot(page);const good=last.pathname==='/editor'&&last.canvases.length>=2&&last.canvases.every(c=>c.width>0&&c.height>0&&c.visible)&&last.canvases.some(c=>c.alpha>0);if(good&&!last.errorText)return{pass:true,diag:last};if(last.errorText)return{pass:false,diag:last,error:last.errorText};if(Date.now()>=nextHeartbeat){log(`[WAIT] Squoosh preview pathname=${last.pathname} canvases=${last.canvases.map(c=>`${c.width}x${c.height}/a${c.alpha}`).join(',')||'-'}`);nextHeartbeat=Date.now()+3000;}await sleep(180);}return{pass:false,diag:last,error:'SQUOOSH_PREVIEW_TIMEOUT_AFTER_VALID_SELECTION'};}
async function makeZip(){if(process.platform!=='win32')return;const zip=`${outDir}.zip`;const ps=`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`;const r=spawnSync('powershell.exe',['-NoProfile','-Command',ps],{encoding:'utf8'});if(r.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] RESULT ZIP FAILED',r.stderr||r.stdout||'');}
async function runRound(r){
  const caseNo=`SQUOOSH-CHROME-${r}`,row={phase:'SQUOOSH_CHROME_BASELINE',round:r,pass:false,harnessFail:false,error:'',selectionCommitted:false,chooserTapped:false,preview:null,pageEvents:[]};
  log(`===== SQUOOSH Chrome ${r}/${repeats} =====`);adb('logcat','-b','all','-c');let page=null;
  try{
    await forceStopChromeAndVerify(caseNo);const launch=launchChromeUrl(SQUOOSH_URL);write(`case-${caseNo}-launch.txt`,`${launch.stdout||''}${launch.stderr||''}`);if(launch.status!==0)throw new Error(`HARNESS_CHROME_LAUNCH_FAILED:${launch.status}`);
    const fg=await waitExpectedChromeForeground();write(`case-${caseNo}-foreground.json`,fg);if(!fg.ok)throw new Error(`HARNESS_WRONG_FOREGROUND_PACKAGE:${resumedPackageFromForeground(fg.foreground)||'NONE'}`);
    const attached=await connectPassiveChromePage();page=attached.page;row.pageEvents=attachPageEvidence(page);row.intro=await waitSquooshIntroReady(page);write(`case-${caseNo}-intro.json`,row.intro);await screen(`case-${caseNo}-before-file-tap.png`);
    row.click=await clickSquooshOpenOnce(page);log(`[FILE OPEN CLICK] CASE ${caseNo}: Squoosh visible open button exactly once`);
    const chooser=await passSystemChooserOnceIfPresent(caseNo);row.chooserTapped=chooser.chooserTapped;row.selection=await selectPhoto01ForActualPicker(caseNo);row.selectionCommitted=true;
    const preview=await waitSquooshPreview(page,previewTimeoutMs);row.preview=preview.diag;row.pass=preview.pass;if(!preview.pass)row.error=preview.error||'SQUOOSH_PREVIEW_FAIL';
  }catch(e){row.error=String(e?.message||e);if(!row.selectionCommitted)row.harnessFail=true;}
  try{row.finalUi=dumpUi();write(`case-${caseNo}-final-ui.xml`,row.finalUi);}catch{}
  const lc=fullLogcat();row.systemEvidence=evidenceFromLogcat(lc);write(`case-${caseNo}-logcat-all-buffers.txt`,lc);write(`case-${caseNo}-logcat-filtered.txt`,filteredEvidence(lc));write(`case-${caseNo}-page-events.json`,row.pageEvents||[]);await screen(`case-${caseNo}-device.png`);write(`case-${caseNo}.json`,row);
  log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] Squoosh Chrome R${r} editor=${row.preview?.pathname||'-'} canvases=${row.preview?.canvases?.map(c=>`${c.width}x${c.height}/a${c.alpha}`).join(',')||'-'} lowerFsOpens=${row.systemEvidence.mediaProviderLowerFsOpens} notReadable=${row.systemEvidence.notReadableMentions} uploadChanged=${row.systemEvidence.uploadFileChanged} error=${row.error||'-'}`);return row;
}
function stats(rows){const valid=rows.filter(x=>!x.harnessFail),pass=valid.filter(x=>x.pass),fail=valid.filter(x=>!x.pass);return{total:rows.length,valid:valid.length,harnessFail:rows.length-valid.length,pass:pass.length,fail:fail.length,passRounds:pass.map(x=>x.round),failRounds:fail.map(x=>x.round)};}
async function main(){
  log('=== TOOL001 V54R1 SQUOOSH CHROME BASELINE ===');log(`REPEATS=${repeats}`);log(`SQUOOSH_URL=${SQUOOSH_URL}`);log('PRODUCT_CODE=NONE');log('HARNESS_FILE_BYTE_READ=NONE');log('ONE_VISIBLE_OPEN_CLICK_ONE_PHOTO01_SELECTION_NO_RETRY');
  if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');
  write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${browserVersion(CHROME_PKG)}`,`squoosh=${SQUOOSH_URL}`,`photo01=${PHOTO01_FILENAME}`].join('\n'));
  const rows=[];for(let r=1;r<=repeats;r++){rows.push(await runRound(r));await sleep(250);}adb('forward','--remove',`tcp:${cdpPort}`);
  const s=stats(rows);let interpretation='';if(s.harnessFail)interpretation='INCONCLUSIVE_HARNESS_FAILURE';else if(s.pass===repeats)interpretation='SQUOOSH_CHROME_7_OF_7_BASELINE_PASS';else interpretation='SQUOOSH_CHROME_RANDOM_OR_REPEATABLE_FAILURE_REPRODUCED';
  const result={version:'V54R1-SQUOOSH-CHROME-BASELINE',repeats,squooshUrl:SQUOOSH_URL,photo01:PHOTO01_FILENAME,stats:s,interpretation,rows};write('result.json',result);
  const summary=['TOOL001 V54R1 SQUOOSH CHROME BASELINE',`REPEATS=${repeats}`,`VALID=${s.valid}/${s.total} PASS=${s.pass}/${s.valid} FAIL=${s.fail} HARNESS_FAIL=${s.harnessFail}`,`PASS_ROUNDS=${s.passRounds.join(',')||'-'}`,`FAIL_ROUNDS=${s.failRounds.join(',')||'-'}`,`INTERPRETATION=${interpretation}`,'','RULE_1=External Squoosh production site only; TOOL001/React/Next.js product code is not used.','RULE_2=Each round: fresh Chrome -> Squoosh visible Open button one click -> PHOTO01 one selection -> observe actual editor preview.','RULE_3=If Android Intent Resolver appears, only the exact Photos and videos choice is tapped once; this is an intermediate user choice, not failure recovery.','RULE_4=V39 Photo Picker source is preserved exactly. DocumentsUI is accepted only when PHOTO01 exact filename is already visible; no scrolling/search/retry.','RULE_5=Harness never reads provider File bytes and never calls setInputFiles/showPicker/FileReader/arrayBuffer/stream.','RULE_6=Preview SUCCESS requires /editor + two visible two-up canvases with non-zero intrinsic dimensions + rendered alpha sample. Final screenshot is always saved.','RULE_7=No retry, no recovery, no alternate photo, no second selection in a round.','RULE_8=HARNESS_FAIL is separated from Squoosh/Chrome FAIL.'].join('\n');write('v54-squoosh-chrome-summary.txt',summary);log(summary);await makeZip();
}
main().catch(async e=>{log('[FATAL]',e?.stack||String(e));try{adb('forward','--remove',`tcp:${cdpPort}`);}catch{}try{await screen('fatal-device.png');}catch{}await makeZip();process.exitCode=1;});
