import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const mode=process.argv[2]||'preflight';
const allowed=new Set(['preflight','core-only','boundary-only','regression-only','limit-only','final']);
if(!allowed.has(mode)){ console.error(`unknown mode: ${mode}`); process.exit(2); }
const root=process.cwd();
const outDir=fs.mkdtempSync(path.join(os.tmpdir(),`tool023-${mode}-`));
const results=[];
const totalStarted=performance.now();

function run(name,cmd,args){
  const started=performance.now();
  const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',env:process.env,shell:false});
  const durationMs=Math.round(performance.now()-started);
  const spawnError=r.error ? `\nSPAWN_ERROR: ${r.error.message}` : '';
  const log=`$ ${cmd} ${args.join(' ')}\n${r.stdout||''}\n${r.stderr||''}${spawnError}`;
  fs.writeFileSync(path.join(outDir,`${name}.log`),log);
  results.push({name,status:r.status??1,durationMs,error:r.error?.message??null});
  return !r.error && r.status===0;
}

const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;}
function zipDirectory(dir,zipPath){
  const files=[]; function walk(current,base=''){for(const ent of fs.readdirSync(current,{withFileTypes:true})){const abs=path.join(current,ent.name);const rel=base?`${base}/${ent.name}`:ent.name;if(ent.isDirectory())walk(abs,rel);else files.push({abs,rel:rel.replace(/\\/g,'/')});}} walk(dir);
  const local=[]; const central=[]; let offset=0;
  for(const f of files){const body=fs.readFileSync(f.abs);const name=Buffer.from(f.rel,'utf8');const crc=crc32(body);const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(0,8);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(body.length,22);lh.writeUInt16LE(name.length,26);local.push(lh,name,body);const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(0,10);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(body.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);central.push(ch,name);offset+=lh.length+name.length+body.length;}
  const centralSize=central.reduce((n,b)=>n+b.length,0);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);fs.writeFileSync(zipPath,Buffer.concat([...local,...central,end]));
}

let ok=true;
for(const [name,script] of [
 ['source','scripts/check-tool-023-source.mjs'],['harness','scripts/check-tool-023-harness.mjs'],['design','scripts/check-tool-023-design.mjs'],['validator','scripts/check-tool-023-validator.mjs'],['transpile','scripts/check-tool-023-transpile.mjs']
]) ok=run(name,'node',[script])&&ok;

const runtimeSpec={
 'preflight':'tests/tool-023-preflight.spec.ts','core-only':'tests/tool-023-core.spec.ts','boundary-only':'tests/tool-023-boundary.spec.ts','regression-only':'tests/tool-023-regression.spec.ts','limit-only':'tests/tool-023-limit.spec.ts'
};
const pwCli=path.join(root,'node_modules','@playwright','test','cli.js');
const nextBin=path.join(root,'node_modules','next','dist','bin','next');
if(mode==='final'){
  if(!fs.existsSync(nextBin)){fs.writeFileSync(path.join(outDir,'build-blocked.log'),'BLOCKED: Next.js runtime unavailable. Production build required.\n');results.push({name:'production-build',status:87,durationMs:0,error:'next-unavailable'});ok=false;}
  else ok=run('production-build','node',[nextBin,'build'])&&ok;
}
if(!fs.existsSync(pwCli)){
  fs.writeFileSync(path.join(outDir,'runtime-blocked.log'),'BLOCKED: @playwright/test CLI unavailable. Runtime validation required.\n');
  results.push({name:'playwright-runtime',status:88,durationMs:0,error:'playwright-unavailable'}); ok=false;
}else if(mode==='final'){
  for(const [name,spec] of Object.entries(runtimeSpec)) ok=run(`playwright-${name}`,'node',[pwCli,'test',spec,'--workers=1','--config=playwright.tool023-runtime.config.ts'])&&ok;
}else{
  ok=run('playwright-runtime','node',[pwCli,'test',runtimeSpec[mode],'--workers=1','--config=playwright.tool023-runtime.config.ts'])&&ok;
}

const pass=results.filter(x=>x.status===0).length;const fail=results.length-pass;const totalDurationMs=Math.round(performance.now()-totalStarted);
const slowest=[...results].sort((a,b)=>b.durationMs-a.durationMs).slice(0,3).map(x=>({...x,sharePct:totalDurationMs?Number((x.durationMs/totalDurationMs*100).toFixed(1)):0}));
const summary=`TOOL 023 ${mode}\nPASS=${pass}\nFAIL=${fail}\nSTATUS=${ok?'PASS':'FAIL'}\nDURATION_MS=${totalDurationMs}\nSLOWEST=${slowest.map(x=>`${x.name}:${x.durationMs}ms`).join(', ')}\n`;
fs.writeFileSync(path.join(outDir,'summary.txt'),summary);
fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify({tool:'023',mode,pass,fail,status:ok?'PASS':'FAIL',totalDurationMs,slowest,results},null,2));
const zipName=`023_${mode}_검수결과.zip`;
const desktopDir=path.join(os.homedir(),'Desktop'); const defaultResultDir=fs.existsSync(desktopDir)?desktopDir:root;
const resultDir=process.env.TOOL023_RESULT_DIR?path.resolve(process.env.TOOL023_RESULT_DIR):defaultResultDir;
fs.mkdirSync(resultDir,{recursive:true});const zipPath=path.join(resultDir,zipName);try{fs.unlinkSync(zipPath);}catch{}
zipDirectory(outDir,zipPath);fs.rmSync(outDir,{recursive:true,force:true});
console.log(`${summary}ZIP=${zipPath}`);process.exit(ok?0:1);
