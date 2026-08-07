import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import { cleanupProjectValidationArtifacts, createValidationResultPackage, parseCounts } from './tool-validation-result-utils.mjs';

const mode=process.argv[2]||'fast';
const definitions={
  fast:[['validator',['run','check:tool011-validator']],['source',['run','check:tool011-source']]],
  check:[['validator',['run','check:tool011-validator']],['source',['run','check:tool011-source']],['ja-terms',['run','check:ja-terms']]],
  failed:[['failed',['exec','playwright','test','--last-failed','--workers=1']]],
  'core-only':[['core',['run','test:toolbox:011-core:raw']]],
  'boundary-only':[['boundary',['run','test:toolbox:011-limit:raw']]],
  'regression-only':[['regression',['run','test:toolbox:011-regression:raw']]],
  'limit-only':[['limit',['run','test:toolbox:011-limit:raw']]],
  final:[['validator',['run','check:tool011-validator']],['source',['run','check:tool011-source']],['ja-terms',['run','check:ja-terms']],['build',['run','build']],['common',['run','test:toolbox:common-additive']],['core',['run','test:toolbox:011-core:raw']],['regression',['run','test:toolbox:011-regression:raw']],['limit',['run','test:toolbox:011-limit:raw']]],
};
if(!definitions[mode]){console.error(`지원하지 않는 011 검수: ${mode}`);process.exit(2)}
const npmCli=process.env.npm_execpath;
const command=npmCli&&existsSync(npmCli)?{executable:process.execPath,prefix:[npmCli]}:process.platform==='win32'?{executable:'cmd.exe',prefix:['/d','/s','/c','npm']}:{executable:'npm',prefix:[]};
const startedAt=new Date(),steps=[];let prerequisiteFailed=false;
for(const [name,args] of definitions[mode]){
  if(mode==='final'&&name==='limit'&&prerequisiteFailed){steps.push({name,status:'skipped',exitCode:null,durationSeconds:0,counts:{passed:0,failed:0,skipped:1},command:'skipped after prerequisite failure',stdout:'',stderr:'선행 검수 실패로 한계검수를 실행하지 않음'});continue}
  const begin=Date.now(),full=[...command.prefix,...args];const run=spawnSync(command.executable,full,{cwd:process.cwd(),env:{...process.env,FORCE_COLOR:'0',TOOLBOX_VALIDATION_MODE:mode},encoding:'utf8',windowsHide:true,shell:false,maxBuffer:1024*1024*300});
  const stdout=run.stdout||'',stderr=run.stderr||'';if(stdout)process.stdout.write(stdout);if(stderr)process.stderr.write(stderr);const exitCode=typeof run.status==='number'?run.status:1,status=exitCode===0?'passed':'failed';
  steps.push({name,status,exitCode,durationSeconds:Math.round((Date.now()-begin)/100)/10,counts:parseCounts(`${stdout}\n${stderr}`),command:`${command.executable} ${full.join(' ')}`,stdout,stderr});if(exitCode!==0)prerequisiteFailed=true;
}
const endedAt=new Date(),failed=steps.some(s=>s.status==='failed'),skipped=steps.some(s=>s.status==='skipped'),status=!failed&&!skipped?'passed':'failed';
const packaged=createValidationResultPackage({toolNumber:'011',validationType:mode,status,startedAt,endedAt,steps,extraFiles:[{source:'docs/011-validation-plan.md',destination:'docs/011-validation-plan.md'}]});cleanupProjectValidationArtifacts();
console.log(`\n011 ${mode.toUpperCase()} RESULT: ${status.toUpperCase()}`);console.log(`바탕화면 결과 ZIP: ${packaged.zipPath}`);console.log(`ZIP 생성: ${packaged.zipCreated?'SUCCESS':'FAILED'}`);process.exit(status==='passed'&&packaged.zipCreated?0:1);
