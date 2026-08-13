#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { _android as android } from 'playwright';

function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const t=argv[i];if(!t.startsWith('--'))continue;const k=t.slice(2),n=argv[i+1];if(!n||n.startsWith('--'))o[k]=true;else{o[k]=n;i++;}}return o;}
const args=parseArgs(process.argv);
const repeats=Math.max(1,Number(args.repeats||7));
const here=path.dirname(fileURLToPath(import.meta.url));
const desktop=process.platform==='win32'?path.join(process.env.USERPROFILE||os.homedir(),'Desktop'):os.homedir();
const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
const outDir=path.join(desktop,`TOOLBOX_001_V43_ROOT_CAUSE_ISOLATION_REAL_DEVICE_${stamp}`);
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
function dumpUi(){const remote='/sdcard/tool001-v43-window.xml';adb('shell','uiautomator','dump','--compressed',remote);return adbText('shell','cat',remote);}
function parseUiNodes(xml){const out=[];const re=/<node\s+([^>]*?)\/?>(?:<\/node>)?/g;let m;while((m=re.exec(xml||''))){const attrs={};const ar=/([\w-]+)="([^"]*)"/g;let a;while((a=ar.exec(m[1])))attrs[a[1]]=xmlDecode(a[2]);out.push(attrs);}return out;}
function hay(n){return `${n.text||''} ${n['content-desc']||''} ${n['resource-id']||''}`.trim();}
function fullLogcat(){return adbText('logcat','-d','-v','threadtime');}
function filteredEvidence(text){return String(text||'').split(/\r?\n/).filter(x=>/(TOOL001_NATIVE_DIAG|chromium|chrome|photopicker|MediaProvider|fuse|ContentResolver|openFileDescriptor|permission denied|EACCES|ENOENT|NotReadableError|ERR_UPLOAD_FILE_CHANGED|file could not be read|FileReader)/i.test(x)).slice(-1200).join('\n');}
function browserVersion(pkg){const t=adbText('shell','dumpsys','package',pkg);return t.match(/versionName=([^\s]+)/)?.[1]||'';}
function cmdOk(name,args,cwd){const r=spawnSync(name,args,{cwd,encoding:'utf8',shell:process.platform==='win32',maxBuffer:128*1024*1024});return r;}
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

const MINIMAL_HTML=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOOL001 V43 Chrome Byte Read</title></head><body style="font-family:sans-serif;padding:28px"><h2>TOOL001 Chrome Minimal File Read</h2><p>Product code is not loaded. One picker selection, one arrayBuffer read.</p><button id="pick" style="font-size:20px;padding:14px 18px">이미지 선택</button><input id="file" type="file" accept="image/*" style="position:fixed;left:-10000px"><pre id="out"></pre><script>
window.__diag={stage:'idle',pass:null};
const f=document.getElementById('file'),b=document.getElementById('pick'),o=document.getElementById('out');
const paint=()=>o.textContent=JSON.stringify(window.__diag,null,2);
b.addEventListener('click',()=>f.click());
f.addEventListener('change',async()=>{
 const file=f.files&&f.files[0];
 if(!file){window.__diag={stage:'no_file',pass:false};paint();return;}
 window.__diag={stage:'read_start',pass:null,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified};paint();
 try{
   const ab=await file.arrayBuffer();
   window.__diag={...window.__diag,stage:'read_pass',pass:true,bytes:ab.byteLength};paint();
 }catch(e){
   window.__diag={...window.__diag,stage:'read_fail',pass:false,errorName:e&&e.name||'',errorMessage:e&&e.message||String(e)};paint();
 }
});
</script></body></html>`;

async function runChromeMinimal(){
  log('=== PHASE A: CHROME MINIMAL HTML BYTE READ ===');
  const devices=await android.devices();
  if(!devices.length)throw new Error('PLAYWRIGHT_ANDROID_DEVICE_NOT_FOUND');
  const device=devices[0];
  const context=await device.launchBrowser({});
  const page=await context.newPage();
  const rows=[];
  for(let r=1;r<=repeats;r++){
    const caseNo=`CHROME-MIN-${r}`;
    log(`===== Chrome minimal ${r}/${repeats} =====`);
    adb('logcat','-c');
    const row={phase:'CHROME_MINIMAL',round:r,pass:false,harnessFail:false,error:'',diag:null,notReadable:false};
    try{
      await page.setContent(MINIMAL_HTML,{waitUntil:'domcontentloaded',timeout:15000});
      await page.locator('#pick').click({timeout:5000,noWaitAfter:true});
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
      } else row.error='DIAG_RESULT_TIMEOUT';
    }catch(e){
      row.error=String(e?.message||e);
      row.harnessFail=/HARNESS_/i.test(row.error);
    }
    const lc=fullLogcat();
    write(`case-${caseNo}.json`,row);
    write(`case-${caseNo}-logcat-full.txt`,lc);
    write(`case-${caseNo}-logcat-filtered.txt`,filteredEvidence(lc));
    await screen(`case-${caseNo}-device.png`);
    log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] Chrome minimal R${r} stage=${row.diag?.stage||'-'} bytes=${row.diag?.bytes||0} error=${row.error||'-'}`);
    rows.push(row);
    await sleep(250);
  }
  await context.close().catch(()=>{});
  if(typeof device.close==='function')await device.close().catch(()=>{});
  return rows;
}

function templateHash(){
  const a=fs.readFileSync(path.join(here,'tool-001-v43-native-template','main.dart'));
  const b=fs.readFileSync(path.join(here,'tool-001-v43-native-template','MainActivity.kt'));
  return crypto.createHash('sha256').update(a).update(b).digest('hex');
}

function prepareNativeApk(){
  const cacheRoot=path.join(os.tmpdir(),'tool001-v43-native-cache');
  const apkCache=path.join(cacheRoot,'app-debug.apk');
  const hashFile=path.join(cacheRoot,'template.sha256');
  const wantHash=templateHash();
  if(!args['rebuild-native']&&fs.existsSync(apkCache)&&fs.existsSync(hashFile)&&fs.readFileSync(hashFile,'utf8').trim()===wantHash){
    log('[NATIVE] using cached diagnostic APK');
    return apkCache;
  }
  log('[NATIVE] building diagnostic APK (first run only)');
  const probe=cmdOk('flutter',['--version'],undefined);
  if(probe.status!==0)throw new Error(`FLUTTER_NOT_AVAILABLE:${probe.stderr||probe.stdout||''}`);
  const work=path.join(os.tmpdir(),'tool001-v43-native-build');
  fs.rmSync(work,{recursive:true,force:true});
  fs.mkdirSync(work,{recursive:true});
  const cr=cmdOk('flutter',['create','--platforms=android','--org','com.fixlgs','--project-name','tool001_native_provider_diag',work],undefined);
  if(cr.status!==0)throw new Error(`FLUTTER_CREATE_FAILED:${cr.stderr||cr.stdout||''}`);
  fs.copyFileSync(path.join(here,'tool-001-v43-native-template','main.dart'),path.join(work,'lib','main.dart'));
  const kt=path.join(work,'android','app','src','main','kotlin','com','fixlgs','tool001_native_provider_diag','MainActivity.kt');
  fs.mkdirSync(path.dirname(kt),{recursive:true});
  fs.copyFileSync(path.join(here,'tool-001-v43-native-template','MainActivity.kt'),kt);
  const br=cmdOk('flutter',['build','apk','--debug'],work);
  write('native-build-stdout.txt',`${br.stdout||''}\n${br.stderr||''}`);
  if(br.status!==0)throw new Error('FLUTTER_BUILD_APK_FAILED');
  const built=path.join(work,'build','app','outputs','flutter-apk','app-debug.apk');
  if(!fs.existsSync(built))throw new Error('NATIVE_APK_NOT_FOUND_AFTER_BUILD');
  fs.mkdirSync(cacheRoot,{recursive:true});
  fs.copyFileSync(built,apkCache);
  fs.writeFileSync(hashFile,wantHash);
  return apkCache;
}

function installNativeApk(apk){
  log('[NATIVE] installing diagnostic APK');
  let r=adb('install','-r',apk);
  if(r.status!==0){
    adb('uninstall','com.fixlgs.tool001_native_provider_diag');
    r=adb('install',apk);
  }
  if(r.status!==0)throw new Error(`ADB_INSTALL_NATIVE_FAILED:${r.stderr||r.stdout||''}`);
}

function parseNativeResult(logText,round){
  const lines=String(logText||'').split(/\r?\n/).filter(x=>x.includes('TOOL001_NATIVE_DIAG'));
  const target=lines.filter(x=>new RegExp(`round=${round}(?:\\s|$)`).test(x));
  const h=target.find(x=>x.includes('NATIVE_HARNESS_FAIL'));
  if(h)return{done:true,harnessFail:true,pass:false,error:h};
  const result=[...target].reverse().find(x=>x.includes('NATIVE_READ_RESULT'));
  if(!result)return{done:false};
  const pass=/pass=true/.test(result);
  const bytes=Number(result.match(/bytes=(\d+)/)?.[1]||0);
  return{done:true,harnessFail:false,pass,bytes,error:pass?'':result};
}

async function runNativeDirect(){
  log('=== PHASE B: ANDROID NATIVE CONTENTRESOLVER DIRECT READ ===');
  const apk=prepareNativeApk();
  installNativeApk(apk);
  const pkg='com.fixlgs.tool001_native_provider_diag';
  const act='com.fixlgs.tool001_native_provider_diag.MainActivity';
  const rows=[];
  for(let r=1;r<=repeats;r++){
    const caseNo=`NATIVE-${r}`;
    log(`===== Android native ${r}/${repeats} =====`);
    adb('logcat','-c');
    adb('shell','am','force-stop',pkg);
    const start=adb('shell','am','start','-n',`${pkg}/${act}`,'--ei','round',String(r));
    const row={phase:'ANDROID_NATIVE',round:r,pass:false,harnessFail:false,error:'',bytes:0};
    if(start.status!==0){row.harnessFail=true;row.error=`HARNESS_NATIVE_START_FAILED:${start.stderr||start.stdout||''}`;}
    else{
      try{
        row.selected=await selectPhoto01(caseNo);
        const deadline=Date.now()+10000;
        while(Date.now()<deadline){
          const t=fullLogcat();
          const p=parseNativeResult(t,r);
          if(p.done){Object.assign(row,p);break;}
          await sleep(180);
        }
        if(!row.pass&&!row.harnessFail&&!row.error)row.error='NATIVE_RESULT_TIMEOUT';
      }catch(e){row.error=String(e?.message||e);row.harnessFail=/HARNESS_/i.test(row.error);}
    }
    const lc=fullLogcat();
    write(`case-${caseNo}.json`,row);
    write(`case-${caseNo}-logcat-full.txt`,lc);
    write(`case-${caseNo}-logcat-filtered.txt`,filteredEvidence(lc));
    await screen(`case-${caseNo}-device.png`);
    log(`[${row.harnessFail?'HARNESS':row.pass?'PASS':'FAIL'}] Android native R${r} bytes=${row.bytes||0} error=${row.error||'-'}`);
    rows.push(row);
    await sleep(250);
  }
  return rows;
}

function summarize(rows){
  const valid=rows.filter(x=>!x.harnessFail);
  return{total:rows.length,valid:valid.length,harnessFail:rows.length-valid.length,pass:valid.filter(x=>x.pass).length,fail:valid.filter(x=>!x.pass).length};
}

function classify(chromeRows,nativeRows){
  const c=summarize(chromeRows),n=summarize(nativeRows);
  if(c.valid===0||n.valid===0)return 'INCONCLUSIVE_HARNESS_FAILURE';
  if(c.fail>0&&n.fail===0)return 'CHROME_ANDROID_FILE_BRIDGE_STRONGLY_SUSPECTED';
  if(c.fail>0&&n.fail>0)return 'ANDROID_PROVIDER_OR_LOWER_NATIVE_BOUNDARY_STRONGLY_SUSPECTED';
  if(c.fail===0&&n.fail===0)return 'NO_FAILURE_REPRODUCED_THIS_RUN';
  if(c.fail===0&&n.fail>0)return 'NATIVE_PATH_FAILURE_ONLY_INCONCLUSIVE';
  return 'INCONCLUSIVE';
}

async function makeZip(){
  if(process.platform!=='win32')return;
  const zip=`${outDir}.zip`;
  const ps=`Compress-Archive -Path '${outDir.replaceAll("'","''")}\\*' -DestinationPath '${zip.replaceAll("'","''")}' -Force`;
  const r=spawnSync('powershell.exe',['-NoProfile','-Command',ps],{encoding:'utf8'});
  if(r.status===0)log('[PASS] RESULT ZIP',zip);else log('[WARN] RESULT ZIP FAILED',r.stderr||r.stdout||'');
}

async function main(){
  log('=== TOOL001 V43 ROOT CAUSE ISOLATION ===');
  log(`REPEATS=${repeats}`);
  if(adb('version').status!==0)throw new Error('ADB_NOT_AVAILABLE');
  if(!/\tdevice\b/.test(adbText('devices')))throw new Error('ADB_DEVICE_NOT_READY');
  write('device-info.txt',[
    `model=${adbText('shell','getprop','ro.product.model').trim()}`,
    `android=${adbText('shell','getprop','ro.build.version.release').trim()}`,
    `sdk=${adbText('shell','getprop','ro.build.version.sdk').trim()}`,
    `chrome=${browserVersion('com.android.chrome')}`
  ].join('\n'));
  const chromeRows=await runChromeMinimal();
  const nativeRows=await runNativeDirect();
  const chrome=summarize(chromeRows),native=summarize(nativeRows),interpretation=classify(chromeRows,nativeRows);
  const summary=[
    'TOOL001 V43 ROOT CAUSE ISOLATION',
    `REPEATS=${repeats}`,
    '',
    `CHROME_MINIMAL VALID=${chrome.valid}/${chrome.total} PASS=${chrome.pass}/${chrome.valid} FAIL=${chrome.fail} HARNESS_FAIL=${chrome.harnessFail}`,
    `ANDROID_NATIVE VALID=${native.valid}/${native.total} PASS=${native.pass}/${native.valid} FAIL=${native.fail} HARNESS_FAIL=${native.harnessFail}`,
    '',
    `INTERPRETATION=${interpretation}`,
    '',
    'RULE_1=Chrome minimal fails + Android native all-pass => Chrome/Android File bridge strongly suspected.',
    'RULE_2=Chrome minimal and Android native both fail => Android Photo Picker/provider/native file-open boundary strongly suspected.',
    'RULE_3=Both all-pass => failure not reproduced; repeat same harness only. Do not change method.',
    'RULE_4=HARNESS_FAIL is never counted as product/platform FAIL.',
    'RULE_5=One round = one picker open, one PHOTO01 selection, one byte-read attempt. No retry/recovery/fallback.',
    'RULE_6=Samsung Internet is not used in V43.'
  ].join('\n');
  write('v43-root-cause-summary.txt',summary);
  write('result.json',{version:'V43-ROOT-CAUSE-ISOLATION',repeats,chrome,native,interpretation,chromeRows,nativeRows});
  log(summary);
  await makeZip();
}

main().catch(async e=>{log('[FATAL]',e?.stack||String(e));try{await screen('fatal-device.png');}catch{}await makeZip();process.exitCode=1;});
