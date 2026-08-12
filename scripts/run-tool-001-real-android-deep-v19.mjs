#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import zlib from 'zlib';
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
const sizeSweepMb = String(args['sizes-mb'] || '0.5,3,8,15,19').split(',').map(v=>Number(v.trim())).filter(v=>Number.isFinite(v)&&v>0&&v<=19);
if (!sizeSweepMb.length) { console.error('ERROR: --sizes-mb must contain values between 0 and 19'); process.exit(2); }
const attemptsTarget = sizeSweepMb.length;
const waitChangeMs = Math.max(5000, Number(args['wait-change'] || 90000));
const settleMs = Math.max(500, Number(args.settle || 3500));
const selector = String(args.selector || '[data-testid="converter-file-input"], input[type=file]');
if (!url) { console.error('ERROR: --url is required'); process.exit(2); }

const desktop = process.platform === 'win32' ? path.join(process.env.USERPROFILE || os.homedir(), 'Desktop') : os.homedir();
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const outDir = path.join(desktop, `TOOLBOX_001_REAL_ANDROID_DEEP_V19_${stamp}`);
fs.mkdirSync(outDir, { recursive: true });
const runnerLines = [];
function log(...p) { const s = p.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' '); console.log(s); runnerLines.push(s); fs.writeFileSync(path.join(outDir,'runner.log'), runnerLines.join('\n'),'utf8'); }
function write(n,d) { fs.writeFileSync(path.join(outDir,n), typeof d === 'string' ? d : JSON.stringify(d,null,2), 'utf8'); }
function run(exe, argv, opts={}) { return spawnSync(exe, argv, { encoding:'utf8', shell:false, ...opts }); }
function adb(...argv) { return run('adb', argv); }
function adbText(...argv) { const r = adb(...argv); return `${r.stdout||''}${r.stderr||''}`; }
function sleep(ms) { return new Promise(r => setTimeout(r,ms)); }
let overallStep = 0;
const OVERALL_STEPS = 18;
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

let originalStayAwake = null;
let originalScreenOffTimeout = null;
let deviceWatchdogTimer = null;


function getForegroundSignals() {
  const windowTxt = adbText('shell','dumpsys','window','windows');
  const activityTxt = adbText('shell','dumpsys','activity','activities');
  const activityTopTxt = adbText('shell','dumpsys','activity','top');
  const lines = [
    ...windowTxt.split(/\r?\n/).filter(x=>/mCurrentFocus|mFocusedApp/i.test(x)).slice(0,8),
    ...activityTxt.split(/\r?\n/).filter(x=>/mResumedActivity|topResumedActivity|ResumedActivity/i.test(x)).slice(0,8),
    ...activityTopTxt.split(/\r?\n/).filter(x=>/ACTIVITY |mResumedActivity|topResumedActivity/i.test(x)).slice(0,8)
  ].map(x=>x.trim()).filter(Boolean);
  const joined = lines.join('\n');
  const packages = Array.from(new Set(
    [...joined.matchAll(/\b([a-zA-Z][\w]*(?:\.[\w]+){2,})\/[\w.$]+/g)].map(m=>m[1])
  ));
  return { lines, joined, packages, windowTxt, activityTxt, activityTopTxt };
}
function screenStateText() {
  const power = adbText('shell','dumpsys','power');
  const display = adbText('shell','dumpsys','display');
  const policy = adbText('shell','dumpsys','window','policy');
  const fg = getForegroundSignals();
  return { power, display, policy, fg };
}
function isScreenAwake(snapshot) {
  const t = `${snapshot?.power||''}\n${snapshot?.display||''}`;
  return /mWakefulness=Awake/i.test(t) || /Display Power:\s*state=ON/i.test(t) || /\bstate=ON\b/i.test(t);
}
function isKeyguardShowing(snapshot) {
  const t = snapshot?.policy || '';
  return /isStatusBarKeyguard=true/i.test(t) ||
         /mShowingLockscreen=true/i.test(t) ||
         /keyguard.*showing=true/i.test(t) ||
         /showing=true.*keyguard/i.test(t) ||
         /mKeyguardShowing=true/i.test(t);
}
function hasPkg(snapshot, re) {
  const t = snapshot?.fg?.joined || '';
  return re.test(t);
}
function chromeLooksForeground(snapshot) {
  return hasPkg(snapshot, /com\.android\.chrome/i);
}
function systemUiLooksForeground(snapshot) {
  return hasPkg(snapshot, /com\.android\.systemui/i);
}
async function pagePing(page) {
  if (!page) return {ok:false,error:'no-page'};
  try {
    const v = await Promise.race([
      page.evaluate(() => ({href:location.href, visibility:document.visibilityState, focus:document.hasFocus(), readyState:document.readyState})),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('page ping timeout')),3500))
    ]);
    return {ok:true,...v};
  } catch (e) {
    return {ok:false,error:String(e?.message||e)};
  }
}
async function configureStayAwake() {
  originalStayAwake = adbText('shell','settings','get','global','stay_on_while_plugged_in').trim();
  originalScreenOffTimeout = adbText('shell','settings','get','system','screen_off_timeout').trim();

  const a = adb('shell','settings','put','global','stay_on_while_plugged_in','3');
  const b = adb('shell','settings','put','system','screen_off_timeout','2147483647');
  adb('shell','svc','power','stayon','usb');
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  if (a.status !== 0) throw new Error(`Failed to enable stay-awake: ${a.stderr||a.stdout||''}`);
  if (b.status !== 0) log(`[WARN] could not extend screen_off_timeout: ${b.stderr||b.stdout||''}`);
  await sleep(450);
  log(`[DEVICE] stay_on_while_plugged_in: ${originalStayAwake || '(unset)'} -> 3`);
  log(`[DEVICE] screen_off_timeout: ${originalScreenOffTimeout || '(unset)'} -> 2147483647`);
}
async function restoreStayAwake() {
  if (deviceWatchdogTimer) {
    clearInterval(deviceWatchdogTimer);
    deviceWatchdogTimer = null;
  }
  if (originalStayAwake != null) {
    const v = String(originalStayAwake).trim();
    if (!v || v === 'null') adb('shell','settings','delete','global','stay_on_while_plugged_in');
    else adb('shell','settings','put','global','stay_on_while_plugged_in',v);
    log(`[DEVICE] restored stay_on_while_plugged_in=${v || '(deleted)'}`);
  }
  if (originalScreenOffTimeout != null) {
    const v = String(originalScreenOffTimeout).trim();
    if (!v || v === 'null') adb('shell','settings','delete','system','screen_off_timeout');
    else adb('shell','settings','put','system','screen_off_timeout',v);
    log(`[DEVICE] restored screen_off_timeout=${v || '(deleted)'}`);
  }
  adb('shell','svc','power','stayon','false');
}
function startDeviceWatchdog() {
  if (deviceWatchdogTimer) clearInterval(deviceWatchdogTimer);
  deviceWatchdogTimer = setInterval(() => {
    try {
      adb('shell','input','keyevent','KEYCODE_WAKEUP');
    } catch {}
  }, 3500);
}


function secureLockSnapshot() {
  let xml = '';
  try { xml = dumpUi(); } catch {}
  const snap = screenStateText();
  const systemUi = /package="com\.android\.systemui"/i.test(xml) || systemUiLooksForeground(snap);
  const credential = /(pin을 입력|pin|password|비밀번호|pattern|패턴|enter pin|enter password|unlock|잠금 해제)/i.test(xml);
  const dumpsysLocked = isKeyguardShowing(snap);
  return { xml, snap, systemUi, credential, blocked: (systemUi && credential) || dumpsysLocked };
}
async function assertInteractiveUnlocked(label='lock-check') {
  const s = secureLockSnapshot();
  if (s.blocked) {
    write(`secure-lock-${Date.now()}.xml`, s.xml || '');
    await saveDeviceScreen(`secure-lock-${Date.now()}.png`).catch(()=>{});
    throw new Error(`SECURE_LOCK_ACTIVE at ${label}. Unlock the Galaxy once and rerun; V19 keeps the display awake after startup.`);
  }
  return s;
}
async function recoverToChrome(page, label='recover-to-chrome') {
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  await sleep(200);
  await assertInteractiveUnlocked(`${label}:before`);
  adb('shell','am','start','-n','com.android.chrome/com.google.android.apps.chrome.Main');
  if (page) await page.bringToFront().catch(()=>{});
  await sleep(550);
  const ping = await pagePing(page);
  if (!ping.ok) throw new Error(`CHROME_PAGE_UNHEALTHY at ${label}: ${ping.error||'unknown'}`);
  await assertInteractiveUnlocked(`${label}:after`);
  return ping;
}
async function ensureDeviceReady(page, label='device ready') {
  log(`[DEVICE] ensure ready: ${label}`);
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  await sleep(300);
  adb('shell','wm','dismiss-keyguard');
  await sleep(300);

  let snap = screenStateText();
  if (!isScreenAwake(snap)) {
    adb('shell','input','keyevent','KEYCODE_WAKEUP');
    await sleep(500);
    snap = screenStateText();
  }

  if (isKeyguardShowing(snap)) {
    const size = adbText('shell','wm','size');
    const m = size.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i) || size.match(/(\d+)x(\d+)/);
    if (m) {
      const sw=Number(m[1]), sh=Number(m[2]);
      adb('shell','input','swipe',String(Math.round(sw*.5)),String(Math.round(sh*.82)),String(Math.round(sw*.5)),String(Math.round(sh*.28)),'250');
      await sleep(500);
      adb('shell','wm','dismiss-keyguard');
      await sleep(350);
      snap = screenStateText();
    }
  }

  if (isKeyguardShowing(snap)) {
    write('device-keyguard-blocked.txt', [
      `label=${label}`,
      `foreground=${snap.fg?.joined||''}`,
      '',
      snap.policy || ''
    ].join('\n'));
    throw new Error('Device is still on a secure lock screen. Unlock the Galaxy once, then rerun; V19 keeps it awake afterward.');
  }

  await assertInteractiveUnlocked(`${label}:post-wake`);

  // If Chrome is not positively identified, attempt recovery. Do not fail on empty Samsung/Android-15 dumpsys output.
  if (!chromeLooksForeground(snap) || systemUiLooksForeground(snap)) {
    adb('shell','am','start','-n','com.android.chrome/com.google.android.apps.chrome.Main');
    await sleep(700);
  }
  if (page) {
    await page.bringToFront().catch(()=>{});
    await sleep(250);
  }

  snap = screenStateText();
  const ping = await pagePing(page);
  write(`device-state-${Date.now()}.txt`, [
    `label=${label}`,
    `awake=${isScreenAwake(snap)}`,
    `keyguard=${isKeyguardShowing(snap)}`,
    `foreground_packages=${(snap.fg?.packages||[]).join(',')}`,
    `foreground_lines=${(snap.fg?.lines||[]).join(' || ')}`,
    `page_ping_ok=${ping.ok}`,
    `page_href=${ping.href||''}`,
    `page_visibility=${ping.visibility||''}`,
    `page_focus=${ping.focus??''}`,
    `page_ping_error=${ping.error||''}`
  ].join('\n'));

  if (!isScreenAwake(snap)) throw new Error('Android display could not be kept awake');
  if (isKeyguardShowing(snap)) throw new Error('Android keyguard is still showing');

  if (chromeLooksForeground(snap)) {
    log(`[PASS] device awake + unlocked + Chrome foreground (${(snap.fg?.lines||[])[0]||'multi-signal'})`);
    return {snap,ping,mode:'foreground-signal'};
  }

  if (ping.ok) {
    log(`[WARN] foreground package could not be resolved reliably; Playwright page ping is healthy, continuing (${ping.visibility}, focus=${ping.focus})`);
    return {snap,ping,mode:'page-ping-fallback'};
  }

  throw new Error(`Chrome/page is not recoverable. foreground=${snap.fg?.joined||'(empty)'} ping=${ping.error||'failed'}`);
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
  return { x: Math.floor((Number(m[1])+Number(m[3]))/2), y: Math.floor((Number(m[2])+Number(m[4]))/2), w:Number(m[3])-Number(m[1]), h:Number(m[4])-Number(m[2]) };
}
function dumpUi() {
  const remote='/sdcard/tool001-v19-window.xml';
  adb('shell','uiautomator','dump','--compressed',remote);
  return adbText('shell','cat',remote);
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
function nodeHay(node) {
  return [node.text,node['content-desc'],node['resource-id'],node.class,node.package].filter(Boolean).join(' ').toLowerCase();
}
function nodeMatches(node, needles) {
  const hay=nodeHay(node);
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
  // Capture directly to the PC. Never create a diagnostic image inside MediaStore-visible
  // device folders because Photo Picker sorts media by recency and that can steal the target.
  const local=path.join(outDir,name);
  const r=spawnSync('adb',['exec-out','screencap','-p'],{encoding:null,shell:false,maxBuffer:64*1024*1024});
  if(r.status!==0 || !r.stdout || !r.stdout.length){
    throw new Error(`ADB_SCREENSHOT_TO_PC_FAILED status=${r.status} stderr=${String(r.stderr||'')}`);
  }
  fs.writeFileSync(local,r.stdout);
  return {local,bytes:r.stdout.length,mediaStoreTouched:false};
}
function pickerSignalSnapshot() {
  const fg=getForegroundSignals();
  const xml=dumpUi();
  const nodes=parseUiNodes(xml);
  const packages=Array.from(new Set(nodes.map(n=>n.package).filter(Boolean)));
  const text=nodes.map(nodeHay).join('\n');
  const knownPkg = [...(fg.packages||[]),...packages].some(p=>
    /(documentsui|myfiles|providers\.media|photopicker|media\.module|files|filepicker|picker)/i.test(p)
  );
  const uiHints = /(recent|최근|downloads|다운로드|images|이미지|photos|사진|browse|찾아보기|파일|files|앨범|album|선택|choose|완료|done|추가|add)/i.test(text);
  const chromeForeground = /com\.android\.chrome/i.test(fg.joined||'');
  const systemUiOnly = !knownPkg && /com\.android\.systemui/i.test(fg.joined||'') && packages.every(p=>/systemui/i.test(p));
  const detected = !systemUiOnly && (knownPkg || (!chromeForeground && uiHints));
  return {detected,fg,xml,nodes,packages,knownPkg,uiHints,chromeForeground,systemUiOnly};
}
async function waitForPicker(timeoutMs=15000) {
  const start=Date.now(); let last=null;
  while(Date.now()-start<timeoutMs) {
    const s=pickerSignalSnapshot(); last=s;
    if(s.detected) {
      log(`[PICKER] detected packages=${[...(s.fg.packages||[]),...s.packages].join(',')||'(unknown)'} knownPkg=${s.knownPkg} uiHints=${s.uiHints}`);
      return s;
    }
    await sleep(450);
  }
  throw new Error(`Android native picker not detected within ${timeoutMs}ms; foreground=${last?.fg?.joined||'(empty)'} uiPackages=${(last?.packages||[]).join(',')}`);
}
async function pickerStillOpen() {
  try { return pickerSignalSnapshot().detected; } catch { return false; }
}
async function tapPickerConfirm(attemptIndex) {
  await sleep(450);
  if (!(await pickerStillOpen())) return {needed:false,closed:true};
  const xml=dumpUi();
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-picker-after-item.xml`,xml);
  const nodes=parseUiNodes(xml);
  const confirms=[
    '선택','완료','추가','열기','확인','choose','select','done','add','open','use this','使用','選択','完了','追加','開く'
  ];
  const hit=nodes.find(n=>{
    if(!nodeMatches(n,confirms)) return false;
    const h=nodeHay(n);
    if(/취소|cancel|닫기|close/.test(h)) return false;
    const c=centerOfBounds(n.bounds);
    return c && c.w>20 && c.h>20;
  });
  if(hit){
    const c=tapNode(hit,'picker confirm');
    log(`[NATIVE] tapped picker confirmation at ${c.x},${c.y}: ${nodeHay(hit).slice(0,120)}`);
    await sleep(700);
    return {needed:true,tapped:true};
  }
  log('[NATIVE] picker still open but no explicit confirmation button found');
  return {needed:true,tapped:false};
}

function parseBounds(bounds='') {
  const c=centerOfBounds(bounds);
  if(!c) return null;
  const m=String(bounds).match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  return m ? {left:Number(m[1]),top:Number(m[2]),right:Number(m[3]),bottom:Number(m[4]),...c} : null;
}
function parseUiTree(xml) {
  // Minimal hierarchy parser for Android uiautomator XML. Keeps parent/child relation,
  // which is required to distinguish Photo Picker media cells from its drag handle.
  const tokens=String(xml||'').match(/<node\s+[^>]*>|<\/node>/g)||[];
  const root={attrs:{},children:[]};
  const stack=[root];
  for(const tok of tokens){
    if(tok.startsWith('</node')){
      if(stack.length>1) stack.pop();
      continue;
    }
    const attrs={};
    const ar=/([\w-]+)="([^"]*)"/g; let a;
    while((a=ar.exec(tok))) attrs[a[1]]=xmlDecode(a[2]);
    const node={attrs,children:[]};
    stack[stack.length-1].children.push(node);
    if(!tok.endsWith('/>')) stack.push(node);
  }
  return root;
}
function descendantText(node) {
  const parts=[];
  const walk=n=>{
    if(n?.attrs){
      if(n.attrs.text) parts.push(n.attrs.text);
      if(n.attrs['content-desc']) parts.push(n.attrs['content-desc']);
      if(n.attrs['resource-id']) parts.push(n.attrs['resource-id']);
    }
    for(const c of n?.children||[]) walk(c);
  };
  walk(node);
  return parts.join(' ');
}
function photoPickerMediaCells(xml) {
  const tree=parseUiTree(xml);
  const out=[];
  const walk=n=>{
    const a=n.attrs||{};
    const b=parseBounds(a.bounds);
    const desc=descendantText(n);
    // Real Photo Picker media cells on this Galaxy are ~1/3 screen wide and nearly square.
    // Explicitly reject the 135x135 drag handle that V12 accidentally clicked.
    if(a.package==='com.google.android.photopicker' &&
       a.clickable==='true' && b &&
       b.w>=240 && b.h>=240 &&
       b.w<=430 && b.h<=430 &&
       Math.abs(b.w-b.h)<=90 &&
       b.top>=350 &&
       /(촬영한 사진|photo|image|video|사진|이미지)/i.test(desc)) {
      out.push({node:n,attrs:a,bounds:b,desc});
    }
    for(const c of n.children||[]) walk(c);
  };
  walk(tree);
  out.sort((x,y)=>(x.bounds.top-y.bounds.top)||(x.bounds.left-y.bounds.left));
  return out;
}
function pickerSelectionSignals(xml) {
  const nodes=parseUiNodes(xml);
  const selectedNodes=nodes.filter(n=>
    n.checked==='true' ||
    /(선택됨|selected|1개 선택|1 selected|체크됨|checked)/i.test(nodeHay(n))
  );
  return {selectedNodes};
}
function photoPickerActionControls(xml) {
  const tree=parseUiTree(xml);
  const out=[];
  const positiveExact=/^(완료|추가|열기|확인|done|add|open|choose|use|選択|完了|追加|開く)$/i;
  const negative=/(전체 선택 해제|선택 해제|deselect|unselect|미리보기|preview|취소|cancel|닫기|close|선택됨|selected|사진 또는 동영상 .*개 선택)/i;
  const walk=n=>{
    const a=n.attrs||{};
    const b=parseBounds(a.bounds);
    const label=descendantText(n).trim().replace(/\s+/g,' ');
    if(a.package==='com.google.android.photopicker' && a.clickable==='true' && b &&
       b.w>=90 && b.h>=60 && b.top>=1600 && !negative.test(label)) {
      const tokens=label.split(/\s+/).filter(Boolean);
      const exact=tokens.find(t=>positiveExact.test(t));
      if(exact) out.push({node:n,attrs:a,bounds:b,label,exact});
    }
    for(const c of n.children||[]) walk(c);
  };
  walk(tree);
  // Prefer the bottom-right action. On the observed Android 15 picker this is the clickable parent of "완료".
  out.sort((a,b)=>(b.bounds.top-a.bounds.top)||(b.bounds.left-a.bounds.left));
  return out;
}
async function pickerClosedStable(page=null, timeoutMs=6500) {
  const started=Date.now(); let consecutive=0, last=null;
  while(Date.now()-started<timeoutMs){
    await sleep(250);
    let open=true;
    try { last=pickerSignalSnapshot(); open=!!last.detected; } catch { open=false; }
    const ping=page ? await pagePing(page) : {ok:true};
    if(!open && ping.ok) consecutive++; else consecutive=0;
    if(consecutive>=3) return {closed:true,last,ping};
  }
  return {closed:false,last};
}
function targetCellSelected(xml, cell) {
  const nodes=parseUiNodes(xml);
  return nodes.some(n=>{
    const b=parseBounds(n.bounds); if(!b) return false;
    const overlaps = Math.abs(b.left-cell.left)<8 && Math.abs(b.top-cell.top)<8 && Math.abs(b.right-cell.right)<8 && Math.abs(b.bottom-cell.bottom)<8;
    return overlaps && /(선택됨|selected)/i.test(nodeHay(n));
  }) || nodes.some(n=>{
    const b=parseBounds(n.bounds); if(!b) return false;
    const inside=b.left>=cell.left && b.right<=cell.right && b.top>=cell.top && b.bottom<=cell.bottom;
    return inside && /(선택됨|selected)/i.test(nodeHay(n));
  });
}
async function verifyAndCommitPhotoPickerSelection(attemptIndex, beforeXml, tappedCell, page=null) {
  const cell=tappedCell.bounds;
  const positions=[
    {name:'center',x:cell.x,y:cell.y},
    {name:'top-right',x:Math.round(cell.right-34),y:Math.round(cell.top+34)},
    {name:'upper-center',x:cell.x,y:Math.round(cell.top+70)}
  ];

  // Center was already tapped by findAndTapFile. Only retry another tile affordance when selection itself is NOT observed.
  for(let pi=0;pi<positions.length;pi++){
    const p=positions[pi];
    if(pi>0){
      const current=dumpUi();
      if(targetCellSelected(current,cell)) break;
      adb('shell','input','tap',String(p.x),String(p.y));
      log(`[PHOTO_PICKER] retry selection tap ${p.name}=(${p.x},${p.y})`);
      await sleep(650);
    }

    const closed=await pickerClosedStable(page,1800);
    if(closed.closed){
      log(`[PASS] Photo Picker stably closed after ${p.name} tap`);
      return {committed:true,mode:`picker-auto-close-${p.name}`,selectionObserved:true};
    }

    const xml=dumpUi();
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-selection-${pi+1}.xml`,xml);
    if(!targetCellSelected(xml,cell)) continue;

    const sig=pickerSelectionSignals(xml);
    const actions=photoPickerActionControls(xml);
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-commit-controls-${pi+1}.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));
    log(`[PASS] Photo Picker target tile selected after ${p.name}; selectedSignals=${sig.selectedNodes.length} commitControls=${actions.length}`);

    for(const action of actions){
      // Never press a deselect/preview surrogate. Action was resolved from its CLICKABLE PARENT, not the non-clickable text child.
      const c=action.bounds;
      adb('shell','input','tap',String(c.x),String(c.y));
      log(`[PHOTO_PICKER] tapped VERIFIED commit action "${action.exact}" parent=(${c.x},${c.y}) bounds=[${c.left},${c.top}][${c.right},${c.bottom}]`);
      await saveDeviceScreen(`attempt-${String(attemptIndex).padStart(2,'0')}-after-commit-tap.png`).catch(()=>{});
      const close=await pickerClosedStable(page,6500);
      if(close.closed){
        log(`[PASS] Photo Picker stably closed after VERIFIED "${action.exact}" action`);
        return {committed:true,mode:'selected-plus-verified-action',selectionObserved:true,action:action.exact,bounds:c};
      }
      log(`[WARN] commit action "${action.exact}" did not close picker; trying next verified action if any`);
    }

    // Once target selection is proven, do NOT tap the media tile again because that can deselect it.
    return {committed:false,mode:actions.length?'verified-action-did-not-close':'selected-but-no-valid-commit-action',selectionObserved:true,
      actions:actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds}))};
  }

  // Only if no selection state was ever observed, use a verified-tile long press as final fallback.
  adb('shell','input','swipe',String(cell.x),String(cell.y),String(cell.x),String(cell.y),'650');
  log(`[PHOTO_PICKER] long-press fallback on VERIFIED media cell (${cell.x},${cell.y})`);
  await sleep(750);
  const close=await pickerClosedStable(page,1800);
  if(close.closed) return {committed:true,mode:'longpress-auto-close',selectionObserved:true};
  const xml=dumpUi();
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-selection-longpress.xml`,xml);
  if(targetCellSelected(xml,cell)){
    const actions=photoPickerActionControls(xml);
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-commit-controls-longpress.json`,actions.map(a=>({label:a.label,exact:a.exact,bounds:a.bounds})));
    for(const action of actions){
      const c=action.bounds;
      adb('shell','input','tap',String(c.x),String(c.y));
      log(`[PHOTO_PICKER] long-press mode VERIFIED commit "${action.exact}" (${c.x},${c.y})`);
      if((await pickerClosedStable(page,6500)).closed) return {committed:true,mode:'longpress-plus-verified-action',selectionObserved:true,action:action.exact,bounds:c};
    }
    return {committed:false,mode:'longpress-selected-but-no-commit',selectionObserved:true};
  }
  return {committed:false,mode:'no-selection-state',selectionObserved:false};
}


function mediaStoreQueryError(raw) {
  return /Error while accessing provider|IllegalArgumentException|Unknown column|Invalid column|Exception/i.test(String(raw||''));
}
function parseMediaStoreRows(raw) {
  const rows=[];
  for(const line of String(raw||'').split(/\r?\n/)){
    const idm=line.match(/(?:^|[\s,])_id=(\d+)/i);
    const namem=line.match(/(?:^|[\s,])_display_name=([^,\r\n]+)/i);
    const datem=line.match(/(?:^|[\s,])date_added=(\d+)/i);
    const sizem=line.match(/(?:^|[\s,])(?:_size|size)=(\d+)/i);
    const relm=line.match(/(?:^|[\s,])relative_path=([^,\r\n]+)/i);
    if(!idm || !namem) continue;
    rows.push({line,id:Number(idm[1]),name:namem[1].trim(),dateAdded:datem?Number(datem[1]):0,size:sizem?Number(sizem[1]):null,relativePath:relm?relm[1].trim():null});
  }
  return rows;
}
function queryImageMediaStore() {
  // Android 15 vendor builds disagree on projection names. `_size` is the canonical
  // MediaStore column; some `content` CLI variants reject unsupported projections.
  // Probe progressively and never let a diagnostic projection bug block the real test.
  const profiles=[
    ['_id:_display_name:date_added:_size:relative_path','full'],
    ['_id:_display_name:date_added:_size','size'],
    ['_id:_display_name:date_added','basic'],
    [null,'raw']
  ];
  const attempts=[];
  for(const [projection,label] of profiles){
    const args=['shell','content','query','--uri','content://media/external/images/media'];
    if(projection) args.push('--projection',projection);
    const raw=adbText(...args);
    attempts.push({label,projection,raw,error:mediaStoreQueryError(raw)});
    if(!mediaStoreQueryError(raw)) return {raw,rows:parseMediaStoreRows(raw),profile:label,projection,attempts};
  }
  return {raw:attempts.at(-1)?.raw||'',rows:[],profile:'unavailable',projection:null,attempts};
}
function mediaStoreTargetProof(filename, attemptIndex, label='check', hardNewest=false) {
  const q=queryImageMediaStore();
  const rows=q.rows||[];
  const targetRows=rows.filter(r=>r.name.toLowerCase()===String(filename).toLowerCase());
  const sorted=[...rows].sort((a,b)=>(b.dateAdded-a.dateAdded)||(b.id-a.id));
  const target=[...targetRows].sort((a,b)=>(b.dateAdded-a.dateAdded)||(b.id-a.id))[0]||null;
  const newest=sorted[0]||null;
  const rank=target?sorted.findIndex(r=>r.id===target.id):-1;
  const proof={label,filename,queryProfile:q.profile,queryAvailable:q.profile!=='unavailable',target,newest,rank,rowCount:rows.length,found:!!target,newestPass:!!target&&!!newest&&newest.id===target.id,hardNewest};
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-mediastore-${label}.json`,proof);
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-mediastore-${label}.txt`,q.attempts.map(a=>`[${a.label}] projection=${a.projection||'NONE'} error=${a.error}\n${a.raw}`).join('\n\n'));
  if(hardNewest && proof.queryAvailable && proof.found && !proof.newestPass){
    throw new Error(`MEDIASTORE_TARGET_NOT_NEWEST expected=${filename} targetId=${target.id} newest=${newest?.name||'NONE'} newestId=${newest?.id??'NONE'}`);
  }
  return proof;
}
function deviceFileSize(remote) {
  const stat=adbText('shell','stat','-c','%s',remote).trim();
  if(/^\d+$/.test(stat)) return Number(stat);
  const wc=adbText('shell','sh','-c',`wc -c < "${remote.replace(/"/g,'\\"')}"`).trim();
  const m=wc.match(/\d+/); return m?Number(m[0]):null;
}
async function waitForMediaStoreTarget(filename, attemptIndex, timeoutMs=30000) {
  const started=Date.now(); let last=null;
  while(Date.now()-started<timeoutMs){
    const proof=mediaStoreTargetProof(filename,attemptIndex,'index-wait',false); last=proof;
    if(proof.found) return proof;
    // A provider-query incompatibility is diagnostic-only. Device-file existence + exact
    // Chrome File.size is the hard end-to-end proof, so do not burn 30s on an unavailable CLI.
    if(!proof.queryAvailable) return proof;
    await sleep(750);
  }
  return last||mediaStoreTargetProof(filename,attemptIndex,'index-timeout',false);
}
async function findAndTapFile(filename, attemptIndex, page=null, timeoutMs=45000, candidateOffset=0) {
  const started=Date.now();
  const shortName=filename.replace(/\.[^.]+$/,'');
  const labels=[filename,shortName];

  while(Date.now()-started<timeoutMs){
    const snap=pickerSignalSnapshot();
    const xml=snap.xml;
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-picker-ui.xml`,xml);

    // Android 15 Google Photo Picker path: filenames are intentionally hidden from accessibility.
    if((snap.packages||[]).includes('com.google.android.photopicker') ||
       /package="com\.google\.android\.photopicker"/i.test(xml)){
      // Re-prove immediately before tapping that our target is still the newest image.
      // Never guess the first Photo Picker tile if another media row appeared.
      const mediaProof=mediaStoreTargetProof(filename,attemptIndex,'picker-pre-tap',false);

      const cells=photoPickerMediaCells(xml);
      write(`attempt-${String(attemptIndex).padStart(2,'0')}-photo-cells.json`,
        cells.map(c=>({bounds:c.bounds,desc:c.desc})));

      if(!cells.length){
        log('[PHOTO_PICKER] no validated square media cells yet; waiting for grid render');
        await sleep(700);
        continue;
      }

      // Prefer the target's MediaStore recency rank when the provider query is usable.
      // If the CLI query is unavailable on this Android build, fall back to newest-first and
      // let the exact Chrome File.size gate prove whether the selected item is truly ours.
      const baseRank=(mediaProof.found && mediaProof.rank>=0)?mediaProof.rank:0;
      const chosenIndex=Math.min(cells.length-1,Math.max(0,baseRank+candidateOffset));
      const cell=cells[chosenIndex];
      log(`[PHOTO_PICKER] validated media cells=${cells.length}; queryProfile=${mediaProof.queryProfile}; targetRank=${mediaProof.rank}; candidateOffset=${candidateOffset}; chosenIndex=${chosenIndex}; bounds=${cell.attrs.bounds} desc="${cell.desc.slice(0,120)}"`);

      // Sanity: never permit the historical V12 drag-handle dimensions to be clicked.
      if(cell.bounds.w<240 || cell.bounds.h<240){
        throw new Error(`PHOTO_PICKER_CELL_GUARD_REJECTED ${JSON.stringify(cell.bounds)}`);
      }

      adb('shell','input','tap',String(cell.bounds.x),String(cell.bounds.y));
      log(`[PHOTO_PICKER] tapped VERIFIED newest media cell center=(${cell.bounds.x},${cell.bounds.y})`);
      await sleep(650);

      const commit=await verifyAndCommitPhotoPickerSelection(attemptIndex,xml,cell,page);
      write(`attempt-${String(attemptIndex).padStart(2,'0')}-photo-commit.json`,commit);
      if(!commit.committed){
        throw new Error(`PHOTO_PICKER_SELECTION_NOT_COMMITTED mode=${commit.mode}`);
      }
      return {strategy:'android15-photopicker-verified-grid',point:{x:cell.bounds.x,y:cell.bounds.y},commit};
    }

    // Generic DocumentsUI / My Files fallback: prefer exact filename.
    const nodes=parseUiNodes(xml);
    const hit=nodes.find(n=>nodeMatches(n,labels) && centerOfBounds(n.bounds));
    if(hit){
      const c=tapNode(hit,'test file');
      log(`[NATIVE] tapped exact test file ${filename} at ${c.x},${c.y}`);
      await sleep(600);
      await tapPickerConfirm(attemptIndex);
      return {strategy:'exact-name-generic-picker',point:c};
    }

    const dl=nodes.find(n=>nodeMatches(n,['downloads','다운로드','download']) && centerOfBounds(n.bounds));
    if(dl){
      const c=tapNode(dl,'Downloads');
      log(`[NATIVE] opened Downloads at ${c.x},${c.y}`);
      await sleep(800);
      continue;
    }

    const search=nodes.find(n=>nodeMatches(n,['search','검색','検索']) && centerOfBounds(n.bounds));
    if(search){
      const c=tapNode(search,'Search');
      log(`[NATIVE] opened picker search at ${c.x},${c.y}`);
      await sleep(350);
      adb('shell','input','text',filename.replace(/%/g,'\\%').replace(/\s/g,'%s'));
      adb('shell','input','keyevent','KEYCODE_ENTER');
      await sleep(1000);
      continue;
    }

    await sleep(650);
  }
  throw new Error(`Native picker could not locate/select/commit ${filename} within ${timeoutMs}ms`);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let k=0;k<8;k++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const t=Buffer.from(type,'ascii');
  const out=Buffer.alloc(12+data.length);
  out.writeUInt32BE(data.length,0); t.copy(out,4); data.copy(out,8);
  out.writeUInt32BE(crc32(Buffer.concat([t,data])),8+data.length);
  return out;
}
function makeTestPng(localPath, targetBytes=512*1024) {
  // Realistic screenshot geometry (1080x2400) plus an ancillary chunk that brings the
  // provider-transfer size to the requested target. This tests BOTH MB-scale handoff and
  // a phone-shaped image decode/preview instead of the historical 1x1/190-byte toy.
  const width=720, height=1600;
  const raw=Buffer.alloc((width*3+1)*height);
  const stride=width*3+1;
  for(let y=0;y<height;y++){
    const row=y*stride; raw[row]=0; // PNG filter: None
    for(let x=0;x<width;x++){
      const o=row+1+x*3;
      raw[o]=(x*255/width)|0;
      raw[o+1]=(y*255/height)|0;
      raw[o+2]=((x+y)>>3)&255;
    }
  }
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0); ihdr.writeUInt32BE(height,4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  const idat=pngChunk('IDAT',zlib.deflateSync(raw,{level:6}));
  const prefix=Buffer.concat([sig,pngChunk('IHDR',ihdr),idat]);
  const iend=pngChunk('IEND',Buffer.alloc(0));
  const minimum=prefix.length+iend.length;
  if(targetBytes<minimum) targetBytes=minimum;
  const padDataLen=Math.max(8,targetBytes-minimum-12);
  const pad=Buffer.alloc(padDataLen,0x41); Buffer.from('tool001-v19\0','ascii').copy(pad,0);
  let buf=Buffer.concat([prefix,pngChunk('tEXt',pad),iend]);
  // Exact-size gate: compensate for any arithmetic edge by trimming/expanding the ancillary payload.
  if(buf.length!==targetBytes){
    const delta=targetBytes-buf.length;
    const adjusted=Buffer.alloc(Math.max(8,padDataLen+delta),0x41); Buffer.from('tool001-v19\0','ascii').copy(adjusted,0);
    buf=Buffer.concat([prefix,pngChunk('tEXt',adjusted),iend]);
  }
  fs.writeFileSync(localPath,buf);
  return {bytes:buf.length,signature:buf.subarray(0,8).toString('hex'),width,height,baseBytes:minimum};
}

async function prepareDeviceFiles(count) {
  const files=[];
  const token=Date.now();
  for(let i=1;i<=count;i++){
    const mb=sizeSweepMb[i-1] ?? sizeSweepMb[sizeSweepMb.length-1];
    const targetBytes=Math.max(64*1024,Math.round(mb*1024*1024));
    const safeMb=String(mb).replace('.','p');
    const name=`TOOL001_V19_${safeMb}MB_${token}_${String(i).padStart(2,'0')}.png`;
    const local=path.join(outDir,name); const meta=makeTestPng(local,targetBytes);
    files.push({
      name,local,testSizeMb:mb,testBytes:meta.bytes,
      remoteDownload:`/sdcard/Download/${name}`,
      remotePictures:`/sdcard/Pictures/${name}`
    });
  }
  return files;
}
async function stageDeviceFile(tf, attemptIndex) {
  // One canonical file only. Remove stale TOOL001 test artifacts before every size case.
  // The browser-side exact File.size gate is the final truth, so MediaStore CLI probing is supportive,
  // not a brittle single point of failure.
  const remote=tf.remotePictures;
  adb('shell','sh','-c','rm -f /sdcard/Pictures/TOOL001_V1*.png /sdcard/Download/TOOL001_V1*.png 2>/dev/null || true');
  await sleep(250);

  const r=run('adb',['push',tf.local,remote]);
  if(r.status!==0) throw new Error(`ADB_PUSH_FAILED ${tf.name} -> ${remote}: ${r.stderr||r.stdout||''}`);
  adb('shell','touch',remote);

  const actualSize=deviceFileSize(remote);
  if(Number(actualSize)!==Number(tf.testBytes)){
    throw new Error(`DEVICE_FILE_SIZE_MISMATCH expected=${tf.testBytes} actual=${actualSize} file=${tf.name}`);
  }

  // Trigger multiple harmless scanner paths. Some Android 15 builds index asynchronously.
  adb('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${remote}`);
  adb('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d','file:///sdcard/Pictures/');

  const proof=await waitForMediaStoreTarget(tf.name,attemptIndex,30000);
  const exists=adbText('shell','ls','-l',remote);
  write(`device-file-${attemptIndex}.txt`,[
    exists,
    `EXPECTED_BYTES=${tf.testBytes}`,
    `DEVICE_BYTES=${actualSize}`,
    `MEDIASTORE_QUERY_PROFILE=${proof?.queryProfile||'unknown'}`,
    `MEDIASTORE_QUERY_AVAILABLE=${proof?.queryAvailable??false}`,
    `MEDIASTORE_TARGET_FOUND=${proof?.found??false}`,
    `MEDIASTORE_TARGET_RANK=${proof?.rank??-1}`,
    `MEDIASTORE_TARGET_NEWEST=${proof?.newestPass??false}`
  ].join('\n'));

  if(proof?.found) log(`[PASS] MediaStore target visible profile=${proof.queryProfile} rank=${proof.rank} newest=${proof.newestPass}`);
  else log(`[WARN] MediaStore CLI could not prove target; continuing with device-size + picker + exact Chrome File.size hard gates`);
  log(`[PASS] staged canonical file ${tf.name} bytes=${actualSize} -> ${remote}`);
  return {exists,indexed:!!proof?.found,remote,targetId:proof?.target?.id??null,proof,actualSize};
}

async function clickUploadButton(page, context, attemptIndex) {
  await assertInteractiveUnlocked(`attempt ${attemptIndex}:immediately-before-upload-activation`);

  const label = attemptIndex === 1
    ? /이미지 선택|Choose images|画像を選択/
    : /이미지 추가|Add images|画像を追加|이미지 선택|Choose images|画像を選択/;
  const btn = page.getByRole('button',{name:label}).first();
  await btn.waitFor({state:'attached',timeout:8000});
  await btn.evaluate(el => el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
  await sleep(250);

  const geom = await btn.evaluate(el => {
    const r=el.getBoundingClientRect(), vv=window.visualViewport;
    return {
      x:r.left,y:r.top,width:r.width,height:r.height,
      dpr:window.devicePixelRatio||1,screenW:screen.width,screenH:screen.height,
      visualOffsetLeft:vv?.offsetLeft||0,visualOffsetTop:vv?.offsetTop||0,
      visualH:vv?.height||window.innerHeight,text:(el.textContent||'').trim()
    };
  });
  if (!geom || geom.width<=0 || geom.height<=0) throw new Error(`UPLOAD_BUTTON_BAD_RECT ${JSON.stringify(geom)}`);
  const cssX=Math.round(geom.x+geom.width/2), cssY=Math.round(geom.y+geom.height/2);
  const strategies=[];

  async function pickerOpenedWithin(ms) {
    const start=Date.now();
    while(Date.now()-start<ms) {
      await assertInteractiveUnlocked(`attempt ${attemptIndex}:post-activation`);
      try { if (pickerSignalSnapshot().detected) return true; } catch {}
      await sleep(250);
    }
    return false;
  }

  // Strategy A: trusted CDP mouse click. Bound the session creation and dispatch separately.
  try {
    const cdp = await Promise.race([
      context.newCDPSession(page),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('CDP_SESSION_TIMEOUT')),2200))
    ]);
    await Promise.race([
      (async()=>{
        await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:cssX,y:cssY,button:'left',clickCount:1});
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:cssX,y:cssY,button:'left',clickCount:1});
      })(),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('CDP_DISPATCH_TIMEOUT')),1800))
    ]);
    await cdp.detach().catch(()=>{});
    strategies.push({method:'cdp-mouse',ok:true});
    log(`[TOUCH] CDP trusted click css=(${cssX},${cssY})`);
    if (await pickerOpenedWithin(2600)) return {method:'cdp-mouse',geom,strategies};
    strategies.at(-1).picker=false;
  } catch(e) {
    strategies.push({method:'cdp-mouse',ok:false,error:String(e?.message||e)});
    log(`[WARN] CDP strategy: ${e?.message||e}`);
  }

  // Strategy B: ADB physical screen tap.
  try {
    await assertInteractiveUnlocked(`attempt ${attemptIndex}:before-adb-tap`);
    const wm=adbText('shell','wm','size');
    const m=wm.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i)||wm.match(/(\d+)x(\d+)/);
    if(!m) throw new Error(`SCREEN_SIZE_PARSE_FAIL ${wm}`);
    const sw=Number(m[1]), sh=Number(m[2]);
    const scaleX=sw/Math.max(1,geom.screenW*geom.dpr);
    const cssToPx=geom.dpr*scaleX;
    const topInset=Math.max(0,sh-Math.round(geom.visualH*cssToPx));
    const ax=Math.max(1,Math.min(sw-1,Math.round((cssX+geom.visualOffsetLeft)*cssToPx)));
    const ay=Math.max(1,Math.min(sh-1,Math.round(topInset+(cssY-geom.visualOffsetTop)*cssToPx)));
    const r=adb('shell','input','tap',String(ax),String(ay));
    if(r.status!==0) throw new Error(`ADB_TAP_FAIL ${r.stderr||r.stdout||''}`);
    strategies.push({method:'adb-tap',ok:true,x:ax,y:ay,topInset});
    log(`[TOUCH] ADB physical tap=(${ax},${ay})`);
    if(await pickerOpenedWithin(3200)) return {method:'adb-tap',geom,strategies};
    strategies.at(-1).picker=false;
  } catch(e) {
    strategies.push({method:'adb-tap',ok:false,error:String(e?.message||e)});
    log(`[WARN] ADB tap strategy: ${e?.message||e}`);
  }

  // Strategy C: force click, bounded.
  try {
    await btn.click({force:true,timeout:2500,noWaitAfter:true});
    strategies.push({method:'playwright-force',ok:true});
    log('[TOUCH] Playwright force click');
    if(await pickerOpenedWithin(2400)) return {method:'playwright-force',geom,strategies};
    strategies.at(-1).picker=false;
  } catch(e) {
    strategies.push({method:'playwright-force',ok:false,error:String(e?.message||e)});
    log(`[WARN] Playwright force strategy: ${e?.message||e}`);
  }

  // Strategy D: DOM activation as final browser-side fallback.
  try {
    await Promise.race([
      btn.evaluate(el=>el.click()),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('DOM_CLICK_TIMEOUT')),1200))
    ]);
    strategies.push({method:'dom-click',ok:true});
    log('[TOUCH] DOM click fallback');
    if(await pickerOpenedWithin(2200)) return {method:'dom-click',geom,strategies};
    strategies.at(-1).picker=false;
  } catch(e) {
    strategies.push({method:'dom-click',ok:false,error:String(e?.message||e)});
  }

  write(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-strategies.json`,strategies);
  await saveDeviceScreen(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-failure.png`).catch(()=>{});
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-failure-ui.xml`,dumpUi());
  throw new Error(`UPLOAD_ACTIVATION_EXHAUSTED ${JSON.stringify(strategies)}`);
}


async function runSelfCheck() {
  log('[SELF-CHECK] V19 validator integrity check starting');

  const requiredFns = [
    ['runSelfCheck', typeof runSelfCheck === 'function'],
    ['makeTestPng', typeof makeTestPng === 'function'],
    ['prepareDeviceFiles', typeof prepareDeviceFiles === 'function'],
    ['stageDeviceFile', typeof stageDeviceFile === 'function'],
    ['configureStayAwake', typeof configureStayAwake === 'function'],
    ['restoreStayAwake', typeof restoreStayAwake === 'function'],
    ['startDeviceWatchdog', typeof startDeviceWatchdog === 'function'],
    ['ensureDeviceReady', typeof ensureDeviceReady === 'function'],
    ['assertInteractiveUnlocked', typeof assertInteractiveUnlocked === 'function'],
    ['secureLockSnapshot', typeof secureLockSnapshot === 'function'],
    ['recoverToChrome', typeof recoverToChrome === 'function'],
    ['clickUploadButton', typeof clickUploadButton === 'function'],
    ['pickerSignalSnapshot', typeof pickerSignalSnapshot === 'function'],
    ['waitForPicker', typeof waitForPicker === 'function'],
    ['findAndTapFile', typeof findAndTapFile === 'function'],
    ['tapPickerConfirm', typeof tapPickerConfirm === 'function'],
    ['dumpUi', typeof dumpUi === 'function'],
    ['pagePing', typeof pagePing === 'function'],
    ['browserInit', typeof browserInit === 'function'],
    ['waitForAttempt', typeof waitForAttempt === 'function'],
    ['zipOutput', typeof zipOutput === 'function']
  ,
    ['photoPickerMediaCells', typeof photoPickerMediaCells === 'function'],
    ['verifyAndCommitPhotoPickerSelection', typeof verifyAndCommitPhotoPickerSelection === 'function'],
    ['photoPickerActionControls', typeof photoPickerActionControls === 'function'],
    ['pickerClosedStable', typeof pickerClosedStable === 'function'],
    ['targetCellSelected', typeof targetCellSelected === 'function'],
    ['parseUiTree', typeof parseUiTree === 'function']];
  const missing = requiredFns.filter(([,ok])=>!ok).map(([name])=>name);
  if (missing.length) throw new Error(`SELF_CHECK_FUNCTION_MISSING: ${missing.join(', ')}`);

  const adbCheck = run('adb',['version']);
  if (adbCheck.status !== 0) throw new Error(`SELF_CHECK_ADB_NOT_AVAILABLE: ${adbCheck.stderr||adbCheck.stdout||''}`);

  const tmp = path.join(outDir, 'self-check-test.png');
  const png = makeTestPng(tmp, 512*1024);
  const bytes = fs.readFileSync(tmp);
  const sig = bytes.subarray(0,8).toString('hex');
  const pngSig = '89504e470d0a1a0a';
  if (sig !== pngSig || bytes.length < 60) {
    throw new Error(`SELF_CHECK_PNG_INVALID: bytes=${bytes.length} sig=${sig}`);
  }
  fs.unlinkSync(tmp);

  const devices = adbText('devices');
  if (!/\tdevice(?:\r?\n|$)/.test(devices)) {
    throw new Error(`SELF_CHECK_NO_AUTHORIZED_ANDROID_DEVICE: ${devices.trim()}`);
  }

  write('self-check.txt', [
    'SELF_CHECK=PASS',
    'BUILD=V19_MEDIASTORE_TARGET_LOCK_AND_SIZE_PROOF',
    `required_functions=${requiredFns.map(([n])=>n).join(',')}`,
    `adb=PASS`,
    `authorized_device=PASS`,
    `test_png=PASS`,
    `test_png_bytes=${png.bytes}`,
    `test_png_signature=${png.signature}`
  ].join('\n'));

  log(`[PASS] SELF-CHECK functions=${requiredFns.length}/${requiredFns.length} ADB=PASS device=PASS PNG=PASS`);
}

function browserInit() {
  const KEY = '__TOOL001_REAL_ANDROID_V19__';
  if (window[KEY]) return;
  const state = window[KEY] = {
    version:'V19', bornEpoch:Date.now(), bornPerf:performance.now(), seq:0,
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
  const domSnapshot = () => {
    const cards=Array.from(document.querySelectorAll('[data-testid="converter-file-card"]'));
    const imgs=Array.from(document.images||[]), cvs=Array.from(document.querySelectorAll('canvas'));
    const alerts=Array.from(document.querySelectorAll('[role=alert],[aria-live]')).filter(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden';}).slice(0,20).map(el=>(el.textContent||'').trim().slice(0,300));
    const text=(document.body?.innerText||'').slice(0,20000), needles=['오류','실패','제외','손상','지원하지','error','failed','invalid','corrupt'];
    return {
      cardCount:cards.length,
      cardStates:cards.slice(0,20).map(c=>c.getAttribute('data-status')||''),
      cardLoadedPreviewCount:cards.filter(c=>Array.from(c.querySelectorAll('img')).some(i=>i.complete&&i.naturalWidth>0)).length,
      cardPreviewDims:cards.map(c=>Array.from(c.querySelectorAll('img')).filter(i=>i.complete&&i.naturalWidth>0).map(i=>({naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,clientWidth:i.clientWidth,clientHeight:i.clientHeight}))),
      imageCount:imgs.length,loadedImageCount:imgs.filter(i=>i.complete&&i.naturalWidth>0).length,
      blobImageCount:imgs.filter(i=>String(i.src||'').startsWith('blob:')).length,
      dataImageCount:imgs.filter(i=>String(i.src||'').startsWith('data:')).length,
      canvases:cvs.slice(0,20).map(c=>({width:c.width,height:c.height})),alerts,
      matchedErrors:needles.filter(n=>text.toLowerCase().includes(n.toLowerCase()))
    };
  };
  async function observeProduct(file,attemptIndex) {
    const started=snap(); state.activeProbes++; push('product-observe-start',{attemptIndex,name:file?.name||null,size:file?.size||null,type:file?.type||null});
    const before=domSnapshot();
    const r={attemptIndex,started,file:{name:file?.name||null,type:file?.type||null,size:file?.size??null,lastModified:file?.lastModified??null,constructorName:file?.constructor?.name||null,tag:Object.prototype.toString.call(file),instanceofFile:file instanceof File,instanceofBlob:file instanceof Blob},nonInvasive:true,originalFileReadAttempted:false,domBefore:before,domAfter:null,productCapturePass:false,visualPreviewPass:false,reason:null};
    const deadline=Date.now()+15000;
    while(Date.now()<deadline){
      const now=domSnapshot();
      const cardAdded=now.cardCount>before.cardCount;
      const previewAdded=now.cardLoadedPreviewCount>before.cardLoadedPreviewCount || now.loadedImageCount>before.loadedImageCount;
      const realisticPreview=now.cardPreviewDims.flat().some(d=>d.naturalWidth===720&&d.naturalHeight===1600);
      if(cardAdded && previewAdded && realisticPreview){ r.productCapturePass=true; r.visualPreviewPass=true; r.reason='card-and-realistic-preview'; r.domAfter=now; break; }
      if(cardAdded && previewAdded && !realisticPreview){ r.visualPreviewPass=false; r.reason='preview-created-but-wrong-natural-dimensions'; }
      if(cardAdded && now.cardStates.some(v=>v==='error')){ r.reason='card-error'; r.domAfter=now; break; }
      await new Promise(q=>setTimeout(q,200));
    }
    if(!r.domAfter) r.domAfter=domSnapshot();
    if(!r.productCapturePass && !r.reason) r.reason='product-preview-timeout';
    r.finished=snap(); r.totalMs=Number((r.finished.perf-started.perf).toFixed(3));
    state.activeProbes--; state.lastProbeDoneAt=Date.now();
    push('product-observe-end',{attemptIndex,productCapturePass:r.productCapturePass,reason:r.reason,totalMs:r.totalMs});
    return r;
  }
  document.addEventListener('change',e=>{
    const target=e.target; if(!(target instanceof HTMLInputElement)||target.type!=='file') return;
    const files=Array.from(target.files||[]), attemptIndex=state.attempts.length+1;
    const rec={attemptIndex,change:snap(),trusted:!!e.isTrusted,fileCount:files.length,inputValueLength:String(target.value||'').length,files:files.map(f=>({name:f.name,type:f.type,size:f.size,lastModified:f.lastModified})),probes:[],done:false,nonInvasive:true};
    state.attempts.push(rec); push('file-change',{attemptIndex,fileCount:files.length,trusted:!!e.isTrusted,nonInvasive:true});
    Promise.all(files.map(f=>observeProduct(f,attemptIndex))).then(probes=>{rec.probes=probes;rec.done=true;rec.doneAt=snap();push('attempt-done',{attemptIndex,probeCount:probes.length,nonInvasive:true});}).catch(e2=>{rec.done=true;rec.error=err(e2);rec.doneAt=snap();push('attempt-error',{attemptIndex,error:rec.error});});
  },true);
  window.addEventListener('error',e=>push('window-error',{message:e.message||null,filename:e.filename||null,lineno:e.lineno||null,colno:e.colno||null}),true);
  window.addEventListener('unhandledrejection',e=>push('unhandledrejection',{reason:err(e.reason)}),true);
  push('diagnostic-installed');
}

async function waitForAttempt(page, expected, timeout, expectedBytes=null) {
  const start=Date.now(); let last=0;
  while(Date.now()-start<timeout){
    const s=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V19__?({count:window.__TOOL001_REAL_ANDROID_V19__.attempts.length,attempts:window.__TOOL001_REAL_ANDROID_V19__.attempts.map(a=>({attemptIndex:a.attemptIndex,done:a.done,fileCount:a.fileCount,fileSize:a.files?.[0]?.size??null,fileName:a.files?.[0]?.name??null})),activeProbes:window.__TOOL001_REAL_ANDROID_V19__.activeProbes}):({count:0,attempts:[],activeProbes:0})).catch(()=>({count:0,attempts:[],activeProbes:0}));
    const a=s.attempts.find(x=>x.attemptIndex===expected);
    if(a && expectedBytes!=null && a.fileSize!=null && Number(a.fileSize)!==Number(expectedBytes)){
      throw new Error(`WRONG_MEDIA_SELECTED attempt=${expected} expectedBytes=${expectedBytes} actualBytes=${a.fileSize} actualName=${a.fileName||''}`);
    }
    if(s.count>=expected&&a?.done&&s.activeProbes===0) return s;
    const sec=Math.floor((Date.now()-start)/1000); if(sec>=last+10){last=sec;log(`[WAIT] attempt ${expected}: ${sec}s, detected=${s.count}, activeProbes=${s.activeProbes}, observedBytes=${a?.fileSize??'none'}, expectedBytes=${expectedBytes??'n/a'}`);} await sleep(500);
  }
  throw new Error(`Attempt ${expected} not completed within ${timeout}ms`);
}

async function main(){
  log('=== TOOL001 REAL ANDROID DEEP DIAGNOSTIC V19 ==='); log('[OUTPUT]',outDir);
  step('검수기 SELF-CHECK');
  await withHeartbeat('validator self-check',()=>runSelfCheck(),15000);

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

  step('실기기 화면 유지/AOD 방지 설정');
  await withHeartbeat('enable Android stay-awake',()=>configureStayAwake(),15000);
  startDeviceWatchdog();

  step('실기기 보안잠금 사전검사');
  await withHeartbeat('secure-lock preflight',()=>assertInteractiveUnlocked('preflight-before-playwright'),10000);

  step('Playwright가 실기기 탐색');
  const ds=await withHeartbeat('Playwright Android device discovery',()=>android.devices(),45000); if(!ds.length) throw new Error('Playwright did not discover the Android device'); log(`[ANDROID] discovered ${ds.length} device(s)`); const device=ds[0];
  step('실제 갤럭시 Chrome 실행');
  const context=await withHeartbeat('launchBrowser(real Android Chrome)',()=>device.launchBrowser({}),60000);
  log('[ANDROID] creating browser page...');
  const page=await withHeartbeat('context.newPage()',()=>context.newPage(),30000);
  const pc=[]; page.on('console',m=>{pc.push(`[${new Date().toISOString()}] ${m.type()} ${m.text()}`);write('page-console.log',pc.join('\n'));}); page.on('pageerror',e=>{pc.push(`[${new Date().toISOString()}] PAGEERROR ${e.stack||e.message}`);write('page-console.log',pc.join('\n'));});
  step('실기기 활성/잠금/Chrome foreground 확인');
  await withHeartbeat('wake + dismiss AOD/keyguard + foreground Chrome',()=>ensureDeviceReady(page,'after browser launch'),20000);
  step('진단 스크립트 주입');
  await withHeartbeat('page.addInitScript()',()=>page.addInitScript(browserInit),15000);
  step('TOOL001 실제 페이지 접속');
  log('[PAGE] goto',url); await withHeartbeat('page.goto()',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}),55000);
  step('파일 입력요소 확인');
  await withHeartbeat('waitForSelector(file input attached)',()=>page.locator(selector).first().waitFor({state:'attached',timeout:30000}),35000);
  const fileInputCount = await page.locator(selector).count();
  log(`[PASS] file input attached count=${fileInputCount} selector=${selector}`);
  await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V19__)window.__TOOL001_REAL_ANDROID_V19__.selector=sel;},selector);
  await page.screenshot({path:path.join(outDir,'before.png'),fullPage:true}).catch(()=>{});

  step(`실기기 자동선택용 PNG ${attemptsTarget}개 생성`);
  const deviceFiles = await withHeartbeat('create local test PNG set',()=>prepareDeviceFiles(attemptsTarget),15000);
  log(`[PASS] prepared ${deviceFiles.length} local test files`);

  step(`Android 네이티브 파일선택기 자동화 ${attemptsTarget}회`);
  const sizeCaseResults=[];
  for(let i=1;i<=attemptsTarget;i++){
    const tf=deviceFiles[i-1];
    log(''); log(`===== SIZE CASE ${i}/${attemptsTarget} ${tf.testSizeMb}MB =====`);
    log(`[AUTO] target=${tf.name} expectedBytes=${tf.testBytes}`);
    let caseResult={caseIndex:i,sizeMb:tf.testSizeMb,expectedBytes:tf.testBytes,name:tf.name,pass:false,selectionTries:[],finalError:null};
    try{
      // Fresh document for every size: prevents prior cards/previews from contaminating visual pass.
      await withHeartbeat(`case ${i}: reset TOOL001 page`,async()=>{
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
        await page.locator(selector).first().waitFor({state:'attached',timeout:30000});
        await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V19__)window.__TOOL001_REAL_ANDROID_V19__.selector=sel;},selector);
      },55000);
      await withHeartbeat(`case ${i}: wake/unlock/foreground guard`,()=>ensureDeviceReady(page,`case ${i} pre-stage`),20000);
      await withHeartbeat(`case ${i}: stage exact ${tf.testSizeMb}MB PNG on Galaxy`,()=>stageDeviceFile(tf,i),50000);
      const preProof=mediaStoreTargetProof(tf.name,i,'pre-activation',false);
      log(`[MEDIASTORE] case=${i} profile=${preProof.queryProfile} found=${preProof.found} rank=${preProof.rank} newest=${preProof.newestPass}`);

      // Up to 3 picker candidates in one run. Wrong-media selection is recoverable and MUST NOT
      // be misreported as a product failure.
      for(let pickTry=0;pickTry<3 && !caseResult.pass;pickTry++){
        if(pickTry>0){
          for(let back=0;back<2;back++){ if(!pickerSignalSnapshot().detected) break; adb('shell','input','keyevent','KEYCODE_BACK'); await sleep(300); }
          await recoverToChrome(page,`case ${i} retry ${pickTry+1}`);
          await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
          await page.locator(selector).first().waitFor({state:'attached',timeout:30000});
          await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V19__)window.__TOOL001_REAL_ANDROID_V19__.selector=sel;},selector);
        }
        const tr={try:pickTry+1,candidateOffset:pickTry,pass:false,error:null,receivedBytes:null,productCapturePass:false,visualPreviewPass:false};
        try{
          await withHeartbeat(`case ${i}.${pickTry+1}: secure-lock check`,()=>assertInteractiveUnlocked(`case ${i}.${pickTry+1}:pre-activation`),7000);
          await withHeartbeat(`case ${i}.${pickTry+1}: activate upload`,()=>clickUploadButton(page,context,i),18000);
          await withHeartbeat(`case ${i}.${pickTry+1}: detect native picker`,()=>waitForPicker(12000),16000);
          await saveDeviceScreen(`case-${String(i).padStart(2,'0')}-try-${pickTry+1}-picker.png`).catch(()=>{});
          await withHeartbeat(`case ${i}.${pickTry+1}: select target candidate`,()=>findAndTapFile(tf.name,i,page,45000,pickTry),65000);
          await withHeartbeat(`case ${i}.${pickTry+1}: exact File.size + product preview`,()=>waitForAttempt(page,1,Math.min(waitChangeMs,60000),tf.testBytes),Math.min(waitChangeMs,60000)+12000,5000);
          const bp=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V19__?JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V19__)):null);
          const a=bp?.attempts?.[0]||null; const probe=a?.probes?.[0]||null;
          tr.receivedBytes=a?.files?.[0]?.size??null;
          tr.receivedName=a?.files?.[0]?.name??null;
          tr.trusted=!!a?.trusted;
          tr.productCapturePass=!!probe?.productCapturePass;
          tr.visualPreviewPass=!!probe?.visualPreviewPass;
          tr.previewDims=probe?.domAfter?.cardPreviewDims||[];
          tr.reason=probe?.reason||null;
          tr.pass=!!(a?.done && a?.trusted && Number(tr.receivedBytes)===Number(tf.testBytes) && probe?.productCapturePass && probe?.visualPreviewPass && probe?.originalFileReadAttempted===false);
          caseResult.selectionTries.push(tr);
          if(tr.pass){
            caseResult.pass=true; caseResult.browserAttempt=a; caseResult.probe=probe;
            write(`case-${String(i).padStart(2,'0')}-pipeline-stage.json`,{caseIndex:i,sizeMb:tf.testSizeMb,stage:'EXACT_SIZE_AND_REALISTIC_PREVIEW_PASS',pass:true,receivedBytes:tr.receivedBytes,previewDims:tr.previewDims,at:new Date().toISOString()});
            log(`[PASS] SIZE ${tf.testSizeMb}MB exact handoff + 720x1600 preview`);
            await page.screenshot({path:path.join(outDir,`case-${String(i).padStart(2,'0')}-PASS.png`),fullPage:true}).catch(()=>{});
          }else{
            tr.error=`PRODUCT_OR_VISUAL_FAIL reason=${tr.reason||'unknown'} received=${tr.receivedBytes}`;
            log(`[WARN] case ${i}.${pickTry+1} exact media selected but product/visual pass incomplete: ${tr.error}`);
            // Correct media reached Chrome; trying another gallery cell cannot fix product processing.
            break;
          }
        }catch(e){
          tr.error=String(e?.message||e); caseResult.selectionTries.push(tr);
          log(`[WARN] case ${i}.${pickTry+1} ${tr.error}`);
          if(!/WRONG_MEDIA_SELECTED/.test(tr.error)) break;
          log(`[RECOVER] wrong media only; retrying next validated Photo Picker cell`);
        }
      }
      if(!caseResult.pass && !caseResult.finalError){
        caseResult.finalError=caseResult.selectionTries.at(-1)?.error||'SIZE_CASE_FAILED';
        write(`case-${String(i).padStart(2,'0')}-pipeline-stage.json`,{caseIndex:i,sizeMb:tf.testSizeMb,stage:'SIZE_CASE_FAIL',pass:false,error:caseResult.finalError,tries:caseResult.selectionTries,at:new Date().toISOString()});
      }
    }catch(e){
      caseResult.finalError=String(e?.message||e);
      write(`case-${String(i).padStart(2,'0')}-pipeline-stage.json`,{caseIndex:i,sizeMb:tf.testSizeMb,stage:'CASE_SETUP_ERROR',pass:false,error:caseResult.finalError,at:new Date().toISOString()});
      log(`[FAIL] SIZE CASE ${tf.testSizeMb}MB setup/automation: ${caseResult.finalError}`);
    }
    sizeCaseResults.push(caseResult);
    write('size-cases-live.json',sizeCaseResults);
    // Recover and continue ALL remaining sizes; one failure must not stop evidence collection.
    try{
      for(let back=0;back<2;back++){ if(!pickerSignalSnapshot().detected) break; adb('shell','input','keyevent','KEYCODE_BACK'); await sleep(300); }
      await recoverToChrome(page,`case ${i} end recovery`);
    }catch(recoveryError){ log(`[WARN] case ${i} end recovery failed: ${recoveryError.message}`); }
  }

  step('실기기 최종 상태 스냅샷');
  await saveDeviceScreen('device-final-state.png').catch(()=>{});
  write('device-final-ui.xml',dumpUi());

  step('브라우저/제품 처리 결과 수집');
  const state=await withHeartbeat('collect browser diagnostic state',()=>page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V19__))),20000);
  const domFinal=await page.evaluate(()=>({url:location.href,title:document.title,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),inputs:Array.from(document.querySelectorAll('input[type=file]')).map((el,i)=>({index:i,accept:el.accept,multiple:el.multiple,disabled:el.disabled})),imgs:Array.from(document.images).slice(0,50).map((img,i)=>({index:i,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,srcHead:String(img.src||'').slice(0,100)})),canvases:Array.from(document.querySelectorAll('canvas')).slice(0,50).map((c,i)=>({index:i,width:c.width,height:c.height}))}));
  const totalSelectionTries=sizeCaseResults.reduce((n,c)=>n+(c.selectionTries?.length||0),0);
  const passedSizes=sizeCaseResults.filter(c=>c.pass).length;
  const allPass=sizeCaseResults.length===attemptsTarget && sizeCaseResults.every(c=>c.pass);
  write('result.json',{meta:{version:'V19',generatedAt:new Date().toISOString(),url,selector,attemptsTarget,sizeSweepMb,sizeCasesObserved:sizeCaseResults.length,totalSelectionTries,node:process.version,hostPlatform:process.platform},environment:state.environment,sizeCases:sizeCaseResults,lastPageAttempts:state.attempts,timeline:state.timeline,domFinal});
  write('timeline.json',state.timeline);write('attempts-last-page.json',state.attempts);write('size-cases.json',sizeCaseResults);write('dom-final.json',domFinal);
  const summary=['TOOL001_REAL_ANDROID_DEEP_DIAGNOSTIC_V19',`URL=${url}`,`SIZE_CASES_TARGET=${attemptsTarget}`,`SIZE_SWEEP_MB=${sizeSweepMb.join(',')}`,`SIZE_CASES_OBSERVED=${sizeCaseResults.length}`,`SIZE_CASES_PASS=${passedSizes}/${attemptsTarget}`,`TOTAL_SELECTION_TRIES=${totalSelectionTries}`,`USER_AGENT=${state.environment?.userAgent||''}`,`PLATFORM=${state.environment?.platform||''}`,`MAX_TOUCH_POINTS=${state.environment?.maxTouchPoints??''}`];
  for(const c of sizeCaseResults){
    const tr=(c.selectionTries||[]).find(t=>t.pass)||c.selectionTries?.at(-1)||{};
    summary.push('',`[SIZE_${c.sizeMb}MB]`,`PASS=${c.pass}`,`EXPECTED_BYTES=${c.expectedBytes}`,`RECEIVED_BYTES=${tr.receivedBytes??''}`,`TRUSTED_CHANGE=${tr.trusted??''}`,`PRODUCT_CAPTURE_PASS=${tr.productCapturePass??''}`,`VISUAL_PREVIEW_PASS=${tr.visualPreviewPass??''}`,`PREVIEW_DIMS=${JSON.stringify(tr.previewDims||[])}`,`SELECTION_TRIES=${c.selectionTries?.length||0}`,`FINAL_ERROR=${c.finalError||tr.error||''}`);
  }
  summary.push('',`FINAL_REAL_ANDROID_FILE_PATH=${allPass?'PASS':'INCOMPLETE_OR_FAIL'}`);
  summary.push(`REALISTIC_MB_SIZE_SWEEP=${allPass?'PASS':'FAIL'}`);
  write('summary.txt',summary.join('\n'));
  write('verdict.json',{allPass,attemptsTarget,sizeCasesObserved:sizeCaseResults.length,passedSizes,totalSelectionTries,sizeCaseVerdicts:sizeCaseResults.map(c=>({sizeMb:c.sizeMb,pass:c.pass,expectedBytes:c.expectedBytes,tries:c.selectionTries?.length||0,error:c.finalError||null}))});

  await page.screenshot({path:path.join(outDir,'final.png'),fullPage:true}).catch(()=>{}); await context.close().catch(()=>{}); if(typeof device.close==='function') await device.close().catch(()=>{});
  await restoreStayAwake().catch(()=>{});
  step('테스트 미디어 정리');
  for(const tf of deviceFiles){
    adb('shell','rm','-f',tf.remoteDownload);
    adb('shell','rm','-f',tf.remotePictures);
  }
  log('[PASS] staged test media cleanup requested');

  step('ADB logcat 수집');
  write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));
  step('결과 ZIP 생성');
  await withHeartbeat('Compress result ZIP',()=>zipOutput(),60000); log('');log('=== COMPLETE ===');log('[FOLDER]',outDir);log('[ZIP]',`${outDir}.zip`);
}

main().catch(async e=>{
  try{await restoreStayAwake();}catch{}
  try{adb('shell','rm','-f','/sdcard/Download/TOOL001_V19_*.png');adb('shell','rm','-f','/sdcard/Pictures/TOOL001_V19_*.png');adb('shell','rm','-f','/sdcard/tool001-v17-screen.png');adb('shell','rm','-f','/sdcard/tool001-v19-screen.png');}catch{}
  log('[FATAL]',e?.stack||String(e));
  write('fatal.txt',e?.stack||String(e));
  try{write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));}catch{}
  try{await zipOutput();}catch{}
  process.exit(1);
});
