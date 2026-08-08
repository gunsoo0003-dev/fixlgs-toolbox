import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts, resolveDesktopPath } from './tool-validation-result-utils.mjs';

const mode = process.argv[2] || 'core-only';
const modes = {
  preflight: { specs: ['tests/tool-018-preflight.spec.ts'], staticChecks: ['scripts/check-tool-018-harness.mjs','scripts/check-tool-018-design.mjs'] },
  'core-only': { specs: ['tests/tool-018-core.spec.ts'], staticChecks: ['scripts/check-tool-018-source.mjs','scripts/check-tool-018-harness.mjs','scripts/check-tool-018-validator.mjs','scripts/check-tool-018-design.mjs'] },
  'boundary-only': { specs: ['tests/tool-018-boundary.spec.ts'], staticChecks: ['scripts/check-tool-018-source.mjs','scripts/check-tool-018-harness.mjs'] },
  'regression-only': { specs: ['tests/tool-018-regression.spec.ts'], staticChecks: ['scripts/check-tool-018-source.mjs','scripts/check-tool-018-harness.mjs','scripts/check-tool-018-design.mjs'] },
  'limit-only': { specs: ['tests/tool-018-limit.spec.ts'], staticChecks: ['scripts/check-tool-018-validator.mjs'] },
};
if (!modes[mode]) { console.error(`Unknown 018 validation mode: ${mode}`); process.exit(2); }

const startedAt = new Date();
const steps = [];
let failed = false;
let harnessOnly = true;
function record(name, command, run, started) {
  const stdout=run.stdout||'', stderr=run.stderr||'', code=typeof run.status==='number'?run.status:1;
  process.stdout.write(stdout); process.stderr.write(stderr);
  const text=`${stdout}\n${stderr}`;
  if(/\[PRODUCT_FAIL\]/.test(text)) harnessOnly=false;
  steps.push({name,status:code===0?'passed':/\[HARNESS_ERROR\]/.test(text)&&!/\[PRODUCT_FAIL\]/.test(text)?'harness_error':'failed',exitCode:code,durationSeconds:Math.round((Date.now()-started)/100)/10,counts:parseCounts(text),command,stdout,stderr:run.error?`${stderr}\n${run.error.message}`:stderr});
  if(code!==0) failed=true;
  return code;
}
function runNode(script) {
  const started=Date.now();
  const run=spawnSync(process.execPath,[script],{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*50});
  return record(script,`${process.execPath} ${script}`,run,started);
}
function runPlaywright(specs) {
  const local=resolve(process.cwd(),'node_modules','@playwright','test','cli.js');
  let exe,args;
  if(existsSync(local)){exe=process.execPath;args=[local,'test',...specs,'--workers=1','--config=playwright.tool018-runtime.config.ts'];}
  else { const npmCli=process.env.npm_execpath; if(npmCli&&existsSync(npmCli)){exe=process.execPath;args=[npmCli,'exec','--','playwright','test',...specs,'--workers=1','--config=playwright.tool018-runtime.config.ts'];} else if(process.platform==='win32'){exe='cmd.exe';args=['/d','/s','/c','npm','exec','--','playwright','test',...specs,'--workers=1','--config=playwright.tool018-runtime.config.ts'];} else {exe='npm';args=['exec','--','playwright','test',...specs,'--workers=1','--config=playwright.tool018-runtime.config.ts'];} }
  const started=Date.now();
  const run=spawnSync(exe,args,{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*300});
  return record(mode,`${exe} ${args.join(' ')}`,run,started);
}

for(const check of modes[mode].staticChecks){ if(runNode(check)!==0) break; }
if(!failed) runPlaywright(modes[mode].specs);
else steps.push({name:'runtime',status:'skipped',exitCode:null,durationSeconds:0,counts:{passed:0,failed:0,skipped:1},command:'playwright not started because static check failed',stdout:'',stderr:''});
const status=failed?(harnessOnly?'harness_error':'failed'):'passed';
const pkg=createValidationResultPackage({toolNumber:'018',validationType:mode,status,startedAt,endedAt:new Date(),steps});
cleanupProjectValidationArtifacts();
let finalZip=pkg.zipPath;
if(pkg.zipCreated){const fixed=resolve(resolveDesktopPath(),`018_${mode}_검수결과.zip`);try{rmSync(fixed,{force:true});renameSync(pkg.zipPath,fixed);finalZip=fixed;}catch(error){console.error(`[HARNESS_ERROR] fixed result ZIP rename failed: ${error instanceof Error?error.message:String(error)}`);}}
console.log(`018 ${mode.toUpperCase()} RESULT: ${status.toUpperCase()}`);console.log(`결과 ZIP: ${finalZip}`);
process.exit(status==='passed'&&pkg.zipCreated?0:status==='harness_error'?2:1);
