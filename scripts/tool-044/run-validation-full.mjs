import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]||'final';
const allowed=new Set(['preflight','core-only','boundary-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){console.error(`UNKNOWN_MODE=${mode}`);process.exit(2)}

const isWin=process.platform==='win32';
const npm=isWin?'npm.cmd':'npm';
const desktop=path.join(process.env.USERPROFILE||os.homedir(),'Desktop');
const resultDir=process.env.TOOL044_RESULT_DIR?path.resolve(process.env.TOOL044_RESULT_DIR):desktop;
fs.mkdirSync(resultDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const txt=path.join(resultDir,`044_${mode}_검수결과_${stamp}.txt`);
const rows=[];

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
  rows.push({name,exit,started,ended:new Date().toISOString(),output:out,spawnError});
  console.log(`=== ${exit===0?'PASS':'FAIL'} ${name} EXIT=${exit}${spawnError?' SPAWN_ERROR=YES':''} ===`);
}

const playwright=(spec)=>{
  // Windows .cmd launch through spawnSync(shell:false) can return status=null.
  // Invoke exactly the same shell command that succeeds interactively.
  if(isWin){
    return run(
      spec,
      `npx playwright test tests/tool-044-${spec}.spec.ts --workers=1 --config=playwright.tool044.config.ts --reporter=list`,
      [],
      {shell:true}
    );
  }
  return run(spec,'npx',['playwright','test',`tests/tool-044-${spec}.spec.ts`,'--workers=1','--config=playwright.tool044.config.ts','--reporter=list']);
};

if(mode==='preflight'){
  run('static-self-check',process.execPath,['scripts/tool-044/run-static-validation.mjs']);
  playwright('preflight');
}else if(mode==='core-only') playwright('core');
else if(mode==='boundary-only') playwright('boundary');
else if(mode==='regression-only') playwright('regression');
else if(mode==='limit-only') playwright('limit');
else{
  // FINAL deliberately keeps running independent stages after a failure.
  run('static-self-check',process.execPath,['scripts/tool-044/run-static-validation.mjs']);
  playwright('preflight');
  playwright('core');
  playwright('boundary');
  playwright('regression');
  playwright('limit');
  if(isWin){
    run('typescript','npx tsc --noEmit',[],{shell:true});
    run('production-build','npm run build',[],{shell:true});
  }else{
    run('typescript','npx',['tsc','--noEmit']);
    run('production-build',npm,['run','build']);
  }
}

const pass=rows.filter(x=>x.exit===0).length;
const fail=rows.length-pass;
const summary=[
  `TOOL044 MODE=${mode}`,
  `PASS=${pass}`,
  `FAIL=${fail}`,
  `SKIP=0`,
  `STATUS=${fail?'FAIL':'PASS'}`,
  '',
  ...rows.map(x=>`${x.exit===0?'PASS':'FAIL'}\t${x.name}\tEXIT=${x.exit}`),
  ''
].join('\n');
fs.writeFileSync(txt,summary+'\n'+rows.map(x=>`\n##### ${x.name} #####\n${x.output}`).join('\n'),'utf8');
console.log(`\n${summary}`);
console.log(`RESULT_TXT=${txt}`);
process.exitCode=fail?1:0;
