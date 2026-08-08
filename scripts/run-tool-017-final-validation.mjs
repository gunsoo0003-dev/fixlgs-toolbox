import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts } from './tool-validation-result-utils.mjs';

const definitions = [
  ['validator', ['run','check:tool017-validator']],
  ['source', ['run','check:tool017-source']],
  ['design', ['run','check:tool017-design']],
  ['harness', ['run','check:tool017-harness']],
  ['ja-terms', ['run','check:ja-terms']],
  ['build', ['run','build']],
  ['common', ['exec','--','playwright','test','tests/common-tool-additive.spec.ts','--workers=1','--config=playwright.tool017-runtime.config.ts']],
  ['core', ['run','test:toolbox:017-core-only']],
  ['boundary', ['run','test:toolbox:017-boundary-only']],
  ['regression', ['run','test:toolbox:017-regression-only']],
  ['service-limit', ['run','test:toolbox:017-limit-only']],
];
const npmCli=process.env.npm_execpath;
const cmd=npmCli&&existsSync(npmCli)?{exe:process.execPath,prefix:[npmCli]}:process.platform==='win32'?{exe:'cmd.exe',prefix:['/d','/s','/c','npm']}:{exe:'npm',prefix:[]};
const startedAt=new Date(),steps=[]; let prerequisiteFailed=false;
for(const [name,args] of definitions){
  if(prerequisiteFailed&&name==='service-limit'){steps.push({name,status:'skipped',exitCode:null,durationSeconds:0,counts:{passed:0,failed:0,skipped:1},command:'skipped',stdout:'',stderr:'선행 단계 실패로 서비스 상한 검수 미실행'});continue;}
  const started=Date.now(),full=[...cmd.prefix,...args];
  const run=spawnSync(cmd.exe,full,{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0'},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*300});
  const stdout=run.stdout||'',stderr=run.stderr||'',code=typeof run.status==='number'?run.status:1; process.stdout.write(stdout);process.stderr.write(stderr);
  const counts=parseCounts(`${stdout}\n${stderr}`); if(code===0&&counts.passed===0)counts.passed=1;if(code!==0&&counts.failed===0)counts.failed=1;
  steps.push({name,status:code===0?'passed':'failed',exitCode:code,durationSeconds:Math.round((Date.now()-started)/100)/10,counts,command:`${cmd.exe} ${full.join(' ')}`,stdout,stderr:run.error?`${stderr}\n${run.error.message}`:stderr});
  if(code!==0&&name!=='service-limit')prerequisiteFailed=true;
}
const failed=steps.some(x=>x.status==='failed'),skipped=steps.some(x=>x.status==='skipped'),status=failed||skipped?'failed':'passed';
const packaged=createValidationResultPackage({toolNumber:'017',validationType:'final',status,startedAt,endedAt:new Date(),steps});
let finalZipPath=packaged.zipPath;
if(packaged.zipCreated){finalZipPath=resolve(dirname(packaged.zipPath),'017_final_검수결과.zip');rmSync(finalZipPath,{force:true});renameSync(packaged.zipPath,finalZipPath);}cleanupProjectValidationArtifacts();
console.log(`017 FINAL RESULT: ${status.toUpperCase()}`);console.log(`FAIL ${steps.filter(x=>x.status==='failed').length} / SKIP ${steps.filter(x=>x.status==='skipped').length}`);console.log(`결과 ZIP: ${finalZipPath}`);
process.exit(status==='passed'&&packaged.zipCreated?0:1);
