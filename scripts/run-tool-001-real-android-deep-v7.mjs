#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { _android as android } from 'playwright';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith('--')) continue;
    const k = t.slice(2), n = argv[i + 1];
    if (!n || n.startsWith('--')) out[k] = true;
    else { out[k] = n; i++; }
  }
  return out;
}

const args = parseArgs(process.argv);
const url = String(args.url || '');
const attemptsTarget = Math.max(1, Number(args.attempts || 3));
const waitChangeMs = Math.max(5000, Number(args['wait-change'] || 90000));
const settleMs = Math.max(500, Number(args.settle || 3500));
const selector = String(args.selector || '[data-testid="converter-file-input"], input[type=file]');
if (!url) { console.error('ERROR: --url is required'); process.exit(2); }

const desktop = process.platform === 'win32' ? path.join(process.env.USERPROFILE || os.homedir(), 'Desktop') : os.homedir();
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const outDir = path.join(desktop, `TOOLBOX_001_REAL_ANDROID_DEEP_V7_${stamp}`);
fs.mkdirSync(outDir, { recursive: true });
const runnerLines = [];
function log(...p) { const s = p.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' '); console.log(s); runnerLines.push(s); fs.writeFileSync(path.join(outDir,'runner.log'), runnerLines.join('\n'),'utf8'); }
function write(n,d) { fs.writeFileSync(path.join(outDir,n), typeof d === 'string' ? d : JSON.stringify(d,null,2), 'utf8'); }
function run(exe, argv, opts={}) { return spawnSync(exe, argv, { encoding:'utf8', shell:false, ...opts }); }
function adb(...argv) { return run('adb', argv); }
function adbText(...argv) { const r = adb(...argv); return `${r.stdout||''}${r.stderr||''}`; }
function sleep(ms) { return new Promise(r => setTimeout(r,ms)); }
let overallStep = 0;
const OVERALL_STEPS = 12;
function step(label) {
  overallStep += 1;
  log(`[PROGRESS ${String(overallStep).padStart(2,'0')}/${OVERALL_STEPS}] ${label}`);
}
async function withHeartbeat(label, promiseFactory, timeoutMs=60000, everyMs=5000) {
  const started = Date.now();
  let timer = null;
  let timeout = null;
  log(`[RUNNING] ${label} ... 0s`);
  const heartbeat = new Promise((_, reject) => {
    timer = setInterval(() => {
      const sec = Math.floor((Date.now()-started)/1000);
      log(`[RUNNING] ${label} ... ${sec}s elapsed`);
    }, everyMs);
    timeout = setTimeout(() => reject(new Error(`${label} TIMEOUT after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    const result = await Promise.race([Promise.resolve().then(promiseFactory), heartbeat]);
    const sec = ((Date.now()-started)/1000).toFixed(1);
    log(`[PASS] ${label} (${sec}s)`);
    return result;
  } catch (e) {
    const sec = ((Date.now()-started)/1000).toFixed(1);
    log(`[FAIL] ${label} (${sec}s) ${e?.message||e}`);
    throw e;
  } finally {
    if (timer) clearInterval(timer);
    if (timeout) clearTimeout(timeout);
  }
}
async function zipOutput() {
  if (process.platform !== 'win32') return;
  const zip = `${outDir}.zip`;
  const d = outDir.replace(/'/g,"''"), z = zip.replace(/'/g,"''");
  run('powershell',['-NoProfile','-Command',`Compress-Archive -Path '${d}\\*' -DestinationPath '${z}' -Force`]);
}


function xmlDecode(v='') {
  return String(v).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
}
function centerOfBounds(bounds) {
  const m = String(bounds||'').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!m) return null;
  return { x: Math.floor((Number(m[1])+Number(m[3]))/2), y: Math.floor((Number(m[2])+Number(m[4]))/2) };
}
function dumpUi() {
  adb('shell','uiautomator','dump','/sdcard/tool001-v6-window.xml');
  const xml = adbText('shell','cat','/sdcard/tool001-v6-window.xml');
  return xml;
}
function parseUiNodes(xml) {
  const out=[];
  const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;
  let m;
  while((m=re.exec(xml||''))) {
    const attrs={};
    const ar=/([\w-]+)="([^"]*)"/g; let a;
    while((a=ar.exec(m[1]))) attrs[a[1]]=xmlDecode(a[2]);
    out.push(attrs);
  }
  return out;
}
function nodeMatches(node, needles) {
  const hay=[node.text,node['content-desc'],node['resource-id']].filter(Boolean).join(' ').toLowerCase();
  return needles.some(n=>hay.includes(String(n).toLowerCase()));
}
function tapNode(node,label='node') {
  const c=centerOfBounds(node.bounds);
  if(!c) throw new Error(`${label}: no bounds`);
  const r=adb('shell','input','tap',String(c.x),String(c.y));
  if(r.status!==0) throw new Error(`${label}: adb tap failed ${r.stderr||r.stdout||''}`);
  return c;
}
async function saveDeviceScreen(name) {
  const remote='/sdcard/tool001-v6-screen.png';
  adb('shell','screencap','-p',remote);
  const local=path.join(outDir,name);
  run('adb',['pull',remote,local]);
}
async function waitForPicker(timeoutMs=15000) {
  const start=Date.now(); let last='';
  while(Date.now()-start<timeoutMs) {
    const focus=adbText('shell','dumpsys','window','windows');
    const line=focus.split(/\r?\n/).find(x=>/mCurrentFocus|mFocusedApp/.test(x) && /(documentsui|myfiles|file|picker|chrome)/i.test(x)) || '';
    if(line) last=line.trim();
    const xml=dumpUi();
    const nodes=parseUiNodes(xml);
    const pickerLike=nodes.some(n=>nodeMatches(n,['com.google.android.documentsui','com.sec.android.app.myfiles','recent','최근','downloads','다운로드','files','파일']));
    if(pickerLike && !nodes.some(n=>nodeMatches(n,['이미지 선택','choose images']))) return {focus:last,xml,nodes};
    await sleep(500);
  }
  throw new Error(`Android native picker not detected within ${timeoutMs}ms; lastFocus=${last}`);
}
async function findAndTapFile(filename, attemptIndex, timeoutMs=30000) {
  const started=Date.now();
  const shortName=filename.replace(/\.png$/i,'');
  const labels=[filename,shortName];
  let didDownloads=false, didSearch=false;
  while(Date.now()-started<timeoutMs) {
    let xml=dumpUi();
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-picker-ui.xml`,xml);
    let nodes=parseUiNodes(xml);
    let hit=nodes.find(n=>nodeMatches(n,labels));
    if(hit){ const c=tapNode(hit,'test file'); log(`[NATIVE] tapped file ${filename} at ${c.x},${c.y}`); return; }

    if(!didDownloads){
      const dl=nodes.find(n=>nodeMatches(n,['downloads','다운로드','download']));
      if(dl){ const c=tapNode(dl,'Downloads'); didDownloads=true; log(`[NATIVE] opened Downloads at ${c.x},${c.y}`); await sleep(1000); continue; }
      didDownloads=true;
    }

    if(!didSearch){
      const search=nodes.find(n=>nodeMatches(n,['search','검색'])) || nodes.find(n=>/action_menu_search|menu_search/i.test(n['resource-id']||''));
      if(search){
        const c=tapNode(search,'Search'); log(`[NATIVE] opened picker search at ${c.x},${c.y}`); await sleep(500);
        const typed=adb('shell','input','text',filename.replace(/%/g,'\\%'));
        if(typed.status===0){ adb('shell','input','keyevent','KEYCODE_ENTER'); log(`[NATIVE] searched for ${filename}`); }
        didSearch=true; await sleep(1200); continue;
      }
      didSearch=true;
    }
    await sleep(700);
  }
  throw new Error(`Native picker could not locate ${filename} within ${timeoutMs}ms`);
}
function makeTestPng(localPath) {
  // Valid 1x1 PNG; small on purpose so native handoff, File lifetime and decode are isolated from file size.
  const b64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=';
  fs.writeFileSync(localPath,Buffer.from(b64,'base64'));
}
async function prepareDeviceFiles(count) {
  const files=[];
  const token=Date.now();
  for(let i=1;i<=count;i++){
    const name=`TOOL001_V7_${token}_${String(i).padStart(2,'0')}.png`;
    const local=path.join(outDir,name); makeTestPng(local);
    const remote=`/sdcard/Download/${name}`;
    const r=run('adb',['push',local,remote]);
    if(r.status!==0) throw new Error(`adb push failed for ${name}: ${r.stderr||r.stdout||''}`);
    adb('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${remote}`);
    const exists=adbText('shell','ls','-l',remote);
    write(`device-file-${i}.txt`,exists);
    files.push({name,local,remote});
  }
  return files;
}
async function clickUploadButton(page, attemptIndex) {
  const label = attemptIndex === 1 ? /이미지 선택|Choose images|画像を選択/ : /이미지 추가|Add images|画像を追加|이미지 선택|Choose images|画像を選択/;
  const btn = page.getByRole('button',{name:label}).first();

  // Real Android Chrome can keep reporting the web button as unstable even though it is rendered.
  // Do NOT use locator.click() here. Find the element in DOM, scroll it into view, then send an actual touch.
  await btn.waitFor({state:'attached',timeout:15000});
  await btn.evaluate(el => el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
  await sleep(350);

  let box = await btn.boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) {
    // Fallback: read rect directly from DOM in case Playwright's actionability layer refuses geometry.
    const r = await btn.evaluate(el => {
      const x = el.getBoundingClientRect();
      return {x:x.left,y:x.top,width:x.width,height:x.height,innerWidth:window.innerWidth,innerHeight:window.innerHeight};
    });
    box = {x:r.x,y:r.y,width:r.width,height:r.height};
  }
  if (!box || box.width <= 0 || box.height <= 0) throw new Error('Upload button has no tappable bounding box');

  const x = Math.round(box.x + box.width/2);
  const y = Math.round(box.y + box.height/2);
  log(`[TOUCH] upload button center css=(${x},${y}) box=${JSON.stringify(box)}`);

  // Primary path: Playwright touchscreen sends a trusted touch to the real Android Chrome page
  // without waiting for the element to be "stable".
  try {
    await page.touchscreen.tap(x,y);
    log(`[PASS] trusted touchscreen tap sent at (${x},${y})`);
    return {method:'touchscreen.tap',x,y};
  } catch (e) {
    log(`[WARN] touchscreen.tap failed: ${e.message}`);
  }

  // Secondary path: coordinate tap at Android OS level. We derive scale from CSS viewport to physical display.
  // This is only used if Playwright's touchscreen channel itself fails.
  const vp = await page.evaluate(() => ({w:window.innerWidth,h:window.innerHeight,dpr:window.devicePixelRatio||1}));
  const wm = adbText('shell','wm','size');
  const m = wm.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i) || wm.match(/(\d+)x(\d+)/);
  if (!m) throw new Error(`Cannot parse Android screen size: ${wm}`);
  const sw = Number(m[1]), sh = Number(m[2]);
  const ax = Math.max(1,Math.min(sw-1,Math.round((x/Math.max(1,vp.w))*sw)));

  // Chrome content starts below browser chrome. Estimate the content-top offset from remaining height.
  // Clamp conservatively; if the page is fullscreen this naturally approaches 0.
  const contentPxH = Math.round(vp.h * (sw/Math.max(1,vp.w)));
  const topOffset = Math.max(0, sh - contentPxH);
  const ay = Math.max(1,Math.min(sh-1,Math.round(topOffset + (y/Math.max(1,vp.h))*contentPxH)));
  adb('shell','input','tap',String(ax),String(ay));
  log(`[PASS] ADB fallback tap sent at physical=(${ax},${ay}) screen=${sw}x${sh} viewport=${vp.w}x${vp.h} topOffset≈${topOffset}`);
  return {method:'adb.tap',x:ax,y:ay};
}

function browserInit() {
  const KEY = '__TOOL001_REAL_ANDROID_V7__';
  if (window[KEY]) return;
  const state = window[KEY] = {
    version:'V7', bornEpoch:Date.now(), bornPerf:performance.now(), seq:0,
    timeline:[], attempts:[], activeProbes:0, lastProbeDoneAt:0, selector:null,
    environment:{
      userAgent:navigator.userAgent, platform:navigator.platform, language:navigator.language,
      languages:navigator.languages, hardwareConcurrency:navigator.hardwareConcurrency,
      deviceMemory:navigator.deviceMemory || null, maxTouchPoints:navigator.maxTouchPoints,
      visibilityState:document.visibilityState
    }
  };
  const snap = () => ({ epoch:Date.now(), perf:Number(performance.now().toFixed(3)), visibility:document.visibilityState, hasFocus:document.hasFocus(), href:location.href });
  const push = (type,detail={}) => { state.timeline.push({seq:++state.seq,type,...snap(),...detail}); if(state.timeline.length>5000) state.timeline.splice(0,state.timeline.length-5000); };
  const simple = e => push(e.type,{targetTag:e.target?.tagName||null,targetType:e.target?.type||null,trusted:!!e.isTrusted});
  ['pageshow','pagehide','focus','blur','online','offline'].forEach(t=>window.addEventListener(t,simple,true));
  document.addEventListener('visibilitychange',()=>push('visibilitychange'),true);
  ['pointerdown','pointerup','touchstart','touchend','click','input'].forEach(t=>document.addEventListener(t,simple,true));
  const err = e => String(e?.name ? (e.name+': '+(e.message||'')) : (e?.message||e||'unknown'));
  const timed = async fn => { const t0=performance.now(); try { return {ok:true,ms:Number((performance.now()-t0).toFixed(3)),value:await fn()}; } catch(e) { return {ok:false,ms:Number((performance.now()-t0).toFixed(3)),error:err(e)}; } };
  const readFR = file => new Promise((resolve,reject)=>{ const fr=new FileReader(); fr.onload=()=>resolve({resultType:typeof fr.result,length:typeof fr.result==='string'?fr.result.length:(fr.result?.byteLength||null)}); fr.onerror=()=>reject(fr.error||new Error('FileReader error')); fr.onabort=()=>reject(new Error('FileReader abort')); fr.readAsDataURL(file); });
  const loadImg = src => new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete}); img.onerror=()=>reject(new Error('Image.onerror')); img.src=src; });
  const hex = bytes => Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join(' ');
  const domSnapshot = () => {
    const imgs=Array.from(document.images||[]), cvs=Array.from(document.querySelectorAll('canvas'));
    const alerts=Array.from(document.querySelectorAll('[role=alert],[aria-live]')).filter(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden';}).slice(0,20).map(el=>(el.textContent||'').trim().slice(0,300));
    const text=(document.body?.innerText||'').slice(0,20000), needles=['오류','실패','제외','손상','지원하지','error','failed','invalid','corrupt'];
    return {imageCount:imgs.length,loadedImageCount:imgs.filter(i=>i.complete&&i.naturalWidth>0).length,blobImageCount:imgs.filter(i=>String(i.src||'').startsWith('blob:')).length,dataImageCount:imgs.filter(i=>String(i.src||'').startsWith('data:')).length,canvases:cvs.slice(0,20).map(c=>({width:c.width,height:c.height})),alerts,matchedErrors:needles.filter(n=>text.toLowerCase().includes(n.toLowerCase()))};
  };
  async function probeFile(file,attemptIndex) {
    const started=snap(); state.activeProbes++; push('probe-start',{attemptIndex,name:file?.name||null,size:file?.size||null,type:file?.type||null});
    const r={attemptIndex,started,file:{name:file?.name||null,type:file?.type||null,size:file?.size??null,lastModified:file?.lastModified??null,webkitRelativePath:file?.webkitRelativePath||'',constructorName:file?.constructor?.name||null,tag:Object.prototype.toString.call(file),instanceofFile:file instanceof File,instanceofBlob:file instanceof Blob},reads:{},objectURL:null,image:null,imageBitmap:null,domBefore:domSnapshot(),domAfter:null};
    r.reads.sliceHead=await timed(async()=>{const ab=await file.slice(0,64).arrayBuffer(),b=new Uint8Array(ab);return{byteLength:ab.byteLength,hex:hex(b)};});
    r.reads.arrayBuffer1=await timed(async()=>{const ab=await file.arrayBuffer(),b=new Uint8Array(ab);return{byteLength:ab.byteLength,headHex:hex(b.slice(0,16)),tailHex:hex(b.slice(Math.max(0,b.length-16)))};});
    await new Promise(q=>setTimeout(q,120));
    r.reads.arrayBuffer2=await timed(async()=>({byteLength:(await file.arrayBuffer()).byteLength}));
    r.reads.fileReader=await timed(()=>readFR(file));
    let blobUrl=null; r.objectURL=await timed(async()=>{blobUrl=URL.createObjectURL(file);return{urlHead:String(blobUrl).slice(0,120),length:String(blobUrl).length};});
    if(blobUrl) r.image=await timed(()=>loadImg(blobUrl));
    r.imageBitmap=typeof createImageBitmap==='function' ? await timed(async()=>{const bmp=await createImageBitmap(file),info={width:bmp.width,height:bmp.height};try{bmp.close();}catch{}return info;}) : {ok:false,skipped:'unavailable'};
    await new Promise(q=>setTimeout(q,800)); r.domAfter=domSnapshot(); r.finished=snap(); r.totalMs=Number((r.finished.perf-started.perf).toFixed(3));
    if(blobUrl){try{URL.revokeObjectURL(blobUrl);}catch{}}
    state.activeProbes--; state.lastProbeDoneAt=Date.now();
    push('probe-end',{attemptIndex,arrayBuffer1:!!r.reads.arrayBuffer1?.ok,arrayBuffer2:!!r.reads.arrayBuffer2?.ok,fileReader:!!r.reads.fileReader?.ok,objectURL:!!r.objectURL?.ok,image:!!r.image?.ok,imageBitmap:!!r.imageBitmap?.ok,totalMs:r.totalMs});
    return r;
  }
  document.addEventListener('change',e=>{
    const target=e.target; if(!(target instanceof HTMLInputElement)||target.type!=='file') return;
    const files=Array.from(target.files||[]), attemptIndex=state.attempts.length+1;
    const rec={attemptIndex,change:snap(),trusted:!!e.isTrusted,fileCount:files.length,inputValueLength:String(target.value||'').length,files:files.map(f=>({name:f.name,type:f.type,size:f.size,lastModified:f.lastModified})),probes:[],done:false};
    state.attempts.push(rec); push('file-change',{attemptIndex,fileCount:files.length,trusted:!!e.isTrusted});
    Promise.all(files.map(f=>probeFile(f,attemptIndex))).then(probes=>{rec.probes=probes;rec.done=true;rec.doneAt=snap();push('attempt-done',{attemptIndex,probeCount:probes.length});}).catch(e2=>{rec.done=true;rec.error=err(e2);rec.doneAt=snap();push('attempt-error',{attemptIndex,error:rec.error});});
  },true);
  window.addEventListener('error',e=>push('window-error',{message:e.message||null,filename:e.filename||null,lineno:e.lineno||null,colno:e.colno||null}),true);
  window.addEventListener('unhandledrejection',e=>push('unhandledrejection',{reason:err(e.reason)}),true);
  push('diagnostic-installed');
}

async function waitForAttempt(page, expected, timeout) {
  const start=Date.now(); let last=0;
  while(Date.now()-start<timeout){
    const s=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V7__?({count:window.__TOOL001_REAL_ANDROID_V7__.attempts.length,attempts:window.__TOOL001_REAL_ANDROID_V7__.attempts.map(a=>({attemptIndex:a.attemptIndex,done:a.done,fileCount:a.fileCount})),activeProbes:window.__TOOL001_REAL_ANDROID_V7__.activeProbes}):({count:0,attempts:[],activeProbes:0})).catch(()=>({count:0,attempts:[],activeProbes:0}));
    const a=s.attempts.find(x=>x.attemptIndex===expected); if(s.count>=expected&&a?.done&&s.activeProbes===0) return s;
    const sec=Math.floor((Date.now()-start)/1000); if(sec>=last+10){last=sec;log(`[WAIT] attempt ${expected}: ${sec}s, detected=${s.count}, activeProbes=${s.activeProbes}`);} await sleep(500);
  }
  throw new Error(`Attempt ${expected} not completed within ${timeout}ms`);
}

async function main(){
  log('=== TOOL001 REAL ANDROID DEEP DIAGNOSTIC V7 ==='); log('[OUTPUT]',outDir);
  step('ADB 연결 확인');
  const d=adbText('devices'); write('adb-devices.txt',d); if(!/\tdevice\b/.test(d)) throw new Error('ADB device is not in device state');
  log('[PASS] ADB device state confirmed');
  adb('logcat','-c');
  step('Android / Chrome 기기정보 수집');
  write('android-device-info.txt',[
    `manufacturer=${adbText('shell','getprop','ro.product.manufacturer').trim()}`,
    `model=${adbText('shell','getprop','ro.product.model').trim()}`,
    `device=${adbText('shell','getprop','ro.product.device').trim()}`,
    `android_release=${adbText('shell','getprop','ro.build.version.release').trim()}`,
    `sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,
    `security_patch=${adbText('shell','getprop','ro.build.version.security_patch').trim()}`,
    `abi=${adbText('shell','getprop','ro.product.cpu.abi').trim()}`
  ].join('\n'));
  write('chrome-package-info.txt',adbText('shell','dumpsys','package','com.android.chrome'));
  log('[PASS] device information saved');

  step('Playwright가 실기기 탐색');
  const ds=await withHeartbeat('Playwright Android device discovery',()=>android.devices(),45000); if(!ds.length) throw new Error('Playwright did not discover the Android device'); log(`[ANDROID] discovered ${ds.length} device(s)`); const device=ds[0];
  step('실제 갤럭시 Chrome 실행');
  const context=await withHeartbeat('launchBrowser(real Android Chrome)',()=>device.launchBrowser({}),60000);
  log('[ANDROID] creating browser page...');
  const page=await withHeartbeat('context.newPage()',()=>context.newPage(),30000);
  const pc=[]; page.on('console',m=>{pc.push(`[${new Date().toISOString()}] ${m.type()} ${m.text()}`);write('page-console.log',pc.join('\n'));}); page.on('pageerror',e=>{pc.push(`[${new Date().toISOString()}] PAGEERROR ${e.stack||e.message}`);write('page-console.log',pc.join('\n'));});
  step('진단 스크립트 주입');
  await withHeartbeat('page.addInitScript()',()=>page.addInitScript(browserInit),15000);
  step('TOOL001 실제 페이지 접속');
  log('[PAGE] goto',url); await withHeartbeat('page.goto()',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}),55000);
  step('파일 입력요소 확인');
  await withHeartbeat('waitForSelector(file input attached)',()=>page.locator(selector).first().waitFor({state:'attached',timeout:30000}),35000);
  const fileInputCount = await page.locator(selector).count();
  log(`[PASS] file input attached count=${fileInputCount} selector=${selector}`);
  await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V7__)window.__TOOL001_REAL_ANDROID_V7__.selector=sel;},selector);
  await page.screenshot({path:path.join(outDir,'before.png'),fullPage:true}).catch(()=>{});

  step(`실기기 자동선택용 PNG ${attemptsTarget}개 준비`);
  const deviceFiles = await withHeartbeat('push test PNGs to /sdcard/Download',()=>prepareDeviceFiles(attemptsTarget),45000);
  log(`[PASS] prepared ${deviceFiles.length} real-device test files`);

  step(`Android 네이티브 파일선택기 자동화 ${attemptsTarget}회`);
  for(let i=1;i<=attemptsTarget;i++){
    const tf=deviceFiles[i-1];
    log(''); log(`===== ATTEMPT ${i}/${attemptsTarget} AUTO =====`);
    log(`[AUTO] target=${tf.remote}`);
    try{
      await withHeartbeat(`attempt ${i}: click TOOL001 upload button`,()=>clickUploadButton(page,i),20000);
      await withHeartbeat(`attempt ${i}: detect Android native picker`,()=>waitForPicker(15000),20000);
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-picker-before.png`).catch(()=>{});
      await withHeartbeat(`attempt ${i}: select ${tf.name} in native picker`,()=>findAndTapFile(tf.name,i,30000),35000);
      await withHeartbeat(`attempt ${i}: wait trusted change + deep file probe`,()=>waitForAttempt(page,i,waitChangeMs),waitChangeMs+5000,5000);
      log(`[ATTEMPT ${i}] NATIVE_PICKER + change + file probe COMPLETE`);
      await sleep(settleMs);
      await page.screenshot({path:path.join(outDir,`attempt-${String(i).padStart(2,'0')}-after.png`),fullPage:true}).catch(()=>{});
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-device-after.png`).catch(()=>{});
      const p=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V7__)));
      write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);
    }catch(e){
      log(`[ATTEMPT ${i}] AUTO TIMEOUT/ERROR ${e.message}`);
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-failure-device.png`).catch(()=>{});
      const xml=dumpUi(); write(`attempt-${String(i).padStart(2,'0')}-failure-ui.xml`,xml);
      const p=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V7__?JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V7__)):null).catch(()=>null);
      if(p){write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);}
      break;
    }
  }

  step('브라우저/파일 진단 결과 수집');
  const state=await withHeartbeat('collect browser diagnostic state',()=>page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V7__))),20000);
  const domFinal=await page.evaluate(()=>({url:location.href,title:document.title,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),inputs:Array.from(document.querySelectorAll('input[type=file]')).map((el,i)=>({index:i,accept:el.accept,multiple:el.multiple,disabled:el.disabled})),imgs:Array.from(document.images).slice(0,50).map((img,i)=>({index:i,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,srcHead:String(img.src||'').slice(0,100)})),canvases:Array.from(document.querySelectorAll('canvas')).slice(0,50).map((c,i)=>({index:i,width:c.width,height:c.height}))}));
  write('result.json',{meta:{version:'V7',generatedAt:new Date().toISOString(),url,selector,attemptsTarget,attemptsObserved:state.attempts.length,node:process.version,hostPlatform:process.platform},environment:state.environment,attempts:state.attempts,timeline:state.timeline,domFinal});
  write('timeline.json',state.timeline);write('attempts.json',state.attempts);write('dom-final.json',domFinal);
  const s=['TOOL001_REAL_ANDROID_DEEP_DIAGNOSTIC_V6',`URL=${url}`,`ATTEMPTS_TARGET=${attemptsTarget}`,`ATTEMPTS_OBSERVED=${state.attempts.length}`,`USER_AGENT=${state.environment?.userAgent||''}`,`PLATFORM=${state.environment?.platform||''}`,`MAX_TOUCH_POINTS=${state.environment?.maxTouchPoints??''}`];
  for(const a of state.attempts){const p=a.probes?.[0];s.push('',`[ATTEMPT_${a.attemptIndex}]`,`TRUSTED_CHANGE=${a.trusted}`,`FILE_COUNT=${a.fileCount}`,`FILE_NAME=${p?.file?.name||a.files?.[0]?.name||''}`,`FILE_TYPE=${p?.file?.type||a.files?.[0]?.type||''}`,`FILE_SIZE=${p?.file?.size??a.files?.[0]?.size??''}`,`SLICE_HEAD_OK=${p?.reads?.sliceHead?.ok??''}`,`ARRAYBUFFER1_OK=${p?.reads?.arrayBuffer1?.ok??''}`,`ARRAYBUFFER1_MS=${p?.reads?.arrayBuffer1?.ms??''}`,`ARRAYBUFFER2_OK=${p?.reads?.arrayBuffer2?.ok??''}`,`FILEREADER_OK=${p?.reads?.fileReader?.ok??''}`,`OBJECTURL_OK=${p?.objectURL?.ok??''}`,`IMAGE_DECODE_OK=${p?.image?.ok??''}`,`NATURAL_WIDTH=${p?.image?.value?.naturalWidth??''}`,`NATURAL_HEIGHT=${p?.image?.value?.naturalHeight??''}`,`IMAGEBITMAP_OK=${p?.imageBitmap?.ok??''}`,`DOM_BEFORE_LOADED_IMAGES=${p?.domBefore?.loadedImageCount??''}`,`DOM_AFTER_LOADED_IMAGES=${p?.domAfter?.loadedImageCount??''}`,`DOM_AFTER_BLOB_IMAGES=${p?.domAfter?.blobImageCount??''}`,`DOM_AFTER_CANVAS_COUNT=${p?.domAfter?.canvases?.length??''}`,`DOM_ERROR_MATCHES=${(p?.domAfter?.matchedErrors||[]).join(',')}`);}
  write('summary.txt',s.join('\n'));
  await page.screenshot({path:path.join(outDir,'final.png'),fullPage:true}).catch(()=>{}); await context.close().catch(()=>{}); if(typeof device.close==='function') await device.close().catch(()=>{});
  step('ADB logcat 수집');
  write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));
  step('결과 ZIP 생성');
  await withHeartbeat('Compress result ZIP',()=>zipOutput(),60000); log('');log('=== COMPLETE ===');log('[FOLDER]',outDir);log('[ZIP]',`${outDir}.zip`);
}

main().catch(async e=>{log('[FATAL]',e?.stack||String(e));write('fatal.txt',e?.stack||String(e));try{write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));}catch{}try{await zipOutput();}catch{}process.exit(1);});
