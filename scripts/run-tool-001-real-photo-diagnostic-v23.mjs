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
const labels=String(args.cases||'GOOD_1,BAD_1,GOOD_2,BAD_2').split(',').map(x=>x.trim()).filter(Boolean);
const selector='[data-testid="converter-file-input"], input[type=file]';
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_REAL_PHOTO_V23_${stamp}`);fs.mkdirSync(outDir,{recursive:true});
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

function xmlDecode(v=''){return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
function parseBounds(bounds=''){const m=String(bounds).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);if(!m)return null;const left=Number(m[1]),top=Number(m[2]),right=Number(m[3]),bottom=Number(m[4]);return{left,top,right,bottom,w:right-left,h:bottom-top,x:Math.floor((left+right)/2),y:Math.floor((top+bottom)/2)};}
function dumpUi(){const remote='/sdcard/tool001-v23-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function nodeHay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function parseUiTree(xml){const tokens=String(xml||'').match(/<node\s+[^>]*>|<\/node>/g)||[];const root={attrs:{},children:[]};const stack=[root];for(const tok of tokens){if(tok.startsWith('</node')){if(stack.length>1)stack.pop();continue;}const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(tok)))attrs[a[1]]=xmlDecode(a[2]);const node={attrs,children:[]};stack[stack.length-1].children.push(node);if(!tok.endsWith('/>'))stack.push(node);}return root;}
function descendantText(node){const parts=[];const walk=n=>{if(n?.attrs){if(n.attrs.text)parts.push(n.attrs.text);if(n.attrs['content-desc'])parts.push(n.attrs['content-desc']);if(n.attrs['resource-id'])parts.push(n.attrs['resource-id']);}for(const c of n?.children||[])walk(c);};walk(node);return parts.join(' ');}
function pickerSelectionSignals(xml){const nodes=parseUiNodes(xml);const selectedNodes=nodes.filter(n=>n.checked==='true'||n.selected==='true'||/(선택됨|selected|1개 선택|1 selected|체크됨|checked)/i.test(nodeHay(n)));return{selectedNodes};}
function photoPickerActionControls(xml){const tree=parseUiTree(xml);const out=[];const positiveExact=/^(완료|추가|열기|확인|done|add|open|choose|use|選択|完了|追加|開く)$/i;const negative=/(전체 선택 해제|선택 해제|deselect|unselect|미리보기|preview|취소|cancel|닫기|close|선택됨|selected|사진 또는 동영상 .*개 선택)/i;const walk=n=>{const a=n.attrs||{};const b=parseBounds(a.bounds);const label=descendantText(n).trim().replace(/\s+/g,' ');if(a.package==='com.google.android.photopicker'&&a.clickable==='true'&&b&&b.w>=90&&b.h>=60&&b.top>=1200&&!negative.test(label)){const tokens=label.split(/\s+/).filter(Boolean);const exact=tokens.find(t=>positiveExact.test(t));if(exact)out.push({node:n,attrs:a,bounds:b,label,exact});}for(const c of n.children||[])walk(c);};walk(tree);out.sort((a,b)=>(b.bounds.top-a.bounds.top)||(b.bounds.left-a.bounds.left));return out;}
function pickerDetectedFromXml(xml){const nodes=parseUiNodes(xml);const packages=[...new Set(nodes.map(n=>n.package).filter(Boolean))];const text=nodes.map(nodeHay).join('\n');return packages.some(p=>/(photopicker|documentsui|myfiles|providers\.media|filepicker|picker)/i.test(p))||(/(최근|recent|사진|photo|images|이미지|완료|done|추가|add)/i.test(text)&&!packages.every(p=>/chrome/i.test(p)));}
async function pickerStillOpen(){try{return pickerDetectedFromXml(dumpUi());}catch{return false;}}
async function pickerClosedStable(page,timeoutMs=6500){const started=Date.now();let consecutive=0;while(Date.now()-started<timeoutMs){await sleep(250);const open=await pickerStillOpen();let ping=true;try{await page.evaluate(()=>location.href);}catch{ping=false;}if(!open&&ping)consecutive++;else consecutive=0;if(consecutive>=3)return true;}return false;}
async function waitForPicker(timeoutMs=15000){const started=Date.now();let last='';while(Date.now()-started<timeoutMs){last=dumpUi();if(pickerDetectedFromXml(last))return last;await sleep(350);}write(`picker-not-detected-${Date.now()}.xml`,last);throw new Error('PHOTO_PICKER_NOT_DETECTED');}
async function autoCommitManualSelection(caseNo,page,startChange){const deadline=Date.now()+90000;let sawSelection=false;let commitTaps=0;let lastXml='';while(Date.now()<deadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st.changes.length>startChange)return{committed:true,mode:'picker-auto-close-change',sawSelection,commitTaps};let open=false;try{lastXml=dumpUi();open=pickerDetectedFromXml(lastXml);}catch{}if(!open){await sleep(250);const st2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st2.changes.length>startChange)return{committed:true,mode:'picker-closed-change',sawSelection,commitTaps};await sleep(500);continue;}const sig=pickerSelectionSignals(lastXml);if(sig.selectedNodes.length){sawSelection=true;write(`case-${caseNo}-selection-observed.xml`,lastXml);const actions=photoPickerActionControls(lastXml);write(`case-${caseNo}-commit-controls.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));if(actions.length){for(const action of actions){const b=action.bounds;adb('shell','input','tap',String(b.x),String(b.y));commitTaps++;log(`[PHOTO_PICKER] case ${caseNo}: auto commit "${action.exact}" at ${b.x},${b.y}`);await pcScreen(`case-${caseNo}-after-auto-commit-${commitTaps}.png`);if(await pickerClosedStable(page,7000)){const st3=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st3.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit',sawSelection:true,commitTaps,action:action.exact};await sleep(1500);const st4=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st4.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit-delayed-change',sawSelection:true,commitTaps,action:action.exact};return{committed:false,mode:'picker-closed-no-change',sawSelection:true,commitTaps,action:action.exact};}}}}
await sleep(300);}write(`case-${caseNo}-commit-timeout.xml`,lastXml);await pcScreen(`case-${caseNo}-commit-timeout-device.png`);return{committed:false,mode:sawSelection?'selection-seen-but-commit-timeout':'no-selection-observed',sawSelection,commitTaps};}

function browserInit(){
  const KEY='__TOOL001_REAL_PHOTO_V23__'; if(window[KEY])return;
  const s=window[KEY]={changes:[],capture:[],consoleErrors:[],events:[]};
  window.addEventListener('tool001:capture-diagnostic',e=>s.capture.push(JSON.parse(JSON.stringify(e.detail||{}))),true);
  const ev=(kind,e)=>{const t=e.target;s.events.push({at:Date.now(),kind,trusted:e.isTrusted,tag:t?.tagName||'',type:t?.type||'',testid:t?.getAttribute?.('data-testid')||'',text:(t?.textContent||'').trim().slice(0,120)});};
  document.addEventListener('pointerdown',e=>ev('pointerdown',e),true);document.addEventListener('click',e=>ev('click',e),true);document.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement&&e.target.type==='file')ev('file-input',e)},true);
  document.addEventListener('change',e=>{const el=e.target;if(!(el instanceof HTMLInputElement)||el.type!=='file')return;ev('file-change',e);const files=Array.from(el.files||[]);s.changes.push({at:Date.now(),trusted:e.isTrusted,files:files.map(f=>({name:f.name,type:f.type,size:f.size,lastModified:f.lastModified}))});},true);
  window.addEventListener('error',e=>s.consoleErrors.push({at:Date.now(),message:e.message||String(e.error||'')}),true);
  window.addEventListener('unhandledrejection',e=>s.consoleErrors.push({at:Date.now(),message:String(e.reason?.message||e.reason||'')}),true);
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
async function ensureChromeInteractive(page,caseNo,tag='guard'){
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  adb('shell','wm','dismiss-keyguard');
  adb('shell','input','keyevent','KEYCODE_MENU');
  await page.bringToFront().catch(()=>{});
  let ping=null;
  try{ping=await page.evaluate(()=>({href:location.href,visibility:document.visibilityState,focus:document.hasFocus()}));}catch(e){ping={error:String(e?.message||e)}}
  const fg=foregroundSnapshot();
  write(`case-${caseNo}-${tag}-foreground.json`,{fg,ping});
  if(ping?.href)return{fg,ping};
  throw new Error(`CHROME_NOT_INTERACTIVE:${fg.joined||'unknown'}`);
}
function pickerSignalSnapshot(){
  let xml='';try{xml=dumpUi();}catch{}
  const fg=foregroundSnapshot();
  const nodes=parseUiNodes(xml);const packages=[...new Set(nodes.map(n=>n.package).filter(Boolean))];
  const pickerPackages=[...new Set([...packages,...fg.packages].filter(p=>/(com\.google\.android\.photopicker|documentsui|myfiles|providers\.media|filepicker|picker)/i.test(p)))];
  const text=nodes.map(nodeHay).join('\n');
  const strongUi=packages.some(p=>/com\.google\.android\.photopicker/i.test(p)) || (pickerPackages.length>0 && /(최근|recent|사진|photo|images|이미지|완료|done|추가|add|앨범|albums)/i.test(text));
  return{detected:strongUi,xml,fg,packages,pickerPackages,textSample:text.slice(0,1000)};
}
async function waitStablePickerOpen(caseNo,method,timeoutMs=6500){
  const started=Date.now();let consecutive=0,last=null;const history=[];
  while(Date.now()-started<timeoutMs){
    last=pickerSignalSnapshot();
    history.push({at:Date.now(),detected:last.detected,consecutive,fg:last.fg.joined,packages:last.packages,pickerPackages:last.pickerPackages});
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
  await ensureChromeInteractive(page,caseNo,`before-upload-r${round}`);
  const btn=page.getByRole('button',{name:/이미지 선택|이미지 추가|파일 선택|select image|choose image|add image|画像を選択/i}).first();
  await btn.waitFor({state:'visible',timeout:15000});
  await btn.evaluate(el=>el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));await sleep(350);
  const geom=await btn.evaluate(el=>{const r=el.getBoundingClientRect(),vv=window.visualViewport;const cx=r.left+r.width/2,cy=r.top+r.height/2;const hit=document.elementFromPoint(cx,cy);return{x:r.left,y:r.top,width:r.width,height:r.height,cx,cy,dpr:window.devicePixelRatio||1,screenW:screen.width,screenH:screen.height,innerW:innerWidth,innerH:innerHeight,visualOffsetLeft:vv?.offsetLeft||0,visualOffsetTop:vv?.offsetTop||0,visualW:vv?.width||innerWidth,visualH:vv?.height||innerHeight,hitTag:hit?.tagName||'',hitText:(hit?.textContent||'').trim().slice(0,120),hitTestId:hit?.getAttribute?.('data-testid')||'',buttonText:(el.textContent||'').trim()};});
  if(!geom||geom.width<=0||geom.height<=0)throw new Error(`UPLOAD_BUTTON_BAD_RECT:${JSON.stringify(geom)}`);
  write(`case-${caseNo}-round-${round}-upload-geometry.json`,geom);
  const strategies=[];
  async function attempt(method,fire){
    try{await fire();strategies.push({method,fire:true});const xml=await waitStablePickerOpen(caseNo,`r${round}-${method}`,6500);strategies[strategies.length-1].stablePicker=!!xml;write(`case-${caseNo}-round-${round}-activation-strategies.json`,strategies);if(xml)return{method,geom,strategies,pickerXml:xml};}
    catch(e){strategies.push({method,fire:false,error:String(e?.message||e)});write(`case-${caseNo}-round-${round}-activation-strategies.json`,strategies);}
    await ensureChromeInteractive(page,caseNo,`recover-${method}-r${round}`).catch(()=>{});await sleep(300);return null;
  }

  // 1) Best physical path: locate the visible Chrome accessibility control itself and tap its real device bounds.
  let r=await attempt('uiautomator-real-button',async()=>{const xml=dumpUi();write(`case-${caseNo}-round-${round}-chrome-before-tap.xml`,xml);const cs=chromeUploadActionControls(xml);write(`case-${caseNo}-round-${round}-chrome-upload-controls.json`,cs);if(!cs.length)throw new Error('CHROME_UPLOAD_CONTROL_NOT_FOUND');const b=cs[0].bounds;const ar=adb('shell','input','tap',String(b.x),String(b.y));if(ar.status!==0)throw new Error('ADB_REAL_BUTTON_TAP_FAILED');});if(r)return r;

  // 2) CSS viewport -> physical screen mapping fallback.
  r=await attempt('adb-visual-viewport',async()=>{const wm=adbText('shell','wm','size');const m=wm.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i)||wm.match(/(\d+)x(\d+)/);if(!m)throw new Error(`SCREEN_SIZE_PARSE_FAIL:${wm}`);const sw=Number(m[1]),sh=Number(m[2]);const cssScale=sw/Math.max(1,geom.innerW);const visiblePx=Math.round(geom.visualH*cssScale);const topInset=Math.max(0,sh-visiblePx);const ax=Math.max(1,Math.min(sw-1,Math.round((geom.cx+geom.visualOffsetLeft)*cssScale)));const ay=Math.max(1,Math.min(sh-1,Math.round(topInset+(geom.cy-geom.visualOffsetTop)*cssScale)));const ar=adb('shell','input','tap',String(ax),String(ay));if(ar.status!==0)throw new Error('ADB_TAP_FAILED');});if(r)return r;

  // 3) CDP pointer events.
  r=await attempt('cdp-mouse',async()=>{const cdp=await Promise.race([context.newCDPSession(page),new Promise((_,rej)=>setTimeout(()=>rej(new Error('CDP_SESSION_TIMEOUT')),2500))]);try{await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:Math.round(geom.cx),y:Math.round(geom.cy),button:'left',clickCount:1});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:Math.round(geom.cx),y:Math.round(geom.cy),button:'left',clickCount:1});}finally{await cdp.detach().catch(()=>{});}});if(r)return r;

  // 4) Playwright handler path.
  r=await attempt('playwright-force',async()=>{await btn.click({force:true,timeout:3000,noWaitAfter:true});});if(r)return r;

  // 5) Fresh geometry + physical tap after toolbar/scroll changes.
  r=await attempt('fresh-uiautomator-retry',async()=>{await btn.evaluate(el=>el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));await sleep(500);const xml=dumpUi();const cs=chromeUploadActionControls(xml);if(!cs.length)throw new Error('FRESH_CHROME_UPLOAD_CONTROL_NOT_FOUND');const b=cs[0].bounds;adb('shell','input','tap',String(b.x),String(b.y));});if(r)return r;

  await pcScreen(`case-${caseNo}-round-${round}-activation-failed-device.png`);write(`case-${caseNo}-round-${round}-activation-failed-ui.xml`,dumpUi());
  throw new Error(`UPLOAD_ACTIVATION_EXHAUSTED_ROUND_${round}:${JSON.stringify(strategies)}`);
}
async function waitForSelectionAndCommit(caseNo,label,page,startChange,context){
  const session=[];
  for(let round=1;round<=3;round++){
    let activation;
    try{activation=await tapUpload(page,context,caseNo,round);}catch(e){session.push({round,activationError:String(e?.message||e)});if(round===3)throw e;continue;}
    session.push({round,activation:{method:activation.method,strategies:activation.strategies}});
    write(`case-${caseNo}-activation-session.json`,session);
    log(`[PICKER READY] CASE ${caseNo} ${label}: Photo Picker가 실제로 열린 것을 확인했습니다.`);
    log(`[ACTION REQUIRED] 지금 Galaxy에서 ${label.startsWith('BAD')?'평소 실패하는':'평소 성공하는'} 실제 사진/스크린샷 1장을 한 번 탭하세요. 완료는 V23이 자동 처리합니다.`);
    const deadline=Date.now()+90000;let sawSelection=false,commitTaps=0,lastXml='';
    while(Date.now()<deadline){
      const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st.changes.length>startChange)return{committed:true,mode:'picker-auto-close-change',sawSelection,commitTaps,round,activation};
      const snap=pickerSignalSnapshot();lastXml=snap.xml;
      if(!snap.detected){
        await sleep(800);const st2=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st2.changes.length>startChange)return{committed:true,mode:'picker-closed-change',sawSelection,commitTaps,round,activation};
        if(!sawSelection){log(`[RECOVER] CASE ${caseNo}: 선택 전에 Photo Picker가 닫혔습니다. 자동으로 다시 엽니다. (${round}/3)`);session.push({round,pickerLostBeforeSelection:true});write(`case-${caseNo}-activation-session.json`,session);break;}
        return{committed:false,mode:'picker-closed-after-selection-no-change',sawSelection,commitTaps,round,activation};
      }
      const sig=pickerSelectionSignals(lastXml);
      if(sig.selectedNodes.length){
        sawSelection=true;write(`case-${caseNo}-selection-observed-r${round}.xml`,lastXml);
        const actions=photoPickerActionControls(lastXml);write(`case-${caseNo}-commit-controls-r${round}.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));
        if(actions.length){for(const action of actions){const b=action.bounds;adb('shell','input','tap',String(b.x),String(b.y));commitTaps++;log(`[PHOTO_PICKER] CASE ${caseNo}: auto commit "${action.exact}" at ${b.x},${b.y}`);await pcScreen(`case-${caseNo}-after-auto-commit-r${round}-${commitTaps}.png`);if(await pickerClosedStable(page,7000)){for(let k=0;k<12;k++){const st3=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st3.changes.length>startChange)return{committed:true,mode:'selected-plus-auto-commit',sawSelection:true,commitTaps,round,activation,action:action.exact};await sleep(250);}return{committed:false,mode:'picker-closed-no-change',sawSelection:true,commitTaps,round,activation,action:action.exact};}}}
      }
      await sleep(300);
    }
    if(sawSelection)return{committed:false,mode:'selection-seen-but-commit-timeout',sawSelection,commitTaps,round,activation};
  }
  return{committed:false,mode:'picker-lost-before-selection-after-retries',sawSelection:false,commitTaps:0};
}

async function waitProduct(page,startCapture,before,timeoutMs=90000){const deadline=Date.now()+timeoutMs;let snap=before,cap=[];while(Date.now()<deadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));cap=st.capture.slice(startCapture);snap=await domSnapshot(page);const terminal=cap.some(x=>x.phase==='picker-file-pass'||x.phase==='picker-file-fail'||x.phase==='capture-bytes-fail');const cardChanged=snap.cardCount!==before.cardCount;if(terminal&&(cardChanged||cap.some(x=>x.phase==='picker-file-fail'||x.phase==='capture-bytes-fail')))break;await sleep(350);}return{capture:cap,after:snap};}
async function collectFailureEvidence(caseNo,label,page,reason){let xml='';try{xml=dumpUi();}catch{}write(`case-${caseNo}-${label}-failure-picker.xml`,xml);await pcScreen(`case-${caseNo}-${label}-failure-device.png`);await page.screenshot({path:path.join(outDir,`case-${caseNo}-${label}-failure-page.png`),fullPage:true}).catch(()=>{});const snap=await domSnapshot(page).catch(()=>null);const obs=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__))).catch(()=>null);write(`case-${caseNo}-${label}-failure-evidence.json`,{reason,pickerOpen:pickerDetectedFromXml(xml),selectionSignals:pickerSelectionSignals(xml).selectedNodes.length,commitControls:photoPickerActionControls(xml).map(a=>({exact:a.exact,label:a.label,bounds:a.bounds})),foreground:foregroundSnapshot(),observer:obs,dom:snap});}

async function main(){
  log('=== TOOL001 REAL USER PHOTO DIAGNOSTIC V23 FINAL-INTEGRATED ===');log('[OUTPUT]',outDir);
  step('SELF-CHECK');const av=adb('version');if(av.status!==0)throw new Error('ADB_NOT_AVAILABLE');const devs=adbText('devices');if(!/\tdevice\b/.test(devs))throw new Error('ADB_DEVICE_NOT_READY');write('self-check.txt','SELF_CHECK=PASS\nMODE=REAL_USER_PHOTO_NO_SYNTHETIC_MEDIA\nAUTO_COMMIT=V19_VERIFIED_PATH\n');log('[PASS] SELF-CHECK');
  step('기기정보 수집');write('device-info.txt',[`model=${adbText('shell','getprop','ro.product.model').trim()}`,`android=${adbText('shell','getprop','ro.build.version.release').trim()}`,`sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,`chrome=${adbText('shell','dumpsys','package','com.android.chrome').match(/versionName=([^\s]+)/)?.[1]||''}`].join('\n'));
  step('화면 유지');adb('shell','settings','put','global','stay_on_while_plugged_in','3');adb('shell','svc','power','stayon','usb');adb('shell','input','keyevent','KEYCODE_WAKEUP');
  step('Playwright 실기기 탐색');const ds=await timed('Playwright Android device discovery',()=>android.devices(),45000);if(!ds.length)throw new Error('NO_ANDROID_DEVICE');const device=ds[0];
  step('실제 Chrome 실행');const context=await timed('launchBrowser(real Android Chrome)',()=>device.launchBrowser({}),60000);const page=await context.newPage();const pcl=[];page.on('console',m=>{pcl.push(`${m.type()} ${m.text()}`);write('page-console.log',pcl.join('\n'));});page.on('pageerror',e=>{pcl.push(`PAGEERROR ${e.stack||e.message}`);write('page-console.log',pcl.join('\n'));});
  step('진단 Observer 주입');await page.addInitScript(browserInit);
  step('TOOL001 접속');await timed('page.goto',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}),55000);await page.locator(selector).first().waitFor({state:'attached',timeout:30000});await pcScreen('before.png');
  step('제품 안전제한/UI 동기화 확인');const limitText=await page.evaluate(()=>document.body?.innerText||'');const ui20=/20\s*MB/i.test(limitText),ui60=/60\s*MB/i.test(limitText);write('ui-limit-check.json',{uiHas20MB:ui20,uiHas60MB:ui60});log(`[LIMIT_UI] 20MB=${ui20} 60MB=${ui60}`);
  step('실사진 비교검수 안내');log('');log('*** 검수기가 테스트 사진을 만들지 않습니다. ***');log('각 CASE에서 안내된 GOOD/BAD 실제 사진을 Galaxy Photo Picker에서 1장만 탭하세요.');log('완료 버튼은 누르지 않아도 됩니다. V23이 V19 검증 로직으로 자동 commit합니다.');log('GOOD = 평소 첨부되는 실제 사진 / BAD = 평소 첨부되지 않는 실제 사진');log('');
  const results=[];
  for(let i=0;i<labels.length;i++){
    const caseNo=i+1,label=labels[i];step(`실사진 CASE ${caseNo}/${labels.length} ${label}`);log('');log(`===== CASE ${caseNo}/${labels.length}: ${label} =====`);log(`[PREPARE] CASE ${caseNo}: Photo Picker를 실제로 연 뒤 선택 안내를 표시합니다.`);
    await page.bringToFront();const before=await domSnapshot(page);const st0=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));let result={case:caseNo,label,pass:false,error:null,before,commit:null};
    try{
      const commit=await timed(`CASE ${caseNo} verified picker + user selection + auto commit`,()=>waitForSelectionAndCommit(caseNo,label,page,st0.changes.length,context),210000);result.commit=commit;result.activation=commit.activation||null;
      if(!commit.committed)throw new Error(`PHOTO_PICKER_COMMIT_FAILED:${commit.mode}`);
      const changeDeadline=Date.now()+15000;let change=null;while(Date.now()<changeDeadline){const st=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_PHOTO_V23__)));if(st.changes.length>st0.changes.length){change=st.changes.at(-1);break;}await sleep(250);}if(!change)throw new Error('NO_FILE_CHANGE_AFTER_VERIFIED_COMMIT');
      const r=await timed(`CASE ${caseNo} product capture + preview`,()=>waitProduct(page,st0.capture.length,before),100000);
      const capPass=r.capture.find(x=>x.phase==='picker-file-pass');const capFail=r.capture.find(x=>x.phase==='picker-file-fail'||x.phase==='capture-bytes-fail');const readers=r.capture.filter(x=>/^reader-/.test(x.phase||''));const sniff=r.capture.findLast?.(x=>x.phase==='capture-byte-signature')||r.capture.slice().reverse().find(x=>x.phase==='capture-byte-signature');const newCards=Math.max(0,r.after.cardCount-before.cardCount);const previewImgs=r.after.cards.flatMap(c=>c.imgs||[]).filter(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);const previewCount=previewImgs.length;const message=r.after.alerts.join(' | ');
      result={...result,change,capture:r.capture,readerTimeline:readers,byteSignature:sniff||null,after:r.after,capturePass:!!capPass,captureFail:capFail||null,newCards,previewCount,previewDims:previewImgs.map(x=>[x.naturalWidth,x.naturalHeight]),uiMessage:message,pass:!!capPass&&newCards>0&&previewCount>0};
      log(`[${result.pass?'PASS':'FAIL'}] ${label} file=${change?.files?.[0]?.name||''} type=${change?.files?.[0]?.type||''} size=${change?.files?.[0]?.size||''} capture=${result.capturePass?'PASS':'FAIL'} card+${newCards} preview=${previewCount}`);
    }catch(e){result.error=String(e?.message||e);log(`[FAIL] ${label} ${result.error}`);await collectFailureEvidence(caseNo,label,page,result.error);}
    results.push(result);write(`case-${caseNo}-${label}.json`,result);await page.screenshot({path:path.join(outDir,`case-${caseNo}-${label}-page.png`),fullPage:true}).catch(()=>{});await pcScreen(`case-${caseNo}-${label}-device.png`);
    if(i<labels.length-1){await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.locator(selector).first().waitFor({state:'attached',timeout:30000});}
  }
  step('비교분석 결과 생성');const summary=['TOOL001_REAL_USER_PHOTO_DIAGNOSTIC_V23',`URL=${url}`,`CASES=${results.length}`];for(const r of results){const f=r.change?.files?.[0]||{};const lastReader=r.readerTimeline?.at(-1)||{};summary.push('',`[${r.label}]`,`PASS=${r.pass}`,`COMMIT_MODE=${r.commit?.mode||''}`,`FILE_NAME=${f.name||''}`,`FILE_TYPE=${f.type||''}`,`FILE_SIZE=${f.size??''}`,`LAST_MODIFIED=${f.lastModified??''}`,`TRUSTED_CHANGE=${r.change?.trusted??''}`,`CAPTURE_PASS=${r.capturePass??false}`,`CAPTURE_FAIL=${r.captureFail?.error||''}`,`LAST_READER_PHASE=${lastReader.phase||''}`,`LAST_READER=${lastReader.reader||''}`,`LAST_READER_ERROR=${lastReader.error||''}`,`SIGNATURE=${r.byteSignature?.signature||''}`,`HAS_EXIF=${r.byteSignature?.hasExif??''}`,`NEW_CARDS=${r.newCards??0}`,`PREVIEW_COUNT=${r.previewCount??0}`,`PREVIEW_DIMS=${JSON.stringify(r.previewDims||[])}`,`UI_MESSAGE=${r.uiMessage||''}`,`ERROR=${r.error||''}`);}write('summary.txt',summary.join('\n'));write('result.json',{version:'V23',url,generatedAt:new Date().toISOString(),uiLimits:{has20MB:ui20,has60MB:ui60},results});
  step('최종 판정');const allPass=results.every(r=>r.pass);write('verdict.json',{allPass,good:results.filter(r=>r.label.startsWith('GOOD')).map(r=>({label:r.label,pass:r.pass,size:r.change?.files?.[0]?.size,type:r.change?.files?.[0]?.type,error:r.error||null})),bad:results.filter(r=>r.label.startsWith('BAD')).map(r=>({label:r.label,pass:r.pass,size:r.change?.files?.[0]?.size,type:r.change?.files?.[0]?.type,error:r.error||null}))});
  step('결과 ZIP 생성');await context.close().catch(()=>{});if(typeof device.close==='function')await device.close().catch(()=>{});adb('shell','svc','power','stayon','false');const zip=path.join(desktop,`${path.basename(outDir)}.zip`);const pr=spawnSync('powershell.exe',['-NoProfile','-Command',`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`],{encoding:'utf8',shell:false});if(pr.status!==0)log('[WARN] ZIP creation failed',pr.stderr||pr.stdout||'');else log('[PASS] RESULT ZIP',zip);log('=== FINAL SUMMARY ===');for(const r of results)log(`${r.label}: ${r.pass?'PASS':'FAIL'} size=${r.change?.files?.[0]?.size??''} type=${r.change?.files?.[0]?.type??''} capture=${r.capturePass?'PASS':'FAIL'} preview=${r.previewCount??0} error=${r.error||''}`);log(`FINAL_REAL_USER_PHOTO=${allPass?'PASS':'MIXED_OR_FAIL'}`);
}
main().catch(async e=>{log('[FATAL]',e?.stack||String(e));try{await pcScreen('fatal-device.png');}catch{}process.exitCode=1;});
