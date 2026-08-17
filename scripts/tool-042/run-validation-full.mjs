import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]||'preflight';
const allowed=new Set(['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){console.error(`unknown mode: ${mode}`);process.exit(2)}
const root=process.cwd();
const outDir=fs.mkdtempSync(path.join(os.tmpdir(),`tool042-${mode}-`));
const results=[];
let activeChild=null;
let activeStep=null;
let interrupted=false;
let finalized=false;
const desktop=path.join(process.env.USERPROFILE||os.homedir(),'Desktop');
const outBase=process.env.TOOL042_RESULT_DIR?path.resolve(process.env.TOOL042_RESULT_DIR):desktop;
fs.mkdirSync(outBase,{recursive:true});
const zipPath=path.join(outBase,`042_${mode}_검수결과.zip`);
const liveTxtPath=path.join(outDir,'live-status.txt');
const liveJsonPath=path.join(outDir,'live-status.json');

const STEP_TIMEOUT_MS={
  'preflight-runtime':90_000,
  'preflight':90_000,
  'core':90_000,
  'boundary':90_000,
  'feature':90_000,
  'regression':90_000,
  'limit':150_000,
  'typescript':120_000,
  'production-build':240_000,
};
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&0xff]^(c>>>8);return(c^0xffffffff)>>>0}
function zipDirectory(dir,zipPath){const files=[];const walk=(cur,base='')=>{for(const e of fs.readdirSync(cur,{withFileTypes:true})){const abs=path.join(cur,e.name),rel=base?`${base}/${e.name}`:e.name;e.isDirectory()?walk(abs,rel):files.push({abs,rel:rel.replace(/\\/g,'/')})}};walk(dir);const local=[],central=[];let offset=0;for(const f of files){const body=fs.readFileSync(f.abs),name=Buffer.from(f.rel),crc=crc32(body),lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(body.length,22);lh.writeUInt16LE(name.length,26);local.push(lh,name,body);const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(body.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);central.push(ch,name);offset+=lh.length+name.length+body.length}const cs=central.reduce((n,b)=>n+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cs,12);end.writeUInt32LE(offset,16);fs.writeFileSync(zipPath,Buffer.concat([...local,...central,end]))}
const safe=(s)=>s.replace(/[^a-zA-Z0-9._-]+/g,'-');
function detachChildPipes(child){
  try{child?.stdout?.destroy()}catch{}
  try{child?.stderr?.destroy()}catch{}
  try{child?.stdin?.destroy()}catch{}
  try{child?.unref?.()}catch{}
}
function killTreeAsync(child,onStatus=()=>{}){
  if(!child?.pid){onStatus('NO_CHILD_PID');return}
  const pid=child.pid;
  if(process.platform==='win32'){
    let killer=null,settled=false;
    const settle=(status)=>{if(settled)return;settled=true;onStatus(status)};
    try{
      killer=spawn('taskkill',['/PID',String(pid),'/T','/F'],{windowsHide:true,stdio:'ignore',detached:false});
      killer.once('error',()=>settle('TASKKILL_SPAWN_FAIL'));
      killer.once('close',code=>settle(code===0?'TASKKILL_OK':`TASKKILL_EXIT_${code}`));
      const guard=setTimeout(()=>{try{killer?.kill('SIGKILL')}catch{}settle('TASKKILL_TIMEOUT_3S')},3000);
      guard.unref?.();
      killer.unref?.();
    }catch{settle('TASKKILL_THROW')}
    return
  }
  try{process.kill(-pid,'SIGKILL');onStatus('SIGKILL_GROUP_OK')}catch{try{child.kill('SIGKILL');onStatus('SIGKILL_CHILD_OK')}catch{onStatus('SIGKILL_FAIL')}}
}
function killTree(child){detachChildPipes(child);killTreeAsync(child)}

function capturePlaywrightEvidence(stepName){
  const src=path.join(root,'test-results');
  if(!fs.existsSync(src))return;
  const dest=path.join(outDir,'evidence',safe(stepName));
  try{
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.rmSync(dest,{recursive:true,force:true});
    fs.cpSync(src,dest,{recursive:true,force:true});
  }catch(e){
    try{fs.appendFileSync(path.join(outDir,'evidence-copy-errors.log'),`${stepName}: ${e instanceof Error?e.message:String(e)}\n`)}catch{}
  }
}
function writeLive(extra={}){const pass=results.filter(x=>x.status===0).length,fail=results.length-pass;const payload={tool:'042',mode,pass,fail,skip:0,status:'RUNNING',updatedAt:new Date().toISOString(),activeStep,results,...extra};const text=[`TOOL 042 ${mode} LIVE`,`UPDATED=${payload.updatedAt}`,`PASS=${pass}`,`FAIL=${fail}`,`ACTIVE=${activeStep?.name||'none'}`,activeStep?.lastOutput?`LAST_OUTPUT=${activeStep.lastOutput}`:'',extra.elapsedSec?`ELAPSED_SEC=${extra.elapsedSec}`:'',extra.status?`STATUS=${extra.status}`:''].filter(Boolean).join('\n')+'\n';try{fs.writeFileSync(path.join(outDir,'live-status.json'),JSON.stringify(payload,null,2));fs.writeFileSync(liveJsonPath,JSON.stringify(payload,null,2));fs.writeFileSync(liveTxtPath,text)}catch{}}
function makeSummary(statusOverride=null){const pass=results.filter(x=>x.status===0).length,fail=results.length-pass;const status=statusOverride||(fail===0?'PASS':'FAIL');return {pass,fail,status,txt:`TOOL 042 ${mode}\nPASS=${pass}\nFAIL=${fail}\nSKIP=0\nSTATUS=${status}\n`}}
function finalize(statusOverride=null,reason='normal'){if(finalized)return;finalized=true;const {pass,fail,status,txt}=makeSummary(statusOverride);const summary=`${txt}REASON=${reason}\n`;try{const finalPayload={tool:'042',mode,pass,fail,skip:0,status,reason,results};fs.writeFileSync(path.join(outDir,'summary.txt'),summary);fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(finalPayload,null,2));fs.writeFileSync(path.join(outDir,'live-status.json'),JSON.stringify(finalPayload,null,2));fs.writeFileSync(liveTxtPath,summary+`ZIP=${zipPath}\n`);fs.writeFileSync(liveJsonPath,JSON.stringify(finalPayload,null,2));try{fs.unlinkSync(zipPath)}catch{}zipDirectory(outDir,zipPath);console.log(`\n${summary}ZIP=${zipPath}`)}catch(e){console.error(`RESULT_PACKAGE_FAIL: ${e instanceof Error?e.message:String(e)}`)}finally{try{fs.rmSync(outDir,{recursive:true,force:true})}catch{}}}
function handleInterrupt(signal){if(interrupted)return;interrupted=true;const now=new Date().toISOString();if(activeStep){results.push({name:activeStep.name,status:130,error:`INTERRUPTED_BY_${signal}`,started:activeStep.started,ended:now,elapsedSec:Math.round((Date.now()-activeStep.startedAt)/1000),timeoutSec:activeStep.timeoutMs?Math.round(activeStep.timeoutMs/1000):null})}killTree(activeChild);activeChild=null;writeLive({status:'INTERRUPTED',signal});finalize('INTERRUPTED',signal);process.exit(130)}
process.on('SIGINT',()=>handleInterrupt('SIGINT'));
process.on('SIGTERM',()=>handleInterrupt('SIGTERM'));

async function runStep(index,total,name,cmd,args){
  console.log(`\n[${index}/${total}] START ${name}`);
  const startedAt=Date.now(),started=new Date(startedAt).toISOString();
  const timeoutMs=STEP_TIMEOUT_MS[name]||0;
  let stdout='',stderr='';
  const logPath=path.join(outDir,`${String(index).padStart(2,'0')}-${safe(name)}.log`);
  const header=`$ ${cmd} ${args.join(' ')}\nSTART=${started}\nTIMEOUT_SEC=${timeoutMs?Math.round(timeoutMs/1000):'NONE'}\n\n`;
  fs.writeFileSync(logPath,header);
  activeStep={index,total,name,started,startedAt,timeoutMs,logPath};
  writeLive();
  return await new Promise(resolve=>{
    let done=false,heartbeat=null,hardTimer=null,timeoutTriggered=false;
    const finish=(code,error,kind='exit')=>{
      if(done)return;done=true;
      if(heartbeat)clearInterval(heartbeat);if(hardTimer)clearTimeout(hardTimer);
      const ended=new Date().toISOString(),elapsedSec=Math.round((Date.now()-startedAt)/1000);
      try{fs.appendFileSync(logPath,`\nEND=${ended}\nELAPSED_SEC=${elapsedSec}\nEXIT=${code}\nEND_KIND=${kind}\nERROR=${error||''}\n`)}catch{}
      results.push({name,status:code,error,kind,started,ended,elapsedSec,timeoutSec:timeoutMs?Math.round(timeoutMs/1000):null});
      if(code!==0 && ['preflight-runtime','preflight','core','boundary','feature','regression','limit'].includes(name)) capturePlaywrightEvidence(name);
      activeChild=null;activeStep=null;writeLive();
      const pass=results.filter(x=>x.status===0).length,fail=results.length-pass;
      console.log(`[${index}/${total}] ${code===0?'PASS':kind==='hard-timeout'?'TIMEOUT':'FAIL'} ${name} | PASS=${pass} FAIL=${fail} | remaining=${total-index}`);
      resolve(code===0);
    };
    let child;
    try{child=spawn(cmd,args,{cwd:root,env:process.env,shell:false,windowsHide:true,detached:process.platform!=='win32'})}catch(e){const m=e instanceof Error?e.message:String(e);try{fs.appendFileSync(logPath,`SPAWN_THROW ${m}\n`)}catch{}finish(1,m,'spawn-error');return}
    activeChild=child;
    heartbeat=setInterval(()=>{const elapsed=Math.max(1,Math.round((Date.now()-startedAt)/1000));console.log(`[${index}/${total}] RUNNING ${name} | elapsed ${elapsed}s${timeoutMs?` / hard ${Math.round(timeoutMs/1000)}s`:''}`);writeLive({elapsedSec:elapsed})},10000);heartbeat.unref?.();
    if(timeoutMs){hardTimer=setTimeout(()=>{
      timeoutTriggered=true;
      const elapsed=Math.round((Date.now()-startedAt)/1000);
      const m=`HARD_TIMEOUT: ${name} exceeded ${Math.round(timeoutMs/1000)}s`;
      stderr+=`\n${m}\n`;
      try{fs.appendFileSync(logPath,`\n${m}\n`)}catch{}
      console.error(`[${index}/${total}] ${m} | recording timeout now; process cleanup runs asynchronously`);
      // Critical: never block the validation runner on Windows taskkill.
      detachChildPipes(child);
      finish(124,m,'hard-timeout');
      killTreeAsync(child,status=>{
        try{fs.appendFileSync(logPath,`PROCESS_CLEANUP=${status}\n`)}catch{}
        console.error(`[${index}/${total}] ${name} cleanup: ${status}`);
      });
    },timeoutMs);hardTimer.unref?.()}
    child.stdout?.on('data',d=>{const s=d.toString();stdout+=s;if(activeStep)activeStep.lastOutput=s.trim().split(/\r?\n/).filter(Boolean).slice(-1)[0]?.slice(-500)||activeStep.lastOutput;try{fs.appendFileSync(logPath,s)}catch{}process.stdout.write(s)});
    child.stderr?.on('data',d=>{const s=d.toString();stderr+=s;if(activeStep)activeStep.lastOutput=s.trim().split(/\r?\n/).filter(Boolean).slice(-1)[0]?.slice(-500)||activeStep.lastOutput;try{fs.appendFileSync(logPath,s)}catch{}process.stderr.write(s)});
    child.on('error',e=>finish(1,e instanceof Error?e.message:String(e),'child-error'));
    child.on('close',code=>timeoutTriggered?finish(124,`HARD_TIMEOUT: ${name} exceeded ${Math.round(timeoutMs/1000)}s`,'hard-timeout'):finish(code??1,null,'exit'));
  });
}

const node=process.execPath,pw=path.join(root,'node_modules','@playwright','test','cli.js'),tsc=path.join(root,'node_modules','typescript','lib','tsc.js'),next=path.join(root,'node_modules','next','dist','bin','next');
const staticSteps=[['self-check',node,['scripts/tool-042/run-static-validation.mjs']]];
const spec=(f,n)=>[n,node,[pw,'test',f,'--workers=1','--config=playwright.tool042.config.ts']];let steps=[...staticSteps];
if(mode==='preflight')steps.push(spec('tests/tool-042-preflight.spec.ts','preflight-runtime'));
if(mode==='core-only')steps.push(spec('tests/tool-042-core.spec.ts','core'));
if(mode==='boundary-only')steps.push(spec('tests/tool-042-boundary.spec.ts','boundary'));
if(mode==='feature-only')steps.push(spec('tests/tool-042-feature.spec.ts','feature'));
if(mode==='regression-only')steps.push(spec('tests/tool-042-regression.spec.ts','regression'));
if(mode==='limit-only')steps.push(spec('tests/tool-042-limit.spec.ts','limit'));
if(mode==='final')steps.push(['typescript',node,[tsc,'--noEmit']],['production-build',node,[next,'build']],spec('tests/tool-042-preflight.spec.ts','preflight'),spec('tests/tool-042-core.spec.ts','core'),spec('tests/tool-042-boundary.spec.ts','boundary'),spec('tests/tool-042-feature.spec.ts','feature'),spec('tests/tool-042-regression.spec.ts','regression'),spec('tests/tool-042-limit.spec.ts','limit'));
try{
  const missing=[];for(const [f,label] of [[pw,'@playwright/test'],[tsc,'typescript'],[next,'next']])if(!fs.existsSync(f))missing.push(label);
  if(missing.length){const m=`ENVIRONMENT_FAIL: local dependencies unavailable: ${missing.join(', ')}. Run npm ci before validation.`;fs.writeFileSync(path.join(outDir,'00-environment.log'),m);const now=new Date().toISOString();results.push({name:'environment-preflight',status:87,error:m,started:now,ended:now,elapsedSec:0});console.error(m)}
  else{console.log(`TOOL 042 ${mode.toUpperCase()} | total steps=${steps.length}`);for(let i=0;i<steps.length&&!interrupted;i++){const [name,cmd,args]=steps[i];await runStep(i+1,steps.length,name,cmd,args)}}
}catch(e){const m=e instanceof Error?(e.stack||e.message):String(e);const now=new Date().toISOString();results.push({name:'validator-internal',status:99,error:m,started:now,ended:now,elapsedSec:0});fs.writeFileSync(path.join(outDir,'99-validator-internal.log'),m)}
const ok=results.every(x=>x.status===0);
finalize(ok?'PASS':'FAIL','completed');
process.exit(ok?0:1);
