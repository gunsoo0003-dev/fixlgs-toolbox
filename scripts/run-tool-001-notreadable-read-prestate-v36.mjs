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
const REPEATS=Math.max(1,Number(args.repeats||20));
const plan=Array.from({length:REPEATS},(_,i)=>({photo:'PHOTO_01',repeat:i+1,label:`PHOTO_01_READ_PRESTATE_R${String(i+1).padStart(2,'0')}`}));
const labels=plan.map(x=>x.label);
const selector='[data-testid="converter-file-input"], input[type=file]';
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_NOTREADABLE_READ_PRESTATE_V36_${stamp}`);fs.mkdirSync(outDir,{recursive:true});
const lines=[];
function log(...p){const s=p.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');console.log(s);lines.push(s);fs.writeFileSync(path.join(outDir,'runner.log'),lines.join('\n'));}
function write(n,d){fs.writeFileSync(path.join(outDir,n),typeof d==='string'?d:JSON.stringify(d,null,2));}
function adb(...a){return spawnSync('adb',a,{encoding:'utf8',shell:false});}
function adbText(...a){const r=adb(...a);return `${r.stdout||''}${r.stderr||''}`;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let stepNo=0;const TOTAL=11+labels.length;function step(s){stepNo++;log(`[PROGRESS ${String(stepNo).padStart(2,'0')}/${TOTAL}] ${s}`)}
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
async function autoCommitManualSelection(caseNo,page,startChange){const deadline=Date.now()+8000;let sawSelection=false;let commitTaps=0;let lastXml='';while(Date.now()<deadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));if(st.changes.length>startChange)return{committed:true,mode:'picker-auto-close-change',sawSelection,commitTaps};let open=false;try{lastXml=dumpUi();open=pickerDetectedFromXml(lastXml);}catch{}if(!open){await sleep(250);const st2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));if(st2.changes.length>startChange)return{committed:true,mode:'picker-closed-change',sawSelection,commitTaps};await sleep(500);continue;}const sig=pickerSelectionSignals(lastXml);if(sig.detected){sawSelection=true;write(`case-${caseNo}-selection-observed.xml`,lastXml);const actions=photoPickerActionControls(lastXml);write(`case-${caseNo}-commit-controls.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));if(actions.length){for(const action of actions){const b=action.bounds;adb('shell','input','tap',String(b.x),String(b.y));commitTaps++;log(`[PHOTO_PICKER] case ${caseNo}: auto commit "${action.exact}" at ${b.x},${b.y}`);await pcScreen(`case-${caseNo}-after-auto-commit-${commitTaps}.png`);if(await pickerClosedStable(page,7000)){const st3=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));if(st3.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit',sawSelection:true,commitTaps,action:action.exact};await sleep(1500);const st4=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));if(st4.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit-delayed-change',sawSelection:true,commitTaps,action:action.exact};return{committed:false,mode:'picker-closed-no-change',sawSelection:true,commitTaps,action:action.exact};}}}}
await sleep(300);}write(`case-${caseNo}-commit-timeout.xml`,lastXml);await pcScreen(`case-${caseNo}-commit-timeout-device.png`);return{committed:false,mode:sawSelection?'selection-seen-but-commit-timeout':'no-selection-observed',sawSelection,commitTaps};}

function browserInit(){
  const KEY='__TOOL001_REAL_PHOTO_V36__'; if(window[KEY])return;
  const s=window[KEY]={changes:[],capture:[],nativeReads:[],consoleErrors:[],events:[],lifecycle:[],nav:[],inputLifecycle:[],aborts:[],decodeOps:[],objectUrls:[],readConcurrency:[],domMutations:[],readPrestate:[]}; let activeReads=0; const readEnter=(kind,extra={})=>{activeReads++;s.readConcurrency.push({at:Date.now(),kind,phase:'start',activeReads,...extra});}; const readExit=(kind,extra={})=>{s.readConcurrency.push({at:Date.now(),kind,phase:'end',activeReads,...extra});activeReads=Math.max(0,activeReads-1);};
  const preState=(kind,blob)=>{
    const now=Date.now();
    const lastChange=s.changes.at(-1)||null;
    const lastLife=s.lifecycle.at(-1)||null;
    const input=document.querySelector('[data-testid="converter-file-input"], input[type=file]');
    const snap={
      at:now,kind,size:Number(blob?.size||0),type:String(blob?.type||''),
      activeReadsBefore:activeReads,
      msSinceChange:lastChange?now-lastChange.at:null,
      lastChangeTrusted:lastChange?.trusted??null,
      inputConnected:!!input?.isConnected,
      inputFileCount:Number(input?.files?.length||0),
      visibility:document.visibilityState,focus:document.hasFocus(),
      lastLifecycleKind:lastLife?.kind||'',msSinceLastLifecycle:lastLife?now-lastLife.at:null,
      priorNativeReadCount:s.nativeReads.length,
      priorAbortCount:s.aborts.length,priorDecodeCount:s.decodeOps.length,
      priorObjectUrlCount:s.objectUrls.length,priorInputLifecycleCount:s.inputLifecycle.length,
      priorDomMutationCount:s.domMutations.length
    };
    s.readPrestate.push(snap);
    return snap;
  };
  // V36 non-product instrumentation: observe native browser reads without consuming the File ourselves.
  // This does not read/slice/clone the provider File; it only records calls and terminal events
  // already caused by the product. This lets the harness work even when the deployed build does
  // not emit tool001:capture-diagnostic events.
  try {
    const proto=FileReader.prototype;
    const orig=proto.readAsArrayBuffer;
    if(!orig.__tool001v36Wrapped){
      const wrapped=function(blob){
        const id=`fr-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const meta={id,at:Date.now(),phase:'filereader-call',size:Number(blob?.size||0),type:String(blob?.type||''),readyState:this.readyState};
        s.nativeReads.push(meta); preState('FileReader',blob); readEnter('FileReader',{id,size:meta.size,type:meta.type});
        const done=(phase)=>{
          let err=''; try{err=this.error?`${this.error.name}:${this.error.message}`:'';}catch{}
          let bytes=null; try{bytes=this.result instanceof ArrayBuffer?this.result.byteLength:null;}catch{}
          s.nativeReads.push({id,at:Date.now(),phase,error:err,bytes,readyState:this.readyState,size:meta.size,type:meta.type}); readExit('FileReader',{id,phase,error:err,bytes});
        };
        this.addEventListener('load',()=>done('filereader-load'),{once:true});
        this.addEventListener('error',()=>done('filereader-error'),{once:true});
        this.addEventListener('abort',()=>done('filereader-abort'),{once:true});
        try{return orig.call(this,blob);}catch(e){
          s.nativeReads.push({id,at:Date.now(),phase:'filereader-throw',error:String(e?.name||'Error')+':'+String(e?.message||e),size:meta.size,type:meta.type}); readExit('FileReader',{id,phase:'throw',error:String(e?.name||'Error')+':'+String(e?.message||e)});
          throw e;
        }
      };
      Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});
      proto.readAsArrayBuffer=wrapped;
    }
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_FILEREADER_OBSERVER:'+String(e?.message||e)}); }
  try {
    const proto=Blob.prototype, orig=proto.stream;
    if(typeof orig==='function'&&!orig.__tool001v36Wrapped){
      const wrapped=function(){
        preState('Blob.stream',this); s.nativeReads.push({at:Date.now(),phase:'blob-stream-call',size:Number(this?.size||0),type:String(this?.type||'')});
        return orig.call(this);
      };
      Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});
      proto.stream=wrapped;
    }
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_STREAM_OBSERVER:'+String(e?.message||e)}); }
  try {
    const proto=Blob.prototype, orig=proto.arrayBuffer;
    if(typeof orig==='function'&&!orig.__tool001v36Wrapped){
      const wrapped=async function(){
        const id=`ab-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, size=Number(this?.size||0), type=String(this?.type||'');
        s.nativeReads.push({id,at:Date.now(),phase:'arraybuffer-call',size,type}); preState('Blob.arrayBuffer',this); readEnter('Blob.arrayBuffer',{id,size,type});
        try{const r=await orig.call(this);s.nativeReads.push({id,at:Date.now(),phase:'arraybuffer-load',bytes:Number(r?.byteLength||0),size,type});readExit('Blob.arrayBuffer',{id,phase:'load',bytes:Number(r?.byteLength||0)});return r;}
        catch(e){const error=String(e?.name||'Error')+':'+String(e?.message||e);s.nativeReads.push({id,at:Date.now(),phase:'arraybuffer-error',error,size,type});readExit('Blob.arrayBuffer',{id,phase:'error',error});throw e;}
      };Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});proto.arrayBuffer=wrapped;
    }
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_ARRAYBUFFER_OBSERVER:'+String(e?.message||e)}); }
  try {
    const origAbort=FileReader.prototype.abort;
    if(typeof origAbort==='function'&&!origAbort.__tool001v36Wrapped){const wrapped=function(){s.aborts.push({at:Date.now(),kind:'FileReader.abort',readyState:this.readyState});return origAbort.call(this)};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});FileReader.prototype.abort=wrapped;}
    const AC=window.AbortController;
    if(AC&&AC.prototype){const orig=AC.prototype.abort;if(typeof orig==='function'&&!orig.__tool001v36Wrapped){const wrapped=function(reason){s.aborts.push({at:Date.now(),kind:'AbortController.abort',reason:String(reason||'')});return orig.call(this,reason)};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});AC.prototype.abort=wrapped;}}
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_ABORT_OBSERVER:'+String(e?.message||e)}); }
  try {
    const origCIB=window.createImageBitmap;
    if(typeof origCIB==='function'&&!origCIB.__tool001v36Wrapped){const wrapped=function(source,...rest){s.decodeOps.push({at:Date.now(),kind:'createImageBitmap',isBlob:source instanceof Blob,size:Number(source?.size||0),type:String(source?.type||'')});return origCIB.call(this,source,...rest)};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});window.createImageBitmap=wrapped;}
    const origCO=URL.createObjectURL,origRO=URL.revokeObjectURL;
    if(typeof origCO==='function'&&!origCO.__tool001v36Wrapped){const wrapped=function(obj){const u=origCO.call(this,obj);s.objectUrls.push({at:Date.now(),kind:'create',url:String(u),isBlob:obj instanceof Blob,size:Number(obj?.size||0),type:String(obj?.type||'')});return u};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});URL.createObjectURL=wrapped;}
    if(typeof origRO==='function'&&!origRO.__tool001v36Wrapped){const wrapped=function(u){s.objectUrls.push({at:Date.now(),kind:'revoke',url:String(u)});return origRO.call(this,u)};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});URL.revokeObjectURL=wrapped;}
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_DECODE_OBSERVER:'+String(e?.message||e)}); }
  try {
    const desc=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
    if(desc?.set&&desc?.get&&!desc.set.__tool001v36Wrapped){const origSet=desc.set,origGet=desc.get;const wrapped=function(v){if(this.type==='file')s.inputLifecycle.push({at:Date.now(),kind:'value-set',value:String(v),connected:this.isConnected,testid:this.getAttribute('data-testid')||''});return origSet.call(this,v)};Object.defineProperty(wrapped,'__tool001v36Wrapped',{value:true});Object.defineProperty(HTMLInputElement.prototype,'value',{get:origGet,set:wrapped,configurable:desc.configurable,enumerable:desc.enumerable});}
    const mo=new MutationObserver(ms=>{for(const m of ms){for(const n of [...m.removedNodes])if(n instanceof Element&&(n.matches?.('input[type=file]')||n.querySelector?.('input[type=file]')))s.domMutations.push({at:Date.now(),kind:'file-input-removed'});for(const n of [...m.addedNodes])if(n instanceof Element&&(n.matches?.('input[type=file]')||n.querySelector?.('input[type=file]')))s.domMutations.push({at:Date.now(),kind:'file-input-added'});}});mo.observe(document.documentElement,{childList:true,subtree:true});
  } catch(e) { s.consoleErrors.push({at:Date.now(),message:'V36_INPUT_DOM_OBSERVER:'+String(e?.message||e)}); }
  const pushLife=(kind,extra={})=>s.lifecycle.push({at:Date.now(),kind,href:location.href,visibility:document.visibilityState,focus:document.hasFocus(),...extra});
  window.addEventListener('tool001:capture-diagnostic',e=>s.capture.push(JSON.parse(JSON.stringify(e.detail||{}))),true);
  const ev=(kind,e)=>{const t=e.target;s.events.push({at:Date.now(),kind,trusted:e.isTrusted,tag:t?.tagName||'',type:t?.type||'',testid:t?.getAttribute?.('data-testid')||'',text:(t?.textContent||'').trim().slice(0,120),href:location.href});};
  document.addEventListener('pointerdown',e=>ev('pointerdown',e),true);document.addEventListener('click',e=>ev('click',e),true);
  document.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement&&e.target.type==='file')ev('file-input',e)},true);
  document.addEventListener('change',e=>{const el=e.target;if(!(el instanceof HTMLInputElement)||el.type!=='file')return;ev('file-change',e);const files=Array.from(el.files||[]);s.changes.push({at:Date.now(),trusted:e.isTrusted,fileCount:files.length,files:files.map(f=>({name:f.name,type:f.type,size:f.size,lastModified:f.lastModified}))});},true);
  document.addEventListener('visibilitychange',()=>pushLife('visibilitychange'));
  window.addEventListener('focus',()=>pushLife('focus'));window.addEventListener('blur',()=>pushLife('blur'));window.addEventListener('pageshow',e=>pushLife('pageshow',{persisted:e.persisted}));window.addEventListener('pagehide',e=>pushLife('pagehide',{persisted:e.persisted}));
  window.addEventListener('popstate',()=>s.nav.push({at:Date.now(),kind:'popstate',href:location.href}));window.addEventListener('hashchange',()=>s.nav.push({at:Date.now(),kind:'hashchange',href:location.href}));
  window.addEventListener('error',e=>s.consoleErrors.push({at:Date.now(),message:e.message||String(e.error||'')}),true);
  window.addEventListener('unhandledrejection',e=>s.consoleErrors.push({at:Date.now(),message:String(e.reason?.message||e.reason||'')}),true);
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

  // V36: NEVER infer overflow menu from toolbar "새 탭".
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
async function autoSelectPickerMedia(caseNo,label,round,page,startChange){
  const before=pickerSignalSnapshot();
  if(!before.detected)throw new Error('HARNESS_PICKER_NOT_ACTIVE');
  const candidates=pickerMediaCandidates(before.xml||'');
  write(`case-${caseNo}-media-grid-r${round}.json`,candidates.map((c,i)=>({slot:i+1,bounds:c.bounds,desc:c.desc,class:c.class})));
  const idx=photoSlotIndex(label);
  if(idx>=candidates.length){
    write(`case-${caseNo}-media-grid-missing-r${round}.xml`,before.xml||'');
    await pcScreen(`case-${caseNo}-media-grid-missing-r${round}.png`);
    throw new Error(`HARNESS_PHOTO_SLOT_NOT_VISIBLE:${idx+1}/${candidates.length}`);
  }
  const c=candidates[idx], b=c.parsed;
  if(b.top<900||b.w<300||b.w>420||b.h<300||b.h>420)
    throw new Error('HARNESS_UNSAFE_MEDIA_BOUNDS');
  write(`case-${caseNo}-photo-target.json`,{label,slot:idx+1,bounds:c.bounds,desc:c.desc});
  adb('shell','input','tap',String(b.x),String(b.y));
  log(`[PHOTO TAP] CASE ${caseNo}: ${label} -> 사진첩 ${idx+1}번 ${c.bounds}`);
  await sleep(300);
  await pcScreen(`case-${caseNo}-after-photo-tap-r${round}.png`);

  // Single-select Photo Picker normally closes immediately.
  const dl=Date.now()+7000;
  let commitTapped=false, commitAction='';
  while(Date.now()<dl){
    const obs=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))).catch(()=>null);
    if(obs?.changes?.length>startChange)
      return{selected:true,slot:idx+1,autoClosed:true,changeObserved:true,candidate:c};

    const snap=pickerSignalSnapshot();
    if(!snap.detected){
      await sleep(300);
      const obs2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))).catch(()=>null);
      return{selected:true,slot:idx+1,autoClosed:true,changeObserved:!!(obs2?.changes?.length>startChange),candidate:c};
    }

    // Some picker modes expose a positive action. Tap it once if it appears.
    if(!commitTapped){
      const actions=photoPickerActionControls(snap.xml||'');
      if(actions.length){
        const act=actions[0], bb=act.bounds;
        adb('shell','input','tap',String(bb.x),String(bb.y));
        commitTapped=true; commitAction=act.exact;
        log(`[COMMIT TAP] CASE ${caseNo}: "${commitAction}" 1회`);
        await pcScreen(`case-${caseNo}-after-commit-r${round}.png`);
      }
    }
    await sleep(180);
  }

  const after=pickerSignalSnapshot();
  write(`case-${caseNo}-photo-flow-timeout-r${round}.xml`,after.xml||'');
  await pcScreen(`case-${caseNo}-photo-flow-timeout-r${round}.png`);
  throw new Error(commitTapped?'HARNESS_COMMIT_RETURN_TIMEOUT':'HARNESS_PHOTO_TAP_NO_RETURN');
}

async function waitForSelectionAndCommit(caseNo,label,page,startChange,context){
  await ensureExpectedToolPage(page,caseNo,'harness-before-activation');
  let activation;
  try{
    activation=await tapUpload(page,context,caseNo,1);
  }catch(e){
    throw new Error(`HARNESS_UPLOAD_ACTIVATION:${String(e?.message||e)}`);
  }
  log(`[PICKER READY] CASE ${caseNo} ${label}: Android Photo Picker 확인.`);
  const picked=await autoSelectPickerMedia(caseNo,label,1,page,startChange);

  const dl=Date.now()+9000;
  while(Date.now()<dl){
    const obs=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))).catch(()=>null);
    if(obs?.changes?.length>startChange){
      return{committed:true,mode:'PHOTO_FLOW_CHANGE',sawSelection:true,slot:picked.slot,activation};
    }
    const snap=pickerSignalSnapshot();
    if(!snap.detected){
      await sleep(300);
      const obs2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))).catch(()=>null);
      return{
        committed:!!(obs2?.changes?.length>startChange),
        mode:(obs2?.changes?.length>startChange)?'PHOTO_FLOW_PICKER_CLOSED_CHANGE':'PHOTO_FLOW_PICKER_CLOSED_NO_CHANGE',
        sawSelection:true,slot:picked.slot,activation
      };
    }
    await sleep(180);
  }
  throw new Error('HARNESS_FLOW_RETURN_TIMEOUT');
}

async function waitProduct(page,startCapture,startNative,before,timeoutMs=6500){const deadline=Date.now()+timeoutMs;let snap=before,cap=[],nr=[];while(Date.now()<deadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));cap=st.capture.slice(startCapture);nr=(st.nativeReads||[]).slice(startNative);snap=await domSnapshot(page);const preview=snap.cards.flatMap(c=>c.imgs||[]).some(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);const cardChanged=snap.cardCount!==before.cardCount;const capFail=cap.some(x=>x.phase==='picker-file-fail'||x.phase==='capture-bytes-fail'||x.phase==='product-add-fail');const nativeFail=nr.some(x=>/error|throw|abort/.test(x.phase||'')&&/(NotReadableError|could not be read|UPLOAD_FILE_CHANGED|ERR_)/i.test(String(x.error||'')));if((cardChanged&&preview)||capFail||nativeFail)break;await sleep(220);}return{capture:cap,nativeReads:nr,after:snap};}
async function collectFailureEvidence(caseNo,label,page,reason){let xml='';try{xml=dumpUi();}catch{}write(`case-${caseNo}-${label}-failure-picker.xml`,xml);await pcScreen(`case-${caseNo}-${label}-failure-device.png`);await page.screenshot({path:path.join(outDir,`case-${caseNo}-${label}-failure-page.png`),fullPage:true}).catch(()=>{});const snap=await domSnapshot(page).catch(()=>null);const obs=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))).catch(()=>null);write(`case-${caseNo}-${label}-failure-evidence.json`,{reason,pickerOpen:pickerDetectedFromXml(xml),selectionSignals:pickerSelectionSignals(xml).selectedNodes.length,commitControls:photoPickerActionControls(xml).map(a=>({exact:a.exact,label:a.label,bounds:a.bounds})),foreground:foregroundSnapshot(),observer:obs,dom:snap});}



function checkpointSummary(r){
  const cap=r.capture||[];
  const has=(phase)=>cap.some(x=>x.phase===phase);
  const firstReader=cap.find(x=>x.phase==='reader-start')||null;
  const owned=cap.find(x=>x.phase==='picker-file-pass')||null;
  const statePass=(r.newCards||0)>0;
  const nr=r.nativeReads||[];
  const nativeStart=nr.find(x=>x.phase==='filereader-call'||x.phase==='blob-stream-call')||null;
  const nativePass=nr.find(x=>x.phase==='filereader-load'&&Number(x.bytes||0)>0)||null;
  const nativeFail=nr.find(x=>x.phase==='filereader-error'||x.phase==='filereader-abort'||x.phase==='filereader-throw')||null;
  const logFail=(r.logcatEvidence||[]).find(x=>/(NotReadableError|ERR_UPLOAD_FILE_CHANGED|UPLOAD_FILE_CHANGED|file could not be read|net::ERR_)/i.test(x))||null;
  return{
    CHANGE_HANDLER_ENTER:!!r.change,
    FILE_ACQUIRED:!!r.change?.files?.length||has('picker-selection-received'),
    READ_START:has('capture-bytes-start')||!!firstReader||!!nativeStart,
    SNAPSHOT_SUCCESS:!!owned||!!nativePass,
    PRODUCT_STATE_CARD_PREVIEW:statePass&&(r.previewCount||0)>0,
    FIRST_READER:firstReader||nativeStart,
    FIRST_FAILURE:cap.find(x=>/fail$/.test(x.phase||'')||x.phase==='product-add-fail')||nativeFail||logFail||null
  };
}

function pyramidSignals(r){
  const changeAt=Number(r.change?.at||0); const reads=r.nativeReads||[]; const firstRead=reads.find(x=>/call$/.test(x.phase||'')||x.phase==='blob-stream-call')||null;
  const notReadable=reads.some(x=>/(NotReadableError|could not be read|UPLOAD_FILE_CHANGED|ERR_UPLOAD_FILE_CHANGED)/i.test(String(x.error||'')))||(r.logcatEvidence||[]).some(x=>/(NotReadableError|could not be read|UPLOAD_FILE_CHANGED|ERR_UPLOAD_FILE_CHANGED)/i.test(x));
  const maxConcurrent=Math.max(0,...(r.readConcurrency||[]).map(x=>Number(x.activeReads||0)));
  const inputReset=(r.inputLifecycle||[]).some(x=>x.kind==='value-set'&&x.value==='');
  const inputDomChanged=(r.domMutations||[]).some(x=>/file-input-(removed|added)/.test(x.kind||''));
  const abortSeen=(r.aborts||[]).length>0;
  const lifecycleNear=(r.lifecycle||[]).filter(x=>changeAt&&Math.abs(Number(x.at||0)-changeAt)<=1200);
  const decodeBeforeRead=(r.decodeOps||[]).some(x=>!firstRead||Number(x.at||0)<=Number(firstRead.at||0));
  const objectUrlBeforeRead=(r.objectUrls||[]).some(x=>x.kind==='create'&&(!firstRead||Number(x.at||0)<=Number(firstRead.at||0)));
  const readDelayMs=changeAt&&firstRead?Number(firstRead.at)-changeAt:null;
  return{notReadable,inputReset,inputDomChanged,maxConcurrent,concurrentRead:maxConcurrent>1,readDelayMs,lifecycleNear,abortSeen,decodeBeforeRead,objectUrlBeforeRead,
    categoryEvidence:{
      C01_PROVIDER_URI:notReadable,
      C02_INPUT_DOM:inputReset||inputDomChanged,
      C03_CONCURRENT_READ:maxConcurrent>1,
      C04_PICKER_RETURN_TIMING:readDelayMs!==null?{readDelayMs,lifecycleNear}:null,
      C05_REACT_LIFECYCLE:inputDomChanged,
      C06_ABORT_RESIDUE:abortSeen,
      C07_CHROME_ANDROID_FILE:notReadable&&!inputReset&&!inputDomChanged&&maxConcurrent<=1&&!abortSeen,
      C08_PRE_READ_DECODE:decodeBeforeRead||objectUrlBeforeRead
    }};
}

function classifyStage(r){
  if(r.pass)return 'PASS';
  if((r.nativeReads||[]).some(x=>x.phase==='filereader-error'||x.phase==='filereader-abort'||x.phase==='filereader-throw')||(r.logcatEvidence||[]).some(x=>/(NotReadableError|ERR_UPLOAD_FILE_CHANGED|UPLOAD_FILE_CHANGED|file could not be read|net::ERR_)/i.test(x)))return 'PROVIDER_NATIVE_READ';
  if(/AUTO_MEDIA_CELL_NOT_FOUND|AUTO_MEDIA_SELECTION_NOT_CONFIRMED|AUTO_MEDIA_PICKER_NOT_ACTIVE|AUTO_MEDIA_UNSAFE_BOUNDS/.test(r.error||''))return 'AUTO_MEDIA_SELECTION';
  if(r.activationError||/UPLOAD_ACTIVATION|UPLOAD_BUTTON_NOT_FOUND|UPLOAD_TARGET|WRONG_TARGET|URL_GUARD|TARGET_PAGE/.test(r.error||''))return 'UPLOAD_ACTIVATION';
  if(r.commit?.mode==='picker-lost-before-selection-after-retries'||/PHOTO_PICKER_NOT_DETECTED/.test(r.error||''))return 'PICKER_OPEN';
  if(r.commit&&!r.commit.sawSelection)return 'PICKER_SELECTION';
  if(r.commit?.mode==='COMMIT_CONTROL_NOT_EXPOSED_AFTER_LIVE_RESCAN')return 'PICKER_COMMIT_UI';
  if(r.commit?.mode==='AUTO_COMMIT_TAPPED_PICKER_STILL_OPEN')return 'PICKER_COMMIT_ACTION';
  if(r.commit?.mode==='COMMIT_CONTROL_NOT_EXPOSED')return 'PICKER_COMMIT_UI';
  if(r.commit?.mode==='PICKER_CLOSED_NO_CHANGE'||/NO_FILE_CHANGE/.test(r.error||''))return 'PICKER_RESULT_RETURN';
  if(r.change&&!r.capturePass)return 'PROVIDER_READ';
  const cap=r.capture||[];
  if(cap.some(x=>x.phase==='product-limit-reject'||x.phase==='picker-prefilter-reject'))return 'PRODUCT_LIMIT';
  const insp=cap.find(x=>x.phase==='product-inspection-pass');
  if(insp?.aboveMaxPixels)return 'PIXEL_LIMIT_CANDIDATE';
  if(cap.some(x=>x.phase==='product-add-fail'))return 'FORMAT_OR_INSPECTION';
  if(r.capturePass&&(!r.newCards||!r.previewCount))return 'PREVIEW_OR_DOM';
  return 'UNKNOWN_WITH_EVIDENCE';
}
function firstDivergence(results){
  const passed=results.filter(r=>r.pass), failed=results.filter(r=>!r.pass);
  if(!failed.length)return 'NO_FAILURE_OBSERVED';
  if(!passed.length)return classifyStage(failed[0]);
  return classifyStage(failed[0]);
}


async function main(){
  log('=== TOOL001 REAL PHOTO HARNESS V36 FACTS-ONLY ===');log('[OUTPUT]',outDir);
  step('SELF-CHECK');const av=adb('version');if(av.status!==0)throw new Error('ADB_NOT_AVAILABLE');const devs=adbText('devices');if(!/\tdevice\b/.test(devs))throw new Error('ADB_DEVICE_NOT_READY');write('self-check.txt','SELF_CHECK=PASS\nMODE=REAL_USER_PHOTO_NO_SYNTHETIC_MEDIA\n\n');log('[PASS] SELF-CHECK');
  step('기기정보 수집');write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${adbText('shell','dumpsys','package','com.android.chrome').match(/versionName=([^\s]+)/)?.[1]||''}`].join('\n'));
  step('화면 유지/알림 방해 억제');suppressNotificationOverlays();adb('shell','settings','put','global','stay_on_while_plugged_in','3');adb('shell','svc','power','stayon','usb');adb('shell','input','keyevent','KEYCODE_WAKEUP');
  step('Playwright 실기기 탐색');const ds=await timed('Playwright Android device discovery',()=>android.devices(),45000);if(!ds.length)throw new Error('NO_ANDROID_DEVICE');const device=ds[0];
  step('실제 Chrome 실행');const context=await timed('launchBrowser(real Android Chrome)',()=>device.launchBrowser({}),60000);const page=await context.newPage();const pcl=[];page.on('console',m=>{pcl.push(`${m.type()} ${m.text()}`);write('page-console.log',pcl.join('\n'));});page.on('pageerror',e=>{pcl.push(`PAGEERROR ${e.stack||e.message}`);write('page-console.log',pcl.join('\n'));});
  step('진단 Observer 주입');await page.addInitScript(browserInit);
  step('TOOL001 접속');await timed('page.goto',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}),55000);await page.locator(selector).first().waitFor({state:'attached',timeout:30000});await ensureExpectedToolPage(page,0,'startup');await pcScreen('before.png');
  step('제품 안전제한/UI 동기화 확인');const limitText=await page.evaluate(()=>document.body?.innerText||'');const ui20=/20\s*MB/i.test(limitText),ui60=/60\s*MB/i.test(limitText);write('ui-limit-check.json',{uiHas20MB:ui20,uiHas60MB:ui60});log(`[LIMIT_UI] 20MB=${ui20} 60MB=${ui60}`);
  step('실기기 사용자흐름 검수 안내');log('');log('*** 검수기는 사용자 흐름만 자동 재현하고 사실만 기록합니다. ***');log('사용자 입력 없음: PHOTO_01 한 장을 연속 반복 선택하여 최초 read 직전 상태만 비교합니다.');log('');log('기본 20회 실제 사용자 흐름을 빠르게 재현하고 PASS군과 NotReadable FAIL군의 read 직전 상태 차이를 자동 비교합니다.');log('');
  const results=[];
  for(let i=0;i<labels.length;i++){
    const caseNo=i+1,label=labels[i],planEntry=plan[i];step(`실사진 CASE ${caseNo}/${labels.length} ${label}`);log('');log(`===== CASE ${caseNo}/${labels.length}: ${label} =====`);log(`[PREPARE] CASE ${caseNo}: Photo Picker를 실제로 연 뒤 선택 안내를 표시합니다.`);
    await ensureExpectedToolPage(page,caseNo,'case-start');await page.bringToFront();const before=await domSnapshot(page);const st0=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__))); adb('logcat','-c'); let result={case:caseNo,label,photo:planEntry.photo,repeat:planEntry.repeat,pass:false,error:null,before,commit:null};
    try{
      const commit=await timed(`CASE ${caseNo} harness positional photo flow`,()=>waitForSelectionAndCommit(caseNo,label,page,st0.changes.length,context),65000);result.commit=commit;result.activation=commit.activation||null;
      if(!commit.committed)throw new Error(`PHOTO_PICKER_COMMIT_FAILED:${commit.mode}`);
      const changeDeadline=Date.now()+8000;let change=null;while(Date.now()<changeDeadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));if(st.changes.length>st0.changes.length){change=st.changes.at(-1);break;}await sleep(250);}if(!change)throw new Error('NO_FILE_CHANGE_AFTER_VERIFIED_COMMIT');
      const r=await timed(`CASE ${caseNo} product capture + preview`,()=>waitProduct(page,st0.capture.length,(st0.nativeReads||[]).length,before,6500),7500);
      const capPass=r.capture.find(x=>x.phase==='picker-file-pass');const capFail=r.capture.find(x=>x.phase==='picker-file-fail'||x.phase==='capture-bytes-fail');const readers=r.capture.filter(x=>/^reader-/.test(x.phase||''));const sniff=r.capture.findLast?.(x=>x.phase==='capture-byte-signature')||r.capture.slice().reverse().find(x=>x.phase==='capture-byte-signature');const newCards=Math.max(0,r.after.cardCount-before.cardCount);const previewImgs=r.after.cards.flatMap(c=>c.imgs||[]).filter(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);const previewCount=previewImgs.length;const message=r.after.alerts.join(' | ');
      const inspection=r.capture.slice().reverse().find(x=>x.phase==='product-inspection-pass')||null;const providerReceived=r.capture.find(x=>x.phase==='picker-selection-received')||null;const productFail=r.capture.slice().reverse().find(x=>x.phase==='product-add-fail'||x.phase==='product-limit-reject'||x.phase==='picker-prefilter-reject')||null;
      const obsNow=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V36__)));
      const nativeReads=r.nativeReads||[]; const readPrestate=(obsNow.readPrestate||[]).slice((st0.readPrestate||[]).length); const inputLifecycle=(obsNow.inputLifecycle||[]).slice((st0.inputLifecycle||[]).length); const aborts=(obsNow.aborts||[]).slice((st0.aborts||[]).length); const decodeOps=(obsNow.decodeOps||[]).slice((st0.decodeOps||[]).length); const objectUrls=(obsNow.objectUrls||[]).slice((st0.objectUrls||[]).length); const readConcurrency=(obsNow.readConcurrency||[]).slice((st0.readConcurrency||[]).length); const domMutations=(obsNow.domMutations||[]).slice((st0.domMutations||[]).length); const lifecycle=(obsNow.lifecycle||[]).slice((st0.lifecycle||[]).length); const events=(obsNow.events||[]).slice((st0.events||[]).length);
      const rawLogcat=adbText('logcat','-d','-v','time');
      const logcatEvidence=rawLogcat.split(/\r?\n/).filter(x=>/(NotReadableError|ERR_UPLOAD_FILE_CHANGED|UPLOAD_FILE_CHANGED|file could not be read|net::ERR_|chromium|cr_File|FileReader)/i.test(x)).slice(-300);
      write(`case-${caseNo}-${label}-native-reads.json`,nativeReads); write(`case-${caseNo}-${label}-read-prestate.json`,readPrestate); write(`case-${caseNo}-${label}-root-cause-telemetry.json`,{readPrestate,inputLifecycle,aborts,decodeOps,objectUrls,readConcurrency,domMutations,lifecycle,events});
      write(`case-${caseNo}-${label}-logcat-evidence.txt`,logcatEvidence.join('\n'));
      const userPass=newCards>0&&previewCount>0;
      result={...result,change,capture:r.capture,nativeReads,readPrestate,inputLifecycle,aborts,decodeOps,objectUrls,readConcurrency,domMutations,lifecycle,events,logcatEvidence,readerTimeline:readers,byteSignature:sniff||null,inspection,providerReceived,productFail,after:r.after,capturePass:!!capPass,captureFail:capFail||null,newCards,previewCount,previewDims:previewImgs.map(x=>[x.naturalWidth,x.naturalHeight]),uiMessage:message,pass:userPass};
      log(`[${result.pass?'PASS':'FAIL'}] ${label} file=${change?.files?.[0]?.name||''} type=${change?.files?.[0]?.type||''} size=${change?.files?.[0]?.size||''} capture=${result.capturePass?'PASS':'FAIL'} card+${newCards} preview=${previewCount}`);
      result.checkpoints=checkpointSummary(result); result.pyramid=pyramidSignals(result); log(`[CHECKPOINT] ${label} CHANGE=${result.checkpoints.CHANGE_HANDLER_ENTER?'PASS':'FAIL'} FILE=${result.checkpoints.FILE_ACQUIRED?'PASS':'FAIL'} READ_START=${result.checkpoints.READ_START?'PASS':'FAIL'} SNAPSHOT=${result.checkpoints.SNAPSHOT_SUCCESS?'PASS':'FAIL'} STATE_PREVIEW=${result.checkpoints.PRODUCT_STATE_CARD_PREVIEW?'PASS':'FAIL'}`);
    }catch(e){result.error=String(e?.message||e);log(`[FAIL] ${label} ${result.error}`);await collectFailureEvidence(caseNo,label,page,result.error);}
    results.push(result);write(`case-${caseNo}-${label}.json`,result);await page.screenshot({path:path.join(outDir,`case-${caseNo}-${label}-page.png`),fullPage:true}).catch(()=>{});await pcScreen(`case-${caseNo}-${label}-device.png`);
    if(i<labels.length-1){await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.locator(selector).first().waitFor({state:'attached',timeout:30000});await ensureExpectedToolPage(page,caseNo,'between-cases');}
  }
  step('검수 사실기록 생성');
  const isNR=r=>!!(r.nativeReads||[]).find(x=>/(NotReadableError|could not be read)/i.test(String(x.error||'')));
  const firstPre=r=>(r.readPrestate||[])[0]||null;
  const compact=r=>{const p=firstPre(r);return {repeat:r.repeat,pass:r.pass,notReadable:isNR(r),error:r.error||'',readKind:p?.kind||'',msSinceChange:p?.msSinceChange??null,activeReadsBefore:p?.activeReadsBefore??null,inputConnected:p?.inputConnected??null,inputFileCount:p?.inputFileCount??null,visibility:p?.visibility||'',focus:p?.focus??null,lastLifecycleKind:p?.lastLifecycleKind||'',msSinceLastLifecycle:p?.msSinceLastLifecycle??null,priorNativeReadCount:p?.priorNativeReadCount??null,priorAbortCount:p?.priorAbortCount??null,priorDecodeCount:p?.priorDecodeCount??null,priorObjectUrlCount:p?.priorObjectUrlCount??null,priorInputLifecycleCount:p?.priorInputLifecycleCount??null,priorDomMutationCount:p?.priorDomMutationCount??null};};
  const rows=results.map(compact); const passRows=rows.filter(x=>x.pass); const failRows=rows.filter(x=>!x.pass&&x.notReadable); const harnessRows=rows.filter(x=>/HARNESS_/.test(x.error||''));
  const fields=['readKind','activeReadsBefore','inputConnected','inputFileCount','visibility','focus','lastLifecycleKind','priorNativeReadCount','priorAbortCount','priorDecodeCount','priorObjectUrlCount','priorInputLifecycleCount','priorDomMutationCount'];
  const dist=(arr,k)=>{const m={};for(const x of arr){const v=String(x[k]);m[v]=(m[v]||0)+1;}return m;};
  const differences=fields.map(k=>({field:k,pass:dist(passRows,k),notReadableFail:dist(failRows,k)}));
  const avg=(arr,k)=>{const xs=arr.map(x=>x[k]).filter(v=>typeof v==='number'&&Number.isFinite(v));return xs.length?Number((xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(2)):null;};
  const timing={passMsSinceChangeAvg:avg(passRows,'msSinceChange'),failMsSinceChangeAvg:avg(failRows,'msSinceChange'),passMsSinceLifecycleAvg:avg(passRows,'msSinceLastLifecycle'),failMsSinceLifecycleAvg:avg(failRows,'msSinceLastLifecycle')};
  write('read-prestate-rows.json',rows);write('read-prestate-comparison.json',{version:'V36',total:results.length,pass:passRows.length,notReadableFail:failRows.length,harness:harnessRows.length,timing,differences,rows});
  const txt=['TOOL001 NOTREADABLE READ-PRESTATE V36',`PHOTO=PHOTO_01`,`TOTAL=${results.length} PASS=${passRows.length} NOTREADABLE_FAIL=${failRows.length} HARNESS=${harnessRows.length}`,'',`TIMING=${JSON.stringify(timing)}`,'','FIELD COMPARISON'];for(const d of differences)txt.push(`${d.field} | PASS=${JSON.stringify(d.pass)} | NOTREADABLE_FAIL=${JSON.stringify(d.notReadableFail)}`);txt.push('','ROWS');for(const x of rows)txt.push(`R${String(x.repeat).padStart(2,'0')} ${x.pass?'PASS':x.notReadable?'NOTREADABLE_FAIL':'OTHER_FAIL'} kind=${x.readKind} change=${x.msSinceChange}ms active=${x.activeReadsBefore} input=${x.inputConnected}/${x.inputFileCount} vis=${x.visibility} focus=${x.focus} life=${x.lastLifecycleKind}:${x.msSinceLastLifecycle}ms priorRead=${x.priorNativeReadCount} abort=${x.priorAbortCount} decode=${x.priorDecodeCount} objurl=${x.priorObjectUrlCount} inputLife=${x.priorInputLifecycleCount} domMut=${x.priorDomMutationCount}`);write('read-prestate-comparison.txt',txt.join('\n'));
  write('summary.txt',txt.join('\n'));
  write('result.json',{version:'V36',mode:'NOTREADABLE_READ_PRESTATE_SAME_PHOTO',url,repeats:REPEATS,generatedAt:new Date().toISOString(),results});
  step('최종 사실표');
  const allPass=results.filter(r=>!String(r.error||'').startsWith('HARNESS_')).every(r=>r.pass);
  write('verdict.json',{allFlowPass:allPass,firstDivergence:firstDivergence(results),passCount:passRows.length,notReadableFailCount:failRows.length,harnessCount:harnessRows.length,timing,differences});
  log('=== READ PRESTATE COMPARISON ===');log(`PASS=${passRows.length} NOTREADABLE_FAIL=${failRows.length} HARNESS=${harnessRows.length}`);log(`TIMING ${JSON.stringify(timing)}`);for(const d of differences)log(`${d.field}: PASS=${JSON.stringify(d.pass)} FAIL=${JSON.stringify(d.notReadableFail)}`);
  step('결과 ZIP 생성');restoreNotificationOverlays();await context.close().catch(()=>{});if(typeof device.close==='function')await device.close().catch(()=>{});adb('shell','svc','power','stayon','false');const zip=path.join(desktop,`${path.basename(outDir)}.zip`);const pr=spawnSync('powershell.exe',['-NoProfile','-Command',`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`],{encoding:'utf8',shell:false});if(pr.status!==0)log('[WARN] ZIP creation failed',pr.stderr||pr.stdout||'');else log('[PASS] RESULT ZIP',zip);log('=== FINAL SUMMARY ===');for(const r of results)log(`${r.label}: ${r.pass?'PASS':'FAIL'} size=${r.change?.files?.[0]?.size??''} type=${r.change?.files?.[0]?.type??''} capture=${r.capturePass?'PASS':'FAIL'} preview=${r.previewCount??0} error=${r.error||''}`);log(`REPEAT_RESULT=PASS:${results.filter(r=>r.pass).length} FAIL:${results.filter(r=>!r.pass).length}`);log(`FIRST_DIVERGENCE=${firstDivergence(results)}`);log(`FINAL_HARNESS_FLOW=${allPass?'PASS':'MIXED_OR_FAIL'}`);log('READ_PRESTATE_COMPARISON=read-prestate-comparison.txt');
}
main().catch(async e=>{restoreNotificationOverlays();log('[FATAL]',e?.stack||String(e));try{await pcScreen('fatal-device.png');}catch{}process.exitCode=1;});
