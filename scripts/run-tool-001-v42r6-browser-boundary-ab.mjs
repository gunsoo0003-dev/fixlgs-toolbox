#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { _android as android, chromium } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);const url=String(args.url||'');if(!url){console.error('ERROR: --url is required');process.exit(2);}const repeats=Math.max(1,Number(args.repeats||7));
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);const outDir=path.join(desktop,`TOOLBOX_001_V42_BROWSER_BOUNDARY_AB_REAL_DEVICE_${stamp}`);fs.mkdirSync(outDir,{recursive:true});
const logs=[];function log(...p){const s=p.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');console.log(s);logs.push(s);fs.writeFileSync(path.join(outDir,'runner.log'),logs.join('\n'));}function write(n,d){fs.writeFileSync(path.join(outDir,n),typeof d==='string'?d:JSON.stringify(d,null,2));}
function adb(...a){return spawnSync('adb',a,{encoding:'utf8',shell:false,maxBuffer:64*1024*1024});}function adbText(...a){const r=adb(...a);return `${r.stdout||''}${r.stderr||''}`;}const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function screen(name){const r=spawnSync('adb',['exec-out','screencap','-p'],{encoding:null,maxBuffer:64*1024*1024});if(r.status===0&&r.stdout?.length)fs.writeFileSync(path.join(outDir,name),r.stdout);}
function xmlDecode(v=''){return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function parseBounds(bounds=''){const m=String(bounds).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);if(!m)return null;const left=+m[1],top=+m[2],right=+m[3],bottom=+m[4];return{left,top,right,bottom,w:right-left,h:bottom-top,x:Math.floor((left+right)/2),y:Math.floor((top+bottom)/2)};}
function dumpUi(){const remote='/sdcard/tool001-v42-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function foregroundPackage(){const t=adbText('shell','dumpsys','activity','activities');const m=t.match(/(?:topResumedActivity|mResumedActivity)[^{}]*\{[^}]*\s([a-zA-Z0-9_.]+)\//);return m?.[1]||'';}
function installedPackages(){return new Set(adbText('shell','pm','list','packages').split(/\r?\n/).map(x=>x.replace(/^package:/,'').trim()).filter(Boolean));}
const BROWSERS=[
 {id:'CHROME',pkg:'com.android.chrome',label:'Chrome'},
 {id:'SAMSUNG',pkg:'com.sec.android.app.sbrowser',label:'Samsung Internet'},
 {id:'EDGE',pkg:'com.microsoft.emmx',label:'Microsoft Edge'},
 {id:'BRAVE',pkg:'com.brave.browser',label:'Brave'},
 {id:'FIREFOX',pkg:'org.mozilla.firefox',label:'Firefox'}
];
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function launchBrowser(pkg){adb('shell','am','force-stop',pkg);sleep(200);const r=adb('shell','am','start','-a','android.intent.action.VIEW','-d',url,'-p',pkg);return r.status===0;}
function pickerOpen(xml){const ps=[...new Set(parseUiNodes(xml).map(n=>n.package).filter(Boolean))];return ps.some(p=>/photopicker|documentsui|myfiles|filepicker/i.test(p));}
function screenSize(){const t=adbText('shell','wm','size');const m=t.match(/(?:Physical|Override) size:\s*(\d+)x(\d+)/i)||t.match(/(\d+)x(\d+)/);return m?{w:+m[1],h:+m[2]}:{w:1080,h:2400};}
function mediaCandidates(xml){
  const nodes=parseUiNodes(xml),out=[];
  for(const n of nodes){
    const b=parseBounds(n.bounds),pkg=String(n.package||''),h=hay(n),cls=String(n.class||'');
    if(!b||pkg!=='com.google.android.photopicker')continue;
    const blocked=/(드래그 핸들|drag handle|더보기|more|컬렉션|collection|완료|done|추가|add|취소|cancel)/i.test(h);
    const mediaLike=/(촬영한 사진|촬영한 동영상|photo|video|image|사진|동영상)/i.test(h);
    if(n.clickable==='true'&&b.top>=900&&b.bottom<=2400&&b.w>=300&&b.w<=420&&b.h>=300&&b.h<=420&&!blocked&&mediaLike){
      out.push({n,b,h,pkg,cls});
    }
  }
  out.sort((a,b)=>a.b.top-b.b.top||a.b.left-b.b.left);
  return out;
}
function commitControls(xml){
  const nodes=parseUiNodes(xml),out=[];
  for(const n of nodes){
    const b=parseBounds(n.bounds); if(!b||n.package!=='com.google.android.photopicker'||n.clickable!=='true')continue;
    const label=(n.text||n['content-desc']||'').trim();
    if(/^(완료|추가|열기|확인|done|add|open|choose|use)$/i.test(label)&&b.top>900)out.push({b,label});
  }
  out.sort((a,b)=>b.b.top-a.b.top||b.b.left-a.b.left); return out;
}
async function legacyWaitStablePickerOpen(caseNo,timeoutMs=6500){
  const started=Date.now();let consecutive=0,last='';const history=[];
  while(Date.now()-started<timeoutMs){
    last=dumpUi();const detected=pickerOpen(last);
    history.push({at:Date.now(),detected,consecutive});
    if(detected)consecutive++;else consecutive=0;
    if(consecutive>=3){
      write(`case-${caseNo}-stable-picker-history.json`,history);
      write(`case-${caseNo}-stable-picker.xml`,last);
      await screen(`case-${caseNo}-stable-picker.png`);
      return last;
    }
    await sleep(250);
  }
  write(`case-${caseNo}-picker-open-history.json`,history);
  if(last)write(`case-${caseNo}-picker-last.xml`,last);
  throw new Error('HARNESS_FAIL:PICKER_NOT_STABLE');
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
  const stable=await waitStablePickerOpen(caseNo,'v39-source-exact',6500);
  if(!stable)throw new Error('HARNESS_FAIL:PICKER_NOT_STABLE');
  return autoSelectPickerMediaV38(caseNo,'PHOTO_01',1,null);
}
function findUploadControl(xml,browserPkg){
  const nodes=parseUiNodes(xml); const strong=/(이미지 선택|이미지 추가|파일 선택|파일 추가|choose images?|choose files?|select images?|select files?|add images?|add files?|画像を選択|画像を追加)/i; const c=[];
  for(const n of nodes){const b=parseBounds(n.bounds),h=hay(n),pkg=String(n.package||'');if(!b||b.top<120)continue;if(pkg&&pkg!==browserPkg)continue;if(!strong.test(h))continue;c.push({n,b,h,score:(n.clickable==='true'?30:0)+(b.w>180?10:0)});}c.sort((a,b)=>b.score-a.score||a.b.top-b.b.top);return c;
}
async function openUploadPickerUi(browserPkg,caseNo,xml){
  const controls=findUploadControl(xml,browserPkg); write(`case-${caseNo}-upload-controls.json`,controls.map(c=>({bounds:c.n.bounds,text:c.h,clickable:c.n.clickable,score:c.score})));
  if(!controls.length)throw new Error('HARNESS_FAIL:UPLOAD_CONTROL_NOT_FOUND');
  const c=controls[0]; adb('shell','input','tap',String(c.b.x),String(c.b.y)); log(`[UPLOAD TAP] ${caseNo}: exactly once at ${c.n.bounds}`);
  await waitPicker(3500); return{x:c.b.x,y:c.b.y,source:'PRIMARY_UPLOAD_CONTROL_ONLY',text:c.h,try:1};
}
async function waitBrowserPage(pkg,timeout=15000){const dl=Date.now()+timeout;while(Date.now()<dl){const x=dumpUi();const nodes=parseUiNodes(x);if(nodes.some(n=>n.package===pkg&&/(이미지 선택|이미지 추가|choose image|select image|画像を選択)/i.test(hay(n))))return x;await sleep(400);}return dumpUi();}
function successSignals(xml,fileHint=''){const nodes=parseUiNodes(xml);const text=nodes.map(hay).join('\n');const imageNodes=nodes.filter(n=>/ImageView|android\.widget\.Image|image/i.test(`${n.class||''} ${n['resource-id']||''}`));const filenameSeen=fileHint?text.toLowerCase().includes(String(fileHint).toLowerCase().split(/\s+/)[0]):/100000\d+\.(?:jpe?g|png|webp)/i.test(text);const cardLike=/변환|convert|삭제|remove|품질|quality/i.test(text)&&filenameSeen;return{filenameSeen,cardLike,imageNodeCount:imageNodes.length,textSample:text.slice(0,3000)};}
function logcatEvidence(){return adbText('logcat','-d','-v','time').split(/\r?\n/).filter(x=>/(NotReadableError|ERR_UPLOAD_FILE_CHANGED|UPLOAD_FILE_CHANGED|file could not be read|net::ERR_|FileReader|showOpenFilePicker)/i.test(x)).slice(-300);}

async function getJson(url,timeoutMs=1800){
  const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),timeoutMs);
  try{const r=await fetch(url,{signal:ac.signal});if(!r.ok)throw new Error(`HTTP_${r.status}`);return await r.json();}
  finally{clearTimeout(timer);}
}
function devtoolsSockets(){
  return [...new Set(adbText('shell','cat','/proc/net/unix').split(/\r?\n/).map(x=>x.trim()).filter(x=>/devtools_remote/i.test(x)).map(x=>x.split(/\s+/).at(-1)||'').map(x=>x.replace(/^@/,'')).filter(Boolean))];
}
async function connectSamsungCdp(browser,caseNo='SAMSUNG-CDP'){
  const port=9333;adb('forward','--remove',`tcp:${port}`);
  const deadline=Date.now()+12000;let lastSockets=[];let lastErr='';
  while(Date.now()<deadline){
    lastSockets=devtoolsSockets();write(`case-${caseNo}-devtools-sockets.json`,lastSockets);
    for(const socket of lastSockets){
      adb('forward','--remove',`tcp:${port}`);
      const fr=adb('forward',`tcp:${port}`,`localabstract:${socket}`);if(fr.status!==0)continue;
      try{
        const targets=await getJson(`http://127.0.0.1:${port}/json/list`,1400);
        write(`case-${caseNo}-cdp-targets-${socket.replace(/[^a-zA-Z0-9_.-]+/g,'_')}.json`,targets);
        const hasTarget=Array.isArray(targets)&&targets.some(t=>String(t?.url||'').includes('toolbox.fixlgs.com'));
        if(!hasTarget)continue;
        const cdpBrowser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        const pages=cdpBrowser.contexts().flatMap(c=>c.pages());
        const page=pages.find(p=>p.url().includes('toolbox.fixlgs.com'))||pages[0];
        if(!page){await cdpBrowser.close().catch(()=>{});continue;}
        log(`[SAMSUNG CDP] socket=${socket} page=${page.url()}`);
        return{browser:cdpBrowser,page,socket,port};
      }catch(e){lastErr=String(e?.message||e);}
    }
    await sleep(350);
  }
  throw new Error(`HARNESS_FAIL:SAMSUNG_CDP_NOT_FOUND sockets=${lastSockets.join(',')} last=${lastErr}`);
}
async function runSamsungPrecision(browser){
  const results=[];
  adb('shell','am','force-stop','com.android.chrome');
  launchBrowser(browser.pkg);await sleep(2600);
  let conn=await connectSamsungCdp(browser,'SAMSUNG-INIT');
  let page=conn.page;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  for(let r=1;r<=repeats;r++){
    const caseNo=`SAMSUNG-${r}`;log(`===== Samsung Internet PRECISION ROUND ${r}/${repeats} =====`);adb('logcat','-c');
    const row={browser:'SAMSUNG',round:r,pass:false,error:'',notReadable:0,preview:false,cdpSocket:conn.socket};
    try{
      const before=await page.evaluate(()=>({cards:document.querySelectorAll('[data-testid="converter-file-card"]').length}));
      const btn=page.locator('button[data-testid="converter-upload-button"],button').filter({hasText:/이미지 선택|이미지 추가|Choose images|Select image/i}).first();
      await btn.click({timeout:5000,noWaitAfter:true});
      row.selected=await selectPhoto01(caseNo);
      const dl=Date.now()+8500;
      while(Date.now()<dl){
        const state=await page.evaluate((bc)=>{const cards=[...document.querySelectorAll('[data-testid="converter-file-card"]')];const added=cards.length>bc;const preview=cards.some(c=>[...c.querySelectorAll('img')].some(i=>i.complete&&i.naturalWidth>0&&i.naturalHeight>0&&i.clientWidth>0&&i.clientHeight>0));return{added,preview};},before.cards);
        if(state.added&&state.preview){row.pass=true;row.preview=true;break;}
        await sleep(200);
      }
      const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;
      if(row.notReadable>0&&!row.pass)row.error='NOTREADABLE';
    }catch(e){row.error=String(e?.message||e);const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;}
    write(`case-${caseNo}.json`,row);write(`case-${caseNo}-logcat.txt`,(row.logcat||[]).join('\n'));await screen(`case-${caseNo}-device.png`);
    log(`[${row.pass?'PASS':'FAIL'}] Samsung Internet R${r} NR=${row.notReadable} preview=${row.preview} error=${row.error||'-'}`);results.push(row);
    if(r<repeats){try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await sleep(300);}catch{await conn.browser.close().catch(()=>{});launchBrowser(browser.pkg);await sleep(2200);conn=await connectSamsungCdp(browser,`SAMSUNG-RECONNECT-${r}`);page=conn.page;await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}}
  }
  await conn.browser.close().catch(()=>{});adb('forward','--remove',`tcp:${conn.port}`);return results;
}

async function runUiBrowser(browser){const results=[];for(let r=1;r<=repeats;r++){const caseNo=`${browser.id}-${r}`;log(`===== ${browser.label} UI ROUND ${r}/${repeats} =====`);adb('logcat','-c');launchBrowser(browser.pkg);await sleep(2200);let xml=await waitBrowserPage(browser.pkg,12000);write(`case-${caseNo}-before.xml`,xml);const row={browser:browser.id,round:r,pass:false,error:'',notReadable:0,signal:null};try{row.uploadEntry=await openUploadPickerUi(browser.pkg,caseNo,xml);const sel=await selectPhoto01(caseNo);row.selected=sel;await sleep(1800);xml=dumpUi();row.signal=successSignals(xml,sel.candidateText);const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;row.pass=row.signal.filenameSeen&&row.signal.imageNodeCount>0&&!row.notReadable;}catch(e){row.error=String(e?.message||e);const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;}write(`case-${caseNo}.json`,row);write(`case-${caseNo}-logcat.txt`,(row.logcat||[]).join('\n'));await screen(`case-${caseNo}-device.png`);log(`[${row.pass?'PASS':'FAIL'}] ${browser.label} R${r} NR=${row.notReadable} file=${row.signal?.filenameSeen||false} imageNodes=${row.signal?.imageNodeCount||0} error=${row.error||'-'}`);results.push(row);await sleep(350);}return results;}

// Chrome precision path: use the product page through Playwright but do not inject extra file reads.
async function runChromePrecision(browser){const results=[];const ds=await android.devices();if(!ds.length)throw new Error('PLAYWRIGHT_ANDROID_DEVICE_NOT_FOUND');const device=ds[0];const context=await device.launchBrowser({});const page=await context.newPage();await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});for(let r=1;r<=repeats;r++){const caseNo=`CHROME-${r}`;log(`===== Chrome PRECISION ROUND ${r}/${repeats} =====`);adb('logcat','-c');const before=await page.evaluate(()=>({cards:document.querySelectorAll('[data-testid="converter-file-card"]').length}));const row={browser:'CHROME',round:r,pass:false,error:'',notReadable:0,preview:false};try{const btn=page.locator('button[data-testid="converter-upload-button"],button').filter({hasText:/이미지 선택|이미지 추가|Choose images|Select image/i}).first();await btn.click({timeout:5000,noWaitAfter:true});await selectPhoto01(caseNo);const dl=Date.now()+8500;while(Date.now()<dl){const s=await page.evaluate((bc)=>{const cards=[...document.querySelectorAll('[data-testid="converter-file-card"]')];const added=cards.length>bc;const preview=cards.some(c=>[...c.querySelectorAll('img')].some(i=>i.complete&&i.naturalWidth>0&&i.naturalHeight>0&&i.clientWidth>0&&i.clientHeight>0));return{added,preview};},before.cards);if(s.added&&s.preview){row.pass=true;row.preview=true;break;}await sleep(200);}const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;if(row.notReadable>0&&!row.pass)row.error='NOTREADABLE';}catch(e){row.error=String(e?.message||e);const ev=logcatEvidence();row.logcat=ev;row.notReadable=ev.filter(x=>/NotReadableError|could not be read|ERR_UPLOAD_FILE_CHANGED/i.test(x)).length;}write(`case-${caseNo}.json`,row);write(`case-${caseNo}-logcat.txt`,(row.logcat||[]).join('\n'));await screen(`case-${caseNo}-device.png`);log(`[${row.pass?'PASS':'FAIL'}] Chrome R${r} NR=${row.notReadable} preview=${row.preview} error=${row.error||'-'}`);results.push(row);if(r<repeats){await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await sleep(300);}}
await context.close().catch(()=>{});if(typeof device.close==='function')await device.close().catch(()=>{});return results;}

async function main(){log('=== TOOL001 V42 BROWSER BOUNDARY A/B ===');if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');const pkgs=installedPackages();const installed=BROWSERS.filter(b=>pkgs.has(b.pkg));write('browser-discovery.json',installed.map(b=>({...b,version:browserVersion(b.pkg)})));log('[BROWSERS]',installed.map(b=>`${b.label}:${browserVersion(b.pkg)}`).join(', '));const chrome=installed.find(b=>b.id==='CHROME');if(!chrome)throw new Error('CHROME_NOT_INSTALLED');const alternate=installed.find(b=>b.id==='SAMSUNG')||installed.find(b=>b.id!=='CHROME');if(!alternate){write('v42-browser-boundary-summary.txt','RESULT=SECOND_BROWSER_NOT_INSTALLED\nChrome comparison cannot isolate browser-vs-Android boundary.\n');throw new Error('SECOND_BROWSER_NOT_INSTALLED');}
write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${browserVersion(chrome.pkg)}`,`alternate=${alternate.label}`,`alternateVersion=${browserVersion(alternate.pkg)}`].join('\n'));
const chromeRows=await runChromePrecision(chrome);const altRows=alternate.id==='SAMSUNG'?await runSamsungPrecision(alternate):await runUiBrowser(alternate);const sum=(rows)=>{const harness=rows.filter(x=>/^HARNESS_/i.test(String(x.error||''))).length;const validRows=rows.filter(x=>!/^HARNESS_/i.test(String(x.error||'')));return{total:rows.length,valid:validRows.length,harnessFail:harness,pass:validRows.filter(x=>x.pass).length,fail:validRows.filter(x=>!x.pass).length,notReadable:validRows.reduce((a,x)=>a+(x.notReadable||0),0)};};const cs=sum(chromeRows),as=sum(altRows);let interpretation='INCONCLUSIVE';if(as.valid===0)interpretation='HARNESS_ONLY_NO_PRODUCT_RESULT';else if(cs.valid>0&&cs.pass<cs.valid&&as.pass===as.valid)interpretation='CHROME_SPECIFIC_STRONGLY_SUSPECTED';else if(cs.valid>0&&cs.pass<cs.valid&&as.pass<as.valid)interpretation='ANDROID_PROVIDER_OR_SHARED_PLATFORM_BOUNDARY_STRONGLY_SUSPECTED';else if(cs.valid>0&&cs.pass===cs.valid&&as.pass<as.valid)interpretation='ALTERNATE_BROWSER_SPECIFIC';else if(cs.valid>0&&cs.pass===cs.valid&&as.pass===as.valid)interpretation='NO_FAILURE_REPRODUCED_THIS_RUN';const txt=[`TOOL001 V42 BROWSER BOUNDARY A/B`,`URL=${url}`,`REPEATS=${repeats}`,`PRIMARY=Chrome ${browserVersion(chrome.pkg)}`,`ALTERNATE=${alternate.label} ${browserVersion(alternate.pkg)}`,'',`CHROME VALID=${cs.valid}/${cs.total} PASS=${cs.pass}/${cs.valid} FAIL=${cs.fail} HARNESS_FAIL=${cs.harnessFail} NOTREADABLE=${cs.notReadable}`,`${alternate.id} VALID=${as.valid}/${as.total} PASS=${as.pass}/${as.valid} FAIL=${as.fail} HARNESS_FAIL=${as.harnessFail} NOTREADABLE=${as.notReadable}`,'',`INTERPRETATION=${interpretation}`,'',`RULE_1=Chrome fails + alternate all-pass => Chrome-specific path suspected`,`RULE_2=Both fail randomly => Android/provider/shared file-access boundary suspected`,`RULE_3=Harness never retries upload/photo coordinates. One round = one upload tap + one PHOTO01 tap + at most one commit tap.`,`RULE_4=User-visible preview is ground truth; HARNESS_FAIL is never product FAIL.`];write('v42-browser-boundary-summary.txt',txt.join('\n'));write('result.json',{version:'V42R6-BROWSER-BOUNDARY-AB-SAMSUNG-CDP-V39-SOURCE-EXACT',chrome:cs,alternate:{browser:alternate,...as},interpretation,chromeRows,altRows});log(txt.join('\n'));
const zip=path.join(desktop,`${path.basename(outDir)}.zip`);const pr=spawnSync('powershell.exe',['-NoProfile','-Command',`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`],{encoding:'utf8'});if(pr.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] ZIP failed',pr.stderr||pr.stdout||'');}
main().catch(async e=>{log('[FATAL]',e?.stack||String(e));try{await screen('fatal-device.png');}catch{}process.exitCode=1;});
