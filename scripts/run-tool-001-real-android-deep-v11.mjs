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
const outDir = path.join(desktop, `TOOLBOX_001_REAL_ANDROID_DEEP_V11_${stamp}`);
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

  // Keep display awake while USB is attached and make Android's normal screen timeout effectively irrelevant.
  adb('shell','settings','put','global','stay_on_while_plugged_in','3');
  adb('shell','settings','put','system','screen_off_timeout','2147483647');
  adb('shell','svc','power','stayon','usb');
  adb('shell','input','keyevent','KEYCODE_WAKEUP');
  await sleep(450);

  log(`[DEVICE] session guard: stay_on_while_plugged_in ${originalStayAwake||'(unset)'} -> 3`);
  log(`[DEVICE] session guard: screen_off_timeout ${originalScreenOffTimeout||'(unset)'} -> 2147483647`);
}
async function restoreStayAwake() {
  if (deviceWatchdogTimer) {
    clearInterval(deviceWatchdogTimer);
    deviceWatchdogTimer = null;
  }
  if (originalStayAwake != null) {
    const v=String(originalStayAwake).trim();
    if(!v || v==='null') adb('shell','settings','delete','global','stay_on_while_plugged_in');
    else adb('shell','settings','put','global','stay_on_while_plugged_in',v);
  }
  if (originalScreenOffTimeout != null) {
    const v=String(originalScreenOffTimeout).trim();
    if(!v || v==='null') adb('shell','settings','delete','system','screen_off_timeout');
    else adb('shell','settings','put','system','screen_off_timeout',v);
  }
  adb('shell','svc','power','stayon','false');
  log(`[DEVICE] restored stay_on_while_plugged_in=${originalStayAwake||'(deleted)'}`);
  log(`[DEVICE] restored screen_off_timeout=${originalScreenOffTimeout||'(deleted)'}`);
}
function startDeviceWatchdog() {
  if (deviceWatchdogTimer) clearInterval(deviceWatchdogTimer);
  deviceWatchdogTimer = setInterval(() => {
    try {
      adb('shell','input','keyevent','KEYCODE_WAKEUP');
      const snap=screenStateText();
      if (isKeyguardShowing(snap)) {
        // Do not attempt to bypass secure authentication. Keep wake state and let
        // the main guard produce a precise failure before touching the webpage.
        log('[WATCHDOG] keyguard detected; main guard will stop before web interaction');
      }
    } catch {}
  }, 4000);
}


function secureLockUiSnapshot() {
  let xml='';
  try { xml=dumpUi(); } catch {}
  const lower=(xml||'').toLowerCase();
  const systemui=/package="com\.android\.systemui"/i.test(xml);
  const credentialHints=/(pin|password|pattern|비밀번호|패턴|pin을 입력|잠금 해제|enter pin|enter password)/i.test(xml);
  return {xml, systemui, credentialHints, blocked: systemui && credentialHints};
}
async function assertNoSecureLock(label='secure-lock-check') {
  const s=secureLockUiSnapshot();
  if (s.blocked) {
    write(`secure-lock-${Date.now()}.xml`,s.xml);
    await saveDeviceScreen(`secure-lock-${Date.now()}.png`).catch(()=>{});
    throw new Error(`SECURE_LOCK_ACTIVE at ${label}: unlock the Galaxy once before rerun. V11 prevents screen timeout afterward.`);
  }
  return s;
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
    throw new Error('Device is still on a secure lock screen. Unlock the Galaxy once, then rerun; V11 keeps it awake afterward.');
  }

  await assertNoSecureLock(`${label}:post-dismiss`);

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
  const remote='/sdcard/tool001-v11-window.xml';
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
  const remote='/sdcard/tool001-v11-screen.png';
  adb('shell','screencap','-p',remote);
  const local=path.join(outDir,name);
  run('adb',['pull',remote,local]);
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
async function findAndTapFile(filename, attemptIndex, timeoutMs=35000) {
  const started=Date.now();
  const shortName=filename.replace(/\.[^.]+$/,'');
  const labels=[filename,shortName];
  let didDownloads=false, didSearch=false, didBrowse=false, usedRecentFallback=false;

  while(Date.now()-started<timeoutMs) {
    let xml=dumpUi();
    write(`attempt-${String(attemptIndex).padStart(2,'0')}-picker-ui.xml`,xml);
    let nodes=parseUiNodes(xml);

    // 1) Exact filename / stem, safest path.
    let hit=nodes.find(n=>nodeMatches(n,labels));
    if(hit){
      const c=tapNode(hit,'test file');
      log(`[NATIVE] tapped exact test file ${filename} at ${c.x},${c.y}`);
      await tapPickerConfirm(attemptIndex);
      return {strategy:'exact-name',point:c};
    }

    // 2) Move to Downloads / Files/Browse if photo picker started somewhere else.
    if(!didDownloads){
      const dl=nodes.find(n=>nodeMatches(n,['downloads','다운로드','download']));
      if(dl){
        const c=tapNode(dl,'Downloads'); didDownloads=true;
        log(`[NATIVE] opened Downloads at ${c.x},${c.y}`);
        await sleep(900); continue;
      }
      didDownloads=true;
    }

    if(!didBrowse){
      const browse=nodes.find(n=>nodeMatches(n,['browse','찾아보기','files','파일','my files','내 파일']));
      if(browse){
        const h=nodeHay(browse);
        if(!labels.some(x=>h.includes(x.toLowerCase()))){
          const c=tapNode(browse,'Browse/Files'); didBrowse=true;
          log(`[NATIVE] opened Browse/Files at ${c.x},${c.y}`);
          await sleep(900); continue;
        }
      }
      didBrowse=true;
    }

    // 3) Search exact filename where picker supports search.
    if(!didSearch){
      const search=nodes.find(n=>nodeMatches(n,['search','검색','検索'])) ||
                   nodes.find(n=>/action_menu_search|menu_search|search_view/i.test(n['resource-id']||''));
      if(search){
        const c=tapNode(search,'Search');
        log(`[NATIVE] opened picker search at ${c.x},${c.y}`);
        await sleep(450);
        adb('shell','input','text',filename.replace(/%/g,'\\%').replace(/\s/g,'%s'));
        adb('shell','input','keyevent','KEYCODE_ENTER');
        log(`[NATIVE] searched exact filename ${filename}`);
        didSearch=true; await sleep(1200); continue;
      }
      didSearch=true;
    }

    // 4) Last-resort Recent-grid selection, but only after verifying the test file is indexed
    // and only inside a known picker. The file is staged immediately before each attempt,
    // so it should be the newest media item.
    if(!usedRecentFallback){
      const mediaQ=adbText('shell','content','query','--uri','content://media/external/images/media','--projection','_id:_display_name:date_added');
      write(`attempt-${String(attemptIndex).padStart(2,'0')}-mediastore.txt`,mediaQ);
      const snap=pickerSignalSnapshot();
      const known=snap.knownPkg;
      if(known && mediaQ.toLowerCase().includes(filename.toLowerCase())){
        const candidates=snap.nodes
          .map(n=>({n,c:centerOfBounds(n.bounds),h:nodeHay(n)}))
          .filter(x=>x.c && x.c.w>=60 && x.c.h>=60 && x.c.y>120 &&
             (/(thumbnail|photo|image|media|grid|item)/i.test(x.h) || x.n.clickable==='true'))
          .filter(x=>!/toolbar|navigation|search|button|menu|tab|album|folder|download|recent|취소|cancel/i.test(x.h))
          .sort((a,b)=>(a.c.y-b.c.y)||(a.c.x-b.c.x));
        if(candidates.length){
          const pick=candidates[0];
          const r=adb('shell','input','tap',String(pick.c.x),String(pick.c.y));
          if(r.status===0){
            usedRecentFallback=true;
            log(`[NATIVE] exact filename not exposed by picker; tapped newest eligible Recent grid item at ${pick.c.x},${pick.c.y} after MediaStore verification`);
            await tapPickerConfirm(attemptIndex);
            return {strategy:'mediastore-verified-recent-grid',point:pick.c};
          }
        }
      }
      usedRecentFallback=true;
    }

    await sleep(650);
  }
  throw new Error(`Native picker could not locate/select ${filename} within ${timeoutMs}ms`);
}

function makeTestPng(localPath) {
  // Valid 1x1 PNG. Small on purpose: tests Android file handoff/lifetime/decoding
  // without introducing file-size or image-complexity variables.
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=';
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(localPath, buf);
  return { bytes: buf.length, signature: buf.subarray(0,8).toString('hex') };
}

async function prepareDeviceFiles(count) {
  const files=[];
  const token=Date.now();
  for(let i=1;i<=count;i++){
    const name=`TOOL001_V11_${token}_${String(i).padStart(2,'0')}.png`;
    const local=path.join(outDir,name); makeTestPng(local);
    files.push({
      name,local,
      remoteDownload:`/sdcard/Download/${name}`,
      remotePictures:`/sdcard/Pictures/${name}`
    });
  }
  return files;
}
async function stageDeviceFile(tf, attemptIndex) {
  const targets=[tf.remoteDownload,tf.remotePictures];
  for(const remote of targets){
    const r=run('adb',['push',tf.local,remote]);
    if(r.status!==0) throw new Error(`adb push failed for ${tf.name} -> ${remote}: ${r.stderr||r.stdout||''}`);
    adb('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${remote}`);
  }
  await sleep(900);
  const exists=targets.map(remote=>adbText('shell','ls','-l',remote)).join('\n');
  const media=adbText('shell','content','query','--uri','content://media/external/images/media','--projection','_id:_display_name:date_added');
  write(`device-file-${attemptIndex}.txt`,`${exists}\n\nMEDIASTORE\n${media}`);
  log(`[PASS] staged ${tf.name} to Download + Pictures and requested MediaStore scan`);
  return {exists,media};
}
async function clickUploadButton(page, context, attemptIndex) {
  await assertNoSecureLock(`attempt ${attemptIndex} immediately-before-touch`);

  const label = attemptIndex === 1 ? /이미지 선택|Choose images|画像を選択/ : /이미지 추가|Add images|画像を追加|이미지 선택|Choose images|画像を選択/;
  const btn = page.getByRole('button',{name:label}).first();
  await btn.waitFor({state:'attached',timeout:8000});
  await btn.evaluate(el=>el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
  await sleep(250);

  const geom=await btn.evaluate(el=>{
    const r=el.getBoundingClientRect(), vv=window.visualViewport;
    return {x:r.left,y:r.top,width:r.width,height:r.height,text:(el.textContent||'').trim(),
      dpr:window.devicePixelRatio||1,screenW:screen.width,screenH:screen.height,
      visualOffsetLeft:vv?.offsetLeft||0,visualOffsetTop:vv?.offsetTop||0,
      visualW:vv?.width||window.innerWidth,visualH:vv?.height||window.innerHeight};
  });
  if(!geom || geom.width<=0 || geom.height<=0) throw new Error(`UPLOAD_BUTTON_BAD_RECT ${JSON.stringify(geom)}`);
  const cssX=Math.round(geom.x+geom.width/2), cssY=Math.round(geom.y+geom.height/2);
  const strategies=[];

  async function pickerOpenedWithin(ms=2500){
    const st=Date.now();
    while(Date.now()-st<ms){
      await assertNoSecureLock(`attempt ${attemptIndex} post-touch`);
      try{ if((pickerSignalSnapshot()).detected) return true; }catch{}
      await sleep(250);
    }
    return false;
  }

  // A. CDP trusted mouse event. This avoids the hasTouch requirement.
  try{
    const cdpPromise=context.newCDPSession(page);
    const cdp=await Promise.race([cdpPromise,new Promise((_,r)=>setTimeout(()=>r(new Error('CDP session timeout')),2500))]);
    await Promise.race([
      (async()=>{
        await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:cssX,y:cssY,button:'left',clickCount:1});
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:cssX,y:cssY,button:'left',clickCount:1});
      })(),
      new Promise((_,r)=>setTimeout(()=>r(new Error('CDP click timeout')),1800))
    ]);
    await cdp.detach().catch(()=>{});
    strategies.push({method:'cdp-mouse',ok:true});
    log(`[TOUCH] CDP trusted click button="${geom.text}" css=(${cssX},${cssY})`);
    if(await pickerOpenedWithin(3000)) return {method:'cdp-mouse',geom,strategies};
    strategies.at(-1).picker=false;
  }catch(e){
    strategies.push({method:'cdp-mouse',ok:false,error:String(e?.message||e)});
    log(`[WARN] CDP click fallback: ${e?.message||e}`);
  }

  // B. ADB physical tap using screenshot/UI coordinates rather than browser stability checks.
  try{
    await assertNoSecureLock(`attempt ${attemptIndex} before-adb-tap`);
    const wm=adbText('shell','wm','size');
    const m=wm.match(/(?:Physical size|Override size):\s*(\d+)x(\d+)/i)||wm.match(/(\d+)x(\d+)/);
    if(!m) throw new Error(`screen size parse failed: ${wm}`);
    const sw=Number(m[1]), sh=Number(m[2]);
    const scaleX=sw/Math.max(1,geom.screenW*geom.dpr);
    const cssToPx=geom.dpr*scaleX;
    const visiblePx=Math.round(geom.visualH*cssToPx);
    const topInset=Math.max(0,sh-visiblePx);
    const ax=Math.max(1,Math.min(sw-1,Math.round((cssX+geom.visualOffsetLeft)*cssToPx)));
    const ay=Math.max(1,Math.min(sh-1,Math.round(topInset+(cssY-geom.visualOffsetTop)*cssToPx)));
    const r=adb('shell','input','tap',String(ax),String(ay));
    if(r.status!==0) throw new Error(r.stderr||r.stdout||'adb tap failed');
    strategies.push({method:'adb-tap',ok:true,x:ax,y:ay,topInset});
    log(`[TOUCH] ADB real tap physical=(${ax},${ay}) screen=${sw}x${sh}`);
    if(await pickerOpenedWithin(3500)) return {method:'adb-tap',geom,strategies};
    strategies.at(-1).picker=false;
  }catch(e){
    strategies.push({method:'adb-tap',ok:false,error:String(e?.message||e)});
    log(`[WARN] ADB tap fallback: ${e?.message||e}`);
  }

  // C. DOM activation only as last fallback; still requires native picker detection.
  try{
    await Promise.race([
      btn.evaluate(el=>el.click()),
      new Promise((_,r)=>setTimeout(()=>r(new Error('DOM click timeout')),1200))
    ]);
    strategies.push({method:'dom-click',ok:true});
    log('[TOUCH] DOM click fallback sent');
    if(await pickerOpenedWithin(2500)) return {method:'dom-click',geom,strategies};
    strategies.at(-1).picker=false;
  }catch(e){
    strategies.push({method:'dom-click',ok:false,error:String(e?.message||e)});
  }

  write(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-strategies.json`,strategies);
  await saveDeviceScreen(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-failure.png`).catch(()=>{});
  write(`attempt-${String(attemptIndex).padStart(2,'0')}-tap-failure-ui.xml`,dumpUi());
  throw new Error(`UPLOAD_ACTIVATION_EXHAUSTED ${JSON.stringify(strategies)}`);
}

function browserInit() {
  const KEY = '__TOOL001_REAL_ANDROID_V11__';
  if (window[KEY]) return;
  const state = window[KEY] = {
    version:'V11', bornEpoch:Date.now(), bornPerf:performance.now(), seq:0,
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
    const s=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V11__?({count:window.__TOOL001_REAL_ANDROID_V11__.attempts.length,attempts:window.__TOOL001_REAL_ANDROID_V11__.attempts.map(a=>({attemptIndex:a.attemptIndex,done:a.done,fileCount:a.fileCount})),activeProbes:window.__TOOL001_REAL_ANDROID_V11__.activeProbes}):({count:0,attempts:[],activeProbes:0})).catch(()=>({count:0,attempts:[],activeProbes:0}));
    const a=s.attempts.find(x=>x.attemptIndex===expected); if(s.count>=expected&&a?.done&&s.activeProbes===0) return s;
    const sec=Math.floor((Date.now()-start)/1000); if(sec>=last+10){last=sec;log(`[WAIT] attempt ${expected}: ${sec}s, detected=${s.count}, activeProbes=${s.activeProbes}`);} await sleep(500);
  }
  throw new Error(`Attempt ${expected} not completed within ${timeout}ms`);
}

async function main(){
  log('=== TOOL001 REAL ANDROID DEEP DIAGNOSTIC V11 ==='); log('[OUTPUT]',outDir);
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

  step('실기기 잠금/AOD 사전검사');
  await withHeartbeat('preflight secure-lock / wake state', async()=>{
    adb('shell','input','keyevent','KEYCODE_WAKEUP');
    await sleep(500);
    await assertNoSecureLock('preflight');
  },10000);

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
  await page.evaluate(sel=>{if(window.__TOOL001_REAL_ANDROID_V11__)window.__TOOL001_REAL_ANDROID_V11__.selector=sel;},selector);
  await page.screenshot({path:path.join(outDir,'before.png'),fullPage:true}).catch(()=>{});

  step(`실기기 자동선택용 PNG ${attemptsTarget}개 생성`);
  const deviceFiles = await withHeartbeat('create local test PNG set',()=>prepareDeviceFiles(attemptsTarget),15000);
  log(`[PASS] prepared ${deviceFiles.length} local test files`);

  step(`Android 네이티브 파일선택기 자동화 ${attemptsTarget}회`);
  for(let i=1;i<=attemptsTarget;i++){
    const tf=deviceFiles[i-1];
    log(''); log(`===== ATTEMPT ${i}/${attemptsTarget} AUTO =====`);
    log(`[AUTO] target=${tf.name}`);
    try{
      await withHeartbeat(`attempt ${i}: wake/unlock/foreground guard`,()=>ensureDeviceReady(page,`attempt ${i} pre-click`),20000);
      await withHeartbeat(`attempt ${i}: stage fresh PNG on Galaxy`,()=>stageDeviceFile(tf,i),20000);
      await withHeartbeat(`attempt ${i}: activate TOOL001 upload button`,()=>clickUploadButton(page,context,i),25000);
      await withHeartbeat(`attempt ${i}: detect Android native picker`,()=>waitForPicker(12000),16000);
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-picker-before.png`).catch(()=>{});
      await withHeartbeat(`attempt ${i}: select ${tf.name} in native picker`,()=>findAndTapFile(tf.name,i,30000),35000);
      await withHeartbeat(`attempt ${i}: wait trusted change + deep file probe`,()=>waitForAttempt(page,i,waitChangeMs),waitChangeMs+5000,5000);
      log(`[ATTEMPT ${i}] NATIVE_PICKER + change + file probe COMPLETE`);
      await sleep(settleMs);
      await page.screenshot({path:path.join(outDir,`attempt-${String(i).padStart(2,'0')}-after.png`),fullPage:true}).catch(()=>{});
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-device-after.png`).catch(()=>{});
      const p=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V11__)));
      write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);
    }catch(e){
      log(`[ATTEMPT ${i}] AUTO TIMEOUT/ERROR ${e.message}`);
      await saveDeviceScreen(`attempt-${String(i).padStart(2,'0')}-failure-device.png`).catch(()=>{});
      const xml=dumpUi(); write(`attempt-${String(i).padStart(2,'0')}-failure-ui.xml`,xml);
      const p=await page.evaluate(()=>window.__TOOL001_REAL_ANDROID_V11__?JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V11__)):null).catch(()=>null);
      if(p){write('timeline-live.json',p.timeline);write('attempts-live.json',p.attempts);}
      break;
    }
  }

  step('실기기 최종 상태 스냅샷');
  await saveDeviceScreen('device-final-state.png').catch(()=>{});
  write('device-final-ui.xml',dumpUi());

  step('브라우저/파일 진단 결과 수집');
  const state=await withHeartbeat('collect browser diagnostic state',()=>page.evaluate(()=>JSON.parse(JSON.stringify(window.__TOOL001_REAL_ANDROID_V11__))),20000);
  const domFinal=await page.evaluate(()=>({url:location.href,title:document.title,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),inputs:Array.from(document.querySelectorAll('input[type=file]')).map((el,i)=>({index:i,accept:el.accept,multiple:el.multiple,disabled:el.disabled})),imgs:Array.from(document.images).slice(0,50).map((img,i)=>({index:i,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,srcHead:String(img.src||'').slice(0,100)})),canvases:Array.from(document.querySelectorAll('canvas')).slice(0,50).map((c,i)=>({index:i,width:c.width,height:c.height}))}));
  write('result.json',{meta:{version:'V11',generatedAt:new Date().toISOString(),url,selector,attemptsTarget,attemptsObserved:state.attempts.length,node:process.version,hostPlatform:process.platform},environment:state.environment,attempts:state.attempts,timeline:state.timeline,domFinal});
  write('timeline.json',state.timeline);write('attempts.json',state.attempts);write('dom-final.json',domFinal);
  const s=['TOOL001_REAL_ANDROID_DEEP_DIAGNOSTIC_V11',`URL=${url}`,`ATTEMPTS_TARGET=${attemptsTarget}`,`ATTEMPTS_OBSERVED=${state.attempts.length}`,`USER_AGENT=${state.environment?.userAgent||''}`,`PLATFORM=${state.environment?.platform||''}`,`MAX_TOUCH_POINTS=${state.environment?.maxTouchPoints??''}`];
  for(const a of state.attempts){const p=a.probes?.[0];s.push('',`[ATTEMPT_${a.attemptIndex}]`,`TRUSTED_CHANGE=${a.trusted}`,`FILE_COUNT=${a.fileCount}`,`FILE_NAME=${p?.file?.name||a.files?.[0]?.name||''}`,`FILE_TYPE=${p?.file?.type||a.files?.[0]?.type||''}`,`FILE_SIZE=${p?.file?.size??a.files?.[0]?.size??''}`,`SLICE_HEAD_OK=${p?.reads?.sliceHead?.ok??''}`,`ARRAYBUFFER1_OK=${p?.reads?.arrayBuffer1?.ok??''}`,`ARRAYBUFFER1_MS=${p?.reads?.arrayBuffer1?.ms??''}`,`ARRAYBUFFER2_OK=${p?.reads?.arrayBuffer2?.ok??''}`,`FILEREADER_OK=${p?.reads?.fileReader?.ok??''}`,`OBJECTURL_OK=${p?.objectURL?.ok??''}`,`IMAGE_DECODE_OK=${p?.image?.ok??''}`,`NATURAL_WIDTH=${p?.image?.value?.naturalWidth??''}`,`NATURAL_HEIGHT=${p?.image?.value?.naturalHeight??''}`,`IMAGEBITMAP_OK=${p?.imageBitmap?.ok??''}`,`DOM_BEFORE_LOADED_IMAGES=${p?.domBefore?.loadedImageCount??''}`,`DOM_AFTER_LOADED_IMAGES=${p?.domAfter?.loadedImageCount??''}`,`DOM_AFTER_BLOB_IMAGES=${p?.domAfter?.blobImageCount??''}`,`DOM_AFTER_CANVAS_COUNT=${p?.domAfter?.canvases?.length??''}`,`DOM_ERROR_MATCHES=${(p?.domAfter?.matchedErrors||[]).join(',')}`);}
  const attemptVerdicts=state.attempts.map(a=>{
    const p=a.probes?.[0];
    const pass=!!(a.done && a.trusted && p?.reads?.sliceHead?.ok && p?.reads?.arrayBuffer1?.ok && p?.reads?.fileReader?.ok && p?.objectURL?.ok && p?.image?.ok);
    return {attemptIndex:a.attemptIndex,pass,trusted:!!a.trusted,fileCount:a.fileCount,arrayBuffer:!!p?.reads?.arrayBuffer1?.ok,fileReader:!!p?.reads?.fileReader?.ok,objectURL:!!p?.objectURL?.ok,imageDecode:!!p?.image?.ok};
  });
  const allPass=attemptVerdicts.length===attemptsTarget && attemptVerdicts.every(v=>v.pass);
  s.push('',`FINAL_REAL_ANDROID_FILE_PATH=${allPass?'PASS':'INCOMPLETE_OR_FAIL'}`);
  s.push(`ATTEMPT_VERDICTS=${JSON.stringify(attemptVerdicts)}`);
  write('summary.txt',s.join('\n'));
  write('verdict.json',{allPass,attemptsTarget,attemptsObserved:state.attempts.length,attemptVerdicts});

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

main().catch(async e=>{try{await restoreStayAwake();}catch{} log('[FATAL]',e?.stack||String(e));write('fatal.txt',e?.stack||String(e));try{write('adb-logcat.txt',adbText('logcat','-d','-v','threadtime'));}catch{}try{await zipOutput();}catch{}process.exit(1);});
