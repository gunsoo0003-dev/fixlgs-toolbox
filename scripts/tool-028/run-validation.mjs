import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mode=process.argv[2]??'preflight';
const allowed=new Set(['preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){console.error(`Unsupported TOOL028 validation mode: ${mode}`);process.exit(2);}
const root=process.cwd();
const outDir=fs.mkdtempSync(path.join(os.tmpdir(),`tool028-${mode}-`));
const results=[];

const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&0xff]^(c>>>8);return(c^0xffffffff)>>>0;}
function zipDirectory(dir,zipPath){
  const files=[]; const walk=(cur,base='')=>{for(const e of fs.readdirSync(cur,{withFileTypes:true})){const abs=path.join(cur,e.name),rel=base?`${base}/${e.name}`:e.name;e.isDirectory()?walk(abs,rel):files.push({abs,rel:rel.replace(/\\/g,'/')});}}; walk(dir);
  const local=[],central=[];let offset=0;
  for(const f of files){const body=fs.readFileSync(f.abs),name=Buffer.from(f.rel),crc=crc32(body),lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(body.length,22);lh.writeUInt16LE(name.length,26);local.push(lh,name,body);const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(body.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);central.push(ch,name);offset+=lh.length+name.length+body.length;}
  const cs=central.reduce((n,b)=>n+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cs,12);end.writeUInt32LE(offset,16);fs.writeFileSync(zipPath,Buffer.concat([...local,...central,end]));
}
function safe(name){return name.replace(/[^a-zA-Z0-9._-]+/g,'-');}
async function runStep(index,total,name,args){
  console.log(`\n[${index}/${total}] START ${name}`);const startedAt=Date.now(),started=new Date(startedAt).toISOString();let stdout='',stderr='';
  return await new Promise(resolve=>{
    let done=false,heartbeat=null;
    const finish=(code,error)=>{if(done)return;done=true;if(heartbeat)clearInterval(heartbeat);const ended=new Date().toISOString(),elapsedSec=Math.max(0,Math.round((Date.now()-startedAt)/1000));fs.writeFileSync(path.join(outDir,`${String(index).padStart(2,'0')}-${safe(name)}.log`),`$ ${process.execPath} ${args.join(' ')}\nSTART=${started}\nEND=${ended}\nELAPSED_SEC=${elapsedSec}\nEXIT=${code}\n\n${stdout}\n${stderr}`);results.push({name,status:code,error,started,ended,elapsedSec});const pass=results.filter(x=>x.status===0).length,fail=results.length-pass;console.log(`[${index}/${total}] ${code===0?'PASS':'FAIL'} ${name} | PASS=${pass} FAIL=${fail} | remaining=${total-index}`);resolve(code===0);};
    let child;try{child=spawn(process.execPath,args,{cwd:root,env:process.env,shell:false,windowsHide:true});}catch(e){const m=e instanceof Error?e.message:String(e);stderr+=`\nSPAWN_THROW: ${m}\n`;finish(1,m);return;}
    heartbeat=setInterval(()=>{const elapsedSec=Math.max(1,Math.round((Date.now()-startedAt)/1000));console.log(`[${index}/${total}] RUNNING ${name} | elapsed ${elapsedSec}s`);},15000);heartbeat.unref?.();
    child.stdout?.on('data',d=>{const x=d.toString();stdout+=x;process.stdout.write(x);});child.stderr?.on('data',d=>{const x=d.toString();stderr+=x;process.stderr.write(x);});child.on('error',e=>{const m=e instanceof Error?e.message:String(e);stderr+=`\nSPAWN_ERROR: ${m}\n`;finish(1,m);});child.on('close',code=>finish(code??1,null));
  });
}

const staticSteps=[
  ['source',['scripts/tool-028/check-source.mjs']],
  ['harness',['scripts/tool-028/check-harness.mjs']],
  ['design-state-contract',['scripts/tool-028/check-design-transplant.mjs']],
  ['package-lock-contract',['scripts/tool-028/check-package.mjs']],
  ['content',['scripts/tool-028/check-content.mjs']],
  ['limit-contract',['scripts/tool-028/check-limit-contract.mjs']],
  ['common-design',['scripts/check-toolbox-common-design.mjs']],
];
const nextCli=path.join(root,'node_modules','next','dist','bin','next');
const pwCli=path.join(root,'node_modules','@playwright','test','cli.js');
const tscCli=path.join(root,'node_modules','typescript','lib','tsc.js');
const runtimeSpec={
  'preflight':['tests/tool-028-preflight.spec.ts'],
  'core-only':['tests/tool-028-core.spec.ts'],
  'boundary-only':['tests/tool-028-boundary.spec.ts'],
  'feature-only':['tests/tool-028-feature.spec.ts','tests/tool-028-design-state.spec.ts'],
  'regression-only':['tests/tool-028-regression.spec.ts'],
  'limit-only':['tests/tool-028-limit.spec.ts'],
}[mode];
const finalExtraSteps = 9;
const totalRunSteps = staticSteps.length + (mode === 'final' ? finalExtraSteps : 2);
let fatalMessage=null;
try{
  console.log(`TOOL 028 ${mode.toUpperCase()} | total steps=${totalRunSteps} | validator self-check first`);
  for(let i=0;i<staticSteps.length;i++) await runStep(i+1,totalRunSteps,staticSteps[i][0],staticSteps[i][1]);
  const staticFailed=results.some(x=>x.status!==0);
  if(!staticFailed){
    const missing=[];
    for(const [label,file] of [['next',nextCli],['playwright',pwCli],['typescript',tscCli]]) if(!fs.existsSync(file)) missing.push(`node_modules/${label}`);
    let depProblem=null;
    try{
      const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
      const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
      const installed=(name)=>{const f=path.join(root,'node_modules',name,'package.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')).version:null;};
      if(pkg.dependencies?.['pdf-lib']!=='1.17.1'||lock.packages?.['']?.dependencies?.['pdf-lib']!=='1.17.1'||installed('pdf-lib')!=='1.17.1') depProblem='pdf-lib package/lock/install must all be 1.17.1';
      else if(pkg.dependencies?.['pdfjs-dist']!=='5.4.54'||lock.packages?.['']?.dependencies?.['pdfjs-dist']!=='5.4.54'||installed('pdfjs-dist')!=='5.4.54') depProblem='protected pdfjs-dist package/lock/install must all remain 5.4.54';
    }catch(e){depProblem=`dependency metadata check failed: ${e instanceof Error?e.message:String(e)}`;}
    if(depProblem)missing.push(depProblem);
    if(missing.length){const now=new Date().toISOString(),msg=`ENVIRONMENT_FAIL: ${missing.join('; ')}. Run npm install before TOOL028 validation.`;fs.writeFileSync(path.join(outDir,'06-environment.log'),msg+'\n');results.push({name:'environment-preflight',status:87,error:msg,started:now,ended:now,elapsedSec:0});console.error(msg);}
    else{
      if(mode==='final'){
        const finalSteps=[
          ['syntax-local-typescript',['scripts/tool-028/check-syntax.mjs']],
          ['typescript-noemit',[tscCli,'--noEmit']],
          ['production-build',['scripts/tool-028/runtime-workspace.mjs','build']],
          ['runtime-core',[pwCli,'test','tests/tool-028-core.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
          ['runtime-boundary',[pwCli,'test','tests/tool-028-boundary.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
          ['runtime-feature',[pwCli,'test','tests/tool-028-feature.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
          ['runtime-design-state',[pwCli,'test','tests/tool-028-design-state.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
          ['runtime-regression',[pwCli,'test','tests/tool-028-regression.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
          ['runtime-limit',[pwCli,'test','tests/tool-028-limit.spec.ts','--workers=1','--config=playwright.tool028-runtime.config.ts']],
        ];
        for(let i=0;i<finalSteps.length;i++){
          const [name,args]=finalSteps[i];
          await runStep(staticSteps.length+i+1,totalRunSteps,name,args);
        }
      }else{
        await runStep(staticSteps.length+1,totalRunSteps,'syntax-local-typescript',['scripts/tool-028/check-syntax.mjs']);
        if(results.at(-1)?.status===0) await runStep(staticSteps.length+2,totalRunSteps,`runtime-${mode}`,[pwCli,'test',...runtimeSpec,'--workers=1','--config=playwright.tool028-runtime.config.ts']);
      }
    }
  }else console.error('VALIDATOR_CONTRACT_FAIL: runtime product test blocked until checker self-check is clean.');
}catch(e){fatalMessage=e instanceof Error?(e.stack||e.message):String(e);const now=new Date().toISOString();results.push({name:'validator-internal',status:99,error:fatalMessage,started:now,ended:now,elapsedSec:0});try{fs.writeFileSync(path.join(outDir,'99-validator-internal.log'),fatalMessage);}catch{}console.error(`VALIDATOR_INTERNAL_FAIL\n${fatalMessage}`);}
const pass=results.filter(x=>x.status===0).length,fail=results.length-pass,ok=fail===0&&!fatalMessage;
const summary=`TOOL 028 ${mode}\nPASS=${pass}\nFAIL=${fail}\nSKIP=0\nSTATUS=${ok?'PASS':'FAIL'}\n`;
try{fs.writeFileSync(path.join(outDir,'summary.txt'),summary);fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify({tool:'028',mode,pass,fail,skip:0,status:ok?'PASS':'FAIL',results},null,2));}catch{}
const desktop=path.join(process.env.USERPROFILE||os.homedir(),'Desktop');const outBase=process.env.TOOL028_RESULT_DIR?path.resolve(process.env.TOOL028_RESULT_DIR):desktop;let zipPath=path.join(outBase,`028_${mode}_검수결과.zip`);let archiveOk=false;
try{fs.mkdirSync(outBase,{recursive:true});try{fs.unlinkSync(zipPath);}catch{}zipDirectory(outDir,zipPath);archiveOk=fs.existsSync(zipPath)&&fs.statSync(zipPath).size>0;if(!archiveOk)throw new Error('result ZIP missing or empty');console.log(`\n${summary}RESULT_ZIP=${zipPath}`);}catch(e){console.error(`RESULT_ARCHIVE_FAIL: ${e instanceof Error?e.message:String(e)}`);zipPath='(archive failed)';}finally{try{fs.rmSync(outDir,{recursive:true,force:true});}catch{}}
process.exit(ok&&archiveOk?0:1);
