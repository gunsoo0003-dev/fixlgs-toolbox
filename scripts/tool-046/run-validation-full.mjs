import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]||'final';
const allowed=new Set(['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){console.error(`UNKNOWN_MODE=${mode}`);process.exit(2)}

const isWin=process.platform==='win32';
const npm=isWin?'npm.cmd':'npm';
const desktop=path.join(process.env.USERPROFILE||os.homedir(),'Desktop');
const resultDir=process.env.TOOL046_RESULT_DIR?path.resolve(process.env.TOOL046_RESULT_DIR):desktop;
fs.mkdirSync(resultDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const txt=path.join(resultDir,`046_${mode}_검수결과_${stamp}.txt`);
const rows=[];

function localBin(name){
  const file=isWin?path.join('node_modules','.bin',`${name}.cmd`):path.join('node_modules','.bin',name);
  return path.resolve(process.cwd(),file);
}
function dependencyPreflight(){
  const required=['playwright','next','tsc'];
  const missing=required.filter(x=>!fs.existsSync(localBin(x)));
  if(missing.length){
    const message=`ENVIRONMENT_BLOCK missing_local_bins=${missing.join(',')}`;
    console.log(message);
    rows.push({name:'environment-dependency-preflight',exit:125,kind:'environment',started:new Date().toISOString(),ended:new Date().toISOString(),output:message+'\n',spawnError:''});
    return false;
  }
  return true;
}

function run(name,cmd,args,options={}){
  const started=new Date().toISOString();
  console.log(`\n=== START ${name} ===`);
  const r=spawnSync(cmd,args,{
    cwd:process.cwd(),
    encoding:'utf8',
    stdio:['ignore','pipe','pipe'],
    windowsHide:true,
    shell:options.shell??false
  });
  const spawnError=r.error ? `${r.error.name}: ${r.error.message}` : '';
  const out=(r.stdout||'')+(r.stderr||'')+(spawnError?`\nSPAWN_ERROR=${spawnError}\n`:'');
  process.stdout.write(out);
  const exit=r.status ?? (r.error ? 127 : 1);
  rows.push({name,exit,kind:'check',started,ended:new Date().toISOString(),output:out,spawnError});
  console.log(`=== ${exit===0?'PASS':'FAIL'} ${name} EXIT=${exit}${spawnError?' SPAWN_ERROR=YES':''} ===`);
}

const playwright=(spec)=>{
  // Windows .cmd launch through spawnSync(shell:false) can return status=null.
  // Invoke exactly the same shell command that succeeds interactively.
  if(isWin){
    return run(
      spec,
      `npx playwright test tests/tool-046-${spec}.spec.ts --workers=1 --config=playwright.tool046.config.ts --reporter=list`,
      [],
      {shell:true}
    );
  }
  return run(spec,'npx',['playwright','test',`tests/tool-046-${spec}.spec.ts`,'--workers=1','--config=playwright.tool046.config.ts','--reporter=list']);
};

if(mode==='preflight'){
  run('static-self-check',process.execPath,['scripts/tool-046/run-static-validation.mjs']);
  if(dependencyPreflight()) playwright('preflight');
}else if(mode==='core-only'){ if(dependencyPreflight()) playwright('core'); }
else if(mode==='boundary-only'){ if(dependencyPreflight()) playwright('boundary'); }
else if(mode==='feature-only'){ if(dependencyPreflight()) playwright('feature'); }
else if(mode==='regression-only'){ if(dependencyPreflight()) playwright('regression'); }
else if(mode==='limit-only'){ if(dependencyPreflight()) playwright('limit'); }
else{
  // FINAL deliberately keeps running independent stages after a failure.
  run('static-self-check',process.execPath,['scripts/tool-046/run-static-validation.mjs']);
  const depsReady=dependencyPreflight();
  if(depsReady){
    playwright('preflight');
    playwright('core');
    playwright('boundary');
    playwright('feature');
    playwright('regression');
    playwright('limit');
    if(isWin){
      run('typescript','npx tsc --noEmit',[],{shell:true});
      run('production-build','npm run build',[],{shell:true});
    }else{
      run('typescript','npx',['tsc','--noEmit']);
      run('production-build',npm,['run','build']);
    }
  }else{
    rows.push({name:'typescript',exit:0,kind:'skip',started:new Date().toISOString(),ended:new Date().toISOString(),output:'SKIP_ENVIRONMENT dependency preflight failed\n',spawnError:''});
    rows.push({name:'production-build',exit:0,kind:'skip',started:new Date().toISOString(),ended:new Date().toISOString(),output:'SKIP_ENVIRONMENT dependency preflight failed\n',spawnError:''});
    console.log('SKIP_ENVIRONMENT typescript/build: dependency preflight failed');
  }
}

const pass=rows.filter(x=>x.kind!=='skip'&&x.kind!=='environment'&&x.exit===0).length;
const fail=rows.filter(x=>x.kind==='check'&&x.exit!==0).length;
const skip=rows.filter(x=>x.kind==='skip').length;
const environmentBlock=rows.some(x=>x.kind==='environment');
const summary=[
  `TOOL046 MODE=${mode}`,
  `PASS=${pass}`,
  `FAIL=${fail}`,
  `SKIP=${skip}`,
  `ENVIRONMENT_BLOCK=${environmentBlock?'1':'0'}`,
  `STATUS=${environmentBlock?'ENVIRONMENT_BLOCK':(fail?'FAIL':'PASS')}`,
  '',
  ...rows.map(x=>`${x.kind==='skip'?'SKIP':x.kind==='environment'?'ENVIRONMENT':x.exit===0?'PASS':'FAIL'}\t${x.name}\tEXIT=${x.exit}`),
  ''
].join('\n');
fs.writeFileSync(txt,summary+'\n'+rows.map(x=>`\n##### ${x.name} #####\n${x.output}`).join('\n'),'utf8');
console.log(`\n${summary}`);
console.log(`RESULT_TXT=${txt}`);
process.exitCode=(fail||environmentBlock)?1:0;
