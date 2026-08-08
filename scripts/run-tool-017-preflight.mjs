import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts, resolveDesktopPath } from './tool-validation-result-utils.mjs';

const startedAt=new Date();
const steps=[];
function record(name,command,run,started){
  const stdout=run.stdout||'',stderr=run.stderr||'',code=typeof run.status==='number'?run.status:1;
  process.stdout.write(stdout);process.stderr.write(stderr);
  steps.push({name,status:code===0?'passed':'failed',exitCode:code,durationSeconds:Math.round((Date.now()-started)/100)/10,counts:parseCounts(`${stdout}\n${stderr}`),command,stdout,stderr});
  return code;
}
function runNode(script){
  const started=Date.now();
  const r=spawnSync(process.execPath,[script],{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*50});
  return record('static-harness',`${process.execPath} ${script}`,r,started);
}
function runRuntime(){
  const started=Date.now();
  const local=resolve(process.cwd(),'node_modules','@playwright','test','cli.js');
  let exe,args;
  if(existsSync(local)){exe=process.execPath;args=[local,'test','tests/tool-017-preflight.spec.ts','--workers=1','--config=playwright.tool017-runtime.config.ts'];}
  else{
    const npmCli=process.env.npm_execpath;
    if(npmCli&&existsSync(npmCli)){exe=process.execPath;args=[npmCli,'exec','--','playwright','test','tests/tool-017-preflight.spec.ts','--workers=1','--config=playwright.tool017-runtime.config.ts'];}
    else if(process.platform==='win32'){exe='cmd.exe';args=['/d','/s','/c','npm','exec','--','playwright','test','tests/tool-017-preflight.spec.ts','--workers=1','--config=playwright.tool017-runtime.config.ts'];}
    else{exe='npm';args=['exec','--','playwright','test','tests/tool-017-preflight.spec.ts','--workers=1','--config=playwright.tool017-runtime.config.ts'];}
  }
  const r=spawnSync(exe,args,{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*100});
  return record('runtime-harness',`${exe} ${args.join(' ')}`,r,started);
}

let failed=false;
const staticCode=runNode('scripts/check-tool-017-harness.mjs');
if(staticCode!==0){
  failed=true;
  steps.push({name:'runtime-harness',status:'skipped',exitCode:null,durationSeconds:0,counts:{passed:0,failed:0,skipped:1},command:'playwright preflight (not started because static harness failed)',stdout:'',stderr:'Runtime preflight was not started because static selector/DOM preflight failed.'});
  console.error('[HARNESS_ERROR] 017 static harness failed. Runtime feature tests were not started.');
}else{
  const runtimeCode=runRuntime();
  if(runtimeCode!==0){failed=true;console.error('[HARNESS_ERROR] 017 runtime preflight failed. Resolve route/selector/timing/environment before classifying feature failures.');}
}

const endedAt=new Date(),status=failed?'failed':'passed';
const pkg=createValidationResultPackage({toolNumber:'017',validationType:'preflight',status,startedAt,endedAt,steps});
cleanupProjectValidationArtifacts();
let finalZip=pkg.zipPath;
if(pkg.zipCreated){
  const fixed=resolve(resolveDesktopPath(),'017_preflight_검수결과.zip');
  try{rmSync(fixed,{force:true});renameSync(pkg.zipPath,fixed);finalZip=fixed;}catch(e){console.error(`[HARNESS_ERROR] fixed result ZIP rename failed: ${e instanceof Error?e.message:String(e)}`);}
}
console.log(`017 PREFLIGHT RESULT: ${status.toUpperCase()}`);
console.log(`결과 ZIP: ${finalZip}`);
process.exit(status==='passed'&&pkg.zipCreated?0:1);
