import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]||'final';
if(mode!=='final'){console.error(`UNKNOWN_MODE=${mode}`);process.exit(2)}
const isWin=process.platform==='win32';
const resultDir=path.join(process.env.USERPROFILE||os.homedir(),'Desktop');
fs.mkdirSync(resultDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const txt=path.join(resultDir,`069_final_검수결과_${stamp}.txt`);
const rows=[];
const bin=x=>path.resolve('node_modules','.bin',isWin?`${x}.cmd`:x);
const deps=()=>['playwright','next','tsc'].every(x=>fs.existsSync(bin(x)));
function run(name,cmd,args=[],opts={}){
  const r=spawnSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],shell:opts.shell??false});
  const out=(r.stdout||'')+(r.stderr||'')+(r.error?`\nSPAWN_ERROR=${r.error.message}`:'');
  process.stdout.write(`\n=== ${name} ===\n${out}`);
  const exit=r.status??(r.error?127:1);
  rows.push({name,exit,output:out});
  return exit===0;
}
function npmRun(name,script){return isWin?run(name,`npm run ${script}`,[],{shell:true}):run(name,'npm',['run',script])}
function browser(){return isWin?run('browser','npx playwright test --config=playwright.tool069.config.ts --workers=1 --reporter=list',[],{shell:true}):run('browser','npx',['playwright','test','--config=playwright.tool069.config.ts','--workers=1','--reporter=list'])}

npmRun('static','tool069:static');
run('secret-scan',process.execPath,['scripts/tool-069/check-secret-scan.mjs']);
if(deps()){
  browser();
  isWin?run('typescript','npx tsc --noEmit',[],{shell:true}):run('typescript','npx',['tsc','--noEmit']);
  npmRun('production-build','build');
}else{
  rows.push({name:'dependency-preflight',exit:0,output:'MAIN_WORK_INTEGRATION_VERIFICATION missing local bins: playwright/next/tsc'});
  console.log('\n=== dependency-preflight ===\nMAIN_WORK_INTEGRATION_VERIFICATION missing local bins: playwright/next/tsc');
}
const pass=rows.filter(x=>x.exit===0).length;
const fail=rows.filter(x=>x.exit!==0).length;
const missingDeps=rows.some(x=>x.name==='dependency-preflight');
const status=fail?'FAIL':missingDeps?'AUX_READY':'PASS';
const summary=`TOOL069 MODE=final\nPASS=${pass}\nFAIL=${fail}\nMAIN_WORK=${missingDeps?1:0}\nENVIRONMENT_BLOCK=0\nSTATUS=${status}\n`;
fs.writeFileSync(txt,summary+rows.map(x=>`\ncheck\t${x.name}\tEXIT=${x.exit}\n${x.output}`).join('\n'),'utf8');
console.log(`\n${summary}RESULT_TXT=${txt}`);
process.exitCode=fail?1:0;
