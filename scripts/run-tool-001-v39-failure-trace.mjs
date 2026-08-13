#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { _android as android } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const url=String(args.url||'');
if(!url){console.error('ERROR: --url is required');process.exit(2);}
const selector='button[data-testid="converter-upload-button"], [data-testid="converter-file-input"], input[type=file]';
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V39_FAILURE_TRACE_REAL_DEVICE_${stamp}`);fs.mkdirSync(outDir,{recursive:true});
const lines=[];
function log(...p){const s=p.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');console.log(s);lines.push(s);fs.writeFileSync(path.join(outDir,'runner.log'),lines.join('\n'));}
function write(n,d){fs.writeFileSync(path.join(outDir,n),typeof d==='string'?d:JSON.stringify(d,null,2));}
function adb(...a){return spawnSync('adb',a,{encoding:'utf8',shell:false});}
function adbText(...a){const r=adb(...a);return `${r.stdout||''}${r.stderr||''}`;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let stepNo=0;const TOTAL=11+Math.max(1,Number(args.repeats||10));function step(s){stepNo++;log(`[PROGRESS ${String(stepNo).padStart(2,'0')}/${TOTAL}] ${s}`)}
function heartbeat(label){const st=Date.now();return setInterval(()=>log(`[RUNNING] ${label} ... ${Math.floor((Date.now()-st)/1000)}s elapsed`),5000)}
async function timed(label,fn,timeout=120000){log(`[RUNNING] ${label} ... 0s`);const hb=heartbeat(label);let to;try{return await Promise.race([Promise.resolve().then(fn),new Promise((_,rej)=>to=setTimeout(()=>rej(new Error(`${label} TIMEOUT after ${timeout}ms`)),timeout))]);}finally{clearInterval(hb);if(to)clearTimeout(to)}}
async function pcScreen(name){const r=spawnSync('adb',['exec-out','screencap','-p'],{encoding:null,maxBuffer:64*1024*1024});if(r.status===0&&r.stdout?.length)fs.writeFileSync(path.join(outDir,name),r.stdout);}

let previousHeadsUp = null;
function readGlobalSetting(key){const v=adbText('shell','settings','get','global',key).trim();return v==='null'||v==='undefined'?'':v;}
function suppressNotificationOverlays(){
  if(previousHeadsUp===null) previousHeadsUp=readGlobalSetting('heads_up_notifications_enabled');
  adb('shell','settings','put','global','heads_up_notifications_enabled','0');
  adb('shell','cmd','statusbar','collapse');
  adb('shell','input','keyevent','KEYCODE_ESCAPE');
}
function restoreNotificationOverlays(){
  if(previousHeadsUp===null)return;
  if(previousHeadsUp==='') adb('shell','settings','delete','global','heads_up_notifications_enabled');
  else adb('shell','settings','put','global','heads_up_notifications_enabled',previousHeadsUp);
}

function xmlDecode(v=''){return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function parseBounds(bounds=''){const m=String(bounds).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);if(!m)return null;const left=Number(m[1]),top=Number(m[2]),right=Number(m[3]),bottom=Number(m[4]);return{left,top,right,bottom,w:right-left,h:bottom-top,x:Math.floor((left+right)/2),y:Math.floor((top+bottom)/2)};}
function dumpUi(){const remote='/sdcard/tool001-v36-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function nodeHay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function parseUiTree(xml){const tokens=String(xml||'').match(/<node\s+[^>]*>|<\/node>/g)||[];const root={attrs:{},children:[]};const stack=[root];for(const tok of tokens){if(tok.startsWith('</node')){if(stack.length>1)stack.pop();continue;}const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(tok)))attrs[a[1]]=xmlDecode(a[2]);const node={attrs,children:[]};stack[stack.length-1].children.push(node);if(!tok.endsWith('/>'))stack.push(node);}return root;}
function descendantText(node){const parts=[];const walk=n=>{if(n?.attrs){if(n.attrs.text)parts.push(n.attrs.text);if(n.attrs['content-desc'])parts.push(n.attrs['content-desc']);if(n.attrs['resource-id'])parts.push(n.attrs['resource-id']);}for(const c of n?.children||[])walk(c);};walk(node);return parts.join(' ');}
function pickerSelectionSignals(xml){
  const nodes=parseUiNodes(xml);
  const actionControls=photoPickerActionControls(xml);
  const explicit=nodes.filter(n=>{
    const role=(n['content-desc']||n.text||'').trim();
    if(/^(사진|photos?|컬렉션|collections?)$/i.test(role))return false;
    if(n.checked==='true')return true;
    return /(1개 선택|1 selected|선택됨|selected item|체크됨|checked|전체 선택 해제|deselect all)/i.test(nodeHay(n));
  });
  const text=nodes.map(nodeHay).join('\n');
  const selectedByText=/(1개 선택|1 selected|선택됨|selected item|전체 선택 해제|deselect all)/i.test(text);
  return{selectedNodes:explicit,actionControls,selectedByText,detected:explicit.length>0||actionControls.length>0||selectedByText};
}
function photoPickerActionControls(xml){const tree=parseUiTree(xml);const out=[];const positiveExact=/^(완료|추가|열기|확인|done|add|open|choose|use|選択|完了|追加|開く)$/i;const negative=/(전체 선택 해제|선택 해제|deselect|unselect|미리보기|preview|취소|cancel|닫기|close|선택됨|selected|사진 또는 동영상 .*개 선택)/i;const walk=n=>{const a=n.attrs||{};const b=parseBounds(a.bounds);const label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.google.android.photopicker'&&a.clickable==='true'&&b&&b.w>=90&&b.h>=60&&b.top>=1200&&!negative.test(label)){const tokens=label.split(/\s+/).filter(Boolean);const exact=tokens.find(t=>positiveExact.test(t));if(exact)out.push({node:n,attrs:a,bounds:b,label,exact});}for(const c of n.children||[])walk(c);};walk(tree);out.sort((a,b)=>(b.bounds.top-a.bounds.top)||(b.bounds.left-a.bounds.left));return out;}
function pickerDetectedFromXml(xml){const nodes=parseUiNodes(xml);const packages=[...new Set(nodes.map(n=>n.package).filter(Boolean))];const text=nodes.map(nodeHay).join('\n');return packages.some(p=>/(photopicker|documentsui|myfiles|providers\.media|filepicker|picker)/i.test(p))||(/(최근|recent|사진|photo|images|이미지|완료|done|추가|add)/i.test(text)&&!packages.every(p=>/chrome/i.test(p)));}
async function pickerStillOpen(){try{return pickerDetectedFromXml(dumpUi());}catch{return false;}}
async function pickerClosedStable(page,timeoutMs=6500){const started=Date.now();let consecutive=0;while(Date.now()-started<timeoutMs){await sleep(250);const open=await pickerStillOpen();let ping=true;try{await page.evaluate(()=>location.href);}catch{ping=false;}if(!open&&ping)consecutive++;else consecutive=0;if(consecutive>=3)return true;}return false;}
async function waitForPicker(timeoutMs=15000){const started=Date.now();let last='';while(Date.now()-started<timeoutMs){last=dumpUi();if(pickerDetectedFromXml(last))return last;await sleep(350);}write(`picker-not-detected-${Date.now()}.xml`,last);throw new Error('PHOTO_PICKER_NOT_DETECTED');}
async function autoCommitManualSelection(caseNo,page,startChange){const deadline=Date.now()+8000;let sawSelection=false;let commitTaps=0;let lastXml='';while(Date.now()<deadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V37__)));if(st.changes.length>startChange)return{committed:true,mode:'picker-auto-close-change',sawSelection,commitTaps};let open=false;try{lastXml=dumpUi();open=pickerDetectedFromXml(lastXml);}catch{}if(!open){await sleep(250);const st2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V37__)));if(st2.changes.length>startChange)return{committed:true,mode:'picker-closed-change',sawSelection,commitTaps};await sleep(500);continue;}const sig=pickerSelectionSignals(lastXml);if(sig.detected){sawSelection=true;write(`case-${caseNo}-selection-observed.xml`,lastXml);const actions=photoPickerActionControls(lastXml);write(`case-${caseNo}-commit-controls.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));if(actions.length){for(const action of actions){const b=action.bounds;adb('shell','input','tap',String(b.x),String(b.y));commitTaps++;log(`[PHOTO_PICKER] case ${caseNo}: auto commit "${action.exact}" at ${b.x},${b.y}`);await pcScreen(`case-${caseNo}-after-auto-commit-${commitTaps}.png`);if(await pickerClosedStable(page,7000)){const st3=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V37__)));if(st3.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit',sawSelection:true,commitTaps,action:action.exact};await sleep(1500);const st4=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V37__)));if(st4.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit-delayed-change',sawSelection:true,commitTaps,action:action.exact};return{committed:false,mode:'picker-closed-no-change',sawSelection:true,commitTaps,action:action.exact};}}}}
await sleep(300);}write(`case-${caseNo}-commit-timeout.xml`,lastXml);await pcScreen(`case-${caseNo}-commit-timeout-device.png`);return{committed:false,mode:sawSelection?'selection-seen-but-commit-timeout':'no-selection-observed',sawSelection,commitTaps};}

function browserInit(){
  const KEY='__TOOL001_REAL_PHOTO_V39__'; if(window[KEY])return;
  const s=window[KEY]={capture:[],consoleErrors:[],events:[],lifecycle:[],nativeReads:[],picker:[],handles:[],images:[],objectUrls:[],inputs:[]};
  const safe=v=>{try{return JSON.parse(JSON.stringify(v));}catch{return String(v)}};
  const rec=(bucket,detail)=>{try{s[bucket].push({at:Date.now(),...safe(detail)});}catch{}}
  window.addEventListener('tool001:capture-diagnostic',e=>rec('capture',e.detail||{}),true);
  const pushLife=(kind,extra={})=>rec('lifecycle',{kind,visibility:document.visibilityState,focus:document.hasFocus(),href:location.href,...extra});
  document.addEventListener('visibilitychange',()=>pushLife('visibilitychange'));
  window.addEventListener('focus',()=>pushLife('focus'));window.addEventListener('blur',()=>pushLife('blur'));
  window.addEventListener('pageshow',e=>pushLife('pageshow',{persisted:e.persisted}));
  window.addEventListener('pagehide',e=>pushLife('pagehide',{persisted:e.persisted}));
  window.addEventListener('error',e=>rec('consoleErrors',{kind:'window-error',message:e.message||String(e.error||'')}),true);
  window.addEventListener('unhandledrejection',e=>rec('consoleErrors',{kind:'unhandledrejection',message:String(e.reason?.message||e.reason||'')}),true);

  // Independent picker observer. Works even when product diagnostic events are absent.
  try{
    const orig=window.showOpenFilePicker;
    if(typeof orig==='function'&&!orig.__tool001v39Wrapped){
      const wrapped=async function(...args){
        rec('picker',{phase:'showOpenFilePicker-call',args:args.map(x=>safe(x))});
        try{const handles=await orig.apply(this,args);rec('picker',{phase:'showOpenFilePicker-pass',count:Array.isArray(handles)?handles.length:0,names:(handles||[]).map(h=>String(h?.name||''))});return handles;}
        catch(e){rec('picker',{phase:'showOpenFilePicker-error',errorName:e?.name||'Error',errorMessage:e?.message||String(e)});throw e;}
      };
      Object.defineProperty(wrapped,'__tool001v39Wrapped',{value:true});window.showOpenFilePicker=wrapped;
    }
  }catch(e){rec('consoleErrors',{kind:'picker-wrap-error',message:String(e?.message||e)});}

  try{
    const hp=window.FileSystemFileHandle?.prototype,orig=hp?.getFile;
    if(typeof orig==='function'&&!orig.__tool001v39Wrapped){
      const wrapped=async function(...args){
        const id=`gf-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;rec('handles',{id,phase:'getFile-call',handleName:String(this?.name||'')});
        try{const f=await orig.apply(this,args);rec('handles',{id,phase:'getFile-pass',handleName:String(this?.name||''),fileName:String(f?.name||''),size:Number(f?.size||0),type:String(f?.type||''),lastModified:Number(f?.lastModified||0)});return f;}
        catch(e){rec('handles',{id,phase:'getFile-error',handleName:String(this?.name||''),errorName:e?.name||'Error',errorMessage:e?.message||String(e)});throw e;}
      };
      Object.defineProperty(wrapped,'__tool001v39Wrapped',{value:true});hp.getFile=wrapped;
    }
  }catch(e){rec('consoleErrors',{kind:'getfile-wrap-error',message:String(e?.message||e)});}

  // Passive read observers: never initiate a read themselves.
  try{
    const proto=Blob.prototype,orig=proto.arrayBuffer;
    if(typeof orig==='function'&&!orig.__tool001v39Wrapped){const wrapped=async function(){const id=`ab-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;rec('nativeReads',{id,api:'arrayBuffer',phase:'call',size:Number(this?.size||0),type:String(this?.type||'')});try{const r=await orig.call(this);rec('nativeReads',{id,api:'arrayBuffer',phase:'pass',bytes:Number(r?.byteLength||0)});return r;}catch(e){rec('nativeReads',{id,api:'arrayBuffer',phase:'error',errorName:e?.name||'Error',errorMessage:e?.message||String(e)});throw e;}};Object.defineProperty(wrapped,'__tool001v39Wrapped',{value:true});proto.arrayBuffer=wrapped;}
  }catch(e){rec('consoleErrors',{kind:'arraybuffer-wrap-error',message:String(e?.message||e)});}
  try{
    const proto=Blob.prototype,orig=proto.stream;
    if(typeof orig==='function'&&!orig.__tool001v39Wrapped){const wrapped=function(){const id=`st-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;rec('nativeReads',{id,api:'stream',phase:'call',size:Number(this?.size||0),type:String(this?.type||'')});try{const r=orig.call(this);rec('nativeReads',{id,api:'stream',phase:'return'});return r;}catch(e){rec('nativeReads',{id,api:'stream',phase:'error',errorName:e?.name||'Error',errorMessage:e?.message||String(e)});throw e;}};Object.defineProperty(wrapped,'__tool001v39Wrapped',{value:true});proto.stream=wrapped;}
  }catch(e){rec('consoleErrors',{kind:'stream-wrap-error',message:String(e?.message||e)});}
  try{
    const FR=window.FileReader,orig=FR?.prototype?.readAsArrayBuffer;
    if(typeof orig==='function'&&!orig.__tool001v39Wrapped){const wrapped=function(blob){const id=`fr-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;rec('nativeReads',{id,api:'FileReader',phase:'call',size:Number(blob?.size||0),type:String(blob?.type||'')});this.addEventListener('load',()=>rec('nativeReads',{id,api:'FileReader',phase:'pass',bytes:Number(this.result?.byteLength||0)}),{once:true});this.addEventListener('error',()=>rec('nativeReads',{id,api:'FileReader',phase:'error',errorName:this.error?.name||'Error',errorMessage:this.error?.message||''}),{once:true});this.addEventListener('abort',()=>rec('nativeReads',{id,api:'FileReader',phase:'abort'}),{once:true});return orig.call(this,blob);};Object.defineProperty(wrapped,'__tool001v39Wrapped',{value:true});FR.prototype.readAsArrayBuffer=wrapped;}
  }catch(e){rec('consoleErrors',{kind:'filereader-wrap-error',message:String(e?.message||e)});}

  try{
    const oc=URL.createObjectURL.bind(URL),or=URL.revokeObjectURL.bind(URL);
    URL.createObjectURL=function(obj){try{const u=oc(obj);rec('objectUrls',{phase:'create',urlHead:String(u).slice(0,100),size:Number(obj?.size||0),type:String(obj?.type||'')});return u;}catch(e){rec('objectUrls',{phase:'create-error',errorName:e?.name||'Error',errorMessage:e?.message||String(e)});throw e;}};
    URL.revokeObjectURL=function(u){rec('objectUrls',{phase:'revoke',urlHead:String(u).slice(0,100)});return or(u);};
  }catch(e){rec('consoleErrors',{kind:'objecturl-wrap-error',message:String(e?.message||e)});}

  document.addEventListener('load',e=>{const t=e.target;if(t instanceof HTMLImageElement)rec('images',{phase:'img-load',srcHead:String(t.currentSrc||t.src||'').slice(0,120),naturalWidth:t.naturalWidth,naturalHeight:t.naturalHeight,clientWidth:t.clientWidth,clientHeight:t.clientHeight});},true);
  document.addEventListener('error',e=>{const t=e.target;if(t instanceof HTMLImageElement)rec('images',{phase:'img-error',srcHead:String(t.currentSrc||t.src||'').slice(0,120),naturalWidth:t.naturalWidth,naturalHeight:t.naturalHeight});},true);
  document.addEventListener('change',e=>{const t=e.target;if(t instanceof HTMLInputElement&&t.type==='file')rec('inputs',{phase:'input-change',count:t.files?.length||0,connected:t.isConnected,accept:t.accept||'',multiple:t.multiple});},true);
  pushLife('observer-init');
}
async function domSnapshot(page){return page.evaluate(()=>{const cards=Array.from(document.querySelectorAll('[data-testid="converter-file-card"]'));return{cardCount:cards.length,cards:cards.map((c,i)=>({i,status:c.getAttribute('data-status'),text:(c.textContent||'').trim().slice(0,1000),imgs:Array.from(c.querySelectorAll('img')).map(img=>({complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,clientWidth:img.clientWidth,clientHeight:img.clientHeight,srcHead:String(img.src||'').slice(0,80)}))})),alerts:Array.from(document.querySelectorAll('[role=alert],[aria-live]')).map(x=>(x.textContent||'').trim()).filter(Boolean).slice(0,30),bodyText:(document.body?.innerText||'').slice(0,18000)};});}
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
function strictChromeOverflowMenuOpen(xml){
  // IMPORTANT: Chrome toolbar's "+" button has content-desc="새 탭".
  // "새 탭" alone MUST NEVER be treated as an opened overflow menu.
  const nodes=parseUiNodes(xml).filter(n=>n.package==='com.android.chrome');
  const hay=nodes.map(nodeHay).join('\n');
  const strongLabels=[
    /새 시크릿 탭/i,/방문 기록/i,/다운로드/i,/북마크/i,/최근 탭/i,/설정/i,
    /New Incognito tab/i,/History/i,/Downloads/i,/Bookmarks/i,/Recent tabs/i,/Settings/i,
    /シークレット タブ/i,/履歴/i,/ダウンロード/i,/ブックマーク/i,/設定/i
  ];
  const matched=strongLabels.filter(re=>re.test(hay)).map(re=>String(re));
  const popupLike=nodes.some(n=>/menu|popup/i.test(`${n['resource-id']||''} ${n.class||''}`) && n.clickable==='true');
  return {open:matched.length>=2 && popupLike,matched,popupLike};
}
function expectedToolHref(href){
  try{
    const actual=new URL(String(href||'')), expected=new URL(url);
    return actual.origin===expected.origin && actual.pathname===expected.pathname;
  }catch{return false;}
}
async function ensureExpectedToolPage(page,caseNo,tag='target'){
  let href='';try{href=await page.evaluate(()=>location.href);}catch{}
  if(!expectedToolHref(href)){
    write(`case-${caseNo}-${tag}-target-recovery.json`,{before:href,expected:url,foreground:foregroundSnapshot()});
    log(`[TARGET_GUARD] CASE ${caseNo}: ${href||'unavailable'} -> restoring TOOL001`);
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator(selector).first().waitFor({state:'attached',timeout:15000});
    href=await page.evaluate(()=>location.href).catch(()=> '');
  }
  if(!expectedToolHref(href))throw new Error(`TARGET_PAGE_NOT_ACTIVE:${href}`);
  return href;
}

async function ensureChromeInteractive(page,caseNo,tag='guard'){
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  adb('shell','wm','dismiss-keyguard');

  // V37: NEVER infer overflow menu from toolbar "새 탭".
  // First guarantee this Playwright page is really TOOL001.
  await ensureExpectedToolPage(page,caseNo,`${tag}-expected-page`);
  await page.bringToFront().catch(()=>{});

  let xml='';try{xml=dumpUi();}catch{}
  const menu=strictChromeOverflowMenuOpen(xml);
  write(`case-${caseNo}-${tag}-chrome-menu-detection.json`,menu);

  if(menu.open){
    log(`[RECOVER] CASE ${caseNo}: strict Chrome overflow menu confirmed; closing with BACK`);
    adb('shell','input','keyevent','KEYCODE_BACK');
    await sleep(350);
    try{xml=dumpUi();}catch{}
    // A real menu-close must leave TOOL001 intact. If not, immediately restore.
    await ensureExpectedToolPage(page,caseNo,`${tag}-post-menu-back`);
  }

  let ping=null;
  try{ping=await page.evaluate(()=>({href:location.href,visibility:document.visibilityState,focus:document.hasFocus()}));}
  catch(e){ping={error:String(e?.message||e)}}
  const fg=foregroundSnapshot();
  const resumedPackage=resumedPackageFromForeground(fg);
  write(`case-${caseNo}-${tag}-foreground.json`,{fg,resumedPackage,ping,chromeOverflowMenuRecovered:menu.open,menuEvidence:menu});
  if(ping?.href && expectedToolHref(ping.href))return{fg,resumedPackage,ping,chromeOverflowMenuRecovered:menu.open};
  throw new Error(`CHROME_NOT_ON_TOOL001:${ping?.href||'unknown'}:${fg.joined||'unknown'}`);
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
function chromeUploadActionControls(xml){
  const tree=parseUiTree(xml);const out=[];
  const wanted=/(^|\s)(이미지 선택|이미지 추가|파일 선택|select image|choose image|add image|画像を選択)(\s|$)/i;
  const walk=(n,depth=0)=>{const a=n.attrs||{};const b=parseBounds(a.bounds);const label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.android.chrome'&&a.clickable==='true'&&b&&b.w>=100&&b.h>=45&&wanted.test(label)){out.push({bounds:b,label,depth,resourceId:a['resource-id']||''});}for(const c of n.children||[])walk(c,depth+1);};walk(tree);
  out.sort((a,b)=>(a.bounds.w*a.bounds.h)-(b.bounds.w*b.bounds.h));return out;
}
async function tapUpload(page,context,caseNo,round=1){
  suppressNotificationOverlays();
  await ensureExpectedToolPage(page,caseNo,`tap-upload-r${round}`);
  await ensureChromeInteractive(page,caseNo,`before-upload-r${round}`);

  // Live deployment can lag behind the diagnostic source. Do not require new testids.
  // Resolve the visible native upload button by testid OR exact localized button text.
  const candidates=page.locator('button[data-testid="converter-upload-button"], button[data-testid="converter-add-button"], button');
  const count=await candidates.count();
  const matches=[];
  for(let i=0;i<count;i++){
    const el=candidates.nth(i);
    const info=await el.evaluate(node=>({
      tag:node.tagName,
      text:(node.textContent||'').trim().replace(/\s+/g,' '),
      testid:node.getAttribute('data-testid')||'',
      disabled:!!node.disabled,
      visible:!!(node.getClientRects().length),
      type:node.getAttribute('type')||''
    })).catch(()=>null);
    if(!info||!info.visible||info.disabled)continue;
    const exactText=/^(이미지 선택|이미지 추가|Choose images|Add images|Select image|Select images|画像を選択|画像を追加)$/i.test(info.text);
    const exactTestId=/^converter-(upload|add)-button$/.test(info.testid);
    if(exactText||exactTestId)matches.push({index:i,info});
  }
  write(`case-${caseNo}-round-${round}-dom-upload-candidates.json`,matches);
  if(matches.length<1)throw new Error(`UPLOAD_BUTTON_NOT_FOUND:${JSON.stringify(matches)}`);
  // Prefer the primary "choose/select" action, otherwise the first whitelisted match.
  let chosen=matches.find(m=>/(이미지 선택|Choose images|Select image|Select images|画像を選択)/i.test(m.info.text))||matches[0];
  const btn=candidates.nth(chosen.index);
  await btn.evaluate(el=>el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));await sleep(350);
  const geom=await btn.evaluate(el=>{
    const r=el.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const hit=document.elementFromPoint(cx,cy);
    const inputs=[...document.querySelectorAll('input[type=file]')].map((x,i)=>({i,accept:x.getAttribute('accept')||'',multiple:x.multiple,disabled:x.disabled,testid:x.getAttribute('data-testid')||'',rects:x.getClientRects().length}));
    return{x:r.left,y:r.top,width:r.width,height:r.height,cx,cy,buttonText:(el.textContent||'').trim().replace(/\s+/g,' '),buttonTestId:el.getAttribute('data-testid')||'',hitTag:hit?.tagName||'',hitText:(hit?.textContent||'').trim().slice(0,120),hitTestId:hit?.getAttribute?.('data-testid')||'',sameNode:hit===el||el.contains(hit),inputs};
  });
  write(`case-${caseNo}-round-${round}-upload-geometry.json`,geom);
  const whitelistedText=/^(이미지 선택|이미지 추가|Choose images|Add images|Select image|Select images|画像を選択|画像を追加)$/i.test(geom.buttonText);
  const whitelistedTestId=/^converter-(upload|add)-button$/.test(geom.buttonTestId);
  if(!geom.sameNode || !(whitelistedText||whitelistedTestId))throw new Error(`UPLOAD_TARGET_WHITELIST_FAIL:${JSON.stringify(geom)}`);
  if(!geom.inputs?.some(x=>!x.disabled && /image|\.jpe?g|\.png|\.webp/i.test(x.accept)))throw new Error(`IMAGE_FILE_INPUT_NOT_FOUND:${JSON.stringify(geom.inputs)}`);

  const strategies=[];
  async function attempt(method,fire){
    await ensureChromeInteractive(page,caseNo,`pre-${method}-r${round}`);
    const beforeHref=await page.evaluate(()=>location.href).catch(()=>null);
    try{
      await fire();strategies.push({method,fire:true});
      const afterHref=await page.evaluate(()=>location.href).catch(()=>null);
      if(beforeHref&&afterHref&&afterHref!==beforeHref){strategies[strategies.length-1].wrongNavigation={beforeHref,afterHref};throw new Error(`WRONG_TARGET_CLICK_NAVIGATION:${afterHref}`);}
      const xml=await waitStablePickerOpen(caseNo,`r${round}-${method}`,6500);strategies[strategies.length-1].stablePicker=!!xml;
      write(`case-${caseNo}-round-${round}-activation-strategies.json`,strategies);
      if(xml)return{method,geom,strategies,pickerXml:xml};
    }catch(e){strategies.push({method,fire:false,error:String(e?.message||e)});write(`case-${caseNo}-round-${round}-activation-strategies.json`,strategies);}
    await ensureChromeInteractive(page,caseNo,`recover-${method}-r${round}`).catch(()=>{});await sleep(300);return null;
  }

  // Benchmark path A: normal browser-native button activation, closest to production user behavior.
  let r=await attempt('playwright-native-button',async()=>{await btn.click({timeout:4000,noWaitAfter:true});});if(r)return r;

  // Benchmark path B: exact Android accessibility node. Reject top Chrome-toolbar coordinates.
  r=await attempt('uiautomator-exact-upload-control',async()=>{
    const xml=dumpUi();
    if(/(새 탭|새 시크릿 탭|방문 기록|New tab|New Incognito tab|History)/i.test(xml))throw new Error('CHROME_OVERFLOW_MENU_OPEN');
    const cs=chromeUploadActionControls(xml).filter(c=>/(이미지 선택|이미지 추가|파일 선택|choose image|choose images|select image|select images|add image|画像を選択)/i.test(c.label) && c.bounds.y>180);
    write(`case-${caseNo}-round-${round}-chrome-upload-controls.json`,cs);
    if(cs.length!==1)throw new Error(`UPLOAD_CONTROL_AMBIGUOUS:${cs.length}`);
    const b=cs[0].bounds;const ar=adb('shell','input','tap',String(b.x),String(b.y));if(ar.status!==0)throw new Error('ADB_EXACT_UPLOAD_TAP_FAILED');
  });if(r)return r;

  // Benchmark path C: CDP on the already verified DOM center. No guessed device coordinate mapping.
  r=await attempt('cdp-whitelisted-button',async()=>{const cdp=await context.newCDPSession(page);try{await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:Math.round(geom.cx),y:Math.round(geom.cy),button:'left',clickCount:1});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:Math.round(geom.cx),y:Math.round(geom.cy),button:'left',clickCount:1});}finally{await cdp.detach().catch(()=>{});}});if(r)return r;

  await pcScreen(`case-${caseNo}-round-${round}-activation-failed-device.png`);write(`case-${caseNo}-round-${round}-activation-failed-ui.xml`,dumpUi());
  throw new Error(`UPLOAD_ACTIVATION_EXHAUSTED_ROUND_${round}:${JSON.stringify(strategies)}`);
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
function photoSlotIndex(label){
  const m=String(label).match(/PHOTO_(\d+)/i);
  return m?Math.max(0,Number(m[1])-1):0;
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

function sliceObserverState(st,start){
  const out={};for(const k of ['capture','consoleErrors','events','lifecycle','nativeReads','picker','handles','images','objectUrls','inputs'])out[k]=(st?.[k]||[]).slice(start?.[k]||0);return out;
}
function observerIndexes(st){const out={};for(const k of ['capture','consoleErrors','events','lifecycle','nativeReads','picker','handles','images','objectUrls','inputs'])out[k]=(st?.[k]||[]).length;return out;}
async function waitV39Outcome(page,start,before,timeoutMs=8000){
  const dl=Date.now()+timeoutMs;let last=null;
  while(Date.now()<dl){
    const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V39__)));
    const obs=sliceObserverState(st,start),dom=await domSnapshot(page);last={obs,dom};
    const loadedPreview=dom.cards.flatMap(c=>c.imgs||[]).some(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0&&img.clientWidth>0&&img.clientHeight>0);
    const cardAdded=dom.cardCount>before.cardCount;
    const explicitProductFail=(obs.capture||[]).some(x=>x.phase==='stable-handle-final-fail'||x.phase==='stable-picker-capture-fail'||x.phase==='stable-picker-error');
    const nativeReadError=(obs.nativeReads||[]).some(x=>x.phase==='error');
    const handleError=(obs.handles||[]).some(x=>x.phase==='getFile-error');
    const pickerError=(obs.picker||[]).some(x=>x.phase==='showOpenFilePicker-error'&&!/AbortError/i.test(String(x.errorName||'')));
    if(cardAdded&&loadedPreview)return last;
    if(explicitProductFail||nativeReadError||handleError||pickerError)return last;
    await sleep(180);
  }
  if(last)return last;
  const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V39__)));
  return{obs:sliceObserverState(st,start),dom:await domSnapshot(page)};
}
function findErrorName(obj){return String(obj?.errorName||obj?.name||obj?.error||'').split(':')[0]||'';}
function deriveFailureTrace(r){
  const o=r.observer||{},cap=o.capture||[],picker=o.picker||[],handles=o.handles||[],reads=o.nativeReads||[],images=o.images||[],urls=o.objectUrls||[];
  const pickerCall=picker.some(x=>x.phase==='showOpenFilePicker-call')||cap.some(x=>x.phase==='stable-picker-open');
  const pickerPass=picker.some(x=>x.phase==='showOpenFilePicker-pass')||cap.some(x=>x.phase==='stable-picker-selected');
  const pickerErr=picker.find(x=>x.phase==='showOpenFilePicker-error'&&!/AbortError/i.test(String(x.errorName||'')))||cap.find(x=>x.phase==='stable-picker-error');
  const getCall=handles.some(x=>x.phase==='getFile-call')||cap.some(x=>x.phase==='stable-handle-getfile-start');
  const getPass=handles.some(x=>x.phase==='getFile-pass')||cap.some(x=>x.phase==='stable-handle-getfile-pass');
  const getErr=handles.find(x=>x.phase==='getFile-error');
  const readCall=reads.some(x=>x.phase==='call')||cap.some(x=>x.phase==='stable-handle-read-start');
  const readPass=reads.some(x=>x.phase==='pass')||cap.some(x=>x.phase==='stable-handle-read-pass');
  const readErr=reads.find(x=>x.phase==='error')||cap.find(x=>x.phase==='stable-handle-attempt-fail'||x.phase==='stable-handle-final-fail');
  const ownedPass=cap.some(x=>x.phase==='stable-handle-owned-pass');
  const objectUrlCreated=urls.some(x=>x.phase==='create');
  const imgLoad=images.some(x=>x.phase==='img-load'&&Number(x.naturalWidth)>0&&Number(x.naturalHeight)>0);
  const imgErr=images.find(x=>x.phase==='img-error');
  const cardAdded=r.newCards>0,visiblePreview=r.previewCount>0;
  let last='NONE',first='UNKNOWN',errorName='',errorMessage='';
  if(pickerCall)last='PICKER_OPEN';
  if(pickerErr){first='PICKER_RETURN';errorName=findErrorName(pickerErr);errorMessage=pickerErr.errorMessage||pickerErr.error||'';}
  else if(pickerPass){last='PICKER_RETURN';
    if(getErr){first='GET_FILE';errorName=findErrorName(getErr);errorMessage=getErr.errorMessage||'';}
    else if(getPass){last='GET_FILE';
      if(readErr){first='BYTE_READ';errorName=findErrorName(readErr)||(/NotReadableError/i.test(String(readErr.error||''))?'NotReadableError':'');errorMessage=readErr.errorMessage||readErr.error||'';}
      else if(readPass){last='BYTE_READ';
        if(ownedPass)last='OWNED_SNAPSHOT';
        if(cardAdded){last='CARD_CREATED';
          if(visiblePreview||imgLoad){last='IMG_LOAD';first='NONE';}
          else {first='IMG_LOAD';errorName=findErrorName(imgErr)||'PREVIEW_NOT_LOADED';errorMessage=imgErr?.errorMessage||'';}
        } else {first='POST_READ_PRODUCT_STATE';errorName='CARD_NOT_CREATED';}
      } else if(readCall){first='BYTE_READ';errorName='READ_NO_SETTLEMENT';}
      else {first='BYTE_READ';errorName='READ_NOT_STARTED';}
    } else if(getCall){first='GET_FILE';errorName='GETFILE_NO_SETTLEMENT';}
    else {first='GET_FILE';errorName='GETFILE_NOT_STARTED';}
  } else if(pickerCall){first='PICKER_RETURN';errorName='PICKER_NO_RESULT';}
  else {first='PICKER_OPEN';errorName='PICKER_NOT_OBSERVED';}
  if(r.pass){first='NONE';errorName='';errorMessage='';last='IMG_LOAD';}
  const notReadable=[...reads,...handles,...cap].filter(x=>/NotReadableError|could not be read/i.test(`${x.errorName||''} ${x.errorMessage||''} ${x.error||''}`)).length;
  return{lastSuccessStep:last,firstFailStep:first,errorName,errorMessage,notReadableEvents:notReadable,pickerCall,pickerPass,getCall,getPass,readCall,readPass,ownedPass,objectUrlCreated,cardAdded,imgLoad,visiblePreview,diagnosticCaptureEvents:cap.length,independentObserverEvents:picker.length+handles.length+reads.length+images.length+urls.length};
}
function summarizeCase(r){
  const cap=r.capture||[];
  const attempts=cap.filter(x=>x.phase==='stable-handle-getfile-start').length;
  const getFilePass=cap.filter(x=>x.phase==='stable-handle-getfile-pass').length;
  const readPass=cap.filter(x=>x.phase==='stable-handle-read-pass').length;
  const ownedPass=cap.filter(x=>x.phase==='stable-handle-owned-pass').length;
  const failures=cap.filter(x=>/fail$/.test(String(x.phase||''))||/error/i.test(String(x.phase||'')));
  const successAttempt=cap.find(x=>x.phase==='stable-handle-owned-pass')?.attempt??null;
  return{attempts,getFilePass,readPass,ownedPass,successAttempt,failures};
}

async function main(){
  const REPEATS=Math.max(1,Number(args.repeats||10));
  log('=== TOOL001 V39 FAILURE TRACE REAL DEVICE ===');log('[OUTPUT]',outDir);
  step('SELF-CHECK');if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');write('self-check.txt','SELF_CHECK=PASS\nMODE=V39_FAILURE_TRACE_10X\n');log('[PASS] SELF-CHECK');
  step('기기정보 수집');write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${adbText('shell','dumpsys','package','com.android.chrome').match(/versionName=([^\\s]+)/)?.[1]||''}`].join('\n'));
  step('화면 유지/알림 방해 억제');suppressNotificationOverlays();adb('shell','settings','put','global','stay_on_while_plugged_in','3');adb('shell','svc','power','stayon','usb');adb('shell','input','keyevent','KEYCODE_WAKEUP');
  step('Playwright 실기기 탐색');const ds=await timed('Playwright Android device discovery',()=>android.devices(),45000);if(!ds.length)throw new Error('NO_ANDROID_DEVICE');const device=ds[0];
  step('실제 Chrome 실행');const context=await timed('launchBrowser(real Android Chrome)',()=>device.launchBrowser({}),60000);const page=await context.newPage();
  const pcl=[];page.on('console',m=>{pcl.push(`${m.type()} ${m.text()}`);write('page-console.log',pcl.join('\n'));});page.on('pageerror',e=>{pcl.push(`PAGEERROR ${e.stack||e.message}`);write('page-console.log',pcl.join('\n'));});
  step('V39 실패단계 관찰기 주입');await page.addInitScript(browserInit);
  step('TOOL001 접속');await timed('page.goto',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}),55000);await page.locator('button[data-testid="converter-upload-button"], button').first().waitFor({state:'attached',timeout:30000});await ensureExpectedToolPage(page,0,'startup');
  const support=await page.evaluate(()=>({ua:navigator.userAgent,showOpenFilePicker:typeof window.showOpenFilePicker==='function'}));write('v39-feature-support.json',support);log(`[FEATURE] showOpenFilePicker=${support.showOpenFilePicker}`);if(!support.showOpenFilePicker)throw new Error('V39_STABLE_PICKER_UNSUPPORTED_ON_DEVICE');
  step('PHOTO_01 동일사진 10회 + 실패단계 추적');const results=[];
  for(let i=0;i<REPEATS;i++){
    const caseNo=i+1;log('');log(`===== V39 CASE ${caseNo}/${REPEATS} =====`);await ensureExpectedToolPage(page,caseNo,'case-start');await page.bringToFront();
    const before=await domSnapshot(page);const st0=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V39__)));const startObs=observerIndexes(st0);adb('logcat','-c');
    const r={case:caseNo,pass:false,error:'',capture:[],observer:{},summary:null,trace:null,newCards:0,previewCount:0};
    try{
      await timed(`CASE ${caseNo} picker open`,()=>tapUpload(page,context,caseNo,1),30000);
      await timed(`CASE ${caseNo} PHOTO_01 select`,()=>autoSelectPickerMediaV38(caseNo,'PHOTO_01',1,page),20000);
      const outcome=await timed(`CASE ${caseNo} product outcome`,()=>waitV39Outcome(page,startObs,before,9000),10000);
      r.observer=outcome.obs||{};r.capture=r.observer.capture||[];r.after=outcome.dom;
      r.newCards=Math.max(0,outcome.dom.cardCount-before.cardCount);
      r.previewCount=outcome.dom.cards.flatMap(c=>c.imgs||[]).filter(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0&&img.clientWidth>0&&img.clientHeight>0).length;
      r.summary=summarizeCase(r);
      // User-visible truth is authoritative: a newly attached card AND a real loaded/visible preview.
      r.pass=r.newCards>0&&r.previewCount>0;
    }catch(e){
      r.error=String(e?.message||e);
      const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V39__))).catch(()=>({}));r.observer=sliceObserverState(st,startObs);r.capture=r.observer.capture||[];r.after=await domSnapshot(page).catch(()=>({cardCount:0,cards:[]}));r.newCards=Math.max(0,(r.after?.cardCount||0)-before.cardCount);r.previewCount=(r.after?.cards||[]).flatMap(c=>c.imgs||[]).filter(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0&&img.clientWidth>0&&img.clientHeight>0).length;r.summary=summarizeCase(r);r.pass=r.newCards>0&&r.previewCount>0;
    }
    r.trace=deriveFailureTrace(r);if(!r.pass&&!r.error)r.error=r.trace.errorName||r.trace.firstFailStep||'ATTACHMENT_FAILED';
    const raw=adbText('logcat','-d','-v','time');r.logcatEvidence=raw.split(/\r?\n/).filter(x=>/(NotReadableError|ERR_UPLOAD_FILE_CHANGED|UPLOAD_FILE_CHANGED|file could not be read|net::ERR_|FileSystemFileHandle|showOpenFilePicker)/i.test(x)).slice(-220);
    write(`case-${caseNo}.json`,r);write(`case-${caseNo}-logcat.txt`,r.logcatEvidence.join('\n'));
    const traceLines=[`CASE=${caseNo}`,`USER_VISIBLE=${r.pass?'SUCCESS':'FAIL'}`,`LAST_SUCCESS_STEP=${r.trace.lastSuccessStep}`,`FIRST_FAIL_STEP=${r.trace.firstFailStep}`,`ERROR_NAME=${r.trace.errorName||''}`,`ERROR_MESSAGE=${r.trace.errorMessage||''}`,`NOTREADABLE_EVENTS=${r.trace.notReadableEvents}`,`PICKER_CALL=${r.trace.pickerCall}`,`PICKER_PASS=${r.trace.pickerPass}`,`GETFILE_CALL=${r.trace.getCall}`,`GETFILE_PASS=${r.trace.getPass}`,`READ_CALL=${r.trace.readCall}`,`READ_PASS=${r.trace.readPass}`,`OWNED_SNAPSHOT=${r.trace.ownedPass}`,`CARD_ADDED=${r.trace.cardAdded}`,`IMG_LOAD=${r.trace.imgLoad}`,`VISIBLE_PREVIEW=${r.trace.visiblePreview}`,`PRODUCT_DIAGNOSTIC_EVENTS=${r.trace.diagnosticCaptureEvents}`,`INDEPENDENT_OBSERVER_EVENTS=${r.trace.independentObserverEvents}`];write(`case-${caseNo}-failure-trace.txt`,traceLines.join('\n'));await pcScreen(`case-${caseNo}-device.png`);
    log(`[${r.pass?'PASS':'FAIL'}] CASE ${caseNo} LAST=${r.trace.lastSuccessStep} FIRST_FAIL=${r.trace.firstFailStep} ERROR=${r.trace.errorName||'-'} NR=${r.trace.notReadableEvents} card=${r.newCards} preview=${r.previewCount}`);results.push(r);
    if(i<REPEATS-1){await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await sleep(350);}
  }
  step('최종 집계');const pass=results.filter(r=>r.pass).length,fail=results.length-pass,nr=results.reduce((a,r)=>a+(r.trace?.notReadableEvents||0),0);const byFail={};for(const r of results){const k=r.trace?.firstFailStep||'UNKNOWN';if(k!=='NONE')byFail[k]=(byFail[k]||0)+1;}
  const txt=['TOOL001 V39 FAILURE TRACE REAL DEVICE',`TOTAL=${results.length}`,`PASS=${pass}`,`FAIL=${fail}`,`NOTREADABLE_EVENTS=${nr}`,`FINAL=${pass===results.length?'PASS_100_PERCENT':'FAIL_NOT_100_PERCENT'}`,'',`FAIL_STEP_COUNTS=${JSON.stringify(byFail)}`,'','ROWS',...results.map(r=>`CASE_${String(r.case).padStart(2,'0')} ${r.pass?'PASS':'FAIL'} LAST=${r.trace?.lastSuccessStep||'-'} FIRST_FAIL=${r.trace?.firstFailStep||'-'} ERROR=${r.trace?.errorName||'-'} NR=${r.trace?.notReadableEvents||0} card=${r.newCards} preview=${r.previewCount}`)];write('v39-failure-trace-summary.txt',txt.join('\n'));write('result.json',{version:'V39-FAILURE-TRACE',url,generatedAt:new Date().toISOString(),pass,fail,notReadableEvents:nr,failStepCounts:byFail,results});log(txt.join('\n'));
  step('결과 ZIP 생성');restoreNotificationOverlays();await context.close().catch(()=>{});if(typeof device.close==='function')await device.close().catch(()=>{});adb('shell','svc','power','stayon','false');const zip=path.join(desktop,`${path.basename(outDir)}.zip`);const pr=spawnSync('powershell.exe',['-NoProfile','-Command',`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`],{encoding:'utf8',shell:false});if(pr.status!==0)log('[WARN] ZIP creation failed',pr.stderr||pr.stdout||'');else log('[PASS] RESULT ZIP',zip);log('SUMMARY=v39-failure-trace-summary.txt');
}
main().catch(async e=>{restoreNotificationOverlays();log('[FATAL]',e?.stack||String(e));try{await pcScreen('fatal-device.png');}catch{}process.exitCode=1;});
