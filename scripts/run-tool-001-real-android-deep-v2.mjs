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
const selector = String(args.selector || 'input[type=file]');
if (!url) { console.error('ERROR: --url is required'); process.exit(2); }

const desktop = process.platform === 'win32' ? path.join(process.env.USERPROFILE || os.homedir(), 'Desktop') : os.homedir();
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const outDir = path.join(desktop, `TOOLBOX_001_REAL_ANDROID_DEEP_V2_${stamp}`);
fs.mkdirSync(outDir, { recursive: true });
const runnerLines = [];
function log(...p) { const s = p.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' '); console.log(s); runnerLines.push(s); fs.writeFileSync(path.join(outDir,'runner.log'), runnerLines.join('\n'),'utf8'); }
function write(n,d) { fs.writeFileSync(path.join(outDir,n), typeof d === 'string' ? d : JSON.stringify(d,null,2), 'utf8'); }
function run(exe, argv, opts={}) { return spawnSync(exe, argv, { encoding:'utf8', shell:false, ...opts }); }
function adb(...argv) { return run('adb', argv); }
function adbText(...argv) { const r = adb(...argv); return `${r.stdout||''}${r.stderr||''}`; }
function sleep(ms) { return new Promise(r => setTimeout(r,ms)); }
async function zipOutput() {
  if (process.platform !== 'win32') return;
  const zip = `${outDir}.zip`;
  const d = outDir.replace(/'/g,"''"), z = zip.replace(/'/g,"''");
  run('powershell',['-NoProfile','-Command',`Compress-Archive -Path '${d}\\*' -DestinationPath '${z}' -Force`]);
}

function browserInit() {
  const KEY = '__TOOL001_REAL_ANDROID_V2__';
  if (window[KEY]) return;
  const state = window[KEY] = {
    version:'V2', bornEpoch:Date.now(), bornPerf:performance.now(), seq:0,
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
    const s=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V2__?({count:window.__TOOL001_REAL_ANDROID_V2__.attempts.length,attempts:window.__TOOL001_REAL_ANDROID_V2__.attempts.map(a=>({attemptIndex:a.attemptIndex,done:a.done,fileCount:a.fileCount})),activeProbes:window.__TOOL001_REAL_ANDROID_V2__.activeProbes}):({count:0,attempts:[],activeProbes:0})).catch(()=>({count:0,attempts:[],activeProbes:0}));
    const a=s.attempts.find(x=>x.attemptIndex===expected); if(s.count>=expected&&a?.done&&s.activeProbes===0) return s;
    const sec=Math.floor((Date.now()-start)/1000); if(sec>=last+10){last=sec;log(`[WAIT] attempt ${expected}: ${sec}s, detected=${s.count}, activeProbes=${s.activeProbes}`);} await sleep(500);
  }
  throw new Error(`Attempt ${expected} not completed within ${timeout}ms`);
}

async function main(){
  log('=== TOOL001 REAL ANDROID DEEP DIAGNOSTIC V2 ==='); log('[OUTPUT]',outDir);
  const d=adbText('devices'); write('adb-devices.txt',d); if(!/\tdevice\b/.test(d)) throw new Error('ADB device is not in device state');
  adb('logcat','-c');
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

  log('[ANDROID] Playwright device discovery...'); const ds=await android.devices(); if(!ds.length) throw new Error('Playwright did not discover the Android device'); log(`[ANDROID] discovered ${ds.length} device(s)`); const device=ds[0];
  log('[ANDROID] launching real Chrome...'); const context=await device.launchBrowser({}); const page=await context.newPage();
  const pc=[]; page.on('console',m=>{pc.push(`[${new Date().toISOString()}] ${m.type()} ${m.text()}`);write('page-console.log',pc.join('\n'));}); page.on('pageerror',e=>{pc.push(`[${new Date().toISOString()}] PAGEERROR ${e.stack||e.message}`);write('page-console.log',pc.join('\n'));});
  await page.addInitScript(browserInit);
  log('[PAGE] goto',url); await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}); await page.waitForSelector(selector,{timeout:30000});
  await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V2__)window.__TOOL001_REAL_ANDROID_V2__.selector=sel;},selector);
  await page.screenshot({path:path.join(outDir,'before.png'),fullPage:true}).catch(()=>{});

  for(let i=1;i<=attemptsTarget;i++){
    log(''); log(`===== ATTEMPT ${i}/${attemptsTarget} READY =====`); log('폰에서 TOOL001 업로드 영역을 눌러 실제 갤러리/내 파일에서 이미지를 선택하세요.'); log('PC에서는 아무 키도 누를 필요 없습니다. change 이벤트를 자동 감지합니다.');
    try{await waitForAttempt(page,i,waitChangeMs);log(`[ATTEMPT ${i}] change + file probe COMPLETE`);await sleep(settleMs);await page.screenshot({path:path.join(outDir,`attempt-${String(i).padStart(2,'0')}-after.png`),fullPage:true}).catch(()=>{});const p=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V2__)));write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);}catch(e){log(`[ATTEMPT ${i}] TIMEOUT/ERROR`,e.message);const p=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V2__?JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V2__)):null).catch(()=>null);if(p){write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);}break;}
  }

  const state=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V2__)));
  const domFinal=await page.evaluate(()=>({url:location.href,title:document.title,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),inputs:Array.from(document.querySelectorAll('input[type=file]')).map((el,i)=>({index:i,accept:el.accept,multiple:el.multiple,disabled:el.disabled})),imgs:Array.from(document.images).slice(0,50).map((img,i)=>({index:i,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,srcHead:String(img.src||'').slice(0,100)})),canvases:Array.from(document.querySelectorAll('canvas')).slice(0,50).map((c,i)=>({index:i,width:c.width,height:c.height}))}));
  write('result.json',{meta:{version:'V2',generatedAt:new Date().toISOString(),url,selector,attemptsTarget,attemptsObserved:state.attempts.length,node:process.version,hostPlatform:process.platform},environment:state.environment,attempts:state.attempts,timeline:state.timeline,domFinal});
  write('timeline.json',state.timeline);write('attempts.json',state.attempts);write('dom-final.json',domFinal);
  const s=['TOOL001_REAL_ANDROID_DEEP_DIAGNOSTIC_V2',`URL=${url}`,`ATTEMPTS_TARGET=${attemptsTarget}`,`ATTEMPTS_OBSERVED=${state.attempts.length}`,`USER_AGENT=${state.environment?.userAgent||''}`,`PLATFORM=${state.environment?.platform||''}`,`MAX_TOUCH_POINTS=${state.environment?.maxTouchPoints??''}`];
  for(const a of state.attempts){const p=a.probes?.[0];s.push('',`[ATTEMPT_${a.attemptIndex}]`,`TRUSTED_CHANGE=${a.trusted}`,`FILE_COUNT=${a.fileCount}`,`FILE_NAME=${p?.file?.name||a.files?.[0]?.name||''}`,`FILE_TYPE=${p?.file?.type||a.files?.[0]?.type||''}`,`FILE_SIZE=${p?.file?.size??a.files?.[0]?.size??''}`,`SLICE_HEAD_OK=${p?.reads?.sliceHead?.ok??''}`,`ARRAYBUFFER1_OK=${p?.reads?.arrayBuffer1?.ok??''}`,`ARRAYBUFFER1_MS=${p?.reads?.arrayBuffer1?.ms??''}`,`ARRAYBUFFER2_OK=${p?.reads?.arrayBuffer2?.ok??''}`,`FILEREADER_OK=${p?.reads?.fileReader?.ok??''}`,`OBJECTURL_OK=${p?.objectURL?.ok??''}`,`IMAGE_DECODE_OK=${p?.image?.ok??''}`,`NATURAL_WIDTH=${p?.image?.value?.naturalWidth??''}`,`NATURAL_HEIGHT=${p?.image?.value?.naturalHeight??''}`,`IMAGEBITMAP_OK=${p?.imageBitmap?.ok??''}`,`DOM_BEFORE_LOADED_IMAGES=${p?.domBefore?.loadedImageCount??''}`,`DOM_AFTER_LOADED_IMAGES=${p?.domAfter?.loadedImageCount??''}`,`DOM_AFTER_BLOB_IMAGES=${p?.domAfter?.blobImageCount??''}`,`DOM_AFTER_CANVAS_COUNT=${p?.domAfter?.canvases?.length??''}`,`DOM_ERROR_MATCHES=${(p?.domAfter?.matchedErrors||[]).join(',')}`);}
  write('summary.txt',s.join('\n'));
  await page.screenshot({path:path.join(outDir,'final.png'),fullPage:true}).catch(()=>{}); await context.close().catch(()=>{}); if(typeof device.close==='function') await device.close().catch(()=>{});
  write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime')); await zipOutput(); log('');log('=== COMPLETE ===');log('[FOLDER]',outDir);log('[ZIP]',`${outDir}.zip`);
}

main().catch(async e=>{log('[FATAL]',e?.stack||String(e));write('fatal.txt',e?.stack||String(e));try{write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));}catch{}try{await zipOutput();}catch{}process.exit(1);});
