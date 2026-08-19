import {spawnSync} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const mode=process.argv[2]||'final';
const allowed=new Set(["preflight", "core-only", "feature-only", "timezone-only", "boundary-only", "regression-only", "limit-only", "final"]);
if(!allowed.has(mode)){console.error(`UNKNOWN_MODE=${mode}`);process.exit(2)}
const isWin=process.platform==='win32';
const resultDir=process.env.TOOL053_RESULT_DIR?path.resolve(process.env.TOOL053_RESULT_DIR):path.join(process.env.USERPROFILE||os.homedir(),'Desktop');
fs.mkdirSync(resultDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const txt=path.join(resultDir,`053_${mode}_검수결과_${stamp}.txt`);
const rows=[];
const localBin=x=>path.resolve('node_modules','.bin',isWin?`${x}.cmd`:x);
function deps(){const missing=['playwright','next','tsc'].filter(x=>!fs.existsSync(localBin(x)));if(missing.length){const out=`ENVIRONMENT_BLOCK missing_local_bins=${missing.join(',')}`;console.log(out);rows.push({name:'dependency-preflight',exit:125,kind:'environment',output:out});return false}return true}
function run(name,cmd,args,opts={}){const r=spawnSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],shell:opts.shell??false});const out=(r.stdout||'')+(r.stderr||'')+(r.error?`\nSPAWN_ERROR=${r.error.name}: ${r.error.message}\n`:'');process.stdout.write(out);const exit=r.status??(r.error?127:1);rows.push({name,exit,kind:'check',output:out});return exit===0}
function pw(spec){return isWin?run(spec,`npx playwright test tests/tool-053-${spec}.spec.ts --workers=1 --config=playwright.tool053.config.ts --reporter=list`,[],{shell:true}):run(spec,'npx',['playwright','test',`tests/tool-053-${spec}.spec.ts`,'--workers=1','--config=playwright.tool053.config.ts','--reporter=list'])}
const specs=["preflight", "core", "feature", "timezone", "boundary", "regression", "limit"];
if(mode==='preflight'){run('static-self-check',process.execPath,['scripts/tool-053/run-static-validation.mjs']);if(deps())pw('preflight')}
else if(mode.endsWith('-only')){const s=mode.slice(0,-5);if(deps())pw(s)}
else{run('secret-scan',process.execPath,['scripts/tool-053/check-secret-scan.mjs']);run('static-self-check',process.execPath,['scripts/tool-053/run-static-validation.mjs']);if(deps()){for(const s of specs)pw(s);if(isWin){run('typescript','npx tsc --noEmit',[],{shell:true});run('production-build','npm run build',[],{shell:true})}else{run('typescript','npx',['tsc','--noEmit']);run('production-build','npm',['run','build'])}}else{for(const x of ['playwright stages','typescript','production-build'])rows.push({name:x,exit:0,kind:'skip',output:'SKIP_ENVIRONMENT dependency preflight failed'})}}
const pass=rows.filter(x=>x.kind==='check'&&x.exit===0).length,fail=rows.filter(x=>x.kind==='check'&&x.exit!==0).length,skip=rows.filter(x=>x.kind==='skip').length,env=rows.some(x=>x.kind==='environment');
const summary=`TOOL053 MODE=${mode}\nPASS=${pass}\nFAIL=${fail}\nSKIP=${skip}\nENVIRONMENT_BLOCK=${env?1:0}\nSTATUS=${env?'ENVIRONMENT_BLOCK':fail?'FAIL':'PASS'}\n`;
fs.writeFileSync(txt,summary+rows.map(x=>`\n${x.kind}\t${x.name}\tEXIT=${x.exit}\n${x.output}`).join('\n'),'utf8');
console.log(summary);console.log(`RESULT_TXT=${txt}`);process.exitCode=(fail||env)?1:0;
